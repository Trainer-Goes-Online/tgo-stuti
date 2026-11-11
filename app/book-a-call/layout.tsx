import type { Metadata } from 'next';

import '../bookacall.css';

export const metadata: Metadata = {
  title: 'Book Your Private 1:1 Breakthrough Call · Stutie Gupta',
  robots: { index: false, follow: false },
};

export default function BookACallLayout({ children }: { children: React.ReactNode }) {
  return children;
}
