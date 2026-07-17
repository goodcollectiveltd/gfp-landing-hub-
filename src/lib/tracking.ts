/**
 * Meta Pixel + ad-attribution passthrough for the public advertorial pages.
 *
 * Ported from the (production-proven) GFP quiz funnel. The advertorial fires the
 * SAME Meta pixel the Shopify store fires Purchase to, so the ad → advertorial →
 * store journey stays on one pixel and attribution lines up. On every CTA we
 * forward the ad-click ids (fbclid) + Meta browser cookies (_fbp/_fbc) + UTMs to
 * the Shopify URL, because cookies do NOT cross from lp.goodforpets.co to
 * goodforpets.co — the query params are what let the store attribute the sale.
 *
 *   VITE_META_PIXEL_ID  Meta (Facebook) Pixel ID (optional override)
 *   VITE_GA4_ID         GA4 Measurement ID (G-XXXXXXX) — optional, secondary
 */

// GFP's live Meta pixel, matching goodforpets.co (Shopify) which records Purchase.
const DEFAULT_PIXEL_ID = "3813384208943708";
// `||` (not ??) so an EMPTY env var in the host still falls through to the default.
const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string | undefined) || (import.meta.env.PROD ? DEFAULT_PIXEL_ID : undefined);
const GA4_ID = (import.meta.env.VITE_GA4_ID as string | undefined) || undefined;

const ATTR_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "fbclid", "gclid", "ttclid", "ad_id", "campaign_id",
];
const STORAGE_KEY = "gfp_attr";

type AnyWin = typeof window & { fbq?: (...a: unknown[]) => void; gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] };

/** Call once on page mount: persist ad attribution, boot the pixel + GA4. */
export function initTracking() {
  captureAttribution();
  initMetaPixel();
  initGA4();
}

/** Persist ad-click / UTM params for the session so we can forward them to Shopify. */
function captureAttribution() {
  try {
    const params = new URLSearchParams(window.location.search);
    const saved = getAttribution();
    let changed = false;
    for (const k of ATTR_KEYS) {
      const v = params.get(k);
      if (v) { saved[k] = v; changed = true; }
    }
    if (changed) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch { /* ignore */ }
}

export function getAttribution(): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

function getCookie(name: string): string {
  const m = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return m ? decodeURIComponent(m.pop() as string) : "";
}

/**
 * Append captured attribution + Meta browser cookies (_fbp/_fbc) to an outbound
 * Shopify URL so conversions attribute back to the ad. Use on every CTA link.
 */
export function withAttribution(url: string): string {
  try {
    const u = new URL(url);
    for (const [k, v] of Object.entries(getAttribution())) {
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    }
    const fbp = getCookie("_fbp"); if (fbp) u.searchParams.set("fbp", fbp);
    const fbc = getCookie("_fbc"); if (fbc) u.searchParams.set("fbc", fbc);
    return u.toString();
  } catch { return url; }
}

function initMetaPixel() {
  if (!PIXEL_ID) return;
  const w = window as AnyWin;
  /* eslint-disable */
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
    t = b.createElement(e); t.async = true; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  })(w, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */
  w.fbq!("init", PIXEL_ID);
  w.fbq!("track", "PageView");
}

function initGA4() {
  if (!GA4_ID) return;
  const w = window as AnyWin;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(s);
  w.dataLayer = w.dataLayer || [];
  w.gtag = function () { w.dataLayer!.push(arguments); };
  w.gtag("js", new Date());
  w.gtag("config", GA4_ID);
}

const META_STANDARD = new Set(["Lead", "InitiateCheckout", "CompleteRegistration", "ViewContent", "Purchase"]);

/** Fire an event to Meta Pixel + GA4 (whichever are configured). */
export function track(event: string, params: Record<string, unknown> = {}) {
  const w = window as AnyWin;
  if (PIXEL_ID && w.fbq) {
    if (META_STANDARD.has(event)) w.fbq("track", event, params);
    else w.fbq("trackCustom", event, params);
  }
  if (GA4_ID && w.gtag) w.gtag("event", event, params);
}
