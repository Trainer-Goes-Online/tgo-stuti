'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

import { collectSignals } from '@/lib/client-signals';
import { readLead, saveLead } from '@/lib/lead-store';
import {
  CONCERNS,
  DETAIL_FIELDS,
  INVEST,
  MIN_BUDGET_INR,
  PACKAGES,
  QUESTIONS,
  TIMELINES,
  detailError,
  labelOf,
  detailErrors,
  emailTypoFix,
  evaluate,
  normalizePhone,
  phoneMaxDigits,
  sanitizeName,
  type Choice,
  type DetailField,
  type QuizAnswers,
} from '@/lib/quiz';
import { site } from '@/lib/site';
import { DEFAULT_ISO, countryByIso } from '@/lib/countries';
import { CountrySelect } from './CountrySelect';
import { ArrowRightIcon, ChevronIcon, CloseIcon } from './icons';

const dialOf = (iso: string) => (countryByIso(iso) ?? countryByIso(DEFAULT_ISO)!).dial;

/**
 * The pre-call quiz. Every landing CTA (`a[data-cta]`) opens it instead of
 * navigating; the links still point at /book-a-call, so with no JavaScript
 * they simply book. A visitor this browser already qualified skips it.
 *
 *   1 concern → 2 occupation → 3 open to investing → 4 package (skipped when
 *   3 is "no") → 5 timeline → 6 details → submit → calendar or a kind no.
 *
 * Single-choice steps advance on tap; steps with a typed answer have a
 * Continue button. Answers survive closing the modal mid-way.
 */

type StepId = 'concern' | 'occupation' | 'invest' | 'package' | 'timeline' | 'details';
type Phase = 'quiz' | 'sending' | 'qualified' | 'disqualified';

const EMPTY: QuizAnswers = {
  concern: '',
  concernOther: '',
  occupation: '',
  invest: '',
  package: '',
  budget: null,
  timeline: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneIso: DEFAULT_ISO,
  phone: '',
  city: '',
};

const ADVANCE_MS = 260;

/** Disqualified screen body, matched to what the visitor actually answered. */
const DISQUALIFIED_COPY: Record<string, string> = {
  not_open_to_investing:
    'Stutie works personally with clients through paid 4D readings and longer-term guidance. Since you’re looking for free guidance at this stage, a 1:1 consultation may not be the right step for you yet.',
  not_ready_to_invest:
    'Stutie’s 1:1 calls are for people ready to invest in a personalised 4D reading or longer-term guidance. Since you’re not ready to invest in a paid reading right now, it may be better to revisit this when you are.',
  budget_below_minimum: `Stutie’s personalised 4D readings start from an investment of ₹${MIN_BUDGET_INR.toLocaleString('en-IN')}. Based on the budget you shared, a 1:1 consultation may not be the right step for you just yet.`,
};

