import type { CSSProperties } from 'react';
import { asset } from './asset-version';
import { CtaLockup } from './CtaLockup';
import { SectionMasthead } from './SectionMasthead';

export function Method() {
  return (
    <section id="method" className="sdp-mech sdp-light">
      <div className="sdp-wrap">
        <SectionMasthead
          title={
            <>
              Your Horoscope Is Just <em>One Piece Of The Puzzle.</em>
            </>
          }
          sub="Traditional astrology looks at your planetary positions, while numerology focuses on your numbers. But your life isn’t influenced by just one factor, so why should your reading be limited to one?"
          delay=".06s"
        />

        <div className="sdp-mech-grid">
          <figure className="sdp-mech-fig" data-sdp-reveal>
            <img
              src={asset('/method/4d-clarity.webp')}
              alt="The 4D Clarity Method: Astrology, Numerology, Soul & Energy and Your Surroundings, four perspectives in one complete reading"
              width={1080}
              height={1080}
              loading="lazy"
              decoding="async"
            />
          </figure>

          <div className="sdp-mech-body" data-sdp-reveal style={{ '--d': '.1s' } as CSSProperties}>
            <p>
              That’s where the <strong>4D Clarity Method</strong> takes a different approach. By combining
              Astrology, Numerology, Soul &amp; Energy Insights, and Your Surroundings, it looks at your
              situation from four interconnected perspectives rather than relying on just one.
            </p>
          </div>
        </div>

        <blockquote className="sdp-pull" data-sdp-reveal>
          <p>
            This helps you understand your current challenges more comprehensively, recognise patterns that may
            have been overlooked and gain greater clarity on what to do next.
          </p>
        </blockquote>

        <div className="sdp-mech-cta" data-sdp-reveal>
          <CtaLockup />
        </div>
      </div>
    </section>
  );
}
