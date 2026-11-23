// Gera o favicon a partir do logo (src/assets/icons/logo.svg, o G de triângulos em dois tons de cinza).
// Favicon: só o desenho, todo branco, sem fundo. O ícone do iPhone (apple-touch-icon) usa as cores do logo
// em fundo escuro, porque o iOS não aceita transparência.
// Saída em src/assets/icons: favicon.ico (16, 32 e 48 px), favicon-32x32.png e apple-touch-icon.png (180 px).
// Precisa do sharp. Rode: node scripts/icons.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIR = path.join(ROOT, 'src/assets/icons');
const require = createRequire(import.meta.url);
let sharp;
try { sharp = require('sharp'); } catch { sharp = createRequire('/opt/npm-tools/')('sharp'); }

const SRC = path.join(DIR, 'logo.svg');
// mesmo desenho, todo em branco: o contorno do G numa forma só (sem emendas entre os triângulos)
const WHITE = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 62.24" width="700" height="622"><path fill="#ffffff" d="M20 0 60 0 50 15.56 30 15.56 20 31.12 30 46.68 50 46.68 40 31.12 60 31.12 70 46.68 60 62.24 20 62.24 10 46.68 0 31.12 10 15.56Z"/></svg>');
const BG = '#0c0b0e';

// logo centralizado com respiro proporcional ao tamanho; bg = null deixa o fundo transparente
async function icon(size, pad, bg = null, src = SRC) {
  const inner = Math.round(size * (1 - pad * 2));
  // rasteriza em alta resolução antes de reduzir; direto no tamanho final, o SVG mostra emendas entre os triângulos
  const big = await sharp(src, { density: 600 }).png().toBuffer();
  const logo = await sharp(big).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const base = bg ? Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${bg}"/></svg>`)
    : { create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } };
  return sharp(base).composite([{ input: logo, gravity: 'center' }]).png().toBuffer();
}

// .ico com PNGs dentro (aceito por todos os navegadores atuais)
function ico(pngs) {
  const head = Buffer.alloc(6); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach(({ size, buf }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o); dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2); dir.writeUInt8(0, o + 3); dir.writeUInt16LE(1, o + 4); dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(buf.length, o + 8); dir.writeUInt32LE(offset, o + 12); offset += buf.length;
  });
  return Buffer.concat([head, dir, ...pngs.map(p => p.buf)]);
}

const sizes = [16, 32, 48];
const pngs = [];
for (const size of sizes) pngs.push({ size, buf: await icon(size, size <= 16 ? 0 : 0.03, null, WHITE) });
fs.writeFileSync(path.join(DIR, 'favicon.ico'), ico(pngs));
fs.writeFileSync(path.join(DIR, 'favicon-32x32.png'), pngs[1].buf);
fs.writeFileSync(path.join(DIR, 'apple-touch-icon.png'), await icon(180, 0.16, BG));
console.log('ícones: favicon.ico (16/32/48), favicon-32x32.png, apple-touch-icon.png (180)');
// logo em PNG com fundo transparente, para usar fora do site
await sharp(SRC, { density: 600 }).resize(1024).png().toFile(path.join(DIR, 'logo-source.png'));
