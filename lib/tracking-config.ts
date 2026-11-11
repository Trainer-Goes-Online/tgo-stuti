import { site } from '@/lib/site';

/**
 * Server-side constants for the Meta event route.
 *
 * SITE_URL is the ONE origin literal in the codebase and it has no fallback:
 * it is Meta's event_source_url. Before setting it:
 *   curl -sS -o /dev/null -D - https://the-domain | grep -iE '^HTTP/|^location:'
 * A 308 means that host is not canonical. House standard is the apex.
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');

export const siteUrlReady = () => Boolean(SITE_URL);

export const TRACKING_CONFIG = {
  amountRupees: site.priceInr,
  currency: 'INR',
  fallbackEventSourceUrl: SITE_URL,
  meta: {
    pixelId: process.env.META_PIXEL_ID ?? '',
    accessToken: process.env.META_CAPI_ACCESS_TOKEN ?? '',
    testEventCode: process.env.META_CAPI_TEST_EVENT_CODE ?? '',
  },
} as const;

export const capiReady = () =>
  Boolean(TRACKING_CONFIG.meta.pixelId && TRACKING_CONFIG.meta.accessToken);
