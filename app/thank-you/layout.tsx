import type { Metadata } from 'next';

import '../thankyou.css';

export const metadata: Metadata = {
  title: 'Your call is booked · Stutie Gupta',
  robots: { index: false, follow: false },
};

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return children;
}
