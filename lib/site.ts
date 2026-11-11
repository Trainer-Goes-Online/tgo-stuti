/**
 * A free call: landing -> /book-a-call (Cal) -> /thank-you. Every landing CTA
 * points at `ctaHref`. Nothing is sold on the site, so every tracked value is 0.
 */
export const site = {
  ctaHref: '/book-a-call',
  priceInr: 0,
};

/** The copy's CTA, verbatim. */
export const CTA_LABEL = 'Click Here To Book Your Private 1:1 Breakthrough Call';

/* Neutral labels for the GA4 item. They never reach Meta. */
export const PRODUCT_LABEL = 'Private Call';
export const GA4_ITEM_ID = 'stuti-call';
