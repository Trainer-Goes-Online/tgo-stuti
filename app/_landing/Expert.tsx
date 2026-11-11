import type { CSSProperties } from 'react';
import { asset } from './asset-version';
import { HERO_PHOTO } from './Hero';
import { MediaPlaceholder } from './MediaPlaceholder';
import { SectionMasthead } from './SectionMasthead';

const FOUNDER_PHOTO = { src: '/expert/stutie.webp', w: 1200, h: 1500 };

export function Expert() {
  const photo = FOUNDER_PHOTO.src ? FOUNDER_PHOTO : HERO_PHOTO;

  return (
    <section id="expert" className="sdp-coach sdp-dark">
      <div className="sdp-wrap">
        <SectionMasthead
          title={
            <>
              Meet Stutie Gupta, <em>The Soul Architect</em>
            </>
          }
          sub="The Expert Who Looks Beyond Your Horoscope To Understand The Bigger Picture."
          delay=".06s"
        />

        <div className="sdp-coach-grid">
          <div
            className="sdp-coach-photo"
            data-sdp-reveal
            style={{ '--ar': (photo.w / photo.h).toFixed(4) } as CSSProperties}
          >
            {photo.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset(photo.src)}
                alt="Stutie Gupta"
                width={photo.w}
                height={photo.h}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <MediaPlaceholder label="Stutie’s portrait" note="Portrait · 4:5 assumed" />
            )}
          </div>

          <div className="sdp-coach-body" data-sdp-reveal style={{ '--d': '.1s' } as CSSProperties}>
            <p className="lede">
              With <strong>17+ years of experience</strong> in Astrology, Numerology, Vastu and energy-based
              practices, Stutie Gupta has guided <strong>1000+ people globally</strong>, helping them better
              understand the challenges and recurring patterns in their lives.
            </p>
            <p>
              Unlike conventional readings that focus on a single modality, her approach looks at your birth
              chart, numbers, soul-level insights and surroundings together, offering a more comprehensive
              perspective on your career, finances, marriage, relationships and important life decisions.
            </p>
            <p>
              Today, through her signature <strong>4D Clarity Method</strong>, she offers personalised guidance
              to people seeking answers beyond traditional Astrology and Numerology.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
