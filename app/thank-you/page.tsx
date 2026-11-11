/**
 *   landing -> /book-a-call -> BOOKING -> /thank-you
 *
 * Reached only by booking, so it prepares the visitor for the call. It fires
 * nothing: Schedule went from the booking page's Cal callback, and a second
 * copy here would double count. No CTA to book; on this page that is a bug.
 */

import { SiteFooter } from '@/components/shared/SiteFooter';
import { CheckIcon, SealCheckIcon } from '@/components/shared/icons';
import { CALL_IS_NOT, CALL_NAME, CALL_STEPS, FAQ_PRIOR } from '@/lib/call-copy';
import { EMAIL_LABEL, LEGAL } from '@/lib/legal';

/* Step 1 of the call, verbatim: the one thing the copy asks the visitor to bring. */
const HAVE_READY = [[CALL_STEPS[0].title, CALL_STEPS[0].body]] as const;

export default function ThankYouPage() {
  return (
    <div className="sg-ty">
      <section className="ty-sec ty-dark ty-hero">
        <div className="ty-wrap">
          <span className="ty-seal" aria-hidden>
            <SealCheckIcon />
          </span>
          <span className="ty-badge">Booking confirmed</span>
          <h1 className="ty-h1">
            Your call is <em>booked.</em>
          </h1>
          <p className="ty-sub">
            The details are on their way to the email address you booked with. Put it in your
            calendar now, while it is in front of you.
          </p>

          <ul className="ty-chips">
            <li>
              <span className="ty-tick" aria-hidden>
                <CheckIcon />
              </span>
              Confirmation by email, with your joining details
            </li>
            <li>
              <span className="ty-tick" aria-hidden>
                <CheckIcon />
              </span>
              Directly with Stutie Gupta
            </li>
          </ul>
        </div>
      </section>

      <section className="ty-sec ty-light">
        <div className="ty-wrap">
          <span className="ty-eyebrow center">WHAT THIS CALL ACTUALLY IS</span>
          <h2 className="ty-h2">
            Your <em>{CALL_NAME}</em>
          </h2>

          <ol className="ty-ord-grid">
            {CALL_STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="ty-ord">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>

          <p className="ty-note">
            {CALL_IS_NOT} Please join on time, from the link in your confirmation email.
          </p>
        </div>
      </section>

      <section className="ty-sec ty-tint">
        <div className="ty-wrap">
          <span className="ty-eyebrow center">BEFORE THE CALL</span>
          <h2 className="ty-h2">
            What to keep <em>ready.</em>
          </h2>

          <ul className={HAVE_READY.length === 1 ? 'ty-ready single' : 'ty-ready'}>
            {HAVE_READY.map(([t, b]) => (
              <li key={t}>
                <h3>{t}</h3>
                <p>{b}</p>
              </li>
            ))}
          </ul>

          <p className="ty-note">{FAQ_PRIOR.a[0]}</p>
        </div>
      </section>

      <section className="ty-sec ty-dark ty-close">
        <div className="ty-wrap">
          <h2 className="ty-h2">
            See you <em>then.</em>
          </h2>
          <p className="ty-sub">
            Something come up, or the confirmation not arrived? Write to{' '}
            {LEGAL.email ? <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> : EMAIL_LABEL} or call{' '}
            {LEGAL.phoneHref ? <a href={`tel:${LEGAL.phoneHref}`}>{LEGAL.phone}</a> : LEGAL.phone}.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
