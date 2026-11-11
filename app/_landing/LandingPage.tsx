import './landing.css';

import { AnnounceStrip } from './AnnounceStrip';
import { CallAgenda } from './CallAgenda';
import { Expert } from './Expert';
import { Faq } from './Faq';
import { Finale } from './Finale';
import { ForYouIf } from './ForYouIf';
import { Hero } from './Hero';
import { Method } from './Method';
import { Proof } from './Proof';
import { ScrollReveal } from './ScrollReveal';
import { StickyCta } from './StickyCta';
import { TrustRow } from './TrustRow';

/**
 * Stutie Gupta · 1:1 Breakthrough Call landing page. SDP VSL skin, in the
 * copy's order:
 *
 *   0a announcement strip   §11 chrome                 brand bar
 *   0b trust row            §12 chip row               light-alt strip
 *   1  hero                 §8 focal photo (no VSL)    stage
 *   6  4D method            four-piece figure + pull   LIGHT
 *   2  this is for you if   §2 one-sided ✓ list        LIGHT-ALT
 *   3/4 proof               §6 videos, chats, cases    LIGHT
 *   5  meet stutie          TEXT + portrait            DARK
 *   7  the call             §1 call-agenda ledger      LIGHT-ALT
 *   10 faq                  §5 ruled ledger            LIGHT
 *   11 finale               the peak                   DARK
 *   12 sticky cta           chrome
 *
 * Absent because the copy has no such beat: guarantee (8), two choices (9).
 */
export default function LandingPage() {
  return (
    <main className="sdp-root">
      <ScrollReveal />
      <AnnounceStrip />
      <TrustRow />
      <Hero />
      <Method />
      <ForYouIf />
      <Proof />
      <Expert />
      <CallAgenda />
      <Faq />
      <Finale />
      <StickyCta />
    </main>
  );
}
