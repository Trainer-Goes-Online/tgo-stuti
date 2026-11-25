import type { CSSProperties } from 'react';
import { asset } from './asset-version';
import { CtaLockup } from './CtaLockup';

/**
 * BEAT 1 · hero (§8 focal media). There is no VSL: the focal object is
 * Stutie's photograph in a circle, set in the VSL frame's place.
 *
 * Copy order, fixed: audience pill → two-tier H1 → assurance line → lead →
 * concern chips (the copy's 4 + 3 rows) → photo → CTA lockup →
 * credibility table.
 */
export const HERO_PHOTO = { src: '/expert/stutie.webp', w: 1200, h: 1500 };

const CHIP_ROWS = [
  ['Career & Job Changes', 'Financial Setbacks', 'Marriage Delays', 'Chronic Health Issues'],
  ['Relationship Problems', 'Business Decisions', 'Feeling Stuck In Life'],
] as const;

/* `num` as a pair = a longer figure set on two fixed lines at a smaller size */
const STATS: ReadonlyArray<{ num: string | readonly [string, string]; lbl: string }> = [
  { num: '17+ Years', lbl: 'Of Experience' },
  { num: '1000+', lbl: 'People Guided Globally' },
  { num: ['4D Comprehensive', 'Reading'], lbl: 'Beyond Kundli & Numerology' },
  { num: '100%', lbl: 'Personalised Reading' },
];

const d = (s: string) => ({ '--d': s }) as CSSProperties;

export function Hero() {
  return (
    <section id="top" className="sdp-hero">
      <div className="sdp-wrap sdp-hero-inner">
        <div className="sdp-eyebrow-pill">
          <span className="glowdot" aria-hidden />
          <span className="eb-text">
            <span className="eb-kicker">For Men &amp; Women</span>{' '}
            <span className="eb-body">Who’ve Tried Multiple Astrology &amp; Numerology Readings Yet Still Feel Stuck</span>
          </span>
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

        <div className="sdp-hero-feature" data-sdp-reveal style={d('.2s')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset('/expert/stutie-hero-stats.webp')}
            alt="Stutie Gupta: 1.5M+ social media audience, 1000+ women coached, 11+ years in women’s health"
            width={1536}
            height={1024}
            fetchPriority="high"
            decoding="async"
          />
        </div>

        <div className="sdp-hero-name" data-sdp-reveal style={d('.23s')}>
          <p className="sdp-hero-name-nm">Stutie Gupta</p>
          <p className="sdp-hero-name-role">
            <span className="part">Soul Architect</span> <span className="sep" aria-hidden>|</span>{' '}
            <span className="part">Founder, 4D Clarity Method</span>
          </p>
        </div>

        <div data-sdp-reveal style={d('.26s')}>
          <CtaLockup />
        </div>

        <div className="sdp-cred-row" data-sdp-reveal style={d('.34s')}>
          {STATS.map((s) => (
            <div className="sdp-cred-card" key={s.lbl}>
              {typeof s.num === 'string' ? (
                <div className="sdp-cred-num">{s.num}</div>
              ) : (
                <div className="sdp-cred-num is-long">
                  <span>{s.num[0]}</span> <span>{s.num[1]}</span>
                </div>
              )}
              <div className="sdp-cred-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
