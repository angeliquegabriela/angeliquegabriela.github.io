// Auditoria local (complementa o Lighthouse): acessibilidade básica, SEO on-page, versão sem JavaScript
// e métricas de carregamento em celular com limitação de rede e CPU semelhante à do Lighthouse.
// Uso: node scripts/serve.mjs 8091 & node scripts/audit.mjs http://localhost:8091
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = process.argv[2] || 'http://localhost:8091';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const sitemap = fs.readFileSync(path.join(ROOT, 'dist/sitemap.xml'), 'utf8');
const SITE = sitemap.match(/<loc>(https?:\/\/[^/]+)/)[1];
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(SITE, ''));

const browser = await chromium.launch();
const report = { pages: {}, perf: {}, summary: {} };
let problems = 0;

// ---------- verificações por página (com e sem JS)
for (const u of urls) {
  const issues = [];
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('pageerror', e => consoleErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  const resp = await page.goto(BASE + u, { waitUntil: 'networkidle' });
  if (resp.status() !== 200) issues.push(`status ${resp.status()}`);
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const out = [];
    const lum = c => { const a = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; };
    const parse = s => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return { c: p.slice(0, 3), a: p[3] === undefined ? 1 : p[3] }; };
    const bgOf = el => { while (el) { const b = parse(getComputedStyle(el).backgroundColor); if (b && b.a > 0.5) return b.c; el = el.parentElement; } return [12, 13, 11]; };
    // contraste
    const seen = new Set(); let low = [];
    for (const el of document.querySelectorAll('body *')) {
      if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || el.closest('[hidden],.sr-only,svg')) continue;
      const fg = parse(cs.color); if (!fg) continue;
      const bg = bgOf(el);
      const L1 = lum(fg.c), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const size = parseFloat(cs.fontSize), bold = Number(cs.fontWeight) >= 700;
      const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
      if (ratio < need) { const k = cs.color + '|' + bg.join(',') + '|' + size; if (!seen.has(k)) { seen.add(k); low.push(`${el.tagName.toLowerCase()}.${el.className || ''} "${el.textContent.trim().slice(0, 30)}" ${ratio.toFixed(2)}:1`); } }
    }
    if (low.length) out.push('contraste baixo: ' + low.slice(0, 5).join(' | '));
    // títulos
    const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => +h.tagName[1]);
    if (hs.filter(h => h === 1).length !== 1) out.push(`H1: ${hs.filter(h => h === 1).length}`);
    for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) { out.push(`salto de título h${hs[i - 1]}→h${hs[i]}`); break; }
    // nomes acessíveis
    for (const a of document.querySelectorAll('a,button')) {
      const name = (a.getAttribute('aria-label') || a.textContent || '').trim();
      if (!name && !a.querySelector('img[alt]')) out.push('link/botão sem nome: ' + a.outerHTML.slice(0, 80));
    }
    for (const i of document.querySelectorAll('input,select,textarea')) if (!(i.id && document.querySelector(`label[for="${i.id}"]`)) && !i.getAttribute('aria-label')) out.push('campo sem rótulo');
    for (const img of document.querySelectorAll('img')) if (!img.hasAttribute('alt')) out.push('img sem alt');
    const ids = [...document.querySelectorAll('[id]')].map(e => e.id); const dup = ids.filter((x, i) => ids.indexOf(x) !== i); if (dup.length) out.push('ids duplicados: ' + [...new Set(dup)].join(','));
    // alvos de toque (WCAG 2.5.8: 24x24 px)
    const small = [];
    for (const el of document.querySelectorAll('a,button,input')) {
      const b = el.getBoundingClientRect(); if (!b.width || el.closest('p,li,dd,td') && el.tagName === 'A' && getComputedStyle(el).display === 'inline') continue;
      if (b.width < 24 || b.height < 24) small.push(`${el.tagName.toLowerCase()} "${(el.textContent || '').trim().slice(0, 20)}" ${Math.round(b.width)}x${Math.round(b.height)}`);
    }
    if (small.length) out.push('alvos pequenos: ' + small.slice(0, 4).join(' | '));
    // SEO
    const meta = n => document.querySelector(`meta[name="${n}"],meta[property="${n}"]`)?.content || '';
    if (!document.title) out.push('sem title');
    if (!meta('description')) out.push('sem description');
    if (!document.querySelector('link[rel=canonical]')) out.push('sem canonical');
    if (!meta('og:image')) out.push('sem og:image');
    if (!document.documentElement.lang) out.push('sem lang');
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent));
    const types = ld.flatMap(x => (x['@graph'] || [x]).map(n => n['@type']));
    if (!types.includes('Person')) out.push('sem Person');
    if (location.pathname.includes('/projetos/') || location.pathname.includes('/projects/')) if (!types.includes('CreativeWork')) out.push('sem CreativeWork');
    if (document.documentElement.scrollWidth > window.innerWidth + 1) out.push(`rolagem horizontal (${document.documentElement.scrollWidth}px)`);
    return { out, title: document.title, desc: meta('description'), types };
  });
  issues.push(...r.out);
  if (consoleErrors.length) issues.push('erros no console: ' + consoleErrors.slice(0, 3).join(' | '));
  await ctx.close();

  // sem JavaScript: o conteúdo precisa estar no HTML
  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  const p2 = await nojs.newPage();
  await p2.goto(BASE + u);
  const nj = await p2.evaluate(() => ({ h1: document.querySelector('h1')?.innerText || '', words: document.querySelector('main')?.innerText.split(/\s+/).length || 0, hiddenText: [...document.querySelectorAll('main *')].filter(e => getComputedStyle(e).display === 'none' && e.textContent.trim().length > 40 && !e.closest('[hidden]')).length }));
  if (!nj.h1) issues.push('sem H1 sem JS');
  if (nj.words < 80) issues.push(`pouco texto sem JS (${nj.words} palavras)`);
  await nojs.close();
  report.pages[u] = { title: r.title, description: r.desc, words: nj.words, issues };
  problems += issues.length;
}

