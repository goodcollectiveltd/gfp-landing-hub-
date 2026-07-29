/**
 * Meta Pixel + PostHog + ad/Intelligems attribution passthrough for the public advertorial pages.
 *
 * This page is **arm B** of a 3-way Intelligems redirect test that starts at
 * goodforpets.co/pages/10reasons. Arms A and C sit on the Shopify theme (where the
 * Intelligems + PostHog embeds live); arm B is this Netlify-hosted subdomain, which the
 * Shopify app embed cannot reach — hence PostHog is loaded here explicitly so all three
 * arms report into ONE PostHog project and are directly comparable.
 *
 * Two attribution jobs, both because cookies do NOT cross from hello.goodforpets.co to
 * goodforpets.co — query params are what survive the hop:
 *   1. Ad click ids (fbclid) + Meta cookies (_fbp/_fbc) + UTMs  -> Meta attribution.
 *   2. Intelligems bucket (igTg/igId)                            -> split-test attribution.
 *
 * Env overrides (all optional):
 *   VITE_META_PIXEL_ID  Meta (Facebook) Pixel ID
 *   VITE_POSTHOG_KEY    PostHog project token
 *   VITE_POSTHOG_HOST   PostHog ingestion host
 *   VITE_GA4_ID         GA4 Measurement ID (G-XXXXXXX) — optional, secondary
 */

// GFP's live Meta pixel, matching goodforpets.co (Shopify) which records Purchase.
const DEFAULT_PIXEL_ID = "3813384208943708";
// `||` (not ??) so an EMPTY env var in the host still falls through to the default.
const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string | undefined) || (import.meta.env.PROD ? DEFAULT_PIXEL_ID : undefined);
const GA4_ID = (import.meta.env.VITE_GA4_ID as string | undefined) || undefined;

// PostHog — the SAME project the Shopify store and quiz funnel report to, so arms A/B/C
// are comparable in one place. PROD-only, same guard as the pixel (never pollutes dev).
const DEFAULT_POSTHOG_KEY = "phc_rKDMS99rcNcbSrW5wmpqYeTsHprVvpsDx5xcspNWCdXH";
const POSTHOG_KEY = (import.meta.env.VITE_POSTHOG_KEY as string | undefined) || (import.meta.env.PROD ? DEFAULT_POSTHOG_KEY : undefined);
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || "https://us.i.posthog.com";

/** Marks every event from this page as arm B, even if the IG params are missing. */
const IG_ARM = "B-hello-8-reasons";

const ATTR_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "fbclid", "gclid", "ttclid", "ad_id", "campaign_id",
  // Intelligems split-test bucket. Captured on arrival and forwarded on every CTA so the
  // bucket survives the hop back to goodforpets.co. NEVER stripped from the address bar.
  "igTg", "igId",
];
const STORAGE_KEY = "gfp_attr";
const IG_SESSION_KEY = "gfp_ig_session";

type PostHogLike = {
  init?: (key: string, config: Record<string, unknown>) => void;
  capture?: (event: string, props?: Record<string, unknown>) => void;
  register?: (props: Record<string, unknown>) => void;
  get_distinct_id?: () => string | undefined;
};
type AnyWin = typeof window & {
  fbq?: (...a: unknown[]) => void;
  gtag?: (...a: unknown[]) => void;
  dataLayer?: unknown[];
  posthog?: PostHogLike;
};

/** Call once on page mount: persist attribution + IG bucket, boot the pixel, PostHog, GA4. */
export function initTracking() {
  captureAttribution();
  captureIntelligemsSession();
  initMetaPixel();
  initPostHog();
  initGA4();
}

/** Persist ad-click / UTM / Intelligems params for the session so we can forward them. */
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

/** Intelligems puts the redirect session in the URL *hash*, not the query string. */
function captureIntelligemsSession() {
  try {
    const m = window.location.hash.match(/ig-redirect-session=([^&]+)/);
    if (m) sessionStorage.setItem(IG_SESSION_KEY, decodeURIComponent(m[1]));
  } catch { /* ignore */ }
}

