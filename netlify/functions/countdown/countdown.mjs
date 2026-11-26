// Live email countdown, served at /.netlify/functions/countdown
//
// Every email open requests this image. It works out the time left to the end of
// the sale and returns a GIF that ticks down the seconds for one minute, then holds.
// No third party, no account: artwork is pre-rendered (art.mjs, from scripts/countdown/build-glyphs.py) and the GIF
// is written here with a small LZW encoder.
//
// Query (all optional):
//   to=2026-11-30T23:59:59Z   end time, ISO 8601. Defaults to the BFCM close.
//
// Usage in an email:
//   <img src="https://hello.goodforpets.co/.netlify/functions/countdown" width="600" alt="Sale ends 23:59 Monday 30 November">

import { inflateSync } from "node:zlib";
import ART from "./art.mjs";

const DEFAULT_END = "2026-11-30T23:59:59Z"; // 23:59:59 UK time (GMT in November)
const FRAMES = 60;                           // one minute of ticking, then it holds
const NAVY = [0x28, 0x2c, 0x5f];
const WHITE = [0xff, 0xff, 0xff];

const unpack = (b64) => new Uint8Array(inflateSync(Buffer.from(b64, "base64")));
const BASE = unpack(ART.base);
const DIGITS = Object.fromEntries(Object.entries(ART.digits).map(([k, v]) => [k, unpack(v)]));

// 16-step palette from white (0) to navy (15). Every pixel in the art is a mix of the two.
const PALETTE = new Uint8Array(16 * 3);
for (let i = 0; i < 16; i++) {
  for (let c = 0; c < 3; c++) PALETTE[i * 3 + c] = Math.round(WHITE[c] + (NAVY[c] - WHITE[c]) * (i / 15));
}

function digitsFor(seconds) {
  const s = Math.max(0, seconds);
  const d = Math.min(99, Math.floor(s / 86400));
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const x = s % 60;
  return [d, h, m, x].map((n) => String(n).padStart(2, "0")).join("");
}

function render(digitString) {
  const { w, slotW, slotH, slots } = ART;
  const px = BASE.slice();
  for (let i = 0; i < 8; i++) {
    const glyph = DIGITS[digitString[i]];
    const [sx, sy] = slots[i];
    for (let y = 0; y < slotH; y++) {
      for (let x = 0; x < slotW; x++) {
        const a = glyph[y * slotW + x];
        if (!a) continue;
        const k = (sy + y) * w + (sx + x);
        px[k] = Math.round((px[k] * (15 - a)) / 15); // white digit laid over the navy box
      }
    }
  }
  return px;
}

// ---- GIF writer ----
class Bytes {
  constructor() { this.parts = []; this.cur = []; }
  byte(b) { this.cur.push(b & 0xff); if (this.cur.length > 65536) this.flush(); }
  word(v) { this.byte(v); this.byte(v >> 8); }
  bytes(arr) { for (const b of arr) this.byte(b); }
  str(s) { for (const ch of s) this.byte(ch.charCodeAt(0)); }
  flush() { if (this.cur.length) { this.parts.push(Uint8Array.from(this.cur)); this.cur = []; } }
  done() { this.flush(); return Buffer.concat(this.parts.map((p) => Buffer.from(p))); }
}

function lzw(indices, minCodeSize, out) {
  const clear = 1 << minCodeSize;
  const eoi = clear + 1;
  let codeSize = minCodeSize + 1;
  let next = eoi + 1;
  let dict = new Map();
  let bitBuf = 0, bitLen = 0;
  const block = [];
  const emit = (code) => {
    bitBuf |= code << bitLen;
    bitLen += codeSize;
    while (bitLen >= 8) {
      block.push(bitBuf & 0xff);
      bitBuf >>>= 8;
      bitLen -= 8;
      if (block.length === 255) { out.byte(255); out.bytes(block); block.length = 0; }
    }
  };
  out.byte(minCodeSize);
  emit(clear);
  let prefix = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const k = indices[i];
    const key = prefix * 4096 + k;
    const hit = dict.get(key);
    if (hit !== undefined) { prefix = hit; continue; }
    emit(prefix);
    if (next < 4096) {
      dict.set(key, next++);
      if (next > (1 << codeSize) && codeSize < 12) codeSize++;
    } else {
      emit(clear);
      dict = new Map();
      codeSize = minCodeSize + 1;
      next = eoi + 1;
    }
    prefix = k;
  }
  emit(prefix);
  emit(eoi);
  if (bitLen > 0) block.push(bitBuf & 0xff);
  while (block.length) {
    const chunk = block.splice(0, 255);
    out.byte(chunk.length); out.bytes(chunk);
  }
  out.byte(0);
}

function frame(out, px, x0, y0, w, h, stride, delayCs) {
  out.bytes([0x21, 0xf9, 0x04, 0x04]); // graphic control: disposal 1, keep frame
  out.word(delayCs);
  out.bytes([0x00, 0x00]);
  out.byte(0x2c);
  out.word(x0); out.word(y0); out.word(w); out.word(h);
  out.byte(0x00);                      // no local palette, not interlaced
  const sub = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) sub[y * w + x] = px[(y0 + y) * stride + (x0 + x)];
  lzw(sub, 4, out);
}

function changedBox(a, b, w, h) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (a[y * w + x] !== b[y * w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  return x1 < 0 ? null : [x0, y0, x1 - x0 + 1, y1 - y0 + 1];
}

export function buildGif(secondsLeft) {
  const { w, h } = ART;
  const out = new Bytes();
  out.str("GIF89a");
  out.word(w); out.word(h);
  out.byte(0xf3);                      // global palette, 16 colours
  out.byte(0); out.byte(0);
  out.bytes(PALETTE);
  // no NETSCAPE loop block: the animation plays once and holds on the last second

  let prev = render(digitsFor(secondsLeft));
  frame(out, prev, 0, 0, w, h, w, 100);
  const ticks = secondsLeft > 0 ? Math.min(FRAMES - 1, secondsLeft) : 0;
  for (let t = 1; t <= ticks; t++) {
    const cur = render(digitsFor(secondsLeft - t));
    const box = changedBox(prev, cur, w, h);
    if (box) frame(out, cur, box[0], box[1], box[2], box[3], w, 100);
    prev = cur;
  }
  out.byte(0x3b);
  return out.done();
}

export default async (req) => {
  const url = new URL(req.url);
  const toParam = url.searchParams.get("to");
  let end = Date.parse(toParam || DEFAULT_END);
  if (!Number.isFinite(end)) end = Date.parse(DEFAULT_END);
  const secondsLeft = Math.floor((end - Date.now()) / 1000);
  const gif = buildGif(secondsLeft);
  return new Response(gif, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      // every open must fetch a fresh image, or the timer freezes at send time
      "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
