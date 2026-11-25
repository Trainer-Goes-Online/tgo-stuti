import crypto from 'crypto';
import { NextResponse, after } from 'next/server';

import { readAttrCookie } from '@/lib/attribution-edge';
import { DEFAULT_ISO, countryByIso } from '@/lib/countries';
import { sendCapiEvent, sha256Hex, type SendableEvent } from '@/lib/meta-capi';
import {
  CONCERNS,
  INVEST,
  MAX_BUDGET_INR,
  PACKAGES,
  QUESTIONS,
  TIMELINES,
  detailErrors,
  evaluate,
  labelOf,
  normalizePhone,
} from '@/lib/quiz';
import { readClientIp, readClientUserAgent, readRequestCookie } from '@/lib/request-signals';
import { TRACKING_CONFIG, capiReady } from '@/lib/tracking-config';

/**
 * The quiz submission. One request does three things, in this order:
 *   1. re-derives `qualified` from the answers (never trusts the browser's)
 *   2. Conversions API: `Lead` for EVERY submission, plus `QualifiedLead`
 *      when qualified. Both carry the fullest user_data this funnel has.
 *   3. POSTs the flat lead record to LEAD_WEBHOOK_URL, every submission,
 *      with `qualified` true/false so the receiver can filter.
 *
 * HEALTH HYGIENE (see lib/meta-capi.ts): the quiz answers, one of which is
 * "Health or Personal Wellbeing", go to the webhook ONLY. Meta receives the
 * event names and hashed identity, never what the visitor is struggling with.
 *
 * Steps 2 and 3 run after the response (next/server `after`): the visitor
 * gets the verdict immediately, and a slow or failing Meta/webhook call can
 * never hold up or break their result screen. Outcomes are logged.
 */

