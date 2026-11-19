// Gera os quadros de processo de UX (no estilo FigJam) e as notas de pesquisa (no estilo Obsidian)
// usados nos cases. São resumos visuais do que está escrito nos próprios cases: nenhum dado novo.
// Saída: src/assets/img/src/<chave>.webp (depois, npm run images gera AVIF/WebP). Precisa do Playwright.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
let chromium, sharp;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = createRequire('/opt/npm-tools/')('playwright')); }
try { sharp = require('sharp'); } catch { sharp = createRequire('/opt/npm-tools/')('sharp'); }

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'src/assets/img/src');
const FONT = 'file://' + path.join(ROOT, 'src/assets/fonts/inter-latin.woff2');
const FONT_EXT = 'file://' + path.join(ROOT, 'src/assets/fonts/inter-latin-ext.woff2');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const STICKY = { y: '#ffe58a', p: '#ffc2dc', b: '#bfe3ff', g: '#c8f0b4', v: '#e2ccff', o: '#ffd6a8' };
const SECTION = { y: '#a8770a', p: '#b0306f', b: '#1d6fb8', g: '#3d8a1f', v: '#7240c4', o: '#b85c00' };

// ---------------------------------------------------------------- quadro (FigJam)
function board({ title, chips, diamond, sections, note }) {
  const cols = sections.length;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Inter;src:url(${FONT}) format('woff2');unicode-range:U+0000-00FF,U+2000-206F,U+2190-21FF}
