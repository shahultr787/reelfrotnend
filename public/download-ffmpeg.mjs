#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
//  download-ffmpeg.mjs
//  Run:  node download-ffmpeg.mjs
//
//  Downloads all @ffmpeg files and patches internal CDN URLs
//  so everything works from http://localhost with no network.
// ─────────────────────────────────────────────────────────────

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const DIR = 'ffmpeg-local';
mkdirSync(DIR, { recursive: true });

const FILES = [
  {
    url:  'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js',
    out:  'ffmpeg.js',
    type: 'text',
  },
  {
    url:  'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    out:  'ffmpeg-core.js',
    type: 'text',
  },
  {
    url:  'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
    out:  'ffmpeg-core.wasm',
    type: 'binary',
  },
];

async function download(url, type) {
  console.log(`  Fetching ${url.split('/').pop()} ...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return type === 'binary' ? Buffer.from(await res.arrayBuffer()) : await res.text();
}

// Patch JS text: replace any CDN absolute URLs with local relative paths
function patch(text) {
  return text
    // jsdelivr core references
    .replace(/https?:\/\/cdn\.jsdelivr\.net\/npm\/@ffmpeg\/core[^"'`\s]*(ffmpeg-core\.wasm)/g, './ffmpeg-local/ffmpeg-core.wasm')
    .replace(/https?:\/\/cdn\.jsdelivr\.net\/npm\/@ffmpeg\/core[^"'`\s]*(ffmpeg-core\.js)/g,   './ffmpeg-local/ffmpeg-core.js')
    // generic jsdelivr @ffmpeg references that remain
    .replace(/https?:\/\/cdn\.jsdelivr\.net\/npm\/@ffmpeg\/[^"'`\s]+/g, m => {
      const file = m.split('/').pop();
      return `./ffmpeg-local/${file}`;
    });
}

console.log(`\nDownloading FFmpeg files into ./${DIR}/\n`);

for (const f of FILES) {
  const data = await download(f.url, f.type);
  const out  = join(DIR, f.out);

  if (f.type === 'text') {
    const patched = patch(data);
    writeFileSync(out, patched, 'utf8');
  } else {
    writeFileSync(out, data);
  }
  console.log(`  ✓ Saved ${out}`);
}

console.log(`\n✅ All done! Files are in ./${DIR}/`);
console.log(`   Open http://localhost:3000/video.html\n`);
