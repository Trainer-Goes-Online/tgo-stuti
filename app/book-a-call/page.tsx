'use client';

/**
 *   landing -> /book-a-call -> BOOKING (Cal) -> /thank-you
 *
 * A free call, so this page is the funnel's conversion step. It fires
 * ViewContent and AddToCart on arrival (both session-deduped) and
 * Schedule from Cal's booking callback, then hands over to /thank-you.
 */

import { useEffect, useRef, useState } from 'react';

import { SiteFooter } from '@/components/shared/SiteFooter';
import { AlertIcon, WhatsappIcon } from '@/components/shared/icons';
import { CAL_LINK } from '@/lib/booking';
import { CALL_DECK, CALL_IS_NOT, CALL_STEPS, FAQ_PRIOR, FAQ_REMEDIES, FAQ_WHO } from '@/lib/call-copy';
import { EMAIL_LABEL, LEGAL, PHONE_DIGITS } from '@/lib/legal';
import { trackAddToCart, trackSchedule, trackViewItem } from '@/lib/track';

const CAL_ORIGIN = 'https://app.cal.com';
/** cal.com namespaces per EVENT, so the namespace IS the slug. */
const CAL_NS = CAL_LINK.split('/')[1] ?? '';
const CAL_URL = CAL_LINK ? `https://cal.com/${CAL_LINK}` : '';
const CAL_BRAND = '#C9500A';

const MOUNT_ID = 'sg-cal';

/* Cal's own loader, from its embed snippet. It defines window.Cal as a QUEUE
   straight away and appends the real script itself, so calls made before the
   script lands are replayed when it does. */
type CalQueue = ((...args: unknown[]) => void) & {
  loaded?: boolean;
  ns?: Record<string, (...args: unknown[]) => void>;
  q?: unknown[][];
};
function loadCal(scriptSrc: string) {
  const C = window as unknown as { Cal?: CalQueue; document: Document };
  const p = (a: { q?: unknown[][] }, ar: unknown[]) => {
    (a.q = a.q || []).push(ar);
  };
  const d = C.document;
  C.Cal =
    C.Cal ||
    function (...ar: unknown[]) {
      const cal = C.Cal as CalQueue;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        (d.head.appendChild(d.createElement('script')) as HTMLScriptElement).src = scriptSrc;
        cal.loaded = true;
      }
      if (ar[0] === 'init') {
        const api = function (...a: unknown[]) {
          p(api as unknown as { q?: unknown[][] }, a);
        } as unknown as ((...a: unknown[]) => void) & { q?: unknown[][] };
        const namespace = ar[1];
        api.q = api.q || [];
        if (typeof namespace === 'string') {
          cal.ns![namespace] = cal.ns![namespace] || (api as (...a: unknown[]) => void);
          p(cal.ns![namespace] as unknown as { q?: unknown[][] }, ar);
          p(cal as unknown as { q?: unknown[][] }, ['initNamespace', namespace]);
        } else {
          p(cal as unknown as { q?: unknown[][] }, ar);
        }
        return;
      }
      p(cal as unknown as { q?: unknown[][] }, ar);
    };
  return C.Cal as CalQueue;
}

/* V2 sends the booking as `data`; the legacy event nests it under `data.booking`. */
function bookingUid(e: unknown): string {
  const data = (e as { detail?: { data?: Record<string, unknown> } })?.detail?.data;
  if (!data) return '';
  if (typeof data.uid === 'string') return data.uid;
  const booking = data.booking as { uid?: unknown } | undefined;
  return typeof booking?.uid === 'string' ? booking.uid : '';
}

const RESCUE_WA_TEXT = encodeURIComponent(
  "Hi, I'd like to book a Private 1:1 Breakthrough Call but none of the listed slots work for me. My details: Name: | Email: | Phone: | Preferred day and time:",
);
const RESCUE_MAILTO = LEGAL.email
  ? `mailto:${LEGAL.email}?subject=${encodeURIComponent('Breakthrough Call: preferred slot request')}&body=${encodeURIComponent(
      'Name:\nEmail:\nPhone:\nPreferred day and time:\n',
    )}`
  : '';

const REASSURANCES = [
  ['Confirmation by email', 'It arrives the moment you book, with the joining details.'],
  ['Directly with Stutie Gupta', 'A private, personalised conversation focused on your situation.'],
] as const;

const FAQS = [FAQ_WHO, FAQ_PRIOR, FAQ_REMEDIES];

