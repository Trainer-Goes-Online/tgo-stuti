'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { site } from '@/lib/site';
import { CTA_EM, CTA_LINES } from './cta';
import { ArrowRightIcon, StarIcon, UsersIcon } from './icons';

/**
 * BEAT 12 · sticky CTA (page chrome). Shown once the hero has scrolled off,
 * hidden again at the finale so the peak and the folded footer are never
 * covered (so it needs no reserved height). Server-renders hidden and
 * inert; if JS never runs, every CTA section still has its own button.
 * The two trust lines are the copy's own badges.
 */
export function StickyCta() {
  const [pastHero, setPastHero] = useState(false);
  const [atFinale, setAtFinale] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('top');
    const finale = document.getElementById('finale');
    const obs: IntersectionObserver[] = [];

    if (hero) {
      const io = new IntersectionObserver(
        ([e]) => setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0),
        { threshold: 0 }
      );
      io.observe(hero);
      obs.push(io);
    }
    if (finale) {
      const io = new IntersectionObserver(([e]) => setAtFinale(e.isIntersecting), { threshold: 0 });
      io.observe(finale);
      obs.push(io);
    }
    return () => obs.forEach((o) => o.disconnect());
  }, []);

  const on = pastHero && !atFinale;

  return (
    <div className={`sdp-stuck${on ? ' on' : ''}`} aria-hidden={!on}>
      <span className="sdp-stuck-beam" aria-hidden />
      <div className="sdp-stuck-inner">
        <a
          className="sdp-stuck-go"
          href={site.ctaHref}
          tabIndex={on ? 0 : -1}
          data-cta
          style={{ '--cta-em': CTA_EM } as CSSProperties}
        >
          <span className="cta-label">
            <span className="cta-l">{CTA_LINES[0]}</span> <span className="cta-l">{CTA_LINES[1]}</span>
          </span>
          <span className="arrow" aria-hidden>
            <ArrowRightIcon size={12} />
          </span>
        </a>
        <ul className="sdp-stuck-trust">
          <li>
            <span className="trust-ic" aria-hidden>
              <StarIcon size={13} />
            </span>
            <b>100%</b> Customer Satisfaction
          </li>
          <li>
            <span className="trust-ic" aria-hidden>
              <UsersIcon size={14} />
            </span>
            <b>1000+</b> People Guided Globally
          </li>
        </ul>
      </div>
    </div>
  );
}
