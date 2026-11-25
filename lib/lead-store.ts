'use client';

/**
 * What the quiz learned about this visitor, kept in the browser so the steps
 * after it can use it:
 *   - the landing CTAs skip the quiz for someone already qualified
 *   - /book-a-call pre-fills Cal's name and email
 *   - Schedule goes to Meta with the same email, phone and name as Lead,
 *     which is what lifts its match quality
 * Every read and write tolerates storage being unavailable.
 */

const KEY = 'sg_lead';

export type StoredLead = {
  leadId: string;
  qualified: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  savedAt: number;
};

export function saveLead(lead: Omit<StoredLead, 'savedAt'>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...lead, savedAt: Date.now() }));
  } catch {
    /* private mode: the booking simply is not pre-filled */
  }
}

export function readLead(): StoredLead | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<StoredLead>;
    return v && typeof v.email === 'string' ? (v as StoredLead) : null;
  } catch {
    return null;
  }
}