export function getAttribution(): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

/**
 * The visitor's Intelligems bucket as PostHog super properties, so every event from this
 * page is attributable to its test arm.
 *   igTg -> ig_test_group  (the assigned group/variant uuid)
 *   igId -> ig_id          (the Intelligems visitor id, `ig_…`)
 */
export function getIntelligemsProps(): Record<string, string> {
  const a = getAttribution();
  const props: Record<string, string> = { ig_arm: IG_ARM };
  if (a.igTg) props.ig_test_group = a.igTg;
  if (a.igId) props.ig_id = a.igId;
  try {
    const s = sessionStorage.getItem(IG_SESSION_KEY);
    if (s) props.ig_redirect_session = s;
  } catch { /* ignore */ }
  return props;
}

function getCookie(name: string): string {
  const m = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return m ? decodeURIComponent(m.pop() as string) : "";
}

/**
 * Append captured attribution (UTMs, fbclid, **igTg/igId**) + Meta browser cookies
 * (_fbp/_fbc) to an outbound Shopify URL. This is what lets BOTH Meta attribute the sale
 * and Intelligems credit the order to arm B once the visitor is back on goodforpets.co.
 * Use on every CTA link.
 */
export function withAttribution(url: string): string {
  try {
    const u = new URL(url);
    for (const [k, v] of Object.entries(getAttribution())) {
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    }
    const fbp = getCookie("_fbp"); if (fbp) u.searchParams.set("fbp", fbp);
    const fbc = getCookie("_fbc"); if (fbc) u.searchParams.set("fbc", fbc);
    // PostHog visitor id, so a Shopify-side Purchase pixel can stitch the sale back to THIS
    // landing-page visitor. Checkout is a different root domain, so PostHog's .goodforpets.co
    // cookie can't follow — the id must ride the URL, then be read by the pixel (identify()).
    try {
      const did = (window as AnyWin).posthog?.get_distinct_id?.();
      if (did) u.searchParams.set("ph_did", did);
    } catch { /* ignore */ }
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

/**
 * PostHog, loaded async from its CDN so it stays OUT of the critical path (this page's
 * speed is itself a variable in the split test — don't bundle it).
 *
 * We deliberately disable PostHog's automatic pageview and fire it inside `loaded`, AFTER
 * registering the Intelligems super properties — otherwise the first $pageview (the most
 * important event for the test) would land without its test-arm attribution.
 */
function initPostHog() {
  if (!POSTHOG_KEY) return;
  const w = window as AnyWin;
  if (w.posthog?.init) return;
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = POSTHOG_HOST.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js";
  s.onload = () => {
    const ph = (window as AnyWin).posthog;
    if (!ph?.init) return;
    ph.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      autocapture: true,           // clicks / interactions, as arms A+C report
      capture_pageview: false,     // fired manually below, after super properties
      capture_pageleave: true,     // required for scroll-depth
      enable_heatmaps: true,       // heatmaps
      disable_session_recording: false, // session replay
      capture_performance: { web_vitals: true }, // web vitals
      disable_surveys: true,       // unused here — saves a script + request on paid traffic
      persistence: "localStorage+cookie",
      loaded: (p: PostHogLike) => {
        p.register?.(getIntelligemsProps());
        p.capture?.("$pageview");
      },
    });
  };
  document.head.appendChild(s);
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

/** Fire an event to Meta Pixel + PostHog + GA4 (whichever are configured). */
export function track(event: string, params: Record<string, unknown> = {}) {
  const w = window as AnyWin;
  if (PIXEL_ID && w.fbq) {
    if (META_STANDARD.has(event)) w.fbq("track", event, params);
    else w.fbq("trackCustom", event, params);
  }
  // PostHog gets every event too, so CTA clicks are segmentable by test arm.
  w.posthog?.capture?.(event, params);
  if (GA4_ID && w.gtag) w.gtag("event", event, params);
}
