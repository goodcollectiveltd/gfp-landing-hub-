// Sanitiser for `customVisual` markup (the bespoke-diagram escape hatch).
//
// Threat model: the markup is authored by our own LLM, every page is reviewed by
// the owner before publish, and there is no user-generated content. This is a
// conservative safety net, not the sole defence: it runs again at render time so
// nothing unexpected reaches the DOM.
//
// Approach: parse into a detached DOM, then walk it against a tag allowlist and
// an attribute policy (drop event handlers, drop unsafe URL attributes, keep
// only same-document refs). Anything not explicitly allowed is removed. Browser-
// only (uses DOMParser) — the renderer is client-side.

/** Tags we allow: SVG drawing primitives + light, safe HTML for labels. */
const ALLOWED_TAGS = new Set([
  // SVG
  "svg", "g", "defs", "title", "desc", "symbol", "use", "path", "rect", "circle",
  "ellipse", "line", "polyline", "polygon", "text", "tspan", "textpath",
  "lineargradient", "radialgradient", "stop", "clippath", "mask", "pattern",
  "marker", "filter", "fegaussianblur", "feoffset", "feblend", "femerge",
  "femergenode", "fecolormatrix", "fecomposite", "feflood", "image",
  // HTML (labels / structure only)
  "div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li",
  "strong", "em", "b", "i", "small", "br", "hr", "figure", "figcaption",
  "blockquote", "section", "header", "footer", "table", "thead", "tbody", "tr",
  "td", "th",
]);

/** Tags removed outright (and their subtrees), even if nested. */
const FORBIDDEN_TAGS = new Set([
  "script", "style", "iframe", "object", "embed", "link", "meta", "base",
  "foreignobject", "a", "form", "input", "button", "textarea", "select",
  "audio", "video", "source", "animate", "animatetransform", "animatemotion",
  "set", "handler",
]);

/** URL-bearing attributes — only same-document (`#id`) references are kept. */
const URL_ATTRS = new Set(["href", "xlink:href", "src", "from", "to", "by", "values"]);

function isSafeUrl(value: string): boolean {
  return value.trim().startsWith("#");
}

function scrubElement(el: Element) {
  // Remove dangerous attributes.
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase();
    const value = attr.value;
    if (name.startsWith("on")) {
      el.removeAttribute(attr.name);
      continue;
    }
    if (URL_ATTRS.has(name) && !isSafeUrl(value)) {
      el.removeAttribute(attr.name);
      continue;
    }
    // Block CSS-based script vectors in inline styles.
    if (name === "style" && /expression\(|javascript:|url\s*\(/i.test(value)) {
      el.removeAttribute(attr.name);
      continue;
    }
  }

  // Recurse, removing forbidden / unknown elements.
  for (const child of Array.from(el.children)) {
    const tag = child.tagName.toLowerCase();
    if (FORBIDDEN_TAGS.has(tag) || !ALLOWED_TAGS.has(tag)) {
      child.remove();
      continue;
    }
    scrubElement(child);
  }
}

/**
 * Sanitise customVisual markup. Returns safe markup, or "" if nothing safe
 * survived. Falls back to "" when run outside a browser (no DOMParser).
 */
export function sanitizeCustomVisual(markup: string): string {
  if (!markup || typeof markup !== "string") return "";
  if (typeof window === "undefined" || typeof window.DOMParser === "undefined") {
    return "";
  }

  // Parse as a document fragment via a template so SVG-in-HTML parses correctly.
  const doc = new DOMParser().parseFromString(
    `<div id="__cv_root__">${markup}</div>`,
    "text/html"
  );
  const root = doc.getElementById("__cv_root__");
  if (!root) return "";

  // Drop forbidden / unknown top-level elements, then scrub the rest.
  for (const child of Array.from(root.children)) {
    const tag = child.tagName.toLowerCase();
    if (FORBIDDEN_TAGS.has(tag) || !ALLOWED_TAGS.has(tag)) {
      child.remove();
      continue;
    }
    scrubElement(child);
  }

  return root.innerHTML;
}
