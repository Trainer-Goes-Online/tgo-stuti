'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { CloseIcon } from './icons';

/**
 * One modal viewer for the proof beat. The content mounts only while open,
 * so closing it stops a video outright. Native <dialog>: ESC closes, focus
 * is trapped, and a click on the backdrop closes.
 */
export function Lightbox({
  open,
  label,
  ratio,
  tone = 'film',
  onClose,
  children,
}: {
  open: boolean;
  label: string;
  /** width / height of what is shown */
  ratio: number;
  tone?: 'film' | 'image';
  onClose: () => void;
  children?: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
    const html = document.documentElement;
    html.style.overflow = open ? 'hidden' : '';
    return () => {
      html.style.overflow = '';
    };
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="sdp-lb"
      aria-label={label}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {open && (
        <div
          className={`sdp-lb-frame is-${tone}`}
          style={{ '--ar': ratio.toFixed(4) } as CSSProperties}
        >
          {children}
        </div>
      )}
      <button type="button" className="sdp-lb-close" onClick={onClose} aria-label="Close">
        <CloseIcon />
      </button>
    </dialog>
  );
}
