/**
 * Every business fact the footer and the policy pages need, in one place.
 *
 * ⚠️ EVERY `[TODO]` IS A LAUNCH BLOCKER AND RENDERS ON THE PAGE. None may be
 * invented. Razorpay's merchant review looks for the entity, address, phone
 * and email ON THE SITE, not inside one policy page.
 */
export const LEGAL = {
  /** The legal person on the PAN and the Razorpay merchant record: the
   *  proprietor's own name for a sole proprietorship, or the Pvt Ltd / LLP name. */
  entity: 'Stutie Gupta',
  /** The name the buyer recognises. Empty when it is the same as the entity. */
  tradeName: 'Cube Readings by Stutie Gupta',
  /** As it should read in a sentence, lower case: 'a sole proprietorship'. */
  structure: '',
  address: 'D-54, Sector 26, Noida 201301',
  /** As it should be read, e.g. '98XXX XXXXX'. */
  phone: '95406 22223',
  /** Digits with the country code, e.g. '+9198XXXXXXXX'. Empty disables tel: links. */
  phoneHref: '+919540622223',
  /** Empty disables mailto: links. */
  email: 'stutieg@gmail.com',
  /** Read as "the courts in …". */
  jurisdiction: 'Uttar Pradesh',
  effectiveDate: '13 November 2026',
  brand: 'Stutie Gupta',
} as const;

export const EMAIL_LABEL = LEGAL.email || '[TODO: email]';
export const PHONE_DIGITS = LEGAL.phoneHref.replace(/\D/g, '');
export const STRUCTURE_KNOWN = LEGAL.structure.trim().length > 0;

export const LEGAL_DISCLAIMER =
  'All readings, content and resources are for guidance and general wellbeing purposes only. Astrology, numerology and related insights are not a substitute for professional medical, psychological, legal or financial advice, and do not diagnose, treat or cure any condition. Consult a qualified professional before making medical, legal or financial decisions. Individual experiences and outcomes vary, and no specific result is promised or guaranteed. Testimonials reflect individual experiences and do not guarantee similar results. This website is not affiliated with or endorsed by Meta. FACEBOOK and INSTAGRAM are trademarks of Meta Platforms, Inc.';
