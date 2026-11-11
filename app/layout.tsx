import type { Metadata } from 'next';

import './globals.css';
import './footer.css';

import { fontVariables } from '@/app/_landing/fonts';
import Analytics from '@/components/shared/Analytics';
import FunnelTracker from '@/components/shared/FunnelTracker';
import MetaPixel from '@/components/shared/MetaPixel';

export const metadata: Metadata = {
  title: 'Get Answers To Your Biggest Life Questions · Stutie Gupta',
  description:
    'One Personalised Reading That Goes Beyond Just Your Kundli & Numbers, through Stutie Gupta’s 4D Clarity Method.',
  /* Pre-launch: comes off once the placeholders, legal pages and domain are in. */
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        {children}
        {/* Each renders nothing without its env id. MetaPixel captures
            attribution ABOVE its own pixel guard, on every page. */}
        <MetaPixel />
        <Analytics />
        <FunnelTracker />
      </body>
    </html>
  );
}
