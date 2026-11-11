import type { Metadata } from 'next';

import '../legal.css';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms & Conditions · Stutie Gupta',
  robots: { index: false, follow: false },
};

/* ⚠️ The client's own terms and conditions goes here, moved verbatim. Never written fresh. */
export default function Page() {
  return (
    <LegalPage
      eyebrow="Legal"
      title={
        <>
          Terms & <em>Conditions</em>
        </>
      }
      lede="[TODO: the client's terms and conditions]"
      clauses={[
        {
          id: 'policy',
          heading: 'Terms & Conditions',
          nav: 'Terms & Conditions',
          pending: "The client's terms and conditions has not been supplied. It is moved here verbatim when it arrives.",
          body: <p>[TODO: the client&apos;s terms and conditions, verbatim]</p>,
        },
      ]}
      close={{
        heading: 'Questions about this policy?',
        body: 'Write to us and we will reply.',
      }}
    />
  );
}
