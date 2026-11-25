/**
 * The pre-call qualification quiz: questions, answer shape and THE rule.
 *
 * SERVER-SAFE: no `'use client'`. The modal renders from these definitions and
 * /api/lead re-runs `evaluate()` on what it receives, so a visitor editing the
 * request in devtools cannot promote themselves to a QualifiedLead.
 *
 * Qualified =
 *   Q3 "open to investing" = yes
 *   AND Q4 is the one-time reading, the 3-month guidance, or a stated budget
 *       of at least MIN_BUDGET_INR.
 * Everything else (Q3 = no, Q4 = not ready, budget under the floor) is not.
 * Q1, Q2 and Q5 are recorded but do not decide qualification.
 */

/**
 * The question wording, shown in the modal AND sent to the webhook as
 * q1_question … q5_question, so the sheet always reads exactly what the
 * visitor was asked.
 */
export const QUESTIONS = {
  concern: 'Which area of your life are you currently seeking guidance on?',
  occupation: 'What do you do?',
  invest: 'Would you be open to investing in personalised support if it’s relevant to your concerns?',
  package: 'Which option best matches what you’re looking for and prepared to invest in?',
  timeline:
    'If you feel Stutie’s personalised guidance is right for you, how soon would you be ready to get started?',
} as const;

export const MIN_BUDGET_INR = 2000;
/** the amount box takes 4 digits */
export const MAX_BUDGET_INR = 9999;

export type Choice = { value: string; label: string; note?: string };

export const CONCERNS: Choice[] = [
  { value: 'career', label: 'Career, Job Change or Professional Growth' },
  { value: 'business', label: 'Business, Finances or Investments' },
  { value: 'relationship', label: 'Marriage, Compatibility or Relationship Concerns' },
  { value: 'health', label: 'Health or Personal Wellbeing' },
  { value: 'stuck', label: 'Recurring Life Problems or Feeling Stuck' },
  { value: 'decision', label: 'Major Life Decision or Transition' },
  { value: 'other', label: 'Other' },
];

export const INVEST: Choice[] = [
  { value: 'yes', label: 'Yes, I’m open to investing in personalised guidance.' },
  { value: 'no', label: 'No, I’m only looking for free guidance at this stage.' },
];

export const PACKAGES: Choice[] = [
  {
    value: 'reading',
    label: 'One Comprehensive 4D Reading | ₹7,500',
    note: 'Understand your situation from four perspectives and receive personalised guidance on your next steps.',
  },
  {
    value: 'guidance',
    label: '3-Month Personalised Guidance | ₹21,000',
    note: 'Three comprehensive readings and ongoing support to implement.',
  },
  /* "__" is where the modal puts the amount box (₹, up to 4 digits) */
  { value: 'budget', label: 'I’m on a tight budget, I can only invest up to __ right now.' },
  { value: 'not_ready', label: 'I’m not ready to invest in a paid reading right now.' },
];

export const TIMELINES: Choice[] = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '2_4_weeks', label: 'Within the next 2–4 weeks' },
  { value: 'exploring', label: 'I’m exploring my options for now' },
];

export type QuizAnswers = {
  concern: string;
  concernOther: string;
  occupation: string;
  invest: string;
  /** '' when Q4 was skipped because Q3 was "no" */
  package: string;
  /** rupees, only meaningful when package === 'budget' */
  budget: number | null;
  timeline: string;
  firstName: string;
  lastName: string;
  email: string;
  /** ISO code of the country picked for the phone number, e.g. 'IN' */
  phoneIso: string;
  /** the national number as typed, without the country code */
  phone: string;
  city: string;
};

export type Verdict = { qualified: boolean; reason: string };

export function evaluate(a: Pick<QuizAnswers, 'invest' | 'package' | 'budget'>): Verdict {
  if (a.invest !== 'yes') return { qualified: false, reason: 'not_open_to_investing' };
  if (a.package === 'reading' || a.package === 'guidance') return { qualified: true, reason: '' };
  if (a.package === 'budget') {
    return (a.budget ?? 0) >= MIN_BUDGET_INR
      ? { qualified: true, reason: '' }
      : { qualified: false, reason: 'budget_below_minimum' };
  }
  return { qualified: false, reason: 'not_ready_to_invest' };
}

/* ── identity normalisers, shared by the form and the server ───────── */

