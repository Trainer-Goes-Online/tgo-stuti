import type { CSSProperties } from 'react';
import { ChatSlider } from './ChatSlider';
import { SectionMasthead } from './SectionMasthead';
import { VideoTestimonials } from './VideoTestimonials';

export function Proof() {
  return (
    <section id="stories" className="sdp-proof sdp-light">
      <div className="sdp-wrap">
        <SectionMasthead
          title={
            <>
              From Feeling Stuck To <em>Finally Finding Answers</em>
            </>
          }
          sub="See how people navigating career uncertainty, major life changes, emotional struggles and difficult decisions found greater clarity, confidence and direction through personalised 4D readings."
          delay=".06s"
        />

        <div data-sdp-reveal style={{ '--d': '.1s' } as CSSProperties}>
          <VideoTestimonials />
        </div>
      </div>

      <div className="sdp-wrap sdp-chat-wrap" data-sdp-reveal>
        <ChatSlider />
      </div>
    </section>
  );
}
