// Gera AVIF e WebP responsivos de cada imagem em src/assets/img/src.
// Saída: src/generated/img/<chave>-<largura>.(avif|webp) + manifest.json
// Uso local: npm run assets (precisa do sharp). O build do Cloudflare só lê o resultado.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'src/assets/img/src');
const OUT = path.join(ROOT, 'src/generated/img');
const WIDTHS = [480, 960, 1440];

fs.mkdirSync(OUT, { recursive: true });
const manifestPath = path.join(OUT, 'manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};

const files = fs.readdirSync(SRC).filter(f => /\.(png|jpe?g|webp)$/i.test(f)).sort();
for (const k of Object.keys(manifest)) if (!files.some(f => f.replace(/\.[^.]+$/, '') === k)) delete manifest[k];
let done = 0;
for (const f of files) {
  const key = f.replace(/\.[^.]+$/, '');
  const input = path.join(SRC, f);
  const hash = crypto.createHash('sha1').update(fs.readFileSync(input)).digest('hex').slice(0, 12);
  if (manifest[key] && manifest[key].hash === hash && manifest[key].widths.every(w => fs.existsSync(path.join(OUT, `${key}-${w}.avif`)))) continue;
  const meta = await sharp(input).metadata();
  const widths = WIDTHS.filter(w => w < meta.width);
  if (!widths.length || meta.width <= WIDTHS[WIDTHS.length - 1]) widths.push(Math.min(meta.width, WIDTHS[WIDTHS.length - 1]));
  const uniq = [...new Set(widths)].sort((a, b) => a - b);
  for (const w of uniq) {
    const base = sharp(input).resize({ width: w, withoutEnlargement: true });
    await base.clone().avif({ quality: 52, effort: 4 }).toFile(path.join(OUT, `${key}-${w}.avif`));
    await base.clone().webp({ quality: 74 }).toFile(path.join(OUT, `${key}-${w}.webp`));
  }
  manifest[key] = { w: meta.width, h: meta.height, widths: uniq, hash };
  done++;
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
console.log(`imagens: ${done} processadas, ${files.length} no total`);