// ---------- teclado: foco visível e ordem no início
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/?intro=0', { waitUntil: 'networkidle' });
  const seq = [];
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    seq.push(await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { t: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 28), outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 }; }));
  }
  report.keyboard = seq;
  const bad = seq.filter(s => !s.outline);
  if (bad.length) { problems += 1; report.keyboardIssue = `foco sem contorno visível em ${bad.length} elementos`; }
  // o primeiro Tab precisa levar ao "Pular para o conteúdo"
  report.skipLinkFirst = /Pular para o conteúdo/.test(seq[0].t);
  await ctx.close();
}

// ---------- desempenho em celular (Moto G Power: 4x CPU, 150 ms RTT, 1,6 Mbps)
const perfPages = ['/', '/projetos', '/processo', '/projetos/editora-futura', '/en/', '/projetos/mr-brain'];
for (const u of perfPages) {
  const runs = [];
  for (let k = 0; k < 2; k++) {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36' });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => {
      window.__m = { lcp: 0, cls: 0, tbt: 0, fcp: 0 };
      new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.tbt += Math.max(0, e.duration - 50); }).observe({ type: 'longtask', buffered: true });
      new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__m.fcp = e.startTime; }).observe({ type: 'paint', buffered: true });
    });
    let bytes = 0;
    cdp.on('Network.loadingFinished', e => { bytes += e.encodedDataLength; });
    const t0 = Date.now();
    await page.goto(BASE + u, { waitUntil: 'load' });
    const loadMs = Date.now() - t0;
    await page.waitForTimeout(3500);
    const m = await page.evaluate(() => window.__m);
    runs.push({ ...m, loadMs, kb: Math.round(bytes / 1024) });
    await ctx.close();
  }
  const best = runs.sort((a, b) => a.lcp - b.lcp)[0];
  report.perf[u] = { fcp: Math.round(best.fcp), lcp: Math.round(best.lcp), cls: +best.cls.toFixed(3), tbt: Math.round(best.tbt), load: best.loadMs, transferKB: best.kb };
}

await browser.close();
report.summary = { pages: urls.length, problems };
fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'reports/audit.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify({ summary: report.summary, perf: report.perf, keyboardIssue: report.keyboardIssue || 'ok', skipLinkFirst: report.skipLinkFirst }, null, 1));
for (const [u, p] of Object.entries(report.pages)) if (p.issues.length) console.log(u, '→', p.issues.join(' ; '));
