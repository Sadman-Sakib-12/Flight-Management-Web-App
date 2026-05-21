/**
 * Generates PWA icons (192x192 and 512x512) as PNG files
 * Uses only Node.js built-ins — no external dependencies needed
 * Run: node scripts/generate-icons.js
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function createPNG(size) {
  const width = size;
  const height = size;

  // --- Draw pixels ---
  // Background: #2563eb (blue), rounded corners, white plane icon
  const pixels = new Uint8Array(width * height * 4); // RGBA

  const cx = width / 2;
  const cy = height / 2;
  const radius = size * 0.156; // ~80/512 * size for rounded corners

  // Blue background color
  const bgR = 0x25, bgG = 0x63, bgB = 0xeb;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Rounded rectangle check
      const inRoundedRect = isInRoundedRect(x, y, 0, 0, width, height, radius);

      if (inRoundedRect) {
        // Check if pixel is part of the plane icon (white)
        const planePixel = isPlanePixel(x, y, cx, cy, size);
        if (planePixel) {
          pixels[idx] = 255; pixels[idx+1] = 255; pixels[idx+2] = 255; pixels[idx+3] = 255;
        } else {
          pixels[idx] = bgR; pixels[idx+1] = bgG; pixels[idx+2] = bgB; pixels[idx+3] = 255;
        }
      } else {
        // Transparent outside rounded rect
        pixels[idx] = 0; pixels[idx+1] = 0; pixels[idx+2] = 0; pixels[idx+3] = 0;
      }
    }
  }

  return encodePNG(pixels, width, height);
}

function isInRoundedRect(px, py, x, y, w, h, r) {
  if (px < x || px >= x + w || py < y || py >= y + h) return false;
  // Check corners
  if (px < x + r && py < y + r) return dist(px, py, x + r, y + r) <= r;
  if (px >= x + w - r && py < y + r) return dist(px, py, x + w - r, y + r) <= r;
  if (px < x + r && py >= y + h - r) return dist(px, py, x + r, y + h - r) <= r;
  if (px >= x + w - r && py >= y + h - r) return dist(px, py, x + w - r, y + h - r) <= r;
  return true;
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function isPlanePixel(px, py, cx, cy, size) {
  const scale = size / 512;
  // Translate to center, rotate 45 degrees
  const tx = px - cx;
  const ty = py - cy;
  // Rotate -45 degrees
  const angle = Math.PI / 4;
  const rx = tx * Math.cos(angle) + ty * Math.sin(angle);
  const ry = -tx * Math.sin(angle) + ty * Math.cos(angle);

  // Scale back
  const sx = rx / scale;
  const sy = ry / scale;

  // Plane body: vertical bar
  if (Math.abs(sx) <= 20 && sy >= -180 && sy <= 200) return true;
  // Wings: horizontal bar
  if (Math.abs(sy) <= 40 && sx >= -180 && sx <= 180) return true;
  // Tail fins
  if (sy >= 180 && sy <= 260 && Math.abs(sx) <= 60) return true;

  return false;
}

function encodePNG(pixels, width, height) {
  const chunks = [];

  // PNG Signature
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  chunks.push(makeChunk("IHDR", ihdr));

  // IDAT chunk — raw image data with filter bytes
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0; // filter type: None
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * (1 + width * 4) + 1 + x * 4;
      rawData[dstIdx] = pixels[srcIdx];
      rawData[dstIdx + 1] = pixels[srcIdx + 1];
      rawData[dstIdx + 2] = pixels[srcIdx + 2];
      rawData[dstIdx + 3] = pixels[srcIdx + 3];
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 6 });
  chunks.push(makeChunk("IDAT", compressed));

  // IEND chunk
  chunks.push(makeChunk("IEND", Buffer.alloc(0)));

  return Buffer.concat(chunks);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, "ascii");
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([len, typeBuffer, data, crc]);
}

function crc32(buf) {
  const table = makeCRCTable();
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeCRCTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

// Generate icons
const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

console.log("Generating 192x192 icon...");
fs.writeFileSync(path.join(outDir, "icon-192x192.png"), createPNG(192));
console.log("✓ icon-192x192.png");

console.log("Generating 512x512 icon...");
fs.writeFileSync(path.join(outDir, "icon-512x512.png"), createPNG(512));
console.log("✓ icon-512x512.png");

console.log("Done! Icons saved to public/icons/");
