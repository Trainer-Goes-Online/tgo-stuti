import type { Metadata } from 'next';

import '../legal.css';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy · Stutie Gupta',
  robots: { index: false, follow: false },
};

/* ⚠️ The client's own refund and cancellation policy goes here, moved verbatim. Never written fresh. */
export default function Page() {
  return (
    <LegalPage
      eyebrow="Legal"
      title={
        <>
          Refund & <em>Cancellation</em>
        </>
      }
      lede="[TODO: the client's refund and cancellation policy]"
      clauses={[
        {
          id: 'policy',
          heading: 'Refund & Cancellation Policy',
          nav: 'Refund & Cancellation Policy',
          pending: "The client's refund and cancellation policy has not been supplied. It is moved here verbatim when it arrives.",
          body: <p>[TODO: the client&apos;s refund and cancellation policy, verbatim]</p>,
        },
      ]}
      close={{
        heading: 'Questions about this policy?',
        body: 'Write to us and we will reply.',
      }}
    />
  );
}
