'use client';

import { useState, type CSSProperties } from 'react';
import { asset } from './asset-version';
import { Lightbox } from './Lightbox';
import { MediaPlaceholder } from './MediaPlaceholder';
import { PlayIcon } from './icons';

/**
 * Posters, not players: each card is a button and the one lightbox mounts
 * the player only while open.
 */
export type VideoTestimonial = {
  label: string;
  w: number;
  h: number;
  src?: string;
  vimeoId?: string;
  poster?: string;
};

const PORTRAIT = { w: 1080, h: 1920 };

export const VIDEOS: VideoTestimonial[] = [
  { label: 'Video Testimonial 1', vimeoId: '1242682182', poster: '/video-testimonials/vt-01.webp', ...PORTRAIT },
  { label: 'Video Testimonial 2', vimeoId: '1242682159', poster: '/video-testimonials/vt-02.webp', ...PORTRAIT },
  { label: 'Video Testimonial 3', vimeoId: '1242682209', poster: '/video-testimonials/vt-03.webp', ...PORTRAIT },
  { label: 'Video Testimonial 4', vimeoId: '1242682162', poster: '/video-testimonials/vt-04.webp', ...PORTRAIT },
  { label: 'Video Testimonial 5', vimeoId: '1242682161', poster: '/video-testimonials/vt-05.webp', ...PORTRAIT },
];

function Card({ v, onPlay }: { v: VideoTestimonial; onPlay: (v: VideoTestimonial) => void }) {
  const style = { '--ar': (v.w / v.h).toFixed(4) } as CSSProperties;
  const playable = Boolean(v.src || v.vimeoId);

  if (!playable) {
    return (
      <div className="sdp-vt" style={style}>
        <MediaPlaceholder kind="film" label={v.label} note="Ratio unmeasured · 9:16 assumed" />
      </div>
    );
  }

  return (
    <button type="button" className="sdp-vt is-live" style={style} onClick={() => onPlay(v)} aria-label={`Play ${v.label}`}>
      {v.poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset(v.poster)} alt="" width={v.w} height={v.h} loading="lazy" decoding="async" />
      ) : (
        <span className="sdp-vt-film" />
      )}
      <span className="sdp-vt-disc" aria-hidden>
        <PlayIcon size={20} />
      </span>
    </button>
  );
}

export function VideoTestimonials() {
  const [open, setOpen] = useState<VideoTestimonial | null>(null);

  return (
    <>
      <div className="sdp-vt-row" role="list" aria-label="Video testimonials">
        {VIDEOS.map((v) => (
          <div role="listitem" className="sdp-vt-item" key={v.label}>
            <Card v={v} onPlay={setOpen} />
          </div>
        ))}
      </div>

      <Lightbox
        open={Boolean(open)}
        label={open?.label ?? 'Video testimonial'}
        ratio={open ? open.w / open.h : 9 / 16}
        onClose={() => setOpen(null)}
      >
        {open?.vimeoId ? (
          <iframe
            src={`https://player.vimeo.com/video/${open.vimeoId}?autoplay=1&title=0&byline=0&portrait=0&dnt=1`}
            title={open.label}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : open?.src ? (
          <video
            src={asset(open.src)}
            poster={open.poster ? asset(open.poster) : undefined}
            controls
            autoPlay
            playsInline
          />
        ) : null}
      </Lightbox>
    </>
  );
}
