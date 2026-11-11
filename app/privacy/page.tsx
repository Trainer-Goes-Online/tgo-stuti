import type { Metadata } from 'next';

import '../legal.css';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy · Stutie Gupta',
  robots: { index: false, follow: false },
};

/* ⚠️ The client's own privacy policy goes here, moved verbatim. Never written fresh. */
export default function Page() {
  return (
    <LegalPage
      eyebrow="Legal"
      title={
        <>
          Privacy <em>Policy</em>
        </>
      }
      lede="[TODO: the client's privacy policy]"
      clauses={[
        {
          id: 'policy',
          heading: 'Privacy Policy',
          nav: 'Privacy Policy',
          pending: "The client's privacy policy has not been supplied. It is moved here verbatim when it arrives.",
          body: <p>[TODO: the client&apos;s privacy policy, verbatim]</p>,
        },
      ]}
      close={{
        heading: 'Questions about this policy?',
        body: 'Write to us and we will reply.',
      }}
    />
  );
}
