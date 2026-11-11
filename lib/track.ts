'use client';

import { site, GA4_ITEM_ID, PRODUCT_LABEL } from '@/lib/site';
import { collectSignals } from '@/lib/client-signals';
import type { SendableEvent } from '@/lib/meta-capi';
import { ga4AddToCart, ga4GenerateLead, ga4ViewItem, once, type Ga4Item } from '@/lib/ga4';

/**
 * The one place a page records something: Meta by its standard name through
 * the CAPI route, GA4 by its own recommended name.
 *
 *   landing or booking arrival  ViewContent / view_item   once per session
 *   booking page arrival        AddToCart / add_to_cart   once per session
 *   Cal booking completed       Schedule / generate_lead  once per booking
 *
 * AddToCart is the arrival, never the CTA click: the landing page has several
 * CTAs, and counting clicks double-counts anyone who taps two.
 */

const VALUE = site.priceInr;

/* GA4 only. The item name never reaches Meta. */
const ITEM: Ga4Item = {
  item_id: GA4_ITEM_ID,
  item_name: PRODUCT_LABEL,
  price: VALUE,
  quantity: 1,
};
const money = { value: VALUE, currency: 'INR', items: [ITEM] };

/** Fire-and-forget, keepalive so it survives the navigation a click causes. */
function capi(eventName: SendableEvent, extra: Record<string, string> = {}) {
  const s = collectSignals();
  try {
    void fetch('/api/meta/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ eventName, ...s, ...extra }),
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}

/** The offer has been seen. Once per SESSION. */
export function trackViewItem() {
  once('view_item', () => {
    capi('ViewContent');
    ga4ViewItem(money);
  });
}

export function trackAddToCart() {
  once('add_to_cart', () => {
    capi('AddToCart');
    ga4AddToCart(money);
  });
}

/** From Cal's booking callback only. Keyed on Cal's booking uid when it sends one. */
export function trackSchedule(bookingId: string) {
  once(`schedule_${bookingId || `t${Date.now()}`}`, () => {
    capi('Schedule', bookingId ? { bookingId } : {});
    ga4GenerateLead({ value: 0, currency: 'INR' });
  });
}
