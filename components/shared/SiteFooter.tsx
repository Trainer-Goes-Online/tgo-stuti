import Link from 'next/link';

import { EMAIL_LABEL, LEGAL, LEGAL_DISCLAIMER } from '@/lib/legal';

/**
 * One footer, every surface. It carries the four facts Razorpay's merchant
 * review looks for on the site: entity, postal address, phone and email.
 * `folded` drops the band so it sits inside the landing finale's dark stage.
 */
const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/refund', label: 'Refund & Cancellation' },
] as const;

export function SiteFooter({ folded = false }: { folded?: boolean }) {
  return (
    <footer className={folded ? 'sg-foot sg-foot-folded' : 'sg-foot'}>
      <div className="sg-foot-wrap">
        <p className="sg-foot-lines">
          <span className="sg-foot-entity">{LEGAL.entity}</span>
          <br />
          {LEGAL.tradeName && (
            <>
              Trading as {LEGAL.tradeName}
              <br />
            </>
          )}
          {LEGAL.address}
          <br />
          {LEGAL.phoneHref ? <a href={`tel:${LEGAL.phoneHref}`}>{LEGAL.phone}</a> : LEGAL.phone}
          <span className="sg-foot-sep" aria-hidden>
            ·
          </span>
          {LEGAL.email ? <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> : EMAIL_LABEL}
        </p>

        <nav className="sg-foot-links" aria-label="Legal">
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>

        <p className="sg-foot-note">{LEGAL_DISCLAIMER}</p>

        <p className="sg-foot-copy">
          &copy; {new Date().getFullYear()} {LEGAL.entity}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