/* local@domain.tld: no spaces, no consecutive dots, letters-only TLD of 2+ */
export const EMAIL_RE = /^(?!.*\.\.)[A-Za-z0-9._%+'-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

/* ── personal details: one rule set, used by the modal AND /api/lead ── */

/** Letters (any script), spaces, apostrophes, dots and hyphens. No digits. */
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;
/** What the name/city boxes accept while typing; everything else is dropped. */
export const sanitizeName = (v: string) =>
  v.replace(/[^\p{L}\p{M}' .-]/gu, '').replace(/\s{2,}/g, ' ').replace(/^\s+/, '');

/** Common domain slips → the domain they meant. */
const EMAIL_TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gamil.com': 'gmail.com',
  'gnail.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.cm': 'gmail.com',
  'gmail.in': 'gmail.com', 'yaho.com': 'yahoo.com', 'yahoo.co': 'yahoo.com', 'yahoo.con': 'yahoo.com',
  'hotmial.com': 'hotmail.com', 'hotmail.co': 'hotmail.com', 'outlok.com': 'outlook.com',
  'outlook.co': 'outlook.com', 'icloud.co': 'icloud.com', 'rediffmail.co': 'rediffmail.com',
};
export function emailTypoFix(email: string): string {
  const at = email.lastIndexOf('@');
  if (at < 0) return '';
  const fix = EMAIL_TYPOS[email.slice(at + 1).toLowerCase()];
  return fix ? `${email.slice(0, at + 1)}${fix}` : '';
}

/** Max digits the phone box takes for a dial code: India 10, elsewhere 14. */
export const phoneMaxDigits = (dial: string) => (dial === '91' ? 10 : 14);

export type DetailField = 'firstName' | 'lastName' | 'email' | 'phone' | 'city';
export const DETAIL_FIELDS: DetailField[] = ['firstName', 'lastName', 'email', 'phone', 'city'];

/** The message for one field, or '' when it is fine. */
export function detailError(
  field: DetailField,
  a: Pick<QuizAnswers, DetailField>,
  dial: string,
): string {
  switch (field) {
    case 'firstName':
    case 'lastName': {
      const v = a[field].trim();
      const label = field === 'firstName' ? 'first' : 'last';
      if (!v) return `Please enter your ${label} name.`;
      if (!NAME_RE.test(v)) return 'Please use letters only.';
      if (field === 'firstName' && v.length < 2) return 'Please enter your full first name.';
      if (v.length > 40) return 'That looks too long.';
      return '';
    }
    case 'email': {
      const v = a.email.trim();
      if (!v) return 'Please enter your email address.';
      if (v.length > 254 || !EMAIL_RE.test(v)) return 'Please enter a valid email, e.g. name@gmail.com';
      const fix = emailTypoFix(v);
      if (fix) return `Did you mean ${fix}?`;
      return '';
    }
    case 'phone': {
      const digits = a.phone.replace(/\D/g, '');
      if (!digits) return 'Please enter your WhatsApp number.';
      if (dial === '91') {
        if (digits.replace(/^0+/, '').length !== 10) return 'Please enter a 10-digit mobile number.';
        if (!normalizePhone(dial, a.phone)) return 'Indian mobile numbers start with 6, 7, 8 or 9.';
        return '';
      }
      return normalizePhone(dial, a.phone) ? '' : 'Please check the number for the selected country.';
    }
    case 'city': {
      const v = a.city.trim();
      if (!v) return 'Please enter your city.';
      if (!NAME_RE.test(v)) return 'Please use letters only.';
      if (v.length < 2 || v.length > 60) return 'Please enter a valid city name.';
      return '';
    }
  }
}

export function detailErrors(a: Pick<QuizAnswers, DetailField>, dial: string) {
  const out: Partial<Record<DetailField, string>> = {};
  for (const f of DETAIL_FIELDS) {
    const m = detailError(f, a, dial);
    if (m) out[f] = m;
  }
  return out;
}

/**
 * The full number as Meta and the webhook want it: country code + national
 * number, digits only (E.164 without the +). `dial` comes from the country
 * picker; `national` is what was typed. Returns '' when it cannot be real.
 *   - a trunk 0 is dropped ("098765…" → "98765…")
 *   - the code typed again in the box ("91 98765…") is dropped
 *   - India must be a 10-digit mobile starting 6–9; elsewhere 4–14 digits,
 *     at most 15 in total
 */
export function normalizePhone(dial: string, national: string): string {
  const code = (dial || '').replace(/\D/g, '');
  let n = (national || '').replace(/\D/g, '').replace(/^0+/, '');
  if (!code || !n) return '';
  if (n.startsWith(code) && (code === '91' ? n.length === 12 : code.length + n.length > 15)) {
    n = n.slice(code.length);
  }
  if (code === '91') return /^[6-9]\d{9}$/.test(n) ? `91${n}` : '';
  const full = `${code}${n}`;
  return n.length >= 4 && n.length <= 14 && full.length >= 8 && full.length <= 15 ? full : '';
}

export const labelOf = (list: Choice[], value: string) =>
  list.find((c) => c.value === value)?.label ?? '';
