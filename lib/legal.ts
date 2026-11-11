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
  entity: '[TODO: registered legal entity]',
  /** The name the buyer recognises. Empty when it is the same as the entity. */
  tradeName: '[TODO: trading name, or empty]',
  /** As it should read in a sentence, lower case: 'a sole proprietorship'. */
  structure: '',
  address: '[TODO: registered postal address]',
  /** As it should be read, e.g. '98XXX XXXXX'. */
  phone: '[TODO: phone]',
  /** Digits with the country code, e.g. '+9198XXXXXXXX'. Empty disables tel: links. */
  phoneHref: '',
  /** Empty disables mailto: links. */
  email: '',
  /** Read as "the courts in …". */
  jurisdiction: '[TODO: jurisdiction]',
  effectiveDate: '[TODO: effective date]',
  brand: 'Stutie Gupta',
} as const;

export const EMAIL_LABEL = LEGAL.email || '[TODO: email]';
export const PHONE_DIGITS = LEGAL.phoneHref.replace(/\D/g, '');
export const STRUCTURE_KNOWN = LEGAL.structure.trim().length > 0;

/** ⚠️ The client's exact wording only. None was supplied. */
export const LEGAL_DISCLAIMER = '[TODO: disclaimer, client’s exact wording]';
