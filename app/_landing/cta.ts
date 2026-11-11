import { CTA_LABEL } from '@/lib/site';

/**
 * The CTA label split into the two lines it takes below desktop. Derived from
 * CTA_LABEL, never retyped: the cut is the word boundary that makes the
 * longer line shortest, so any label LAUNCH sets still splits evenly.
 */
function balance(label: string): [string, string] {
  const words = label.trim().split(/\s+/);
  if (words.length < 2) return [label, ''];
  let cut = 1;
  let best = Infinity;
  for (let i = 1; i < words.length; i++) {
    const longer = Math.max(words.slice(0, i).join(' ').length, words.slice(i).join(' ').length);
    if (longer < best) {
      best = longer;
      cut = i;
    }
  }
  return [words.slice(0, cut).join(' '), words.slice(cut).join(' ')];
}

export const CTA_LINES = balance(CTA_LABEL);

/**
 * Width of the longer line in em, for the fluid font-size on narrow screens:
 * Manrope 800 caps average ~0.68em a character plus .05em tracking. An
 * estimate, not a measurement against the shipped woff2.
 */
export const CTA_EM = (Math.max(CTA_LINES[0].length, CTA_LINES[1].length) * 0.73 + 0.6).toFixed(1);
