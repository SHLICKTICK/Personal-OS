const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  chunk.writeUInt32BE(crc32(typeAndData), 8 + len);
  return chunk;
}

function createPng(width, height, getRgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rawRows = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawRows[offset++] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getRgba(x, y, width, height);
      rawRows[offset++] = r;
      rawRows[offset++] = g;
      rawRows[offset++] = b;
      rawRows[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawRows);
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Distance from point to line segment
function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

function renderPersonalOSIcon(width, height, isMaskable) {
  const scale = width / 512;
  const cx = width / 2;
  const cy = height / 2;

  // Maskable scales down by ~18% so everything is inside safe circle
  const glyphScale = isMaskable ? 0.72 : 1.0;

  // Geometry in 512 coordinate space scaled by glyphScale
  const c1x = cx + (-76) * scale * glyphScale;
  const c1y = cy + (-76) * scale * glyphScale;
  const c2x = cx + (-6) * scale * glyphScale;
  const c2y = cy;
  const c3x = cx + (-76) * scale * glyphScale;
  const c3y = cy + (76) * scale * glyphScale;

  const u1x = cx + (19) * scale * glyphScale;
  const u1y = cy + (76) * scale * glyphScale;
  const u2x = cx + (89) * scale * glyphScale;
  const u2y = cy + (76) * scale * glyphScale;

  const strokeWidth = 26 * scale * glyphScale;
  const circleRadius = 160 * scale * glyphScale;

  return createPng(width, height, (x, y) => {
    // Base dark background: #050a0a
    let r = 5, g = 10, b = 10, a = 255;

    // Subtle radial gradient in center
    const distFromCenter = Math.hypot(x - cx, y - cy);
    if (distFromCenter < circleRadius * 1.3) {
      const gradFactor = Math.max(0, 1 - distFromCenter / (circleRadius * 1.3));
      r = Math.min(255, Math.round(5 + 12 * gradFactor));
      g = Math.min(255, Math.round(10 + 26 * gradFactor));
      b = Math.min(255, Math.round(10 + 24 * gradFactor));
    }

    // Circular circuit ring
    const ringDist = Math.abs(distFromCenter - circleRadius);
    if (ringDist < 2 * scale) {
      const alpha = Math.max(0, 1 - ringDist / (2 * scale));
      r = Math.round(r * (1 - alpha * 0.4) + 0 * alpha * 0.4);
      g = Math.round(g * (1 - alpha * 0.4) + 245 * alpha * 0.4);
      b = Math.round(b * (1 - alpha * 0.4) + 160 * alpha * 0.4);
    }

    // Distance to chevron segments
    const dSeg1 = distToSegment(x, y, c1x, c1y, c2x, c2y);
    const dSeg2 = distToSegment(x, y, c2x, c2y, c3x, c3y);
    const dChevron = Math.min(dSeg1, dSeg2);

    // Distance to underscore segment
    const dUnderscore = distToSegment(x, y, u1x, u1y, u2x, u2y);

    const halfStroke = strokeWidth / 2;

    // Render Chevron: cyan-to-emerald gradient
    if (dChevron < halfStroke + 6 * scale) {
      const tY = (y - (cy - 76 * scale * glyphScale)) / (152 * scale * glyphScale);
      const targetR = 0;
      const targetG = Math.round(210 + (245 - 210) * Math.min(1, Math.max(0, tY)));
      const targetB = Math.round(255 - (255 - 160) * Math.min(1, Math.max(0, tY)));

      if (dChevron <= halfStroke) {
        // Solid core
        r = targetR; g = targetG; b = targetB;
      } else {
        // Antialiased glow edge
        const edgeAlpha = Math.max(0, 1 - (dChevron - halfStroke) / (6 * scale));
        r = Math.round(r * (1 - edgeAlpha) + targetR * edgeAlpha);
        g = Math.round(g * (1 - edgeAlpha) + targetG * edgeAlpha);
        b = Math.round(b * (1 - edgeAlpha) + targetB * edgeAlpha);
      }
    }

    // Render Underscore: vibrant emerald #00f5a0
    if (dUnderscore < halfStroke + 6 * scale) {
      const targetR = 0;
      const targetG = 245;
      const targetB = 160;

      if (dUnderscore <= halfStroke) {
        r = targetR; g = targetG; b = targetB;
      } else {
        const edgeAlpha = Math.max(0, 1 - (dUnderscore - halfStroke) / (6 * scale));
        r = Math.round(r * (1 - edgeAlpha) + targetR * edgeAlpha);
        g = Math.round(g * (1 - edgeAlpha) + targetG * edgeAlpha);
        b = Math.round(b * (1 - edgeAlpha) + targetB * edgeAlpha);
      }
    }

    // Rounded container border for standard icons if not maskable
    if (!isMaskable) {
      const cornerR = 70 * scale;
      const dx = Math.max(0, Math.abs(x - cx) - (cx - cornerR));
      const dy = Math.max(0, Math.abs(y - cy) - (cy - cornerR));
      if (Math.hypot(dx, dy) > cornerR) {
        // Outer transparent corner
        a = 0;
      }
    }

    return [r, g, b, a];
  });
}

const pubDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(pubDir)) {
  fs.mkdirSync(pubDir, { recursive: true });
}

// 1. 192x192
const p192 = renderPersonalOSIcon(192, 192, false);
fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), p192);
console.log('Generated public/pwa-192x192.png');

// 2. 512x512
const p512 = renderPersonalOSIcon(512, 512, false);
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), p512);
console.log('Generated public/pwa-512x512.png');

// 3. 512x512 Maskable
const p512m = renderPersonalOSIcon(512, 512, true);
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), p512m);
console.log('Generated public/pwa-maskable-512x512.png');

// 4. Apple Touch Icon 180x180
const pApple = renderPersonalOSIcon(180, 180, false);
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), pApple);
console.log('Generated public/apple-touch-icon.png');

// 5. Favicon 48x48 PNG (browsers handle PNG favicon)
const pFav = renderPersonalOSIcon(48, 48, false);
fs.writeFileSync(path.join(pubDir, 'favicon.ico'), pFav);
console.log('Generated public/favicon.ico');
