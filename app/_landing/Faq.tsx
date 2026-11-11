import { SectionMasthead } from './SectionMasthead';
import { PlusIcon } from './icons';

/**
 * BEAT 10 · FAQ (§5 ruled ledger, LIGHT). Native <details>, so it works
 * with no JS. Q1 opens on load. No "Most asked" pill: nobody has measured
 * which question is asked most. The copy's "1." numbering becomes the Q.0N
 * ordinal; questions and answers verbatim.
 */
const QA: { q: string; a: string[] }[] = [
  {
    q: 'How is the 4D Clarity Method different from a regular Astrology or future prediction reading?',
    a: [
      'Think of it like a health check-up. If you’re constantly feeling tired, a doctor wouldn’t look at just your iron levels. They might also check your thyroid, vitamin levels and other health markers to understand the bigger picture.',
      'The same principle guides the 4D Clarity Method. Your horoscope or numbers may offer one perspective, but they don’t necessarily tell the whole story.',
      'By bringing together planets, numbers, soul patterns, current energy imprints, and your surroundings, the method offers a more comprehensive interpretation of your circumstances, helping you explore patterns and questions that a single reading might overlook.',
    ],
  },
  {
    q: 'I’ve already consulted astrologers and tried different remedies. How will this be different?',
    a: [
      'Many people who come to us have already consulted multiple astrologers, followed suggested remedies or received completely different predictions about the same problem. Yet, months or even years later, they’re still dealing with the same concerns.',
      'Often, the issue isn’t that their previous readings were necessarily wrong. It’s that each practitioner may have looked at their situation through a different, individual approach, without considering how other aspects might connect.',
      'That’s where the 4D Clarity Method is different. Instead of giving you another isolated prediction or a list of remedies, it brings together four perspectives to help you understand what may have been overlooked and which questions deserve a closer look.',
    ],
  },
  {
    q: 'Do I need to know anything about Astrology, Numerology or spiritual practices before booking?',
    a: [
      'Not at all. You don’t need any prior knowledge of Astrology, Numerology or spiritual practices. What matters more is your willingness to understand your situation with an open mind.',
      'Some people come to us having consulted multiple astrologers, while others are exploring a reading for the very first time. Both are equally welcome.',
    ],
  },
  {
    q: 'Will I be asked to follow expensive remedies or make changes to my home?',
    a: [
      'Not every reading leads to remedies, and you won’t automatically be asked to make changes to your home or office.',
      'The purpose of the 4D Clarity Method is to explore your situation through different perspectives, rather than prescribe the same remedies to everyone.',
      'If an additional Vastu assessment or any other service is considered relevant, this will be discussed separately, including what it involves. You’re free to decide whether you wish to proceed.',
    ],
  },
  {
    q: 'Will my 1:1 consultation be directly with Stutie Gupta?',
    a: [
      'Yes, your 1:1 consultation will be directly with Stutie Gupta, where you’ll have the opportunity to discuss your concerns, ask questions and understand how her 4D Clarity Method can help you.',
      'This is a private, personalised conversation focused on your situation, rather than a generic consultation where everyone receives the same advice.',
    ],
  },
];

export function Faq() {
  return (
    <section id="faq" className="sdp-faq sdp-light">
      <div className="sdp-wrap">
        <SectionMasthead
          title={
            <>
              Frequently Asked <em>Questions</em>
            </>
          }
          delay=".06s"
        />

        <div className="sdp-faq-list">
          {QA.map((item, i) => (
            <details className="sdp-q" key={item.q} open={i === 0}>
              <summary className="sdp-q-head">
                <span className="sdp-q-text">
                  <span className="qn">Q.{String(i + 1).padStart(2, '0')}</span>
                  {item.q}
                </span>
                <span className="ic" aria-hidden>
                  <PlusIcon />
                </span>
              </summary>
              <div className="sdp-q-inner">
                {item.a.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
