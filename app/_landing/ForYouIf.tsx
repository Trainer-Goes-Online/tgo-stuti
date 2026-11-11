import type { CSSProperties } from 'react';
import { CheckIcon } from './icons';
import { SectionMasthead } from './SectionMasthead';

/**
 * BEAT 2 · this is for you if (§2, one-sided ✓ self-recognition list).
 * The copy disqualifies nobody, so no ✗ column, and it puts no CTA here.
 * Each row's opening clause is set bold at the sentence's own seam; every
 * word is the copy's.
 */
const ITEMS = [
  {
    head: 'You’ve been working hard but your career or business isn’t progressing,',
    body: 'with missed opportunities, delayed promotions, financial setbacks or plans that repeatedly fall through.',
  },
  {
    head: 'Your marriage or relationships keep running into problems,',
    body: 'whether it’s repeated disagreements, broken relationships, delayed marriage or uncertainty about your future with someone.',
  },
  {
    head: 'You’ve consulted astrologers, numerologists or tried different remedies,',
    body: 'but you’re still struggling with the same problems and haven’t received the clarity you were hoping for.',
  },
  {
    head: 'You’re facing an important life decision,',
    body: 'like changing jobs, starting a business, choosing a life partner or making a major investment, and don’t want to make a decision you’ll regret.',
  },
  {
    head: 'You feel there’s something you’re not understanding about your situation,',
    body: 'and want a more comprehensive reading that goes beyond your Kundli to consider multiple aspects of your life.',
  },
] as const;

export function ForYouIf() {
  return (
    <section id="for-you" className="sdp-who sdp-light-alt">
      <div className="sdp-wrap">
        <SectionMasthead
          eyebrow="For Men & Women Who Feel Stuck In Life Despite Their Best Efforts To Move Forward"
          title={
            <>
              This Is For You <em>If:</em>
            </>
          }
          delay=".06s"
        />

        <ul className="sdp-who-list">
          {ITEMS.map((it, i) => (
            <li key={it.head} data-sdp-reveal style={{ '--d': `${0.04 + i * 0.05}s` } as CSSProperties}>
              <span className="ck" aria-hidden>
                <CheckIcon />
              </span>
              <span>
                <strong>{it.head}</strong> {it.body}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