@font-face{font-family:Inter;src:url(${FONT_EXT}) format('woff2');unicode-range:U+0100-024F}
*{box-sizing:border-box;margin:0}
body{width:1280px;padding:40px 44px 44px;font-family:Inter,system-ui,sans-serif;color:#1e1e1e;background:#f4f4f2;background-image:radial-gradient(#cfcfcb 1.2px,transparent 1.3px);background-size:22px 22px}
.top{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:${diamond ? 18 : 28}px}
h1{font-size:34px;font-weight:700;letter-spacing:-.01em}
.chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
.chip{font-size:15px;font-weight:600;padding:7px 12px;border-radius:999px;background:#fff;border:1.5px solid #1e1e1e}
.dd{display:block;width:100%;height:120px;margin:0 0 6px}
.grid{display:grid;grid-template-columns:repeat(${cols},1fr);gap:22px;align-items:start}
.sec{background:#fff;border:2px solid #d6d6d2;border-radius:18px;padding:16px 14px 18px;position:relative;box-shadow:0 2px 0 rgba(0,0,0,.04)}
.tag{display:inline-block;font-size:16px;font-weight:700;color:#fff;padding:6px 12px;border-radius:8px;margin-bottom:14px}
.sub{font-size:14px;color:#5b5b57;margin:-6px 0 12px;font-weight:600}
.st{border-radius:6px;padding:14px 14px 16px;font-size:19px;line-height:1.28;font-weight:500;margin-top:12px;box-shadow:0 6px 10px -6px rgba(0,0,0,.28),0 1px 0 rgba(0,0,0,.06)}
.st:first-of-type{margin-top:0}
.st.x{text-decoration:line-through;text-decoration-thickness:2px;opacity:.75}
.arrow{position:absolute;right:-21px;top:28px;width:20px;height:20px;z-index:2}
.note{margin-top:20px;font-size:15px;color:#5b5b57}
</style></head><body>
<div class="top"><h1>${esc(title)}</h1><div class="chips">${chips.map(c => `<span class="chip">${esc(c)}</span>`).join('')}</div></div>
${diamond ? `<svg class="dd" viewBox="0 0 1192 120" preserveAspectRatio="none"><path d="M4 60 L298 6 L592 60 L298 114 Z M600 60 L894 6 L1188 60 L894 114 Z" fill="none" stroke="#1e1e1e" stroke-width="2.5"/>${diamond.map((t, i) => `<text x="${149 + i * 298}" y="66" text-anchor="middle" font-family="Inter" font-size="17" font-weight="700" fill="#1e1e1e">${esc(t)}</text>`).join('')}</svg>` : ''}
<div class="grid">${sections.map((s, i) => `<section class="sec"><span class="tag" style="background:${SECTION[s.c]}">${esc(s.t)}</span>${s.sub ? `<p class="sub">${esc(s.sub)}</p>` : ''}${s.items.map(it => {
    const x = it.startsWith('~'); const txt = x ? it.slice(1) : it;
    return `<div class="st${x ? ' x' : ''}" style="background:${STICKY[s.c]}">${esc(txt)}</div>`;
  }).join('')}${i < cols - 1 ? `<svg class="arrow" viewBox="0 0 20 20"><path d="M2 10h13M10 4l6 6-6 6" fill="none" stroke="#1e1e1e" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}</section>`).join('')}</div>
${note ? `<p class="note">${esc(note)}</p>` : ''}
</body></html>`;
}

// ---------------------------------------------------------------- notas (Obsidian)
function notes({ vault, files, active, title, tags, intro, h2a, list, h2b, links, graph }) {
  const link = s => s.replace(/\[\[([^\]]+)\]\]/g, '<span class="wl">$1</span>');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Inter;src:url(${FONT}) format('woff2');unicode-range:U+0000-00FF,U+2000-206F,U+2190-21FF}
@font-face{font-family:Inter;src:url(${FONT_EXT}) format('woff2');unicode-range:U+0100-024F}
*{box-sizing:border-box;margin:0}
body{width:1280px;height:780px;display:grid;grid-template-columns:270px 1fr 300px;font-family:Inter,system-ui,sans-serif;background:#1e1e1e;color:#dadada}
.side{background:#262626;border-right:1px solid #333;padding:18px 12px}
.vault{font-size:15px;font-weight:700;color:#e6e6e6;padding:4px 8px 14px;display:flex;gap:8px;align-items:center}
.vault i{width:10px;height:10px;border-radius:3px;background:#8a5cf6}
.f{font-size:15px;padding:7px 10px;border-radius:6px;color:#b9b9b9;margin:2px 0}
.f.on{background:#3a3550;color:#fff}
.f.dir{color:#8f8f8f;font-weight:600;margin-top:10px}
.main{padding:28px 46px;overflow:hidden}
.bar{display:flex;gap:8px;margin:-6px 0 22px}
.tab{font-size:13px;padding:6px 12px;border-radius:6px 6px 0 0;background:#2b2b2b;color:#bdbdbd}
.tab.on{background:#333;color:#fff}
h1{font-size:32px;font-weight:700;color:#f2f2f2;margin-bottom:12px}
.props{display:flex;gap:8px;margin-bottom:20px}
.t{font-size:13px;color:#c9b6ff;background:#3a3150;padding:4px 10px;border-radius:999px}
p{font-size:17px;line-height:1.6;color:#cfcfcf;margin-bottom:16px}
h2{font-size:21px;color:#f0f0f0;margin:22px 0 10px}
ul{padding-left:22px}
li{font-size:17px;line-height:1.55;color:#cfcfcf;margin:5px 0}
li::marker{color:#8a5cf6}
.wl{color:#a98bff;border-bottom:1px solid #5f4bb0}
b{color:#f0f0f0}
.graph{background:#202020;border-left:1px solid #333;padding:18px}
.gt{font-size:13px;color:#9a9a9a;margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em}
</style></head><body>
<aside class="side"><div class="vault"><i></i>${esc(vault)}</div>${files.map(f => f.dir ? `<div class="f dir">${esc(f.dir)}</div>` : `<div class="f${f === active ? ' on' : ''}">${esc(f)}</div>`).join('')}</aside>
<main class="main"><div class="bar"><span class="tab on">${esc(active)}</span><span class="tab">${esc(links[0].replace(/\[\[|\]\]/g, ''))}</span></div>
<h1>${esc(title)}</h1><div class="props">${tags.map(t => `<span class="t">#${esc(t)}</span>`).join('')}</div>
<p>${link(esc(intro))}</p><h2>${esc(h2a)}</h2><ul>${list.map(l => `<li>${link(esc(l))}</li>`).join('')}</ul>
<h2>${esc(h2b)}</h2><ul>${links.map(l => `<li>${link(esc(l))}</li>`).join('')}</ul></main>
<aside class="graph"><p class="gt">${esc(graph.label)}</p><svg viewBox="0 0 264 640" width="264" height="640">${graph.edges.map(([a, b]) => `<line x1="${graph.nodes[a][0]}" y1="${graph.nodes[a][1]}" x2="${graph.nodes[b][0]}" y2="${graph.nodes[b][1]}" stroke="#4a4a4a" stroke-width="1.5"/>`).join('')}${graph.nodes.map(([x, y, t, on]) => `<circle cx="${x}" cy="${y}" r="${on ? 9 : 6}" fill="${on ? '#a98bff' : '#8a8a8a'}"/><text x="${x}" y="${y + 24}" text-anchor="middle" font-family="Inter" font-size="12" fill="#a8a8a8">${esc(t)}</text>`).join('')}</svg></aside>
</body></html>`;
}

// ---------------------------------------------------------------- conteúdo (só o que está nos cases)
const FRAMEWORKS = ['Double Diamond', 'Design Thinking', 'Jobs to Be Done', 'Lean UX'];
const JOBS = {
  ux_ef_pt: board({
    title: 'Editora Futura · processo de UX', chips: FRAMEWORKS,
    diamond: ['Descobrir', 'Definir', 'Desenvolver', 'Entregar'],
    sections: [
      { t: 'Descobrir', c: 'y', items: ['Diagnóstico: experiência digital concentrada em Speaking', '6 oportunidades: aprendizagem, professor, progresso, interação, famílias e avaliação', 'Auditoria do fluxo de criação de role-plays no painel'] },
      { t: 'Definir', c: 'p', items: ['Aposta: de lista de exercícios a jornada guiada', 'Job do aluno: saber o que fazer em seguida e ver a própria evolução', 'Job do professor: acompanhar e orientar a turma'] },
      { t: 'Desenvolver', c: 'b', items: ['Jornada em 6 momentos, do acesso ao acompanhamento', 'Um padrão de interação para as 4 habilidades', 'Gamificação sem competição constante', 'Painel: um rodapé por etapa'] },
      { t: 'Entregar e aprender', c: 'g', items: ['Hipótese: o feedback do Mr. Brain aumenta o início da próxima atividade', 'Teste A/B com 12.432 alunos', '28,1% → 32,4% (+4,3 p.p.)'] },
    ],
  }),
  ux_ef_en: board({
    title: 'Editora Futura · UX process', chips: FRAMEWORKS,
    diamond: ['Discover', 'Define', 'Develop', 'Deliver'],
    sections: [
      { t: 'Discover', c: 'y', items: ['Diagnosis: digital experience focused on Speaking', '6 opportunities: learning, teachers, progress, interaction, families and assessment', 'Audit of the role-play authoring flow in the admin panel'] },
      { t: 'Define', c: 'p', items: ['Bet: from an exercise list to a guided journey', 'Student job: know what to do next and see their own progress', 'Teacher job: follow and guide the class'] },
      { t: 'Develop', c: 'b', items: ['A 6-moment journey, from access to follow-up', 'One interaction pattern for all 4 skills', 'Gamification without constant competition', 'Admin panel: one footer per step'] },
      { t: 'Deliver and learn', c: 'g', items: ['Hypothesis: Mr. Brain’s feedback increases starting the next activity', 'A/B test with 12,432 students', '28.1% → 32.4% (+4.3 pp)'] },
    ],
  }),
  ux_fk_pt: board({
    title: 'Futura Kids · processo de UX', chips: FRAMEWORKS,
    diamond: ['Descobrir', 'Definir', 'Desenvolver', 'Entregar'],
    sections: [
      { t: 'Descobrir', c: 'y', sub: 'Pesquisa em 3 eixos', items: ['Engajamento: games, histórias, música, desafios e exploração', 'Necessidades: clareza, incentivo, variedade e progresso', 'O que atrapalha: repetição, instruções longas e medo de errar'] },
      { t: 'Definir', c: 'p', items: ['Job da criança: entender o que fazer e avançar sem depender da leitura', 'Diretriz: do textual ao sensorial', 'Regra: a criança nunca erra, ela tenta de novo'] },
      { t: 'Desenvolver', c: 'b', items: ['Instrução sempre em áudio, com botão para repetir', 'Navegação guiada pela voz do Mr. Brain', '~XP, badges e level up', 'Álbum de figurinhas no lugar dos pontos'] },
      { t: 'Entregar', c: 'g', items: ['Diretriz de produto de abril de 2026', 'Conceitos de tela com regras por tela', 'Próximo: modo ativado pela idade e onboarding'] },
    ],
  }),
  ux_fk_en: board({
    title: 'Futura Kids · UX process', chips: FRAMEWORKS,
    diamond: ['Discover', 'Define', 'Develop', 'Deliver'],
    sections: [
      { t: 'Discover', c: 'y', sub: 'Research in 3 areas', items: ['Engagement: games, stories, music, challenges and exploration', 'Needs: clarity, encouragement, variety and progress', 'What gets in the way: repetition, long instructions and fear of failing'] },
      { t: 'Define', c: 'p', items: ['Child’s job: understand what to do and move on without depending on reading', 'Guideline: from textual to sensory', 'Rule: the child never fails, they try again'] },
      { t: 'Develop', c: 'b', items: ['Instructions always in audio, with a replay button', 'Navigation guided by Mr. Brain’s voice', '~XP, badges and level up', 'Sticker album instead of points'] },
      { t: 'Deliver', c: 'g', items: ['Product guideline from April 2026', 'Screen concepts with rules for every screen', 'Next: mode switched on by age, and onboarding'] },
    ],
  }),
  obs_ef_pt: notes({
    vault: 'Editora Futura', active: 'Diagnóstico da experiência',
    files: [{ dir: 'Pesquisa' }, 'Diagnóstico da experiência', 'Jobs por perfil', 'Auditoria do painel', { dir: 'Produto' }, 'Jornada em 6 momentos', 'Hipótese do feedback', 'Teste A/B'],
    title: 'Diagnóstico da experiência', tags: ['pesquisa', 'edtech', 'double-diamond'],
    intro: 'A experiência digital começou concentrada em Speaking. Evoluir não era somar atividades: era repensar acesso, avanço do aluno, acompanhamento do professor e uso dos dados.',
    h2a: 'Oportunidades', list: ['Aprendizagem limitada: integrar as quatro habilidades', 'Pouca autonomia do professor', 'Progresso pouco visível', 'Pouca interação além das atividades individuais', 'Famílias distantes', 'Avaliação formativa restrita'],
    h2b: 'Ligações', links: ['[[Jobs por perfil]]', '[[Jornada em 6 momentos]]', '[[Hipótese do feedback]]'],
    graph: { label: 'Grafo', nodes: [[132, 70, 'Diagnóstico', 1], [52, 190, 'Jobs'], [212, 190, 'Auditoria'], [132, 300, 'Jornada'], [52, 420, 'Hipótese'], [212, 420, 'Painel'], [132, 540, 'Teste A/B']], edges: [[0, 1], [0, 2], [0, 3], [1, 3], [3, 4], [2, 5], [4, 6], [3, 5]] },
  }),
  obs_ef_en: notes({
    vault: 'Editora Futura', active: 'Experience diagnosis',
    files: [{ dir: 'Research' }, 'Experience diagnosis', 'Jobs by user type', 'Admin panel audit', { dir: 'Product' }, '6-moment journey', 'Feedback hypothesis', 'A/B test'],
    title: 'Experience diagnosis', tags: ['research', 'edtech', 'double-diamond'],
    intro: 'The digital experience started out focused on Speaking. Evolving it wasn’t about adding activities: it meant rethinking access, student progress, teacher follow-up and the use of data.',
    h2a: 'Opportunities', list: ['Limited learning: integrate the four skills', 'Little teacher autonomy', 'Progress hard to see', 'Little interaction beyond individual activities', 'Families at a distance', 'Limited formative assessment'],
    h2b: 'Links', links: ['[[Jobs by user type]]', '[[6-moment journey]]', '[[Feedback hypothesis]]'],
    graph: { label: 'Graph', nodes: [[132, 70, 'Diagnosis', 1], [52, 190, 'Jobs'], [212, 190, 'Audit'], [132, 300, 'Journey'], [52, 420, 'Hypothesis'], [212, 420, 'Admin'], [132, 540, 'A/B test']], edges: [[0, 1], [0, 2], [0, 3], [1, 3], [3, 4], [2, 5], [4, 6], [3, 5]] },
  }),
};

import { extraBoards } from './boards-extra.mjs';

// ---------------------------------------------------------------- render
const only = process.argv.slice(2);
const JOBS_ALL = { ...JOBS, ...(await extraBoards()) };
const keys = Object.keys(JOBS_ALL).filter(k => !only.length || only.some(p => k.startsWith(p)));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 780 }, deviceScaleFactor: 1.5 });
const tmp = path.join(ROOT, '.cache/board.html');
fs.mkdirSync(path.dirname(tmp), { recursive: true });
for (const key of keys) {
  fs.writeFileSync(tmp, JOBS_ALL[key]);
  await page.setViewportSize({ width: 1280, height: 780 });
  await page.goto('file://' + tmp, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
  const { w, h } = await page.evaluate(() => { const r = document.body.getBoundingClientRect(); return { w: Math.ceil(r.width), h: Math.ceil(r.height) }; });
  await page.setViewportSize({ width: w, height: Math.max(h, 400) });
  // WebP de alta qualidade: bem menor que PNG e sem perda visível no texto dos quadros
  const shot = await page.screenshot({ fullPage: true });
  await sharp(shot).webp({ quality: 92 }).toFile(path.join(OUT, `${key}.webp`));
  fs.rmSync(path.join(OUT, `${key}.png`), { force: true });
}
await browser.close();
console.log(`quadros: ${keys.length} imagens em src/assets/img/src`);