export default function BookACallPage() {
  const [state, setState] = useState<'loading' | 'ready' | 'failed' | 'unset'>(
    CAL_LINK ? 'loading' : 'unset',
  );

  /* Cal's `inline` MOUNTS an embed. A second call puts a second instance in
     the same container and the two fight (the form appears, then snaps back).
     StrictMode runs effects twice in development, so the boot is ref-guarded
     and the effect has no dependencies. */
  const calBooted = useRef(false);
  /* bookingSuccessfulV2 and bookingSuccessful both fire for one booking. */
  const handedOff = useRef(false);

  const arrived = useRef(false);
  useEffect(() => {
    if (arrived.current) return;
    arrived.current = true;
    trackViewItem();
    trackAddToCart();
  }, []);

  useEffect(() => {
    if (!CAL_LINK) return;

    let cancelled = false;
    /* The embed reports nothing on load, so readiness is whether an iframe
       actually appeared in the mount point. */
    const started = Date.now();
    const poll = window.setInterval(() => {
      if (cancelled) return;
      if (document.querySelector(`#${MOUNT_ID} iframe`)) {
        setState('ready');
        window.clearInterval(poll);
      } else if (Date.now() - started > 9000) {
        setState('failed');
        window.clearInterval(poll);
      }
    }, 300);

    if (calBooted.current) {
      return () => {
        cancelled = true;
        window.clearInterval(poll);
      };
    }
    calBooted.current = true;

    const onBooked = (e: unknown) => {
      if (handedOff.current) return;
      handedOff.current = true;
      trackSchedule(bookingUid(e));
      window.location.href = '/thank-you';
    };

    try {
      const Cal = loadCal(`${CAL_ORIGIN}/embed/embed.js`) as CalQueue & { config?: Record<string, unknown> };
      Cal('init', CAL_NS, { origin: CAL_ORIGIN });
      Cal.config = { ...Cal.config, forwardQueryParams: true };
      const ns = Cal.ns![CAL_NS];

      ns('inline', {
        elementOrSelector: `#${MOUNT_ID}`,
        config: { layout: 'month_view', useSlotsViewOnSmallScreen: 'true' },
        calLink: CAL_LINK,
      });
      ns('ui', {
        cssVarsPerTheme: { light: { 'cal-brand': CAL_BRAND }, dark: { 'cal-brand': CAL_BRAND } },
        theme: 'light',
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
      ns('on', { action: 'bookingSuccessfulV2', callback: onBooked });
      ns('on', { action: 'bookingSuccessful', callback: onBooked });
    } catch {
      if (!cancelled) setState('failed');
      window.clearInterval(poll);
    }

    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, []);

  return (
    <div className="sg-book">
      <div className="bk-strip">
        Private 1:1 Breakthrough Call
        <span className="bk-strip-sep" aria-hidden>
          ·
        </span>
        Directly with Stutie Gupta
      </div>

      <section className="bk-body">
        <div className="wrap">
          <div className="bk-mast">
            <span className="bk-pill">Book your call</span>
            <h1>
              Book Your Private 1:1 <em>Breakthrough Call</em>
            </h1>
            <p className="bk-deck">{CALL_DECK}</p>
          </div>

          <div className="bk-card bk-wide" id="calendar">
            <div className="bk-card-head">
              <h2>Pick a slot that works for you</h2>
              <p>All times are shown in your own time zone.</p>
            </div>

            <div className={state === 'ready' ? 'bk-cal-inset ready' : 'bk-cal-inset'}>
              {state !== 'ready' && (
                <p className={state === 'loading' ? 'bk-cal-note' : `bk-cal-note ${state}`}>
                  {state === 'unset'
                    ? '⚠️ Calendar link not supplied. Set CAL_LINK in lib/booking.ts to Stutie’s Cal.com event and the calendar appears here.'
                    : state === 'failed'
                      ? 'The calendar could not load here. Use the direct link below and your booking will work exactly the same.'
                      : 'Loading the calendar.'}
                </p>
              )}
              {CAL_LINK ? <div className="bk-cal" id={MOUNT_ID} /> : null}
            </div>

            {CAL_URL ? (
              <p className="bk-direct">
                Calendar not showing?{' '}
                <a href={CAL_URL} target="_blank" rel="noopener noreferrer">
                  Open the booking page directly
                </a>
                .
              </p>
            ) : null}

            <ul className="bk-reassure">
              {REASSURANCES.map(([t, b]) => (
                <li key={t}>
                  <span className="bk-check" aria-hidden>
                    ✓
                  </span>
                  <span>
                    <b>{t}.</b> {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bk-rescue bk-wide">
            <span className="bk-rescue-eyebrow">
              <AlertIcon size={14} />
              Preferred slot not available?
            </span>
            <h2>Cannot find a time that works for you?</h2>
            <p>
              Send us your <strong>name, email, phone number and your preferred day and time</strong>,
              and we will get back to you to set up your call.
            </p>
            <div className="bk-rescue-acts">
              {PHONE_DIGITS ? (
                <a
                  className="bk-rescue-wa"
                  href={`https://wa.me/${PHONE_DIGITS}?text=${RESCUE_WA_TEXT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsappIcon size={17} />
                  Message us on WhatsApp
                </a>
              ) : null}
              {RESCUE_MAILTO ? (
                <a className="bk-rescue-mail" href={RESCUE_MAILTO}>
                  Email us
                </a>
              ) : null}
            </div>
            <p className="bk-rescue-direct">
              {PHONE_DIGITS ? <a href={`https://wa.me/${PHONE_DIGITS}`}>{LEGAL.phone}</a> : LEGAL.phone}
              <span aria-hidden> · </span>
              {LEGAL.email ? <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> : EMAIL_LABEL}
            </p>
          </div>

          <h2 className="bk-h2">
            What Can You Expect From Your <em>Private 1:1 Breakthrough Call?</em>
          </h2>
          <ol className="bk-value">
            {CALL_STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="bk-ord">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>

          <h2 className="bk-h2">Before you book</h2>
          <div className="bk-faq">
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                {f.a.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </details>
            ))}
          </div>

          <div className="bk-final">
            <h2>
              One slot. <em>Then your answers.</em>
            </h2>
            <p>{CALL_IS_NOT}</p>
            <a className="bk-btn lg" href="#calendar">
              Take me to the calendar
              <span aria-hidden>&nbsp;&rarr;</span>
            </a>
          </div>

          <p className="bk-help">
            Trouble booking? Write to{' '}
            {LEGAL.email ? <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> : EMAIL_LABEL} or call{' '}
            {LEGAL.phoneHref ? <a href={`tel:${LEGAL.phoneHref}`}>{LEGAL.phone}</a> : LEGAL.phone}.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
