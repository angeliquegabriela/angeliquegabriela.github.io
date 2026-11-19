// Gera imagens Open Graph 1200x630 (JPEG) por perfil, por case e para o Log, nos dois idiomas.
// Saída: src/generated/og/*.jpg + manifest.json. Precisa do Playwright.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { HOME, CASE_ORDER, PERSON } from '../src/config.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'src/generated/og');
const IMG = path.join(ROOT, 'src/generated/img');
const FONTS = path.join(ROOT, 'src/assets/fonts');
fs.mkdirSync(OUT, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(path.join(IMG, 'manifest.json'), 'utf8'));

function fm(lang, slug) {
  const src = fs.readFileSync(path.join(ROOT, `src/content/cases/${lang}/${slug}.md`), 'utf8');
  const head = src.split('---')[1];
  const get = k => { const m = head.match(new RegExp(`^${k}:\\s*(.*)$`, 'm')); return m ? m[1].trim().replace(/^"|"$/g, '') : ''; };
  return { title: get('title'), kicker: get('kicker'), subtitle: get('subtitle'), cover: get('cover') };
}
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const imgUrl = key => {
  if (!key || !manifest[key]) return null;
  const w = manifest[key].widths.includes(960) ? 960 : manifest[key].widths[manifest[key].widths.length - 1];
  return 'file://' + path.join(IMG, `${key}-${w}.webp`);
};

function html({ kicker, title, text, cover, footer }) {
  const blocks = Array.from({ length: 20 }, (_, i) => `<i style="opacity:${(0.35 + (i % 5) * 0.15).toFixed(2)}"></i>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Silkscreen;src:url(file://${FONTS}/silkscreen-latin.woff2) format("woff2")}
@font-face{font-family:Inter;font-weight:100 900;src:url(file://${FONTS}/inter-latin.woff2) format("woff2")}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#0c0b0e;color:#ece9f1;font-family:Inter,sans-serif;position:relative;overflow:hidden}
.wrap{position:absolute;inset:56px 64px 56px 64px;display:flex;gap:48px}
.left{flex:1;display:flex;flex-direction:column;min-width:0}
.k{font:400 18px/1.5 Silkscreen;letter-spacing:.06em;text-transform:uppercase;color:#bf5fff;margin-bottom:18px}
h1{font:400 ${cover ? 54 : 66}px/1.08 Silkscreen;letter-spacing:.04em;text-transform:uppercase;text-shadow:5px 5px 0 #2b2833;margin-bottom:22px}
p{font-size:26px;line-height:1.38;color:#d8d3e0;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.foot{margin-top:auto;font:400 17px/1.3 Silkscreen;letter-spacing:.06em;text-transform:uppercase;color:#a19bac}
.right{width:430px;flex:none;display:flex;align-items:center}
.right img{width:100%;height:330px;object-fit:cover;border:3px solid #2b2833;box-shadow:10px 10px 0 #2b2833}
.ground{position:absolute;left:64px;right:64px;bottom:30px;display:grid;grid-template-columns:repeat(20,1fr);gap:6px}
.ground i{height:8px;background:#bf5fff}
</style></head><body><div class="wrap"><div class="left"><div class="k">${esc(kicker)}</div><h1>${esc(title)}</h1><p>${esc(text)}</p><div class="foot">${esc(footer)}</div></div>${cover ? `<div class="right"><img src="${cover}"></div>` : ''}</div><div class="ground">${blocks}</div></body></html>`;
}

const jobs = [];
for (const lang of ['pt', 'en']) {
  const foot = `${PERSON.name} · ${lang === 'pt' ? 'Portfólio' : 'Portfolio'}`;
  jobs.push({ id: `${lang}-home`, kicker: 'Product Designer · UX · Conversation Design', title: PERSON.name, text: HOME.intro[lang], cover: imgUrl('e2'), footer: foot });
  for (const slug of CASE_ORDER) {
    const c = fm(lang, slug);
    jobs.push({ id: `${lang}-case-${slug}`, kicker: c.kicker.split('·').slice(0, 3).join('·'), title: c.title, text: c.subtitle, cover: imgUrl(c.cover), footer: foot });
  }
  jobs.push({ id: `${lang}-log`, kicker: 'Log', title: lang === 'pt' ? 'Design, produto e DesignOps' : 'Design, product and DesignOps', text: lang === 'pt' ? 'Metrica, Growth Map, Design Check, design sprint, processo de design, workshops e Front Review.' : 'Metrica, Growth Map, Design Check, design sprints, design process, workshops and Front Review.', cover: imgUrl('gm'), footer: foot });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const out = {};
for (const j of jobs) {
  const tmp = path.join(ROOT, '.cache/og.html');
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, html(j));
  await page.goto('file://' + tmp, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const file = `${j.id}.jpg`;
  await page.screenshot({ path: path.join(OUT, file), type: 'jpeg', quality: 82 });
  out[j.id] = file;
}
out.default = out['pt-home'];
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(out, null, 1));
await browser.close();
console.log(`og: ${jobs.length} imagens`);