export function QuizGate() {
  const [open, setOpen] = useState(false);

  /* Delegated, so every CTA (lockups and the sticky bar) is covered without
     turning the server-rendered sections into client components. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[data-cta]');
      if (!a) return;
      if (readLead()?.qualified) return; /* already qualified: straight to the calendar */
      e.preventDefault();
      setOpen(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return <QuizModal open={open} onClose={() => setOpen(false)} />;
}

function QuizModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [a, setA] = useState<QuizAnswers>(EMPTY);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>('quiz');
  const [error, setError] = useState('');
  const [honeypot, setHoneypot] = useState('');
  /** why the verdict was "no", for the disqualified copy */
  const [reason, setReason] = useState('');
  const advanceTimer = useRef<number | undefined>(undefined);

  /* Every visitor sees all six steps, including Q4 after a "no" on Q3; the
     verdict is only shown at the end. */
  const steps = useMemo<StepId[]>(
    () => ['concern', 'occupation', 'invest', 'package', 'timeline', 'details'],
    [],
  );
  const num = (id: StepId) => steps.indexOf(id) + 1;
  const current = steps[Math.min(step, steps.length - 1)];

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  /* Move focus into each new step: a text field when there is one, else the
     step itself (not the first option, whose focus ring reads as "selected"). */
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      const root = body.current;
      if (!root) return;
      const target =
        root.querySelector<HTMLElement>('input:not([tabindex="-1"]):not([data-inline]), textarea') ?? root;
      target.focus({ preventScroll: true });
    }, 40);
    return () => window.clearTimeout(id);
  }, [open, step, phase]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const set = <K extends keyof QuizAnswers>(k: K, v: QuizAnswers[K]) => {
    setError('');
    setA((p) => ({ ...p, [k]: v }));
  };

  const next = useCallback(() => {
    setError('');
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }, [steps.length]);

  const back = () => {
    setError('');
    window.clearTimeout(advanceTimer.current);
    setStep((s) => Math.max(0, s - 1));
  };

  /** Tap an option: record it, and advance unless it needs a typed follow-up. */
  const choose = (k: 'concern' | 'invest' | 'package' | 'timeline', v: string) => {
    window.clearTimeout(advanceTimer.current);
    setError('');
    setA((p) => ({ ...p, [k]: v }));
    const needsMore = (k === 'concern' && v === 'other') || (k === 'package' && v === 'budget');
    if (!needsMore) {
      advanceTimer.current = window.setTimeout(() => setStep((s) => s + 1), ADVANCE_MS);
    }
  };

  function validate(id: StepId): string {
    switch (id) {
      case 'concern':
        if (!a.concern) return 'Please choose the area that matters most to you right now.';
        if (a.concern === 'other' && a.concernOther.trim().length < 2) return 'Please tell us a little about it.';
        return '';
      case 'occupation':
        return a.occupation.trim().length < 3 ? 'Please share your designation and company.' : '';
      case 'invest':
        return a.invest ? '' : 'Please choose one option.';
      case 'package':
        if (!a.package) return 'Please choose the option that fits you best.';
        if (a.package === 'budget' && !(a.budget && a.budget > 0)) return 'Please enter the amount you can invest.';
        return '';
      case 'timeline':
        return a.timeline ? '' : 'Please choose one option.';
      case 'details':
        return ''; /* per-field: see detailErrors() in onContinue */
    }
  }

  /* ── personal details: per-field errors ─────────────────────────
     A field is checked when the visitor leaves it, every field on Submit,
     and an error re-checks live while typing so it clears the moment the
     value is fixed. */
  const [fe, setFe] = useState<Partial<Record<DetailField, string>>>({});

  /** set a detail value; re-check it live if it is showing an error (or `force`) */
  const edit = (field: DetailField, value: string, force = false) => {
    const next = { ...a, [field]: value };
    setA(next);
    setError('');
    if (force || fe[field] !== undefined) {
      setFe((p) => ({ ...p, [field]: detailError(field, next, dialOf(next.phoneIso)) }));
    }
  };

  const check = (field: DetailField) => {
    /* an untouched empty field is not an error until Submit */
    if (!a[field].trim() && fe[field] === undefined) return;
    setFe((p) => ({ ...p, [field]: detailError(field, a, dialOf(a.phoneIso)) }));
  };

  const onContinue = () => {
    if (current === 'details') {
      const errs = detailErrors(a, dialOf(a.phoneIso));
      setFe(Object.fromEntries(DETAIL_FIELDS.map((f) => [f, errs[f] ?? ''])));
      const first = DETAIL_FIELDS.find((f) => errs[f]);
      if (first) {
        body.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
        return;
      }
      return void submit();
    }
    const msg = validate(current);
    if (msg) return setError(msg);
    next();
  };

  async function submit() {
    setPhase('sending');
    const answers = a;
    const local = evaluate(answers);
    let qualified = local.qualified;
    setReason(local.reason);
    let leadId = '';
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ answers, signals: collectSignals(), website: honeypot }),
        /* never leave the visitor on "Submitting…" */
        signal: AbortSignal.timeout(12000),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        qualified?: boolean;
        leadId?: string;
        reason?: string;
        fields?: DetailField[];
      };
      if (!res.ok || !data.ok) {
        setPhase('quiz');
        if (data.reason === 'invalid_details' && data.fields?.length) {
          /* the server disagreed with a field: show it on that field */
          const dial = dialOf(a.phoneIso);
          setFe(Object.fromEntries(data.fields.map((f) => [f, detailError(f, a, dial) || 'Please check this field.'])));
          body.current?.querySelector<HTMLElement>(`[data-field="${data.fields[0]}"]`)?.focus();
        } else {
          setError('Something in your answers needs another look. Please check each step and try again.');
        }
        return;
      }
      qualified = Boolean(data.qualified);
      leadId = data.leadId ?? '';
    } catch {
      /* Network trouble or timeout: keep the visitor moving on the same rule the server uses. */
    }

    saveLead({
      leadId,
      qualified,
      firstName: a.firstName.trim(),
      lastName: a.lastName.trim(),
      email: a.email.trim().toLowerCase(),
      phone: normalizePhone(dialOf(a.phoneIso), a.phone),
      city: a.city.trim(),
    });

    if (qualified) {
      setPhase('qualified');
      window.setTimeout(() => {
        window.location.href = site.ctaHref;
      }, 1400);
    } else {
      setPhase('disqualified');
    }
  }

  /** Back to question 1 with every answer still selected, so a visitor who
   *  mis-tapped can change just that one and tap through the rest. */
  const restart = () => {
    setStep(0);
    setError('');
    setFe({});
    setPhase('quiz');
  };

  const total = steps.length;
  const progress = phase === 'quiz' || phase === 'sending' ? ((step + 1) / total) * 100 : 100;

  return (
    <dialog
      ref={dialog}
      className="sdp-quiz"
      aria-labelledby="sdp-quiz-title"
      onClose={onClose}
      /* Only the × button (or "Back to the page") closes the quiz: a stray tap
         on the backdrop or the Esc key must not throw away a half-filled form. */
      onCancel={(e) => e.preventDefault()}
      /* Chrome lets a repeated Esc force past a cancelled close request, so the
         key itself is stopped before it becomes one. */
      onKeyDown={(e) => {
        if (e.key === 'Escape') e.preventDefault();
      }}
    >
      <div className="sdp-quiz-card">
        <div className="sdp-quiz-bar" aria-hidden>
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="sdp-quiz-top">
          {phase === 'quiz' && step > 0 ? (
            <button type="button" className="sdp-quiz-back" onClick={back}>
              <ChevronIcon size={16} dir="left" /> Back
            </button>
          ) : (
            <span />
          )}
          {phase === 'quiz' || phase === 'sending' ? (
            <span className="sdp-quiz-count">
              Step {step + 1} of {total}
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="sdp-quiz-close"
            onClick={onClose}
            aria-label="Close"
            disabled={phase === 'sending'}
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="sdp-quiz-body" ref={body} key={`${phase}-${current}`} tabIndex={-1}>
          {(phase === 'quiz' || phase === 'sending') && (
            <form
              noValidate
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                onContinue();
              }}
            >
              {current === 'concern' && (
                <Step
                  n={num('concern')}
                  title={QUESTIONS.concern}
                  hint="Select the one that matters most to you right now."
                >
                  <Options list={CONCERNS} value={a.concern} onPick={(v) => choose('concern', v)} />
                  {a.concern === 'other' && (
                    <input
                      className="sdp-quiz-input"
                      placeholder="Tell us briefly"
                      value={a.concernOther}
                      maxLength={200}
                      onChange={(e) => set('concernOther', e.target.value)}
                    />
                  )}
                </Step>
              )}

              {current === 'occupation' && (
                <Step
                  n={num('occupation')}
                  title={QUESTIONS.occupation}
                  hint="Please mention your designation and company, e.g. Associate VP @ IBM"
                >
                  <input
                    className="sdp-quiz-input"
                    placeholder="Designation @ Company"
                    autoComplete="organization-title"
                    value={a.occupation}
                    maxLength={200}
                    onChange={(e) => set('occupation', e.target.value)}
                  />
                </Step>
              )}

              {current === 'invest' && (
                <Step
                  n={num('invest')}
                  title={QUESTIONS.invest}
                  hint="Stutie works personally with clients through paid 4D readings and longer-term guidance."
                >
                  <Options list={INVEST} value={a.invest} onPick={(v) => choose('invest', v)} />
                </Step>
              )}

              {current === 'package' && (
                <Step
                  n={num('package')}
                  title={QUESTIONS.package}
                  hint="Depending on your concerns, Stutie offers a comprehensive one-time reading or longer-term personalised guidance."
                >
                  <Options
                    list={PACKAGES}
                    value={a.package}
                    onPick={(v) => choose('package', v)}
                    slot={
                      /* the "__" in option C: up to 4 digits of rupees, inline in the sentence */
                      <span className="sdp-quiz-amt" onClick={(e) => e.stopPropagation()}>
                        <span className="cur" aria-hidden>
                          ₹
                        </span>
                        <input
                          data-inline
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="____"
                          aria-label="Amount in rupees you can invest right now"
                          value={a.budget ?? ''}
                          onFocus={() => a.package !== 'budget' && choose('package', 'budget')}
                          onChange={(e) => {
                            const d = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setA((p) => ({ ...p, package: 'budget', budget: d ? Number(d) : null }));
                            setError('');
                          }}
                        />
                      </span>
                    }
                  />
                </Step>
              )}

              {current === 'timeline' && (
                <Step
                  n={num('timeline')}
                  title={QUESTIONS.timeline}
                >
                  <Options list={TIMELINES} value={a.timeline} onPick={(v) => choose('timeline', v)} />
                </Step>
              )}

              {current === 'details' && (
                <Step n={num('details')} title="Your Personal Details" hint="So Stutie’s team can reach you about your call.">
                  <div className="sdp-quiz-fields">
                    <Field label="First name" error={fe.firstName} id="firstName">
                      <input
                        className="sdp-quiz-input"
                        data-field="firstName"
                        autoComplete="given-name"
                        autoCapitalize="words"
                        value={a.firstName}
                        maxLength={40}
                        aria-invalid={!!fe.firstName}
                        aria-describedby={fe.firstName ? 'qerr-firstName' : undefined}
                        onChange={(e) => edit('firstName', sanitizeName(e.target.value))}
                        onBlur={() => check('firstName')}
                      />
                    </Field>
                    <Field label="Last name" error={fe.lastName} id="lastName">
                      <input
                        className="sdp-quiz-input"
                        data-field="lastName"
                        autoComplete="family-name"
                        autoCapitalize="words"
                        value={a.lastName}
                        maxLength={40}
                        aria-invalid={!!fe.lastName}
                        aria-describedby={fe.lastName ? 'qerr-lastName' : undefined}
                        onChange={(e) => edit('lastName', sanitizeName(e.target.value))}
                        onBlur={() => check('lastName')}
                      />
                    </Field>
                    <Field
                      label="Email"
                      id="email"
                      error={fe.email}
                      fix={
                        fe.email && emailTypoFix(a.email.trim())
                          ? () => edit('email', emailTypoFix(a.email.trim()), true)
                          : undefined
                      }
                    >
                      <input
                        className="sdp-quiz-input"
                        data-field="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        autoCapitalize="off"
                        spellCheck={false}
                        placeholder="name@gmail.com"
                        value={a.email}
                        maxLength={254}
                        aria-invalid={!!fe.email}
                        aria-describedby={fe.email ? 'qerr-email' : undefined}
                        onChange={(e) => edit('email', e.target.value.replace(/\s/g, ''))}
                        onBlur={() => check('email')}
                      />
                    </Field>
                    {/* a div, not <label>: a label would forward clicks into the code button */}
                    <div className={`sdp-quiz-field${fe.phone ? ' has-error' : ''}`}>
                      <span className="flabel" id="sdp-quiz-tel-label">
                        WhatsApp number
                      </span>
                      <div className="sdp-quiz-tel">
                        <CountrySelect
                          value={a.phoneIso}
                          onChange={(iso) => {
                            /* re-fit what was typed to the new country's length */
                            const next = { ...a, phoneIso: iso, phone: fitPhone(a.phone, dialOf(iso)) };
                            setA(next);
                            if (fe.phone !== undefined)
                              setFe((p) => ({ ...p, phone: detailError('phone', next, dialOf(iso)) }));
                          }}
                        />
                        <input
                          type="tel"
                          data-field="phone"
                          autoComplete="tel-national"
                          inputMode="numeric"
                          aria-labelledby="sdp-quiz-tel-label"
                          aria-invalid={!!fe.phone}
                          aria-describedby={fe.phone ? 'qerr-phone' : undefined}
                          placeholder={a.phoneIso === DEFAULT_ISO ? '98765 43210' : 'Phone number'}
                          value={a.phone}
                          onChange={(e) => edit('phone', fitPhone(e.target.value, dialOf(a.phoneIso)))}
                          onBlur={() => check('phone')}
                        />
                      </div>
                      {fe.phone && (
                        <span className="sdp-quiz-ferr" id="qerr-phone" role="alert">
                          {fe.phone}
                        </span>
                      )}
                    </div>
                    <Field label="City" wide error={fe.city} id="city">
                      <input
                        className="sdp-quiz-input"
                        data-field="city"
                        autoComplete="address-level2"
                        autoCapitalize="words"
                        value={a.city}
                        maxLength={60}
                        aria-invalid={!!fe.city}
                        aria-describedby={fe.city ? 'qerr-city' : undefined}
                        onChange={(e) => edit('city', sanitizeName(e.target.value))}
                        onBlur={() => check('city')}
                      />
                    </Field>
                    {/* honeypot: hidden from people, irresistible to bots */}
                    <input
                      className="sdp-quiz-hp"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      name="website"
                    />
                  </div>
                </Step>
              )}

              {error && (
                <p className="sdp-quiz-error" role="alert">
                  {error}
                </p>
              )}

              {needsContinue(current, a) && (
                <button type="submit" className="sdp-quiz-go" disabled={phase === 'sending'}>
                  {phase === 'sending' ? 'Submitting…' : current === 'details' ? 'Submit' : 'Continue'}
                  {phase !== 'sending' && <ArrowRightIcon size={13} />}
                </button>
              )}
            </form>
          )}

          {phase === 'qualified' && (
            <div className="sdp-quiz-result" role="status">
              <p className="sdp-quiz-eyebrow">Thank you for sharing</p>
              <h2 id="sdp-quiz-title" className="sdp-quiz-h">
                You’re A Great Fit For A <em>1:1 Call</em>
              </h2>
              <p className="sdp-quiz-p">Taking you to Stutie’s calendar to choose a time that works for you…</p>
              <span className="sdp-quiz-spin" aria-hidden />
            </div>
          )}

          {phase === 'disqualified' && (
            <div className="sdp-quiz-result">
              <p className="sdp-quiz-eyebrow">Thank you for sharing</p>
              <h2 id="sdp-quiz-title" className="sdp-quiz-h">
                A 1:1 Call May Not Be The <em>Right Fit</em> Just Yet.
              </h2>
              <p className="sdp-quiz-p">{DISQUALIFIED_COPY[reason] ?? DISQUALIFIED_COPY.not_ready_to_invest}</p>
              <p className="sdp-quiz-p sdp-quiz-p-soft">
                There’s no pressure. You’re welcome to come back whenever the timing feels right. If you picked
                an option by mistake, start again and update your answers.
              </p>

              {/* what decided it, so a mis-tap is easy to spot */}
              <dl className="sdp-quiz-recap">
                <div>
                  <dt>Open to investing</dt>
                  <dd>{labelOf(INVEST, a.invest) || '—'}</dd>
                </div>
                <div>
                  <dt>Option chosen</dt>
                  <dd>
                    {a.package === 'budget'
                      ? `Tight budget, up to ₹${(a.budget ?? 0).toLocaleString('en-IN')}`
                      : labelOf(PACKAGES, a.package) || '—'}
                  </dd>
                </div>
              </dl>

              <div className="sdp-quiz-actions">
                <button type="button" className="sdp-quiz-go sdp-quiz-again" onClick={restart}>
                  Start again
                </button>
                <button type="button" className="sdp-quiz-link" onClick={onClose}>
                  Back to the page
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}

/** Steps with a typed answer (or a typed follow-up) need an explicit Continue. */
function needsContinue(id: StepId, a: QuizAnswers) {
  if (id === 'occupation' || id === 'details') return true;
  if (id === 'concern') return a.concern === 'other';
  if (id === 'package') return a.package === 'budget';
  return false;
}

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="sdp-quiz-step">
      <legend className="sdp-quiz-q" id="sdp-quiz-title">
        <span className="num">{n}</span>
        <span>{title}</span>
      </legend>
      {hint && <p className="sdp-quiz-hint">{hint}</p>}
      {children}
    </fieldset>
  );
}

