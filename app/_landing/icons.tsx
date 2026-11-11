/**
 * Line glyphs for the landing page. The copy's emoji become one-colour
 * glyphs; the labels beside them stay verbatim.
 */

type IconProps = { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  'aria-hidden': true as const,
  focusable: false as const,
});

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** ⭐ */
export function StarIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} fill="currentColor">
      <path d="M12 3l2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8z" />
    </svg>
  );
}

/** 🔥 */
export function FlameIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} {...stroke}>
      <path d="M12 21c-3.9 0-6.6-2.7-6.6-6.3 0-3.2 2.1-5.3 3.6-7 .4 1.8 1.4 3 2.6 3.5-.2-3 1.1-5.6 3.4-7.7.3 3 1.6 4.6 2.9 6.2 1.1 1.4 1.7 3 1.7 5 0 3.6-2.7 6.3-7.6 6.3z" />
      <path d="M12 21c-1.7 0-2.9-1.2-2.9-2.8 0-1.5 1-2.5 2-3.6.5 1 1.2 1.6 1.9 1.8.9 1 1.5 1.6 1.5 2.4 0 1.3-1.1 2.2-2.5 2.2z" />
    </svg>
  );
}

/** 💯 */
export function SealCheckIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} {...stroke}>
      <path d="M12 2.8l2.1 1.6 2.6-.2.9 2.5 2.3 1.2-.4 2.6 1.4 2.2-1.4 2.2.4 2.6-2.3 1.2-.9 2.5-2.6-.2L12 21.2l-2.1-1.6-2.6.2-.9-2.5-2.3-1.2.4-2.6L3.1 11.3l1.4-2.2-.4-2.6 2.3-1.2.9-2.5 2.6.2z" />
      <path d="M8.6 12.2l2.3 2.3 4.5-4.6" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} {...stroke} strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.4 12.3l2.4 2.4 4.8-4.9" />
    </svg>
  );
}

export function UsersIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} {...stroke}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.2 20c0-3.2 2.6-5.6 5.8-5.6s5.8 2.4 5.8 5.6" />
      <path d="M15.6 5.2a3.2 3.2 0 0 1 0 6M17.6 14.6c1.9.7 3.2 2.6 3.2 5.4" />
    </svg>
  );
}

export function CheckIcon({ size = 13 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export function ChevronIcon({ size = 18, dir = 'right' }: IconProps & { dir?: 'left' | 'right' }) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === 'right' ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} />
    </svg>
  );
}

export function PlayIcon({ size = 26 }: IconProps) {
  return (
    <svg {...base(size)} fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function ExpandIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4H20v5.5M9.5 20H4v-5.5M20 4l-6.2 6.2M4 20l6.2-6.2" />
    </svg>
  );
}

export function PlusIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CloseIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ImageGlyph({ size = 30 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="M4 17l4.8-4.6a2 2 0 0 1 2.7-.1L20 19" />
    </svg>
  );
}

export function FilmGlyph({ size = 30 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 9h19M2.5 15h19M7.5 5v14M16.5 5v14" />
    </svg>
  );
}

export function TextGlyph({ size = 30 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2.5" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

/* ── The four perspectives of the 4D Clarity Method ─────────────── */

/** Astrology: a ringed planet with a star. */
export function AstrologyIcon({ size = 26 }: IconProps) {
  return (
    <svg {...base(size)} {...stroke}>
      <circle cx="11" cy="13" r="5.2" />
      <path d="M3.4 16.6c-1-1.7 2.1-4.6 6.9-6.5 4.8-1.9 9.1-2.1 10.1-.4" />
      <path d="M18.6 3.2l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6z" />
    </svg>
  );
}

/** Numerology: a number square. */
export function NumerologyIcon({ size = 26 }: IconProps) {
  return (
    <svg {...base(size)} {...stroke}>
      <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="2.4" />
      <path d="M9.2 3.6v16.8M14.8 3.6v16.8M3.6 9.2h16.8M3.6 14.8h16.8" />
      <circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Soul & Energy Insights: a radiant centre. */
export function SoulIcon({ size = 26 }: IconProps) {
  return (
    <svg {...base(size)} {...stroke}>
      <circle cx="12" cy="12" r="3.4" />
      <circle cx="12" cy="12" r="7" strokeDasharray="1.6 2.6" />
      <path d="M12 2.4v1.8M12 19.8v1.8M2.4 12h1.8M19.8 12h1.8M5.2 5.2l1.3 1.3M17.5 17.5l1.3 1.3M18.8 5.2l-1.3 1.3M6.5 17.5l-1.3 1.3" />
    </svg>
  );
}

/** Your Surroundings: a home set on a compass bearing. */
export function SurroundingsIcon({ size = 26 }: IconProps) {
  return (
    <svg {...base(size)} {...stroke}>
      <path d="M4.6 11.2L12 4.8l7.4 6.4" />
      <path d="M6.6 9.6v9.6h10.8V9.6" />
      <path d="M12 11.4l1.4 3.2-1.4 2.8-1.4-2.8z" />
    </svg>
  );
}
