// Gera uma prévia com caminhos relativos (para abrir fora do Cloudflare, por exemplo como página publicada no Claude).
// Saída: .cache/preview/. Não é usada em produção.
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, '.cache/preview');
fs.rmSync(OUT, { recursive: true, force: true });
const pages = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && pages.push(p); } })(DIST);
const assets = new Set();
const toFile = u => {
  const [p, hash] = u.split('#');
  let f;
  if (/\.[a-z0-9]+$/i.test(p)) f = p.slice(1);
  else if (p === '/') f = 'inicio.html';
  else if (p.endsWith('/')) f = p.slice(1) + 'index.html';
  else f = p.slice(1) + '.html';
  return { f, hash };
};
for (const file of pages) {
  const rel = path.relative(DIST, file);
  const depth = rel.split('/').length - 1;
  const pre = '../'.repeat(depth);
  let s = fs.readFileSync(file, 'utf8');
  s = s.replace(/<source type="image\/(avif|webp)"[^>]*>/g, '').replace(/<link rel="preload" as="image"[^>]*>/g, '');
  const fix = u => { const { f, hash } = toFile(u); if (!f.endsWith('.html')) assets.add(f); return pre + f + (hash !== undefined ? '#' + hash : ''); };
  s = s.replace(/(href|src)="(\/[^"]*)"/g, (m, a, u) => u.startsWith('//') ? m : `${a}="${fix(u)}"`);
  s = s.replace(/url\((\/assets\/[^)]+)\)/g, (m, u) => `url(${fix(u)})`);
  if (rel === 'index.html') {
    fs.mkdirSync(OUT, { recursive: true });
    fs.writeFileSync(path.join(OUT, 'inicio.html'), s);
    s = s.replace('<title>Gabriela Angelique · Product Designer | UX | Conversation Design</title>', '<title>Portfólio Gabriela Angelique</title>');
    const head = s.slice(s.indexOf('<head>') + 6, s.indexOf('</head>'));
    const body = s.slice(s.indexOf('>', s.indexOf('<body')) + 1, s.lastIndexOf('</body>'));
    const title = head.match(/<title>.*?<\/title>/)[0];
    s = title + '\n' + head.replace(title, '') + '\n<script>document.body.id="top";document.body.setAttribute("data-lang","pt");document.body.setAttribute("data-page","home");</script>\n' + body;
  }
  fs.mkdirSync(path.dirname(path.join(OUT, rel)), { recursive: true });
  fs.writeFileSync(path.join(OUT, rel), s);
}
for (const a of assets) {
  const src = path.join(DIST, a);
  if (!fs.existsSync(src)) { console.warn('faltando', a); continue; }
  fs.mkdirSync(path.dirname(path.join(OUT, a)), { recursive: true });
  fs.copyFileSync(src, path.join(OUT, a));
}
const all = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : all.push(path.relative(OUT, p)); } })(OUT);
fs.writeFileSync(path.join(ROOT, '.cache/preview-files.json'), JSON.stringify(all.filter(f => f !== 'index.html').sort()));
console.log(`prévia: ${all.length} arquivos`);
