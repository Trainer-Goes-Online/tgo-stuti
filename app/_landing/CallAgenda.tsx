import type { CSSProperties } from 'react';
import { CtaLockup } from './CtaLockup';
import { SectionMasthead } from './SectionMasthead';

/**
 * BEAT 7 · what the call covers (§1 call-agenda ledger, LIGHT-ALT). This is
 * the order the call runs in and the copy numbers it, so the ordinals stay
 * and a spine joins them. Titles and bodies verbatim.
 */
const STEPS = [
  {
    title: 'Identify Your Most Pressing Life Question',
    body: 'Briefly share the one area of your life where you’re seeking guidance, whether it’s a career decision, financial concern, relationship or something else, and what you’d most like to understand.',
  },
  {
    title: 'Understand What A Comprehensive 4D Reading Could Reveal',
    body: 'Learn how looking at your birth chart, numbers, current energy patterns and surroundings together could offer a different perspective from a conventional Astrology or Numerology consultation.',
  },
  {
    title: 'Know Exactly What Your Next Step Could Look Like',
    body: 'Understand whether the 4D Clarity Method is relevant to your concerns, what your personalised reading would involve and how to proceed if you decide it’s right for you.',
  },
] as const;

export function CallAgenda() {
  return (
    <section id="call" className="sdp-agenda sdp-light-alt">
      <div className="sdp-wrap">
        <SectionMasthead
          title={
            <>
              What Can You Expect From Your <em>Private 1:1 Breakthrough Call?</em>
            </>
          }
          sub="A focused conversation about the problems you’re facing, the answers you’re looking for and whether a comprehensive 4D reading is the right approach for you."
          delay=".06s"
        />

        <ol className="sdp-agenda-list">
          {STEPS.map((s, i) => (
            <li
              className="sdp-agenda-row"
              key={s.title}
              data-sdp-reveal
              style={{ '--d': `${0.04 + i * 0.08}s` } as CSSProperties}
            >
              <span className="sdp-agenda-num" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="sdp-agenda-card">
                <h3 className="sdp-agenda-title">
                  <span className="sdp-visually-hidden">{i + 1}. </span>
                  {s.title}
                </h3>
                <p className="sdp-agenda-body">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="sdp-agenda-cta" data-sdp-reveal>
          <CtaLockup />
        </div>
      </div>
    </section>
  );
}