const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const oneOf = (v: string, list: { value: string }[]) => (list.some((c) => c.value === v) ? v : '');

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad-json' }, { status: 400 });
  }

  /* honeypot: a field no person sees. Bots get a normal-looking answer and nothing is sent. */
  if (str(body.website)) {
    return NextResponse.json({ ok: true, qualified: false, leadId: '' });
  }

  /* ── answers ─────────────────────────────────────────────────── */
  const a = (body.answers ?? {}) as Record<string, unknown>;
  const concern = oneOf(str(a.concern), CONCERNS);
  const concernOther = concern === 'other' ? str(a.concernOther, 200) : '';
  const occupation = str(a.occupation, 200);
  const invest = oneOf(str(a.invest), INVEST);
  /* Q4 is asked of everyone, including a "no" on Q3 (who stays disqualified) */
  const pkg = oneOf(str(a.package), PACKAGES);
  const budgetNum = Number(a.budget);
  const budget =
    pkg === 'budget' && Number.isFinite(budgetNum) && budgetNum > 0 && budgetNum <= MAX_BUDGET_INR
      ? Math.round(budgetNum)
      : null;
  const timeline = oneOf(str(a.timeline), TIMELINES);
  const firstName = str(a.firstName, 60);
  const lastName = str(a.lastName, 60);
  const fullName = `${firstName} ${lastName}`.trim();
  const email = str(a.email, 200).toLowerCase();
  const phoneCountry = countryByIso(str(a.phoneIso, 2).toUpperCase()) ?? countryByIso(DEFAULT_ISO)!;
  const phone = normalizePhone(phoneCountry.dial, str(a.phone, 40));
  const city = str(a.city, 80);

  const missing =
    !concern || !occupation || !invest || !pkg ||
    (pkg === 'budget' && budget === null) || !timeline;
  if (missing) {
    return NextResponse.json({ ok: false, reason: 'incomplete' }, { status: 400 });
  }

  /* Same per-field rules the modal applies (lib/quiz.ts). */
  const bad = detailErrors(
    { firstName, lastName, email, phone: str(a.phone, 40), city },
    phoneCountry.dial,
  );
  const badFields = Object.keys(bad);
  if (badFields.length || !phone) {
    return NextResponse.json(
      { ok: false, reason: 'invalid_details', fields: badFields.length ? badFields : ['phone'] },
      { status: 400 },
    );
  }

  const verdict = evaluate({ invest, package: pkg, budget });

  /* ── match signals: the body first, the request's own cookies as backup ── */
  const s = (body.signals ?? {}) as Record<string, unknown>;
  const utmIn = (s.utm ?? {}) as Record<string, unknown>;
  const edge = readAttrCookie(readRequestCookie(req, 'sg_attr'));
  const pick = (...v: (string | undefined)[]) => v.find((x) => x && x.trim()) ?? '';

  const utm = {
    source: pick(str(utmIn.source), edge.utmSource),
    medium: pick(str(utmIn.medium), edge.utmMedium),
    campaign: pick(str(utmIn.campaign), edge.utmCampaign),
    content: pick(str(utmIn.content), edge.utmContent),
    term: pick(str(utmIn.term), edge.utmTerm),
  };
  const fbclid = pick(str(s.fbclid), edge.fbclid);
  const fbp = pick(str(s.fbp), readRequestCookie(req, '_fbp'));
  /* No _fbc cookie but we know the fbclid: build it exactly as the pixel would. */
  const fbc = pick(str(s.fbc), readRequestCookie(req, '_fbc'), fbclid ? `fb.1.${Date.now()}.${fbclid}` : '');
  const externalId = str(s.externalId, 100);
  const gaClientId = str(s.gaClientId, 100);
  const referrer = pick(str(s.referrer), edge.referrer);
  const landingUrl = pick(str(s.landingUrl), edge.landingUrl);
  const pageUrl = str(s.eventSourceUrl, 500);
  const clientIp = readClientIp(req);
  const userAgent = readClientUserAgent(req);
  /* Meta's country key is only honest when the number says where they are. */
  /* Meta's country key: the country they picked for their own number. */
  const country = phoneCountry.iso.toLowerCase();

  const leadId = crypto.randomUUID();
  const submittedAt = new Date().toISOString();

  /* ── 2. Conversions API ─────────────────────────────────────── */
  const events: SendableEvent[] = verdict.qualified ? ['Lead', 'QualifiedLead'] : ['Lead'];
  /* Deterministic per lead, so a retry of the same lead dedupes inside Meta's
     48h window, and the webhook can carry the ids whether or not CAPI is on. */
  const eventIds: Record<string, string> = Object.fromEntries(
    events.map((e) => [e, sha256Hex(`${leadId}|${e}`)]),
  );
  const eventStatus: Record<string, string> = {};

  /* Meta and the webhook run AFTER the response (next/server `after`), so the
     visitor sees their result instantly instead of waiting on Meta or Pabbly. */
  const deliver = async () => {
  if (capiReady()) {
    const user = {
      email,
      phone,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      city: city || undefined,
      country: country || undefined,
      externalId: externalId || undefined,
      fbc: fbc || undefined,
      fbp: fbp || undefined,
      clientIp: clientIp || undefined,
      clientUserAgent: userAgent || undefined,
    };
    await Promise.all(
      events.map(async (eventName) => {
        const eventId = eventIds[eventName];
        const r = await sendCapiEvent({
          pixelId: TRACKING_CONFIG.meta.pixelId,
          accessToken: TRACKING_CONFIG.meta.accessToken,
          eventName,
          eventId,
          eventSourceUrl: pageUrl || TRACKING_CONFIG.fallbackEventSourceUrl,
          user,
          valueRupees: 0,
          currency: TRACKING_CONFIG.currency,
          testEventCode: TRACKING_CONFIG.meta.testEventCode || undefined,
        });
        eventStatus[eventName] = r.ok ? 'sent' : `failed_${r.status}`;
        if (!r.ok) console.error(`[lead] CAPI ${eventName} failed`, r.status, r.body);
      }),
    );
  } else {
    for (const e of events) eventStatus[e] = 'capi_not_configured';
  }

  /* ── 3. webhook ─────────────────────────────────────────────── */
  const hook = (process.env.LEAD_WEBHOOK_URL ?? '').trim();
  /* the URL Meta receives as event_source_url, so sheet and Meta agree */
  const eventSourceUrl = pageUrl || TRACKING_CONFIG.fallbackEventSourceUrl || '';
  /* true from a local dev server, or while a Meta test event code is set */
  const isTest = process.env.NODE_ENV !== 'production' || Boolean(TRACKING_CONFIG.meta.testEventCode);
  /* Q4 as read: the budget option carries the amount they typed. */
  const packageText = pkg
    ? labelOf(PACKAGES, pkg).replace('__', budget !== null ? `₹${budget.toLocaleString('en-IN')}` : '__')
    : '';
  let webhook = 'not_configured';
  if (hook) {
    const record = {
      /* lead */
      lead_id: leadId,
      submitted_at: submittedAt,
      qualified: verdict.qualified,
      disqualify_reason: verdict.reason,
      /* sheet columns shared with the purchase flows. A call is free and no
         purchase happens here, so amount is 0 and purchase_event_id "none". */
      event_source_url: eventSourceUrl,
      amount: 0,
      currency: TRACKING_CONFIG.currency,
      is_test: isTest,
      purchase_event_id: 'none',
      /* questions and answers, as the visitor saw and chose them */
      q1_question: QUESTIONS.concern,
      q1_answer: concern === 'other' ? `Other: ${concernOther}` : labelOf(CONCERNS, concern),
      q2_question: QUESTIONS.occupation,
      q2_answer: occupation,
      q3_question: QUESTIONS.invest,
      q3_answer: labelOf(INVEST, invest),
      q4_question: QUESTIONS.package,
      q4_answer: packageText,
      q5_question: QUESTIONS.timeline,
      q5_answer: labelOf(TIMELINES, timeline),
      /* answers, short form */
      concern: labelOf(CONCERNS, concern),
      concern_other: concernOther,
      occupation,
      open_to_investing: invest,
      package: packageText,
      budget_inr: budget,
      start_timeline: labelOf(TIMELINES, timeline),
      /* person */
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: `+${phone}`,
      phone_country_code: `+${phoneCountry.dial}`,
      city,
      country,
      /* campaign */
      utm_source: utm.source,
      utm_medium: utm.medium,
      utm_campaign: utm.campaign,
      utm_content: utm.content,
      utm_term: utm.term,
      fbclid,
      fbc,
      fbp,
      /* context */
      external_id: externalId,
      ga_client_id: gaClientId,
      referrer,
      landing_url: landingUrl,
      page_url: pageUrl,
      client_ip: clientIp,
      user_agent: userAgent,
      /* Meta CAPI events fired for this lead */
      meta_events: events.join(','),
      meta_lead_event_id: eventIds.Lead ?? '',
      meta_lead_status: eventStatus.Lead ?? '',
      meta_qualified_lead_event_id: eventIds.QualifiedLead ?? '',
      meta_qualified_lead_status: eventStatus.QualifiedLead ?? '',
    };
    try {
      const r = await fetch(hook, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(8000),
      });
      webhook = r.ok ? 'sent' : `failed_${r.status}`;
      if (!r.ok) console.error('[lead] webhook failed', r.status);
    } catch (e) {
      webhook = 'failed';
      console.error('[lead] webhook error', e);
    }
  }
  console.info(`[lead] ${leadId} qualified=${verdict.qualified} meta=${JSON.stringify(eventStatus)} webhook=${webhook}`);
  };

  after(deliver);

  return NextResponse.json({ ok: true, leadId, qualified: verdict.qualified });
}