/**
 * Option rows. A label containing "__" has that blank replaced by `slot`
 * (the inline amount box), which is why a row is a div with role="radio"
 * rather than a <button>: a button may not contain an input.
 */
function Options({
  list,
  value,
  onPick,
  slot,
}: {
  list: Choice[];
  value: string;
  onPick: (v: string) => void;
  slot?: React.ReactNode;
}) {
  return (
    <div className="sdp-quiz-opts" role="radiogroup">
      {list.map((c, i) => {
        const [before, after] = c.label.split('__');
        const hasSlot = slot && after !== undefined;
        return (
          <div
            role="radio"
            tabIndex={0}
            aria-checked={value === c.value}
            className="sdp-quiz-opt"
            key={c.value}
            onClick={() => onPick(c.value)}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPick(c.value);
              }
            }}
          >
            <span className="key" aria-hidden>
              {String.fromCharCode(65 + i)}
            </span>
            <span className="txt">
              <span className="lbl">
                {hasSlot ? (
                  <>
                    {before}
                    {slot}
                    {after}
                  </>
                ) : c.label.includes(' | ') ? (
                  /* "Title | ₹price": the price never breaks away from its bar */
                  <>
                    {c.label.split(' | ')[0]} <span className="price">| {c.label.split(' | ')[1]}</span>
                  </>
                ) : (
                  c.label
                )}
              </span>
              {c.note && <span className="note">{c.note}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Field({
  label,
  wide,
  id,
  error,
  fix,
  children,
}: {
  label: string;
  wide?: boolean;
  id?: string;
  error?: string;
  /** when set, the error shows a one-tap "use this" button (email typo fix) */
  fix?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`sdp-quiz-field${wide ? ' is-wide' : ''}${error ? ' has-error' : ''}`}>
      <label>
        <span className="flabel">{label}</span>
        {children}
      </label>
      {error && (
        <span className="sdp-quiz-ferr" id={id ? `qerr-${id}` : undefined} role="alert">
          {error}
          {fix && (
            <button type="button" className="sdp-quiz-fix" onClick={fix}>
              Use this
            </button>
          )}
        </span>
      )}
    </div>
  );
}

/**
 * Keep only what a phone number can contain, capped to the country's
 * length. India: drops a trunk 0 or a retyped 91 prefix, caps at 10 digits
 * and groups them "98765 43210". Elsewhere: digits only, up to 14.
 */
function fitPhone(raw: string, dial: string): string {
  let d = raw.replace(/\D/g, '');
  if (dial === '91') {
    d = d.replace(/^0+/, '');
    if (d.length > 10 && d.startsWith('91')) d = d.slice(2);
    d = d.slice(0, phoneMaxDigits(dial));
    return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d;
  }
  return d.slice(0, phoneMaxDigits(dial));
}
