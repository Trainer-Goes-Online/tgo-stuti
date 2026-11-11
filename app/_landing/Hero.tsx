import type { CSSProperties } from 'react';
import { asset } from './asset-version';
import { CtaLockup } from './CtaLockup';
import { MediaPlaceholder } from './MediaPlaceholder';

/**
 * BEAT 1 · hero (§8 focal media). There is no VSL: the focal object is
 * Stutie's photograph, set in the VSL frame's place.
 *
 * Copy order, fixed: audience pill → two-tier H1 → assurance line → lead →
 * concern chips (the copy's 4 + 3 rows) → photo → CTA lockup →
 * credibility table.
 *
 * TO FILL: set HERO_PHOTO.src and its real pixel w/h. The frame takes its
 * width from the file's own ratio (portrait or landscape both fit, nothing
 * is cropped beyond the frame's edge). Bump ASSET_V in the same pass.
 */
export const HERO_PHOTO = { src: '', w: 1200, h: 1500 };

const CHIP_ROWS = [
  ['Career & Job Changes', 'Financial Setbacks', 'Marriage Delays', 'Chronic Health Issues'],
  ['Relationship Problems', 'Business Decisions', 'Feeling Stuck In Life'],
] as const;

const STATS = [
  { num: '1000+', lbl: 'People Guided Globally' },
  { num: '17+ Years', lbl: 'Of Experience' },
  { num: '4-Part Life Analysis', lbl: 'Beyond Traditional Astrology' },
  { num: '100%', lbl: 'Personalised Reading' },
] as const;

const d = (s: string) => ({ '--d': s }) as CSSProperties;

export function Hero() {
  const ar = (HERO_PHOTO.w / HERO_PHOTO.h).toFixed(4);

  return (
    <section id="top" className="sdp-hero">
      <div className="sdp-wrap sdp-hero-inner">
        <div className="sdp-eyebrow-pill">
          <span className="glowdot" aria-hidden />
          <span>For Men &amp; Women Who’ve Tried Multiple Astrology &amp; Numerology Readings Yet Still Feel Stuck</span>
        </div>

        <h1 className="sdp-h1" data-sdp-reveal style={d('.06s')}>
          <span className="sdp-h1-l1">
            Get Answers To Your <em>Biggest Life Questions</em>
          </span>
          <span className="sdp-h1-l2">
            Through One Personalised Reading That Goes Beyond Just Your Kundli &amp; Numbers.
          </span>
        </h1>

        <p className="sdp-hero-sub" data-sdp-reveal style={d('.12s')}>
          Without Fear-Based Predictions, Scare Tactics Or Pressure To Follow Expensive Remedies.
        </p>

        <p className="sdp-hero-lead" data-sdp-reveal style={d('.15s')}>
          Stutie’s personalised <strong>4D Clarity Method</strong> brings together Astrology, Numerology,
          Soul-Level insights &amp; your surroundings to explore your situation from four perspectives,
          recognise recurring patterns and discuss practical next steps for concerns including.
        </p>

        <div className="sdp-hero-markers" data-sdp-reveal style={d('.17s')} aria-label="Concerns covered">
          {CHIP_ROWS.map((row, r) => (
            <div className="sdp-hero-markers-row" key={r}>
              {row.map((m) => (
                <span className="sdp-marker-chip" key={m}>
                  <span className="sdp-marker-dot" aria-hidden />
                  {m}
                </span>
              ))}
            </div>
          ))}
        </div>

        <figure className="sdp-portrait" data-sdp-reveal style={{ '--ar': ar, '--d': '.2s' } as CSSProperties}>
          <div className="sdp-portrait-media">
            {HERO_PHOTO.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset(HERO_PHOTO.src)}
                alt="Stutie Gupta, The Soul Architect"
                width={HERO_PHOTO.w}
                height={HERO_PHOTO.h}
                decoding="async"
              />
            ) : (
              <MediaPlaceholder
                label="Stutie’s picture"
                note="Portrait · 4:5 assumed · 1200×1500 or larger"
              />
            )}
          </div>
        </figure>

        <div data-sdp-reveal style={d('.26s')}>
          <CtaLockup />
        </div>

        <div className="sdp-cred-row" data-sdp-reveal style={d('.34s')}>
          {STATS.map((s) => (
            <div className="sdp-cred-card" key={s.lbl}>
              <div className="sdp-cred-num">{s.num}</div>
              <div className="sdp-cred-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
