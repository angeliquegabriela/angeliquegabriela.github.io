// Gerador estático do portfólio. Sem dependências: roda com `node build.mjs` (Node 20+).
// Lê src/config.mjs, src/content/** e src/generated/** e escreve o site em dist/.
// Variáveis de ambiente: SITE_URL, BASE_PATH (site numa subpasta, como no GitHub Pages), UMAMI_WEBSITE_ID, UMAMI_SRC, MOSTRAR_PENDENTES=1 (mostra os [PREENCHER] no site).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { SITE_URL, PERSON, HOME, CASE_ORDER, SKILLS, UI, CASE_SECTIONS, FEATURES } from './src/config.mjs';
const SHOW_LOG = FEATURES.log !== false;
const LINK = k => (PERSON.hiddenLinks || []).includes(k) ? null : PERSON.links[k];

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const GEN = path.join(SRC, 'generated');
const UMAMI_ID = (process.env.UMAMI_WEBSITE_ID || '').trim();
const UMAMI_SRC = (process.env.UMAMI_SRC || 'https://cloud.umami.is/script.js').trim();
const HIDE_TODO = process.env.MOSTRAR_PENDENTES !== '1';
const TODO = '[PREENCHER]';
const YEAR = new Date().getFullYear();
const TODAY = new Date().toISOString().slice(0, 10);
const LANGS = ['pt', 'en'];

const warnings = [];
const todos = [];
const usedImages = new Set();

// ---------------------------------------------------------------- utilidades
const read = p => fs.readFileSync(p, 'utf8');
const exists = p => fs.existsSync(p);
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const stripMd = s => String(s ?? '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`#>]/g, '').trim();
const abs = p => SITE_URL + p;
const hashOf = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);

// BASE_PATH: quando o site fica numa subpasta (ex.: GitHub Pages em usuario.github.io/repositorio),
// todos os caminhos que começam com "/" no HTML ganham esse prefixo.
const BASE = (process.env.BASE_PATH || '').replace(/\/$/, '');
const withBase = html => !BASE ? html : html
  .replace(/(\s(?:href|src|data-cv|poster)=")\/(?!\/)/g, `$1${BASE}/`)
  .replace(/(\s(?:image)?srcset=)"([^"]+)"/g, (m0, k, v) => `${k}"${v.split(',').map(x => x.trim().replace(/^\/(?!\/)/, `${BASE}/`)).join(', ')}"`)
  .replace(/url\((["']?)\/(?!\/)/g, `url($1${BASE}/`)
  .replace(/&quot;h&quot;:&quot;\/(?!\/)/g, `&quot;h&quot;:&quot;${BASE}/`)
  .replace(/<html lang="/, `<html data-base="${BASE}" lang="`);
function write(rel, content) {
  const p = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, rel.endsWith('.html') ? withBase(content) : content);
}
function copy(from, rel) {
  const p = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.copyFileSync(from, p);
}
// URL pública -> arquivo em dist (Cloudflare Pages serve /a/b a partir de a/b.html).
const fileFor = url => url === '/' ? 'index.html' : url.endsWith('/') ? url.slice(1) + 'index.html' : url.slice(1) + '.html';

// ---------------------------------------------------------------- front matter (subconjunto de YAML)
function parseFrontMatter(src, file) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`Sem front matter: ${file}`);
  const data = {};
  for (const line of m[1].split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i < 0) throw new Error(`Linha inválida em ${file}: ${line}`);
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (val.startsWith('[') && val.endsWith(']') && !val.startsWith('[PREENCHER')) {
      val = val.slice(1, -1).split(',').map(x => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else if (/^".*"$/.test(val) || /^'.*'$/.test(val)) {
      val = val.slice(1, -1);
    }
    data[key] = val;
  }
  return { data, body: m[2] };
}

// ---------------------------------------------------------------- imagens
const imgManifest = exists(path.join(GEN, 'img/manifest.json')) ? JSON.parse(read(path.join(GEN, 'img/manifest.json'))) : {};

function picture(key, alt, { sizes = '(min-width: 1100px) 960px, 100vw', eager = false, cls = '' } = {}) {
  const m = imgManifest[key];
  if (!m) { warnings.push(`Imagem sem versão otimizada: ${key} (rode npm run assets)`); return ''; }
  if (!alt || !alt.trim()) throw new Error(`Imagem sem texto alternativo: ${key}`);
  usedImages.add(key);
  const set = ext => m.widths.map(w => `/assets/img/${key}-${w}.${ext} ${w}w`).join(', ');
  const fallbackW = m.widths.includes(960) ? 960 : m.widths[m.widths.length - 1];
  const h = Math.round(m.h * Math.min(m.w, m.widths[m.widths.length - 1]) / m.w);
  const w = Math.min(m.w, m.widths[m.widths.length - 1]);
  return `<picture${cls ? ` class="${cls}"` : ''}><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img src="/assets/img/${key}-${fallbackW}.webp" width="${w}" height="${h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'}></picture>`;
}

// Capa em pixel para cases sem imagem divulgável.
function pixelCover(seedText, title) {
  let seed = [...seedText].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const cols = 32, rows = 18, cells = [];
  const shades = ['#26103d', '#5a268a', '#8f45d9', '#bf5fff'];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const v = rnd();
    const wave = Math.sin((c + r * 0.6) / 4) * 0.5 + 0.5;
    if (v < 0.18 + wave * 0.22) cells.push(`<rect x="${c}" y="${r}" width="1" height="1" fill="${shades[Math.min(3, Math.floor(v * 4 / (0.4 + wave * 0.3)))]}"/>`);
  }
  return `<svg class="pixel-cover" viewBox="0 0 ${cols} ${rows}" role="img" aria-label="${esc(title)}" shape-rendering="crispEdges" preserveAspectRatio="xMidYMid slice"><rect width="${cols}" height="${rows}" fill="#141218"/>${cells.join('')}</svg>`;
}

// ---------------------------------------------------------------- markdown (subconjunto)
function inline(s, lang) {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m0, text, href) => {
    if (text === 'PREENCHER') return m0;
    const ext = /^https?:/.test(href);
    return `<a href="${href}"${ext ? ` target="_blank" rel="noopener" ` : ''}>${text}${ext ? `<span class="sr-only"> ${UI[lang].newTab}</span>` : ''}</a>`;
  });
  out = out.replace(/\[PREENCHER(?::\s*([^\]]*))?\]/g, (m0, hint) => `<mark class="todo" title="${UI[lang].todo}">[PREENCHER${hint ? ': ' + hint : ''}]</mark>`);
  return out;
}

function markdown(src, lang, ctx = {}) {
  let lines = src.replace(/\r/g, '').split('\n');
  if (HIDE_TODO) lines = hideTodoLines(lines);
  const html = [];
  const toc = [];
  let i = 0;
  const para = [];
  const flush = () => { if (para.length) { html.push(`<p>${inline(para.join(' '), lang)}</p>`); para.length = 0; } };
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t) { flush(); i++; continue; }
    let m;
    if ((m = t.match(/^(#{2,4})\s+(.*)$/))) {
      flush();
      const level = m[1].length; const text = m[2];
      const id = slugify(text);
      if (level === 2) toc.push({ id, text });
      html.push(`<h${level} id="${id}">${inline(text, lang)}</h${level}>`);
      i++; continue;
    }
    if (/^!\[[^\]]*\]\(img:[^)]+\)$/.test(t)) {
      flush();
      const imgs = [];
      while (i < lines.length && (m = lines[i].trim().match(/^!\[([^\]]*)\]\(img:([^)\s]+)\)$/))) { imgs.push({ alt: m[1], key: m[2] }); i++; }
      const sizes = imgs.length > 1 ? '(min-width: 1100px) 470px, (min-width: 700px) 50vw, 100vw' : '(min-width: 1100px) 960px, 100vw';
      html.push(`<div class="media${imgs.length > 1 ? ' media-2' : ''}">${imgs.map(x => `<figure>${picture(x.key, x.alt, { sizes })}<figcaption>${inline(x.alt, lang)}</figcaption></figure>`).join('')}</div>`);
      continue;
    }
    // figma:URL | legenda → prévia navegável do arquivo do Figma
    if ((m = t.match(/^figma:(https:\/\/www\.figma\.com\/\S+)\s*\|\s*(.+)$/))) {
      flush();
      const src = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(m[1])}`;
      html.push(`<figure class="media embed"><div class="embed-box"><iframe src="${src}" title="${esc(m[2])}" loading="lazy" allowfullscreen></iframe></div><figcaption>${inline(m[2], lang)}</figcaption></figure>`);
      i++; continue;
    }
    if (/^[-*]\s+/.test(t)) {
      flush();
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^[-*]\s+/, '')); i++; }
      html.push(`<ul>${items.map(x => `<li>${inline(x, lang)}</li>`).join('')}</ul>`);
      continue;
    }
    if (/^\d+\.\s+/.test(t)) {
      flush();
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^\d+\.\s+/, '')); i++; }
      html.push(`<ol>${items.map(x => `<li>${inline(x, lang)}</li>`).join('')}</ol>`);
      continue;
    }
    if (t.startsWith('>')) {
      flush();
      const q = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) { q.push(lines[i].trim().replace(/^>\s?/, '')); i++; }
      html.push(`<blockquote><p>${inline(q.join(' '), lang)}</p></blockquote>`);
      continue;
    }
    if (t.startsWith('|')) {
      flush();
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(lines[i].trim()); i++; }
      const cells = r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      html.push(`<div class="table-wrap"><table><thead><tr>${head.map(h => `<th scope="col">${inline(h, lang)}</th>`).join('')}</tr></thead><tbody>${body.map(r => `<tr>${r.map((c, j) => j === 0 ? `<th scope="row">${inline(c, lang)}</th>` : `<td>${inline(c, lang)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    para.push(t); i++;
  }
  flush();
  return { html: html.join('\n'), toc };
}

// Por padrão, remove linhas com [PREENCHER] e seções que ficarem vazias.
function hideTodoLines(lines) {
  const kept = lines.filter(l => !l.includes(TODO.slice(0, -1)));
  const out = [];
  for (let i = 0; i < kept.length; i++) {
    const l = kept[i];
    if (/^##\s/.test(l)) {
      let j = i + 1, has = false;
      while (j < kept.length && !/^##\s/.test(kept[j])) { if (kept[j].trim()) has = true; j++; }
      if (!has) { i = j - 1; continue; }
    }
    out.push(l);
  }
  return out;
}

// Por padrão, tira de um texto curto os trechos e frases com [PREENCHER].
function cleanTodo(str) {
  if (!HIDE_TODO || typeof str !== 'string' || !str.includes('[PREENCHER')) return str;
  let out = str.replace(/\s*·\s*[^·]*\[PREENCHER[^\]]*\][^·]*/g, '');
  out = out.split(/(?<=[.!?])\s+/).filter(x => !x.includes('[PREENCHER')).join(' ');
  return out.replace(/\[PREENCHER[^\]]*\]/g, '').trim();
}

