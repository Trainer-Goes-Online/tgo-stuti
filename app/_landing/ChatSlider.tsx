'use client';

import { useState, type CSSProperties } from 'react';
import { asset } from './asset-version';
import { Lightbox } from './Lightbox';
import { ExpandIcon } from './icons';

/**
 * The names and roles are set in the artwork, so the page prints no caption;
 * they live in `alt` only. The set is rendered twice so the -50% marquee
 * loops seamlessly; the copy is hidden from assistive tech and tab order.
 */
type Chat = { file: string; w: number; h: number; alt: string };

const CARD = { w: 490, h: 782 };

const CHATS: Chat[] = [
  { file: 'chat-aditi-founder.webp', ...CARD, alt: 'WhatsApp testimonial from Aditi Aggarwal, Founder, Startup' },
  { file: 'chat-entrepreneur-delhi.webp', ...CARD, alt: 'WhatsApp testimonial from an anonymous entrepreneur' },
  { file: 'chat-it-manager-gurgaon.webp', ...CARD, alt: 'WhatsApp testimonial from an anonymous manager' },
  { file: 'chat-mahima-hospitality.webp', w: 700, h: 1166, alt: 'WhatsApp testimonial from Mahima, hospitality' },
  { file: 'chat-student-ncr.webp', ...CARD, alt: 'WhatsApp testimonial from an anonymous student' },
  { file: 'chat-sunaina-writer.webp', w: 682, h: 906, alt: 'Instagram story testimonial from Sunaina, content writer' },
  { file: 'chat-divya-kant-radiologist.webp', ...CARD, alt: 'WhatsApp testimonial from Dr Divya Kant, Head Radiologist' },
  { file: 'chat-entrepreneur-2.webp', ...CARD, alt: 'WhatsApp testimonial from an anonymous entrepreneur' },
  { file: 'chat-nattasha-kapoor.webp', ...CARD, alt: 'WhatsApp testimonial from Nattasha Kapoor, Spiritual coach' },
];

const src = (c: Chat) => asset(`/proof/chats/${c.file}`);

export function ChatSlider() {
  const [open, setOpen] = useState<Chat | null>(null);

  return (
    <div className="sdp-chat">
      <div className="sdp-chat-track">
        <div className={`sdp-chat-rail${open ? ' is-held' : ''}`}>
          {[0, 1].map((copy) =>
            CHATS.map((c) => (
              <div className="sdp-chat-item" key={`${copy}-${c.file}`} aria-hidden={copy === 1 || undefined}>
                <button
                  type="button"
                  className="sdp-chat-card"
                  style={{ '--ar': (c.w / c.h).toFixed(4) } as CSSProperties}
                  onClick={() => setOpen(c)}
                  aria-label={`Read full size: ${c.alt}`}
                  tabIndex={copy === 1 ? -1 : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src(c)} alt={copy === 1 ? '' : c.alt} width={c.w} height={c.h} decoding="async" />
                  <span className="sdp-chat-zoom" aria-hidden>
                    <ExpandIcon size={14} />
                  </span>
                </button>
              </div>
            )),
          )}
        </div>
      </div>

      <Lightbox
        open={Boolean(open)}
        label={open?.alt ?? 'Client message'}
        ratio={open ? open.w / open.h : CARD.w / CARD.h}
        tone="image"
        onClose={() => setOpen(null)}
      >
        {open && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src(open)} alt={open.alt} width={open.w} height={open.h} />
        )}
      </Lightbox>
    </div>
  );
}