function collectTodos(where, text) {
  const items = [];
  let section = 'Topo (resumo e ficha)';
  for (const line of String(text).split('\n')) {
    const h = line.match(/^##\s+(.+)/); if (h) section = h[1].trim();
    if (!line.includes('[PREENCHER')) continue;
    const field = line.match(/^(\w+):\s/);
    const clean = line.replace(/^[-*]\s+/, '').replace(/^\w+:\s/, '').replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').trim();
    items.push(`${field && section.startsWith('Topo') ? field[1] : section}: ${clean.length > 150 ? clean.slice(0, 147) + '…' : clean}`);
  }
  if (items.length) todos.push({ where, n: items.length, items });
}

// ---------------------------------------------------------------- conteúdo
const URLS = {
  case: (lang, slug) => lang === 'pt' ? `/projetos/${slug}` : `/en/projects/${slug}`,
  log: lang => lang === 'pt' ? '/log' : '/en/log',
  post: (lang, slug) => lang === 'pt' ? `/log/${slug}` : `/en/log/${slug}`,
  home: lang => lang === 'pt' ? '/' : '/en/',
  projects: lang => lang === 'pt' ? '/projetos' : '/en/projects',
  process: lang => lang === 'pt' ? '/processo' : '/en/process',
};

function loadCases(lang) {
  const dir = path.join(SRC, 'content/cases', lang);
  const map = {};
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
    const { data, body } = parseFrontMatter(read(path.join(dir, f)), f);
    if (String(data.hidden) === 'true' || !CASE_ORDER.includes(data.slug)) continue; // guardado, não publicado
    for (const k of ['slug', 'title', 'subtitle', 'seoTitle', 'description', 'card', 'company', 'role', 'period', 'team', 'kicker']) {
      if (data[k] === undefined) throw new Error(`Campo "${k}" faltando em cases/${lang}/${f}`);
    }
    // Estrutura padrão: as seções são opcionais, mas as que existem seguem a ordem.
    const heads = [...body.matchAll(/^##\s+(.+)$/gm)].map(m => m[1].trim());
    const req = CASE_SECTIONS[lang];
    let pos = -1;
    for (const h of req) {
      const at = heads.indexOf(h);
      if (at < 0) continue;
      if (at < pos) throw new Error(`Case ${lang}/${f}: seção "${h}" fora de ordem`);
      pos = at;
    }
    if (data.description.length > 165) warnings.push(`Meta description longa (${data.description.length}) em ${lang}/${f}`);
    collectTodos(`cases/${lang}/${f}`, read(path.join(dir, f)));
    for (const k of Object.keys(data)) data[k] = cleanTodo(data[k]);
    map[data.slug] = { ...data, body, lang };
  }
  for (const s of CASE_ORDER) if (!map[s]) throw new Error(`Case "${s}" sem arquivo em ${lang}`);
  return map;
}

function loadPosts(lang) {
  const dir = path.join(SRC, 'content/log', lang);
  if (!exists(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => {
    const { data, body } = parseFrontMatter(read(path.join(dir, f)), f);
    collectTodos(`log/${lang}/${f}`, read(path.join(dir, f)));
    return { ...data, body, order: Number(data.order || 99) };
  }).sort((a, b) => a.order - b.order);
}

const CASES = Object.fromEntries(LANGS.map(l => [l, loadCases(l)]));
const POSTS = Object.fromEntries(LANGS.map(l => [l, loadPosts(l)]));

// ---------------------------------------------------------------- assets (css/js com hash para cache)
const CSS = read(path.join(SRC, 'assets/css/site.css'));
const JS = read(path.join(SRC, 'assets/js/site.js'));
const JS_FILE = `/assets/js/site.${hashOf(JS)}.js`;
const ogManifest = exists(path.join(GEN, 'og/manifest.json')) ? JSON.parse(read(path.join(GEN, 'og/manifest.json'))) : {};
const ogImage = id => ogManifest[id] ? `/assets/og/${ogManifest[id]}` : (ogManifest['default'] ? `/assets/og/${ogManifest['default']}` : null);

// ---------------------------------------------------------------- dados estruturados
const PERSON_ID = abs('/#person');
function personLD(lang) {
  return {
    '@type': 'Person', '@id': PERSON_ID,
    name: PERSON.name,
    jobTitle: PERSON.jobTitle[lang],
    url: abs(URLS.home(lang)),
    image: abs('/assets/img/portrait.png'),
    worksFor: { '@type': 'Organization', name: PERSON.worksFor },
    alumniOf: [{ '@type': 'CollegeOrUniversity', name: 'FIAP' }, { '@type': 'CollegeOrUniversity', name: 'Estácio' }, { '@type': 'CollegeOrUniversity', name: 'UFJF' }],
    knowsAbout: ['Product Design', 'UX Design', 'Conversation Design', 'UX Research', 'Design Systems', 'A/B Testing', 'Product Management', 'Product Owner', 'Generative AI', 'Front-end'],
    knowsLanguage: ['pt-BR', 'en', 'es'],
    sameAs: ['linkedin', 'github', 'behance'].map(LINK).filter(Boolean),
  };
}
const ldScript = graph => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;

// ---------------------------------------------------------------- ícones e peças
const ARROW = dir => {
  const paths = { right: 'M0 2h3V1h1v1h1v1H4v1H3V3H0z', down: 'M2 0h1v3h1V2h1v1H4v1H3v1H2V4H1V3H0V2h1v1h1z', up: 'M2 0h1v1h1v1h1v1H4V2H3v3H2V2H1v1H0V2h1V1h1z', upRight: 'M1 0h4v4H4V2H3v1H2v1H1v1H0V4h1V3h1V2h1V1H1z' };
  return `<svg class="px-arrow" viewBox="0 0 5 5" width="10" height="10" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="${paths[dir]}"/></svg>`;
};
const LOGO = `<svg class="logo" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M13 0L16.5 6H9.5Z M3 6H10L6.5 12Z M6.5 12L10 18H3Z M17.5 12L21 18H14Z M8.5 18H15.5L12 24Z"/></svg>`;
const ext = (href, label, lang, attrs = '') => `<a href="${href}" target="_blank" rel="noopener" ${attrs}>${label}${ARROW('upRight')}<span class="sr-only"> ${UI[lang].newTab}</span></a>`;
// CV hospedado no site: a versão do idioma, ou a em português quando a outra ainda não existe.
const CV_DIR = path.join(SRC, 'assets/cv');
// CV: o PDF local (fora do GitHub), senão PERSON.cvUrl, senão nenhum link de CV
const HAS_CV = exists(path.join(CV_DIR, PERSON.cvFiles.pt));
const cvFor = lang => !FEATURES.cv ? null : exists(path.join(CV_DIR, PERSON.cvFiles[lang])) ? { href: `/cv/${PERSON.cvFiles[lang]}`, own: true }
  : HAS_CV ? { href: `/cv/${PERSON.cvFiles.pt}`, own: lang === 'pt' }
  : PERSON.cvUrl ? { href: PERSON.cvUrl, own: true } : null;
const cvLabel = lang => cvFor(lang) && cvFor(lang).own ? UI[lang].cvLink : UI[lang].cvLinkFallback;
const cvExt = (lang, local, cls = '') => !cvFor(lang) ? '' : `<a${cls ? ` class="${cls}"` : ''} href="${cvFor(lang).href}" target="_blank" rel="noopener" type="application/pdf" data-umami-event="cv-abrir" data-umami-event-local="${local}">${cvLabel(lang)}${ARROW('upRight')}<span class="sr-only"> ${UI[lang].newTab}</span></a>`;
// E-mail visível, com link e botão de copiar (o aviso "copiado" vai para leitores de tela pela região aria-live).

// ---------------------------------------------------------------- layout
function head({ lang, title, description, url, alt, og, type = 'website', ld = [], preloadImg = '' }) {
  const t = UI[lang];
  const ogUrl = og ? abs(og) : null;
  const altLinks = alt ? `<link rel="alternate" hreflang="pt-BR" href="${abs(alt.pt)}"><link rel="alternate" hreflang="en" href="${abs(alt.en)}"><link rel="alternate" hreflang="x-default" href="${abs(alt.pt)}">` : '';
  const umami = UMAMI_ID ? `<script defer src="${esc(UMAMI_SRC)}" data-website-id="${esc(UMAMI_ID)}" data-domains="${esc(new URL(SITE_URL).hostname)}" data-do-not-track="true"></script>` : '';
  return `<!doctype html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${PERSON.name}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${abs(url)}">
${altLinks}
<meta name="theme-color" content="#0c0b0e">
<meta name="color-scheme" content="dark">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
<link rel="preload" href="/assets/fonts/silkscreen-latin.woff2" as="font" type="font/woff2" crossorigin>
${preloadImg}
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${PERSON.name}">
<meta property="og:locale" content="${t.ogLocale}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${abs(url)}">
${ogUrl ? `<meta property="og:image" content="${ogUrl}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="${esc(title)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
${ogUrl ? `<meta name="twitter:image" content="${ogUrl}">` : ''}
<style>${CSS}</style>
<script>document.documentElement.classList.add('js');</script>
${ldScript(ld)}
<script defer src="${JS_FILE}"></script>
${umami}
</head>`;
}

function header({ lang, alt, active }) {
  const t = UI[lang];
  const home = URLS.home(lang);
  const h = active === 'home' ? '' : home;
  const links = [['projects', `${h}#projetos`], ['about', `${h}#sobre`], ...(SHOW_LOG ? [['log', URLS.log(lang)]] : []), ['contact', `${h}#contato`]];
  return `<a class="skip-link" href="#conteudo">${t.skip}</a>
<header class="site-header">
  <div class="wrap header-in">
    <a class="brand" href="${home}">${LOGO}<span>${PERSON.name}</span></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav">${t.menu}</button>
    <nav id="site-nav" class="site-nav" aria-label="${lang === 'pt' ? 'Principal' : 'Main'}">
      <ul>${links.map(([k, href]) => `<li><a href="${href}"${active === k ? ' aria-current="page"' : ''}>${t.nav[k]}</a></li>`).join('')}</ul>
      <a class="lang" href="${alt ? alt[t.other] : URLS.home(t.other)}" hreflang="${t.other === 'pt' ? 'pt-BR' : 'en'}" lang="${t.other === 'pt' ? 'pt-BR' : 'en'}"><span aria-hidden="true">${t.otherLabel}</span><span class="sr-only">${t.otherName}</span></a>
    </nav>
  </div>
</header>`;
}

function footer(lang, { home = false } = {}) {
  const t = UI[lang];
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="foot-line">
      <p>${t.footer} © ${YEAR} ${PERSON.name}</p>
      <a class="foot-email" href="mailto:${PERSON.email}" data-umami-event="contato-email" data-umami-event-local="rodape">${PERSON.email}</a>
      <a href="#top">${t.backTop} ↑</a>
    </div>
  </div>
</footer>`;
}

function page({ lang, title, description, url, alt, og, type, ld, body, active, preloadImg, home = false }) {
  return `${head({ lang, title, description, url, alt, og, type, ld, preloadImg })}
<body id="top" data-lang="${lang}" data-page="${active || ''}">
${header({ lang, alt, active })}
<main id="conteudo" tabindex="-1">
${body}
</main>
${footer(lang, { home })}
</body>
</html>
`;
}

// ---------------------------------------------------------------- componentes de case
function caseCover(c, { eager = false, sizes } = {}) {
  if (c.cover) return picture(c.cover, c.coverAlt, { eager, sizes });
  return pixelCover(c.slug, `${c.title}`);
}

function caseCard(c, lang, { local = 'inicio', hl = 3, sizes = '(min-width: 1100px) 520px, (min-width: 700px) 50vw, 100vw' } = {}) {
  const t = UI[lang];
  return `<article class="card">
  <a class="card-link" href="${URLS.case(lang, c.slug)}" data-umami-event="abrir-case" data-umami-event-case="${c.slug}" data-umami-event-local="${local}">
    <div class="card-media${c.coverFit === 'contain' ? ' fit-contain' : ''}">${caseCover(c, { sizes })}</div>
    <div class="card-body">
      <h${hl} class="card-title">${esc(c.title)}</h${hl}>
      <p class="card-text">${esc(c.card)}</p>
      <p class="card-tags">${esc((c.kicker || '').split('·').slice(0, 3).map(s => s.trim()).join(' · '))}</p>
      <span class="card-cta">${t.viewCase}${ARROW('right')}</span>
    </div>
  </a>
</article>`;
}

// Faixa de números (topo da home e começo de cada case).
function statsList(items, label, cls = '') {
  if (!items || !items.length) return '';
  return `<ul class="stats${cls ? ' ' + cls : ''}" aria-label="${esc(label)}">${items.map(([v, l]) => `<li><strong>${esc(v)}</strong><span>${esc(l)}</span></li>`).join('')}</ul>`;
}

// Pássaro do site original (sprite 10x5): o = corpo, d = asa, k = olho, y = bico e pés.
const BIRD_ROWS = ['.....oooo.', '..oooookyy', 'oooodooo..', '.odddddo..', '...y..y...'];
const BIRD_COLORS = { o: '#bf5fff', d: '#8a3ec4', k: '#16121c', y: '#ffd24a' };
const BIRD = `<svg viewBox="0 0 10 5" width="40" height="20" shape-rendering="crispEdges" aria-hidden="true">${BIRD_ROWS.map((r, y) => [...r].map((c, x) => c === '.' ? '' : `<rect x="${x}" y="${y}" width="1" height="1" fill="${BIRD_COLORS[c]}"/>`).join('')).join('')}</svg>`;

// ---------------------------------------------------------------- página inicial
function homePage(lang) {
  const t = UI[lang];
  const cases = CASES[lang];
  const url = URLS.home(lang);
  const alt = { pt: URLS.home('pt'), en: URLS.home('en') };
  const featured = HOME.featured.map(s => cases[s]);
  const posts = POSTS[lang];
  const name = PERSON.name;

  const hero = `<section class="hero" aria-labelledby="hero-title" data-hero>
  <div class="wrap">
    <button type="button" class="skip-intro" data-skip-intro hidden>${t.skipIntro} <kbd>Esc</kbd></button>
    <h1 id="hero-title" class="hero-title">${name}</h1>
    <p class="hero-intro">${esc(HOME.intro[lang])}</p>
    <div class="hero-ctas"><a class="btn" href="#projetos" data-build-target>${t.seeProjects}${ARROW('down')}</a>${ext(PERSON.links.linkedin, 'LinkedIn', lang, 'class="btn btn-alt" data-umami-event="contato-linkedin"')}</div>
    <div class="ground" aria-hidden="true" data-ground>
      <div class="ground-blocks">${'<i></i>'.repeat(20)}</div>
      <div class="bird" data-bird>${BIRD}<span class="bubble" data-bubble hidden></span></div>
    </div>
  </div>
</section>`;

  const projects = `<section class="section" id="projetos" aria-labelledby="projetos-title">
  <div class="wrap">
    <h2 id="projetos-title" class="section-title">${t.projectsTitle}</h2>
    <div class="grid-home">${featured.map(c => caseCard(c, lang)).join('')}</div>
    <p class="more"><a class="btn" href="${URLS.projects(lang)}" data-umami-event="ver-todos-projetos">${t.allProjects}${ARROW('right')}</a></p>
  </div>
</section>`;

  const aboutTxt = lang === 'pt' ? [
    'Product Designer e líder de design. Ao longo de mais de 10 anos, encontrou formas de transformar problemas complexos em soluções que fazem diferença para pessoas e negócios.',
    'Tem um perfil em T: atua em pesquisa, estratégia, conversation design, UX writing, fluxos, prototipação e validação, com maior profundidade em UI/UX, design systems e desenvolvimento de equipes.',
    'Nos últimos anos, aprofundou IA, automação e dados. Ao longo da carreira, mentorou mais de 20 designers.',
  ] : [
    'A Product Designer and design leader. Over 10+ years, she has found ways to turn complex problems into solutions that matter to people and businesses.',
    'She has a T-shaped profile: she works across research, strategy, conversation design, UX writing, flows, prototyping and validation, with the deepest expertise in UI/UX, design systems and team development.',
    'In recent years, she has gone deeper into AI, automation and data. Over her career, she has mentored more than 20 designers.',
  ];
  const inv = HOME.featured.map((s, i) => `<li><span>${lang === 'pt' ? 'Projeto' : 'Project'} ${i + 1}</span><a href="${URLS.case(lang, s)}">${esc(cases[s].short || cases[s].title.split(':')[0])}</a></li>`).join('')
    + `<li><span>+${CASE_ORDER.length - HOME.featured.length}</span><a href="${URLS.projects(lang)}">${lang === 'pt' ? 'Ver todos' : 'See all'}</a></li>`;
  const about = `<section class="section" id="sobre" aria-labelledby="sobre-title">
  <div class="wrap">
    <h2 id="sobre-title" class="section-title">${t.about}</h2>
    <div class="about-grid">
      <div class="about-text">${aboutTxt.map(p => `<p>${esc(p)}</p>`).join('')}</div>
      <div class="about-skills">
        ${SKILLS.groups.map(g => `<p class="chips-label">${esc(g.label[lang])}</p><ul class="chips">${g.items.map(s => SKILLS.strong.includes(s) ? `<li class="strong">${s}<span class="sr-only"> (${lang === 'pt' ? 'mais forte' : 'strongest'})</span></li>` : `<li>${s}</li>`).join('')}</ul>`).join('\n        ')}
        <p class="chips-label">${lang === 'pt' ? 'Também usa' : 'Also uses'}</p><ul class="chips">${SKILLS.tech.map(s => `<li>${s}</li>`).join('')}</ul>
        ${SKILLS.strong.length ? `<p class="chips-legend"><i aria-hidden="true"></i>${lang === 'pt' ? 'Pontos mais fortes' : 'Strongest areas'}</p>` : ''}
      </div>
    </div>
    <div class="player">
      <div class="player-portrait"><img src="/assets/img/portrait.png" width="64" height="64" alt="${lang === 'pt' ? 'Retrato em pixel art de Gabriela Angelique' : 'Pixel art portrait of Gabriela Angelique'}" loading="lazy"></div>
      <div class="player-stats">
        <p class="player-top"><span>${lang === 'pt' ? 'Jogadora 1' : 'Player 1'}</span><span>${lang === 'pt' ? 'Nv.' : 'Lv.'} 10</span></p>
        <p class="player-name">${name}</p>
        <p class="player-class">${lang === 'pt' ? 'Classe: Designer em T' : 'Class: T-shaped designer'} · PT · EN · ES</p>
        <p class="player-label">${lang === 'pt' ? 'Inventário' : 'Inventory'}</p>
        <ol class="player-inv">${inv}</ol>
        <p class="player-special"><span>${lang === 'pt' ? 'Golpe especial' : 'Special move'}:</span> ▶ ${lang === 'pt' ? 'da pesquisa à validação' : 'from research to validation'}</p>
      </div>
    </div>
  </div>
</section>`;

  const log = !SHOW_LOG ? '' : `<section class="section" id="log" aria-labelledby="log-title">
  <div class="wrap">
    <h2 id="log-title" class="section-title">${t.log}</h2>
    <ul class="log-list log-list-home">${posts.slice(0, 3).map((p, i) => logItem(p, lang, 3, i === 0)).join('')}</ul>
    <p class="more"><a class="btn" href="${URLS.log(lang)}">${t.allPosts}${ARROW('right')}</a></p>
  </div>
</section>`;

  const contact = `<section class="section" id="contato" aria-labelledby="contato-title">
  <div class="wrap contact-grid">
    <div>
      <h2 id="contato-title" class="section-title">${t.contact}</h2>
      <ul class="contact-links">
        <li>${ext(PERSON.links.linkedin, 'LinkedIn', lang, 'data-umami-event="contato-linkedin"')}</li>
        ${cvFor(lang) ? `<li>${cvExt(lang, 'contato')}</li>` : ''}
        ${LINK('behance') ? `<li>${ext(LINK('behance'), 'Behance', lang)}</li>` : ''}
        <li>${ext(PERSON.links.github, 'GitHub', lang)}</li>
        <li>${ext(PERSON.links.instagram, 'Instagram', lang)}</li>
        <li>${ext(PERSON.links.youtube, 'YouTube', lang)}</li>
      </ul>
    </div>
    ${terminal(lang)}
  </div>
</section>`;

  const title = HOME.title[lang];
  const ld = [
    personLD(lang),
    { '@type': 'WebSite', '@id': abs('/#website'), url: abs('/'), name: PERSON.name, inLanguage: ['pt-BR', 'en'], author: { '@id': PERSON_ID } },
    { '@type': 'ProfilePage', '@id': abs(url) + '#page', url: abs(url), name: title, description: HOME.description[lang], inLanguage: t.lang, mainEntity: { '@id': PERSON_ID }, isPartOf: { '@id': abs('/#website') } },
    { '@type': 'ItemList', name: t.projectsTitle, itemListElement: featured.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(URLS.case(lang, c.slug)), name: c.title })) },
  ];
  return page({
    lang, title, description: HOME.description[lang], url, alt, og: ogImage(`${lang}-home`), ld, active: 'home', home: true,
    body: [hero, projects, about, log, contact].join('\n'),
  });
}

// ---------------------------------------------------------------- todos os projetos
function projectsPage(lang) {
  const t = UI[lang];
  const url = URLS.projects(lang);
  const all = CASE_ORDER.map(s => CASES[lang][s]);
  const body = `<section class="section section-first">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${URLS.home(lang)}">${t.case.breadcrumbHome}</a></li><li><span aria-current="page">${t.case.breadcrumbProjects}</span></li></ol></nav>
    <h1 class="section-title">${t.case.breadcrumbProjects}</h1>
    <p class="section-intro">${t.projectsIntro}</p>
    <div class="grid-all">${all.map(c => caseCard(c, lang, { local: 'projetos', hl: 2, sizes: '(min-width: 1100px) 340px, (min-width: 700px) 50vw, 100vw' })).join('')}</div>
  </div>
</section>`;
  const title = lang === 'pt' ? `Projetos · ${PERSON.name} · Product Designer | UX | Conversation Design` : `Projects · ${PERSON.name} · Product Designer | UX | Conversation Design`;
  const description = lang === 'pt' ? 'Todos os cases de Gabriela Angelique: plataforma de inglês com IA, conversation design, analytics, chatbot, Web3, design systems e e-commerce.' : 'All case studies by Gabriela Angelique: AI English learning platform, conversation design, analytics, chatbot, Web3, design systems and e-commerce.';
  const ld = [personLD(lang), { '@type': 'CollectionPage', url: abs(url), name: title, inLanguage: t.lang, about: { '@id': PERSON_ID }, hasPart: all.map(c => ({ '@type': 'CreativeWork', name: c.title, url: abs(URLS.case(lang, c.slug)) })) }];
  return page({ lang, title, description, url, alt: { pt: URLS.projects('pt'), en: URLS.projects('en') }, og: ogImage(`${lang}-home`), ld, body, active: 'projects' });
}

function terminal(lang) {
  const t = UI[lang];
  const hint = lang === 'pt'
    ? ['Olá! Este terminal responde sobre a Gabriela.', `Comandos: ajuda · sobre · cases · ab${cvFor(lang) ? ' · cv' : ''} · contato`]
    : ['Hi! This terminal answers questions about Gabriela.', `Commands: help · about · cases · ab${cvFor(lang) ? ' · cv' : ''} · contact`];
  const data = CASE_ORDER.map(s => { const c = CASES[lang][s]; return { t: c.title, h: URLS.case(lang, s), k: [c.kicker, ...(Array.isArray(c.skills) ? c.skills : [])].join(' ') }; });
  return `<div class="terminal" data-terminal data-email="${PERSON.email}" data-linkedin="${PERSON.links.linkedin}" data-cv="${cvFor(lang) ? cvFor(lang).href : ''}" data-cases="${esc(JSON.stringify(data))}">
  <div class="terminal-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span>${t.terminalTitle}</span></div>
  <div class="terminal-out" role="log" aria-live="polite" aria-label="${lang === 'pt' ? 'Saída do terminal' : 'Terminal output'}">${hint.map(h => `<p>${esc(h)}</p>`).join('')}</div>
  <form class="terminal-form" data-terminal-form hidden>
    <label for="term-in" class="sr-only">${t.terminalLabel}</label>
    <span aria-hidden="true">&gt;</span>
    <input id="term-in" name="q" type="text" autocomplete="off" spellcheck="false" enterkeyhint="send" placeholder="${t.terminalHint}">
  </form>
</div>`;
}

function logItem(p, lang, hl = 3, media = true) {
  const t = UI[lang];
  return `<li class="log-item"><a href="${URLS.post(lang, p.slug)}">
    ${p.cover && media ? `<div class="log-media">${picture(p.cover, p.coverAlt || p.title, { sizes: '(min-width: 1100px) 360px, 100vw' })}</div>` : ''}
    <div class="log-body"><p class="log-min">${esc(p.min)} ${t.min}</p><h${hl}>${esc(p.title)}</h${hl}><p>${esc(p.summary)}</p><span class="card-cta">${t.read}${ARROW('right')}</span></div>
  </a></li>`;
}

// Bloco "Como foi medido": a seção vira um quadro próprio, fácil de achar ao passar os olhos.
function wrapMeasure(html) {
  return html.replace(/(<h2 id="(?:como-foi-medido|how-it-was-measured)">[\s\S]*?)(?=<h2 |$)/, '<section class="measure">$1</section>\n');
}

// ---------------------------------------------------------------- Processo (como eu trabalho)
function processPage(lang) {
  const t = UI[lang]; const tp = t.process;
  const url = URLS.process(lang);
  const file = path.join(SRC, 'content/pages', lang, 'processo.md');
  const { data, body: md } = parseFrontMatter(read(file), 'processo.md');
  collectTodos(`pages/${lang}/processo.md`, read(file));
  const { html, toc } = markdown(md, lang);
  // cada H2 vira um bloco; o último (métricas) ganha destaque
  const blocks = html.split(/(?=<h2 id=")/).filter(x => x.trim());
  const sections = blocks.map((b, i) => `<section class="topic${i === blocks.length - 1 ? ' topic-metrics' : ''}">${b}</section>`).join('\n');
  const body = `<article class="process">
  <div class="wrap wrap-narrow">
    <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${URLS.home(lang)}">${t.case.breadcrumbHome}</a></li><li><span aria-current="page">${tp.crumb}</span></li></ol></nav>
    <h1 class="case-title">${tp.h1}</h1>
    <p class="case-subtitle">${tp.intro}</p>
    <nav class="toc" aria-labelledby="toc-title"><p id="toc-title" class="toc-title">${tp.onPage}</p><ol>${toc.map(x => `<li><a href="#${x.id}">${inline(x.text, lang)}</a></li>`).join('')}</ol></nav>
  </div>
  <div class="wrap wrap-narrow case-body process-body">
${sections}
  </div>
</article>`;
  const title = `${data.title} · ${PERSON.name}`;
  const ld = [personLD(lang), { '@type': 'WebPage', url: abs(url), name: title, description: data.description, inLanguage: t.lang, about: { '@id': PERSON_ID } }];
  return page({ lang, title, description: data.description, url, alt: { pt: URLS.process('pt'), en: URLS.process('en') }, og: ogImage(`${lang}-home`), ld, body, active: 'process' });
}

// ---------------------------------------------------------------- página de case
function casePage(lang, slug) {
  const t = UI[lang];
  const c = CASES[lang][slug];
  const url = URLS.case(lang, slug);
  const alt = { pt: URLS.case('pt', slug), en: URLS.case('en', slug) };
  const idx = CASE_ORDER.indexOf(slug);
  const next = CASES[lang][CASE_ORDER[(idx + 1) % CASE_ORDER.length]];
  // Texto antes de "<!-- fim-topo -->" vai para o topo do case, acima da capa.
  const [topMd, restMd] = c.body.includes('<!-- fim-topo -->') ? c.body.split('<!-- fim-topo -->') : ['', c.body];
  const intro = topMd.trim() ? `<div class="case-intro case-body">${markdown(topMd, lang, { slug }).html}</div>` : '';
  const html = wrapMeasure(markdown(restMd, lang, { slug }).html);
  const metaRow = (k, v) => v ? `<div><dt>${k}</dt><dd>${inline(v, lang)}</dd></div>` : '';
  const title = `${c.seoTitle} · ${PERSON.name}`;
  const coverPreload = c.cover && imgManifest[c.cover] ? (() => {
    const m = imgManifest[c.cover];
    return `<link rel="preload" as="image" type="image/avif" imagesrcset="${m.widths.map(w => `/assets/img/${c.cover}-${w}.avif ${w}w`).join(', ')}" imagesizes="(min-width: 1100px) 960px, 100vw" fetchpriority="high">`;
  })() : '';
  const body = `<article class="case" data-case="${slug}">
  <div class="wrap wrap-narrow">
    <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${URLS.home(lang)}">${t.case.breadcrumbHome}</a></li><li><a href="${URLS.projects(lang)}">${t.case.breadcrumbProjects}</a></li><li><span aria-current="page">${esc(c.title)}</span></li></ol></nav>
    <p class="kicker">${esc(c.kicker)}</p>
    <h1 class="case-title">${esc(c.title)}</h1>
    <p class="case-subtitle">${esc(c.subtitle)}</p>
    <dl class="case-meta">${metaRow(t.case.company, c.company)}${metaRow(t.case.role, c.role)}${metaRow(t.case.period, c.period)}${metaRow(t.case.team, c.team)}</dl>
    ${intro}
    ${statsList(Object.keys(c).filter(k => /^stat\d$/.test(k)).sort().map(k => String(c[k]).split(' | ')).filter(x => x.length === 2 && x[0]), t.caseStats, 'stats-case')}
  </div>
  <div class="wrap case-cover">${caseCover(c, { eager: true, sizes: '(min-width: 1100px) 960px, 100vw' })}</div>
  <div class="wrap wrap-narrow case-body">
${html}
  </div>
  <div class="wrap wrap-narrow case-end">
    <nav class="case-nav" aria-label="${t.case.next}">
      <a class="next-case" href="${URLS.case(lang, next.slug)}" data-umami-event="abrir-case" data-umami-event-case="${next.slug}" data-umami-event-local="proximo"><span>${t.case.next}</span><strong>${esc(next.title)}</strong>${ARROW('right')}</a>
      <a class="link-arrow" href="${URLS.projects(lang)}">${t.case.back}</a>
    </nav>
  </div>
</article>`;
  const og = ogImage(`${lang}-case-${slug}`);
  const ld = [
    personLD(lang),
    {
      '@type': 'CreativeWork', '@id': abs(url) + '#case', url: abs(url), name: c.title, headline: c.seoTitle, description: c.description,
      abstract: stripMd(c.description),
      author: { '@id': PERSON_ID }, creator: { '@id': PERSON_ID }, inLanguage: t.lang,
      keywords: (Array.isArray(c.skills) ? c.skills : []).join(', '),
      genre: lang === 'pt' ? 'Estudo de caso de design' : 'Design case study',
      ...(og ? { image: abs(og) } : {}),
      ...(c.company ? { sourceOrganization: { '@type': 'Organization', name: stripMd(c.company).split('·')[0].trim() } } : {}),
    },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.case.breadcrumbHome, item: abs(URLS.home(lang)) },
      { '@type': 'ListItem', position: 2, name: t.case.breadcrumbProjects, item: abs(URLS.projects(lang)) },
      { '@type': 'ListItem', position: 3, name: c.title, item: abs(url) },
    ] },
  ];
  return page({ lang, title, description: c.description, url, alt, og, type: 'article', ld, body, active: 'case', preloadImg: coverPreload });
}

// ---------------------------------------------------------------- Log
function logIndexPage(lang) {
  const t = UI[lang];
  const url = URLS.log(lang);
  const body = `<section class="section section-first">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${URLS.home(lang)}">${t.case.breadcrumbHome}</a></li><li><span aria-current="page">Log</span></li></ol></nav>
    <h1 class="section-title">${t.log}</h1>
    <p class="section-intro">${t.logIntro}</p>
    <ul class="log-list log-list-all">${POSTS[lang].map(p => logItem(p, lang, 2)).join('')}</ul>
  </div>
</section>`;
  const title = lang === 'pt' ? `Log: design, produto e DesignOps · ${PERSON.name}` : `Log: design, product and DesignOps · ${PERSON.name}`;
  const description = lang === 'pt' ? 'Textos de Gabriela Angelique sobre Growth Map, Design Check, design sprint, processo de design, workshops e colaboração com front-end.' : 'Writing by Gabriela Angelique on the Growth Map, Design Check, design sprints, design process, workshops and front-end collaboration.';
  const ld = [personLD(lang), { '@type': 'Blog', url: abs(url), name: title, author: { '@id': PERSON_ID }, inLanguage: t.lang, blogPost: POSTS[lang].map(p => ({ '@type': 'BlogPosting', headline: p.title, url: abs(URLS.post(lang, p.slug)) })) }];
  return page({ lang, title, description, url, alt: { pt: URLS.log('pt'), en: URLS.log('en') }, og: ogImage(`${lang}-log`), ld, body, active: 'log' });
}

function postPage(lang, p, i) {
  const t = UI[lang];
  const url = URLS.post(lang, p.slug);
  const posts = POSTS[lang];
  const next = posts[(i + 1) % posts.length];
  const html = wrapMeasure(markdown(p.body, lang).html);
  const body = `<article class="post">
  <div class="wrap wrap-narrow">
    <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${URLS.home(lang)}">${t.case.breadcrumbHome}</a></li><li><a href="${URLS.log(lang)}">Log</a></li><li><span aria-current="page">${esc(p.title)}</span></li></ol></nav>
    <p class="kicker">${esc(p.min)} ${t.min}</p>
    <h1 class="case-title">${esc(p.title)}</h1>
    <p class="case-subtitle">${esc(p.summary)}</p>
  </div>
  ${p.cover ? `<div class="wrap case-cover">${picture(p.cover, p.coverAlt || p.title, { eager: true })}</div>` : ''}
  <div class="wrap wrap-narrow case-body">
${html}
  </div>
  <div class="wrap wrap-narrow case-end">
    <nav class="case-nav" aria-label="${t.nextPost}">
      <a class="next-case" href="${URLS.post(lang, next.slug)}"><span>${t.nextPost}</span><strong>${esc(next.title)}</strong>${ARROW('right')}</a>
      <a class="link-arrow" href="${URLS.log(lang)}">${t.backLog}</a>
    </nav>
  </div>
</article>`;
  const title = `${p.title} · Log · ${PERSON.name}`;
  const ld = [personLD(lang), { '@type': 'BlogPosting', headline: p.title, description: p.summary, url: abs(url), author: { '@id': PERSON_ID }, inLanguage: t.lang, ...(p.cover ? { image: abs(`/assets/img/${p.cover}-960.webp`) } : {}) }];
  return page({ lang, title, description: p.description || p.summary, url, alt: { pt: URLS.post('pt', p.slug), en: URLS.post('en', p.slug) }, og: ogImage(`${lang}-log`), type: 'article', ld, body, active: 'log' });
}

function notFoundPage() {
  const lang = 'pt'; const t = UI.pt;
  const body = `<section class="section section-first"><div class="wrap wrap-narrow">
    <h1 class="section-title">404 · ${t.notFound}</h1>
    <p>${t.notFoundText}</p>
    <p lang="en">${UI.en.notFoundText}</p>
    <ul class="contact-links"><li><a href="/">${t.goHome}</a></li><li><a href="/en/" lang="en">${UI.en.goHome}</a></li></ul>
    <script>(function(){var h=location.hash||'';var m=h.match(/^#\\/(projetos|log)\\/([\\w-]+)/);if(m){var s=m[2]==='analytics'?'metrica':m[2];if(s==='huzaar'){location.replace('/projetos');return;}location.replace((m[1]==='projetos'&&s!=='metrica'?'/projetos/':'/log/')+s);}})();</script>
  </div></section>`;
  return head({ lang, title: `404 · ${PERSON.name}`, description: t.notFoundText, url: '/404', ld: [] }).replace('<meta name="robots" content="index, follow, max-image-preview:large">', '<meta name="robots" content="noindex">')
    + `\n<body id="top">${header({ lang, active: '' })}<main id="conteudo" tabindex="-1">${body}</main>${footer(lang)}</body></html>`;
}

// ---------------------------------------------------------------- sitemap, robots, headers
function sitemap(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(e => `  <url>
    <loc>${abs(e.url)}</loc>
    <lastmod>${TODAY}</lastmod>
${e.alt ? `    <xhtml:link rel="alternate" hreflang="pt-BR" href="${abs(e.alt.pt)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${abs(e.alt.en)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(e.alt.pt)}"/>
` : ''}  </url>`).join('\n')}
</urlset>
`;
}

const ROBOTS = `# Buscadores e robôs de IA são bem-vindos.
User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot
Allow: /

Sitemap: ${abs('/sitemap.xml')}
`;

const HEADERS = `/assets/*
  Cache-Control: public, max-age=31536000, immutable
${FEATURES.cv ? '/cv/*\n  Cache-Control: public, max-age=3600\n' : ''}/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  X-Frame-Options: SAMEORIGIN
`;

const REDIRECTS = `/en.html /en/ 301
/index.html / 301
${SHOW_LOG ? `/projetos/analytics /log/metrica 301
/en/projects/analytics /en/log/metrica 301
/projetos/metrica /log/metrica 301
/en/projects/metrica /en/log/metrica 301` : `/projetos/analytics /projetos 302
/en/projects/analytics /en/projects 302
/projetos/metrica /projetos 302
/en/projects/metrica /en/projects 302
/log / 302
/log/* / 302
/en/log /en/ 302
/en/log/* /en/ 302`}
${FEATURES.process ? '' : '/processo / 301\n/en/process /en/ 301\n'}/projetos/lideranca-seedts /projetos 302
/projetos/hypha /projetos 302
/en/projects/hypha /en/projects 302
/en/projects/lideranca-seedts /en/projects 302
${cvFor('pt') ? `/cv/gabriela-angelique-cv-geral-pt.pdf ${cvFor('pt').href} 301
/cv/gabriela-angelique-cv-geral-en.pdf ${cvFor('en').href} 301
` : ''}/en /en/ 301
/perfil/* / 301
/en/profile/* /en/ 301
`;

// ---------------------------------------------------------------- build
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

const sitemapEntries = [];
for (const lang of LANGS) {
  write(fileFor(URLS.home(lang)), homePage(lang));
  write(fileFor(URLS.projects(lang)), projectsPage(lang));
  if (FEATURES.process) write(fileFor(URLS.process(lang)), processPage(lang));
  if (lang === 'pt') {
    sitemapEntries.push({ url: '/', alt: { pt: '/', en: '/en/' } }, { url: '/en/', alt: { pt: '/', en: '/en/' } });
    sitemapEntries.push({ url: '/projetos', alt: { pt: '/projetos', en: '/en/projects' } }, { url: '/en/projects', alt: { pt: '/projetos', en: '/en/projects' } });
    if (FEATURES.process) sitemapEntries.push({ url: '/processo', alt: { pt: '/processo', en: '/en/process' } }, { url: '/en/process', alt: { pt: '/processo', en: '/en/process' } });
  }
  for (const slug of CASE_ORDER) {
    write(fileFor(URLS.case(lang, slug)), casePage(lang, slug));
    if (lang === 'pt') { const alt = { pt: URLS.case('pt', slug), en: URLS.case('en', slug) }; sitemapEntries.push({ url: alt.pt, alt }, { url: alt.en, alt }); }
  }
  if (SHOW_LOG) write(fileFor(URLS.log(lang)), logIndexPage(lang));
  if (SHOW_LOG) POSTS[lang].forEach((p, i) => write(fileFor(URLS.post(lang, p.slug)), postPage(lang, p, i)));
  if (SHOW_LOG && lang === 'pt') {
    sitemapEntries.push({ url: '/log', alt: { pt: '/log', en: '/en/log' } }, { url: '/en/log', alt: { pt: '/log', en: '/en/log' } });
    POSTS.pt.forEach(p => { const alt = { pt: URLS.post('pt', p.slug), en: URLS.post('en', p.slug) }; sitemapEntries.push({ url: alt.pt, alt }, { url: alt.en, alt }); });
  }
}
write('404.html', notFoundPage());
write('sitemap.xml', sitemap(sitemapEntries));
write('robots.txt', ROBOTS);
write('_headers', HEADERS);
write('_redirects', REDIRECTS);

// assets
if (FEATURES.cv && exists(CV_DIR)) for (const f of fs.readdirSync(CV_DIR).filter(f => f.endsWith('.pdf'))) copy(path.join(CV_DIR, f), `cv/${f}`);
if (!FEATURES.cv) {}
else if (!HAS_CV) warnings.push(PERSON.cvUrl ? 'CV local ausente: os links de CV usam PERSON.cvUrl' : 'CV ausente (src/assets/cv/): os links de CV saem do site');
else if (!exists(path.join(CV_DIR, PERSON.cvFiles.en))) warnings.push('CV em inglês ausente: as páginas em inglês usam o PDF em português');
write(JS_FILE.slice(1), JS);
for (const f of fs.readdirSync(path.join(SRC, 'assets/fonts'))) copy(path.join(SRC, 'assets/fonts', f), `assets/fonts/${f}`);
for (const f of fs.readdirSync(path.join(SRC, 'assets/img/static'))) copy(path.join(SRC, 'assets/img/static', f), `assets/img/${f}`);
for (const key of usedImages) for (const w of imgManifest[key].widths) for (const e of ['avif', 'webp']) copy(path.join(GEN, `img/${key}-${w}.${e}`), `assets/img/${key}-${w}.${e}`);
// só as imagens de compartilhamento em uso (nada de cases ocultos)
for (const f of new Set(Object.values(ogManifest))) if (exists(path.join(GEN, 'og', f))) copy(path.join(GEN, 'og', f), `assets/og/${f}`);
// favicon a partir do logo (gerado por scripts/icons.mjs)
for (const f of ['favicon.ico', 'favicon-32x32.png', 'apple-touch-icon.png']) {
  if (exists(path.join(SRC, 'assets/icons', f))) copy(path.join(SRC, 'assets/icons', f), f);
  else warnings.push(`ícone ausente: ${f} (rode node scripts/icons.mjs)`);
}

// verificações
const htmlFiles = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && htmlFiles.push(p); } })(DIST);
for (const f of htmlFiles) {
  const s = read(f);
  const rel = path.relative(DIST, f);
  if (/data:image\/(png|jpe?g|webp|gif)/.test(s)) throw new Error(`Imagem em base64 em ${rel}`);
  // só a prévia do Figma pode vir em iframe (o site antigo vinha inteiro dentro de um)
  for (const m of s.matchAll(/<iframe\b[^>]*>/gi)) if (!/src="https:\/\/www\.figma\.com\/embed\?/.test(m[0]) || !/\btitle="[^"]+"/.test(m[0])) throw new Error(`iframe não permitido em ${rel}`);
  const h1 = (s.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) throw new Error(`${rel} tem ${h1} H1`);
  for (const m of s.matchAll(/<img\b[^>]*>/g)) if (!/\balt="[^"]+"/.test(m[0])) throw new Error(`img sem alt em ${rel}: ${m[0].slice(0, 80)}`);
}

// relatório de pendências
const report = [`# Pendências [PREENCHER]`, '', `Gerado em ${TODAY}. Cada item abaixo fica fora do site até ser preenchido (com MOSTRAR_PENDENTES=1 ele aparece marcado).`, ''];
report.push('A versão em inglês (cases/en) tem os mesmos campos: preencha nos dois idiomas.', '');
for (const t of todos.filter(t => !t.where.includes('/en/'))) { report.push(`## ${t.where} (${t.n})`, '', ...t.items.map(i => `- ${i}`), ''); }
fs.mkdirSync(path.join(ROOT, '.cache'), { recursive: true });
fs.writeFileSync(path.join(ROOT, '.cache/PENDENCIAS.md'), report.join('\n') + '\n');

console.log(`build ok: ${htmlFiles.length} páginas em dist/ · analítica ${UMAMI_ID ? 'ligada' : 'desligada (sem UMAMI_WEBSITE_ID)'} · pendências: ${todos.filter(t => !t.where.includes('/en/')).reduce((a, t) => a + t.n, 0)} por idioma${HIDE_TODO ? ' (ocultas)' : ''}`);
for (const w of [...new Set(warnings)]) console.warn('aviso: ' + w);
