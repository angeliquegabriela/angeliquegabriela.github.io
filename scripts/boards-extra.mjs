// Quadros extras dos cases Editora Futura e Mr. Brain: visão geral do Projeto Futura, ferramentas,
// frameworks, heurísticas, dinâmicas, usos e processo de criação do Mr. Brain e uma montagem de tela
// do Illustrator. São resumos visuais do que está escrito nos próprios cases: nenhum dado novo.
// As poses do Mr. Brain são recortes das ilustrações da Gabriela (e7, e8 e e9).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
let sharp;
try { sharp = require('sharp'); } catch { sharp = createRequire('/opt/npm-tools/')('sharp'); }

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'src/assets/img/src');
const CACHE = path.join(ROOT, '.cache/poses');
const FONT = 'file://' + path.join(ROOT, 'src/assets/fonts/inter-latin.woff2');
const FONT_EXT = 'file://' + path.join(ROOT, 'src/assets/fonts/inter-latin-ext.woff2');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const file = p => 'file://' + p;

const STICKY = { y: '#ffe58a', p: '#ffc2dc', b: '#bfe3ff', g: '#c8f0b4', v: '#e2ccff', o: '#ffd6a8', w: '#ffffff' };
const SECTION = { y: '#a8770a', p: '#b0306f', b: '#1d6fb8', g: '#3d8a1f', v: '#7240c4', o: '#b85c00', k: '#1e1e1e' };

// ---------------------------------------------------------------- recorte das poses
// Cada pose é o componente conectado (pelo canal alfa) que contém o ponto indicado.
const POSES = {
  welcome: ['e9', 1190, 755], pencil: ['e9', 613, 274], laptop: ['e9', 254, 274], mic: ['e9', 388, 752], headset: ['e9', 775, 755],
  medal: ['e8', 190, 270], reading: ['e8', 478, 778], magnifier: ['e8', 924, 770], wave: ['e8', 1346, 285],
  jump: ['e7', 208, 250], cheer: ['e7', 580, 278], cloud: ['e7', 1296, 294], board: ['e7', 190, 734],
};
async function cutPoses() {
  fs.mkdirSync(CACHE, { recursive: true });
  const out = {};
  const bySrc = {};
  for (const [name, [src, x, y]] of Object.entries(POSES)) (bySrc[src] ||= []).push([name, x, y]);
  for (const [src, list] of Object.entries(bySrc)) {
    const { data, info } = await sharp(path.join(SRC, `${src}.webp`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height, k = 4, w = Math.ceil(W / k), h = Math.ceil(H / k);
    const m = new Uint8Array(w * h);
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) if (data[(yy * W + xx) * 4 + 3] > 30) m[((yy / k) | 0) * w + ((xx / k) | 0)] = 1;
    const d = new Uint8Array(w * h);
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) if (m[yy * w + xx]) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = xx + dx, Y = yy + dy; if (X >= 0 && Y >= 0 && X < w && Y < h) d[Y * w + X] = 1; }
    const lab = new Int32Array(w * h); const boxes = [];
    for (let i = 0; i < w * h; i++) if (d[i] && !lab[i]) {
      const id = boxes.length + 1; lab[i] = id; const st = [i]; const b = [w, h, 0, 0, 0];
      while (st.length) { const j = st.pop(); const xx = j % w, yy = (j / w) | 0; b[0] = Math.min(b[0], xx); b[1] = Math.min(b[1], yy); b[2] = Math.max(b[2], xx); b[3] = Math.max(b[3], yy); b[4]++;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = xx + dx, Y = yy + dy; if (X < 0 || Y < 0 || X >= w || Y >= h) continue; const q = Y * w + X; if (d[q] && !lab[q]) { lab[q] = id; st.push(q); } } }
      boxes.push(b);
    }
    for (const [name, px, py] of list) {
      const cands = boxes.map((b, i) => [b, i + 1]).filter(([b]) => b[4] > 2500 && px >= b[0] * k && px <= (b[2] + 1) * k && py >= b[1] * k && py <= (b[3] + 1) * k);
      if (!cands.length) throw new Error(`Pose ${name} não encontrada em ${src}`);
      const [b, id] = cands.sort((a, c) => a[0][4] - c[0][4])[0];
      const L = b[0] * k, T = b[1] * k, R = Math.min(W, (b[2] + 1) * k), B = Math.min(H, (b[3] + 1) * k);
      const buf = Buffer.alloc((R - L) * (B - T) * 4);
      for (let yy = T; yy < B; yy++) for (let xx = L; xx < R; xx++) {
        const si = (yy * W + xx) * 4, di = ((yy - T) * (R - L) + (xx - L)) * 4; const own = lab[((yy / k) | 0) * w + ((xx / k) | 0)];
        buf[di] = data[si]; buf[di + 1] = data[si + 1]; buf[di + 2] = data[si + 2]; buf[di + 3] = (own === 0 || own === id) ? data[si + 3] : 0;
      }
      const f = path.join(CACHE, `${name}.png`);
      await sharp(buf, { raw: { width: R - L, height: B - T, channels: 4 } }).trim({ threshold: 1 }).png().toFile(f);
      out[name] = file(f);
    }
  }
  return out;
}

// ---------------------------------------------------------------- moldura (FigJam)
const ARROW = '<svg viewBox="0 0 20 20" width="22" height="22"><path d="M2 10h13M10 4l6 6-6 6" fill="none" stroke="#1e1e1e" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function fj({ title, chips = [], width = 1120, css = '', body, note }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Inter;src:url(${FONT}) format('woff2');unicode-range:U+0000-00FF,U+2000-206F,U+2190-21FF}
@font-face{font-family:Inter;src:url(${FONT_EXT}) format('woff2');unicode-range:U+0100-024F}
*{box-sizing:border-box;margin:0}
html{background:#f4f4f2}
body{width:${width}px;padding:36px 40px 40px;font-family:Inter,system-ui,sans-serif;color:#1e1e1e;background:#f4f4f2;background-image:radial-gradient(#cfcfcb 1.2px,transparent 1.3px);background-size:22px 22px}
.top{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:24px}
h1{font-size:32px;font-weight:700;letter-spacing:-.01em;line-height:1.15}
.chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
.chip{font-size:15px;font-weight:600;padding:7px 12px;border-radius:999px;background:#fff;border:1.5px solid #1e1e1e;white-space:nowrap}
.sec{background:#fff;border:2px solid #d6d6d2;border-radius:18px;padding:16px 16px 18px;box-shadow:0 2px 0 rgba(0,0,0,.04);position:relative;min-width:0}
.tag{display:inline-block;font-size:16px;font-weight:700;color:#fff;padding:6px 12px;border-radius:8px;margin-bottom:12px}
.st{border-radius:6px;padding:12px 14px 14px;font-size:19px;line-height:1.3;font-weight:500;box-shadow:0 6px 10px -6px rgba(0,0,0,.28),0 1px 0 rgba(0,0,0,.06)}
.st b{display:block;font-weight:700}
.st small{display:block;font-size:16px;font-weight:500;opacity:.78;margin-top:4px;line-height:1.3}
.stack{display:grid;gap:10px}
.st.sm{font-size:16px;padding:9px 12px 10px}
.pill{display:inline-block;font-size:17px;font-weight:700;padding:7px 13px;border-radius:999px;background:#fff;border:2px solid #1e1e1e;margin:0 6px 8px 0}
.flow{display:flex;align-items:stretch;gap:8px}
.flow>.st{flex:1}
.flow>.ar{display:flex;align-items:center}
.note{margin-top:18px}
${css}
</style></head><body>
<div class="top"><h1>${esc(title)}</h1><div class="chips">${chips.map(c => `<span class="chip">${esc(c)}</span>`).join('')}</div></div>
${body}
${note ? `<div class="note st" style="background:${STICKY.v}">${note}</div>` : ''}
</body></html>`;
}
const st = (c, html, cls = '') => `<div class="st${cls ? ' ' + cls : ''}" style="background:${STICKY[c]}">${html}</div>`;
const sec = (c, tag, inner, extra = '') => `<section class="sec"${extra}><span class="tag" style="background:${SECTION[c]}">${esc(tag)}</span>${inner}</section>`;
const two = (a, b) => `<b>${esc(a)}</b><small>${esc(b)}</small>`;

// ---------------------------------------------------------------- Editora Futura
const T = {
  pt: {
    proj: {
      title: 'Projeto Futura · visão geral', chips: ['Happy English', 'Inglês para escolas', 'Web, iOS e Android'],
      what: 'O que é', whatText: 'A plataforma digital de inglês da Editora Futura. Amplia o livro didático e conecta alunos, professores, coordenadores, famílias e a editora em uma só experiência.',
      skills: '4 habilidades', sk: [['Listening', 'compreensão auditiva'], ['Speaking', 'conversação e pronúncia'], ['Reading', 'leitura e interpretação'], ['Writing', 'escrita e produção textual']],
      journey: 'Jornada do aluno', j: [['1 · Primeiro acesso', 'código do livro, senha e dados escolares'], ['2 · Nivelamento', 'adaptativo, pelo CEFR, com a BNCC'], ['3 · Trilhas', 'por série, nas 4 habilidades'], ['4 · Atividades e desafios', 'quizzes, vídeos, IA e role-plays'], ['5 · Avaliação e evolução', 'progresso, feedback, pontos e badges']],
      who: 'Quem usa', w: [['Aluno', 'aprende e acompanha as conquistas'], ['Professor', 'libera unidades e acompanha a turma'], ['Coordenador', 'acompanha a evolução das turmas'], ['Pais e responsáveis', 'veem o desempenho dos filhos'], ['Editora Futura', 'administra usuários, conteúdo e dados']],
      before: 'Problemas de antes', b: ['Foco excessivo em Speaking', 'Pouca autonomia do professor', 'Sem acompanhamento individual', 'Pouca interação', 'Famílias sem acesso', 'Poucos momentos de avaliação', 'Dependência da internet'],
      pillars: 'Pilares do produto', p: ['Aprendizagem personalizada', 'Gamificação', 'IA em speaking e role-play', 'Autonomia docente', 'Interação social', 'Acompanhamento por aluno e turma', 'Atividades online e offline'],
      note: '<b>Mr. Brain acompanha toda a jornada</b><small>Orienta, incentiva e celebra. Quem aprende e conquista é sempre o aluno.</small>',
    },
    tools: {
      title: 'Ferramentas de UX e produto · por etapa', chips: ['Pesquisa', 'Design', 'IA', 'Dados'],
      groups: [
        ['y', 'Pesquisar e entender', ['Maze', 'Hotjar', 'Obsidian', 'Notion'], 'Testes de usabilidade, mapas de calor e notas de pesquisa ligadas entre si'],
        ['o', 'Colaborar e decidir', ['FigJam', 'Miro', 'Whimsical', 'Notion'], 'Quadros de processo, fluxos e documentação que o time inteiro consulta'],
        ['b', 'Desenhar e prototipar', ['Figma', 'Framer', 'Webflow', 'Illustrator'], 'Interfaces, design system, protótipos navegáveis e ilustração vetorial'],
        ['g', 'Entregar', ['Zeplin', 'HTML', 'CSS', 'React'], 'Especificações e conversa com a Engenharia na linguagem do código'],
        ['v', 'Prototipar com IA', ['Lovable', 'Replit', 'Claude Code', 'Figma AI', 'Midjourney'], 'Do conceito a algo testável em menos tempo'],
        ['p', 'Medir', ['Futura Analytics', 'Maze', 'Hotjar'], 'Teste A/B, adoção e usabilidade antes e depois de cada entrega'],
      ],
      note: '<b>Na Editora Futura</b><small>Notas de pesquisa no Obsidian, ilustração do Mr. Brain no Illustrator e o teste A/B no painel de experimentos da Futura Analytics.</small>',
    },
    fw: {
      title: 'Frameworks aplicados na Editora Futura', chips: [],
      head: ['Framework', 'O que é', 'Como entrou no projeto'],
      rows: [
        ['y', 'Double Diamond', 'Abrir e fechar o problema (descobrir e definir), depois abrir e fechar a solução (desenvolver e entregar).', 'Organizou o trabalho do diagnóstico da experiência ao teste A/B.'],
        ['p', 'Design Thinking', 'Empatia, definição, ideação, protótipo e teste, em ciclos e a partir de quem usa.', 'Orientou como conduzir cada etapa, com aluno, professor e editora no centro.'],
        ['b', 'Jobs to Be Done', 'O que a pessoa quer conseguir fazer, e não só quem ela é.', 'Aluno: saber o que fazer em seguida e ver a evolução. Professor: acompanhar e orientar a turma.'],
        ['g', 'Lean UX', 'Cada aposta vira uma hipótese testável, com aprendizado rápido.', 'O feedback do Mr. Brain virou um teste A/B com controle, métrica primária e critério de parada.'],
        ['v', 'CEFR + BNCC', 'CEFR: escala europeia de proficiência, de A1 a C2. BNCC: a base curricular brasileira.', 'Régua do nivelamento: o resultado aparece como ano escolar + nível CEFR, com a proposta de integração com a BNCC.'],
      ],
    },
    heur: {
      title: 'Auditoria do painel · heurísticas de Nielsen', chips: ['Criação de role-plays', 'Antes → depois'],
      head: ['Heurística', 'Antes', 'Depois'],
      rows: [
        ['#1 Visibilidade do status do sistema', 'O stepper não marcava as etapas concluídas', 'O stepper marca cada etapa concluída'],
        ['#2 Correspondência com o mundo real', '“Quem eu sou?” não deixava claro que era a persona da IA', '“Persona da IA”, com uma linha de ajuda'],
        ['#4 Consistência e padrões', 'Botões “Salvar” espalhados por seção', 'Um rodapé por etapa: Voltar, Salvar rascunho e Próxima etapa'],
        ['#5 Prevenção de erros', 'Limites de duração e tentativas começando em 0', 'Duração e tentativas com unidade (min, vezes)'],
        ['#6 Reconhecer em vez de lembrar', 'Nenhuma indicação do mínimo de 3 objetivos', 'Contador: “2 de 3 objetivos mínimos”'],
      ],
      note: '<b>Também na auditoria</b><small>Avisos informativos em amarelo que pareciam erro e o botão “Próximo” desabilitado sem explicar o motivo.</small>',
    },
    dyn: {
      title: 'Dinâmicas de engajamento da plataforma', chips: ['Gamificação', 'Prática social', 'Sem pressão'],
      groups: [
        ['b', 'Progressão', ['XP, níveis e patentes', 'Desbloqueios', 'Trilha com 8 unidades e 12 atividades por unidade']],
        ['y', 'Conquista', ['Badges e conquistas na home do aluno', 'Sequências (streaks)', 'Ranking da turma']],
        ['o', 'Desafio', ['4 desafios Leveling Up por unidade', 'Checkpoint a cada 2 unidades', 'Mr. Brain on the cloud: vocabulário em 60 segundos']],
        ['g', 'Prática social', ['Speaking Club', 'Fórum e eventos', 'Atividades síncronas', 'Nuvem de palavras da turma']],
        ['p', 'Sem pressão', ['Check your Proficiency não vale nota', 'Nivelamento como ponto de partida, não como prova', 'Gamificação sem competição constante']],
      ],
      note: '<b>Quem conquista é o aluno</b><small>O Mr. Brain entrega a medalha e comemora junto, mas nunca ocupa o lugar do aluno no ranking.</small>',
    },
  },
  en: {
    proj: {
      title: 'Projeto Futura · overview', chips: ['Happy English', 'English for schools', 'Web, iOS and Android'],
      what: 'What it is', whatText: 'Editora Futura’s digital English platform. It extends the textbook and connects students, teachers, coordinators, families and the publisher in one experience.',
      skills: '4 skills', sk: [['Listening', 'listening comprehension'], ['Speaking', 'conversation and pronunciation'], ['Reading', 'reading and interpretation'], ['Writing', 'writing and text production']],
      journey: 'Student journey', j: [['1 · First access', 'book code, password and school details'], ['2 · Placement', 'adaptive, by CEFR, with the BNCC'], ['3 · Learning paths', 'by school year, across the 4 skills'], ['4 · Activities and challenges', 'quizzes, videos, AI and role-plays'], ['5 · Assessment and progress', 'progress, feedback, points and badges']],
      who: 'Who uses it', w: [['Student', 'learns and follows their achievements'], ['Teacher', 'unlocks units and follows the class'], ['Coordinator', 'follows how classes progress'], ['Parents and guardians', 'see their children’s performance'], ['Editora Futura', 'manages users, content and data']],
      before: 'Problems before', b: ['Too much focus on Speaking', 'Little teacher autonomy', 'No individual follow-up', 'Little interaction', 'No access for families', 'Few assessment moments', 'Dependence on the internet'],
      pillars: 'Product pillars', p: ['Personalized learning', 'Gamification', 'AI for speaking and role-play', 'Teacher autonomy', 'Social interaction', 'Follow-up by student and class', 'Online and offline activities'],
      note: '<b>Mr. Brain is there for the whole journey</b><small>He guides, encourages and celebrates. The student is always the one who learns and achieves.</small>',
    },
    tools: {
      title: 'UX and product tools · by stage', chips: ['Research', 'Design', 'AI', 'Data'],
      groups: [
        ['y', 'Research and understand', ['Maze', 'Hotjar', 'Obsidian', 'Notion'], 'Usability tests, heatmaps and linked research notes'],
        ['o', 'Collaborate and decide', ['FigJam', 'Miro', 'Whimsical', 'Notion'], 'Process boards, flows and documentation the whole team uses'],
        ['b', 'Design and prototype', ['Figma', 'Framer', 'Webflow', 'Illustrator'], 'Interfaces, design system, clickable prototypes and vector illustration'],
        ['g', 'Deliver', ['Zeplin', 'HTML', 'CSS', 'React'], 'Specs and conversations with Engineering in the language of code'],
        ['v', 'Prototype with AI', ['Lovable', 'Replit', 'Claude Code', 'Figma AI', 'Midjourney'], 'From concept to something testable, faster'],
        ['p', 'Measure', ['Futura Analytics', 'Maze', 'Hotjar'], 'A/B testing, adoption and usability before and after each release'],
      ],
      note: '<b>At Editora Futura</b><small>Research notes in Obsidian, Mr. Brain illustrated in Illustrator and the A/B test in the Futura Analytics experiment panel.</small>',
    },
    fw: {
      title: 'Frameworks applied at Editora Futura', chips: [],
      head: ['Framework', 'What it is', 'How it shaped the project'],
      rows: [
        ['y', 'Double Diamond', 'Open and close the problem (discover and define), then open and close the solution (develop and deliver).', 'Organized the work from the experience diagnosis to the A/B test.'],
        ['p', 'Design Thinking', 'Empathy, definition, ideation, prototype and test, in cycles, starting from the people who use it.', 'Guided how each stage was run, with students, teachers and the publisher at the center.'],
        ['b', 'Jobs to Be Done', 'What a person wants to get done, not just who they are.', 'Student: know what to do next and see their progress. Teacher: follow and guide the class.'],
        ['g', 'Lean UX', 'Every bet becomes a testable hypothesis, with fast learning.', 'Mr. Brain’s feedback became an A/B test with a control group, primary metric and stopping criterion.'],
        ['v', 'CEFR + BNCC', 'CEFR: the European proficiency scale, from A1 to C2. BNCC: Brazil’s national curriculum base.', 'The yardstick for placement: the result shows school year + CEFR level, with a proposed BNCC integration.'],
      ],
    },
    heur: {
      title: 'Admin panel audit · Nielsen’s heuristics', chips: ['Role-play authoring', 'Before → after'],
      head: ['Heuristic', 'Before', 'After'],
      rows: [
        ['#1 Visibility of system status', 'The stepper didn’t mark completed steps', 'The stepper marks every completed step'],
        ['#2 Match with the real world', '“Who am I?” didn’t make clear it was the AI persona', '“AI persona”, with a line of help text'],
        ['#4 Consistency and standards', '“Save” buttons scattered across sections', 'One footer per step: Back, Save draft and Next step'],
        ['#5 Error prevention', 'Duration and attempt limits starting at 0', 'Duration and attempts with units (min, times)'],
        ['#6 Recognition rather than recall', 'No sign of the minimum of 3 objectives', 'A counter: “2 of 3 minimum objectives”'],
      ],
      note: '<b>Also in the audit</b><small>Informational notices in yellow that looked like errors, and a disabled “Next” button with no explanation.</small>',
    },
    dyn: {
      title: 'Engagement dynamics on the platform', chips: ['Gamification', 'Social practice', 'No pressure'],
      groups: [
        ['b', 'Progression', ['XP, levels and ranks', 'Unlocks', 'A path of 8 units with 12 activities each']],
        ['y', 'Achievement', ['Badges and achievements on the student home', 'Streaks', 'Class leaderboard']],
        ['o', 'Challenge', ['4 Leveling Up challenges per unit', 'A checkpoint every 2 units', 'Mr. Brain on the cloud: vocabulary in 60 seconds']],
        ['g', 'Social practice', ['Speaking Club', 'Forum and events', 'Live activities', 'A class word cloud']],
        ['p', 'No pressure', ['Check your Proficiency isn’t graded', 'Placement as a starting point, not a test', 'Gamification without constant competition']],
      ],
      note: '<b>The student is the one who achieves</b><small>Mr. Brain hands over the medal and celebrates, but never takes the student’s place on the leaderboard.</small>',
    },
  },
};

function efProjeto(t) {
  const css = `.ra{display:grid;grid-template-columns:1fr 1.25fr;gap:18px;margin-bottom:18px}
.sk{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.rc{display:grid;grid-template-columns:1fr 1fr 34px 1fr;gap:12px;align-items:stretch;margin-top:18px}
.rc>.ar{display:flex;align-items:center;justify-content:center}`;
  const body = `<div class="ra">${sec('v', t.what, st('v', esc(t.whatText)))}${sec('b', t.skills, `<div class="sk">${t.sk.map(([a, b]) => st('b', two(a, b), 'sm')).join('')}</div>`)}</div>
${sec('y', t.journey, `<div class="flow">${t.j.map(([a, b], i) => (i ? `<span class="ar">${ARROW}</span>` : '') + st('y', two(a, b), 'sm')).join('')}</div>`)}
<div class="rc">${sec('o', t.who, `<div class="stack">${t.w.map(([a, b]) => st('o', two(a, b), 'sm')).join('')}</div>`)}${sec('p', t.before, `<div class="stack">${t.b.map(x => st('p', esc(x), 'sm')).join('')}</div>`)}<span class="ar">${ARROW}</span>${sec('g', t.pillars, `<div class="stack">${t.p.map(x => st('g', esc(x), 'sm')).join('')}</div>`)}</div>`;
  return fj({ title: t.title, chips: t.chips, css, body, note: t.note });
}
function efTools(t) {
  const css = `.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.g3 .st{margin-top:6px}`;
  const body = `<div class="g3">${t.groups.map(([c, name, tools, why]) => sec(c, name, `<div>${tools.map(x => `<span class="pill">${esc(x)}</span>`).join('')}</div>${st(c, esc(why), 'sm')}`)).join('')}</div>`;
  return fj({ title: t.title, chips: t.chips, css, body, note: t.note });
}
function efFrameworks(t) {
  const css = `.tb{display:grid;grid-template-columns:210px 1fr 1fr;gap:12px 14px;align-items:stretch}
.th{font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#5b5b57;padding:0 2px}
.nm{display:flex;align-items:center;font-size:19px;font-weight:700;color:#fff;border-radius:12px;padding:12px 14px}`;
  const body = `<div class="tb">${t.head.map(h => `<div class="th">${esc(h)}</div>`).join('')}${t.rows.map(([c, n, what, how]) => `<div class="nm" style="background:${SECTION[c]}">${esc(n)}</div>${st('w', esc(what), 'sm')}${st(c, esc(how), 'sm')}`).join('')}</div>`;
  return fj({ title: t.title, chips: t.chips, css, body });
}
function efHeur(t) {
  const css = `.tb{display:grid;grid-template-columns:250px 1fr 30px 1fr;gap:12px 12px;align-items:stretch}
.th{font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#5b5b57;padding:0 2px}
.nm{display:flex;align-items:center;font-size:17px;font-weight:700;color:#fff;background:#1e1e1e;border-radius:12px;padding:12px 14px;line-height:1.25}
.ar{display:flex;align-items:center;justify-content:center}`;
  const body = `<div class="tb"><div class="th">${esc(t.head[0])}</div><div class="th">${esc(t.head[1])}</div><div></div><div class="th">${esc(t.head[2])}</div>${t.rows.map(([h, a, b]) => `<div class="nm">${esc(h)}</div>${st('p', esc(a), 'sm')}<span class="ar">${ARROW}</span>${st('g', esc(b), 'sm')}`).join('')}</div>`;
  return fj({ title: t.title, chips: t.chips, css, body, note: t.note });
}
function efDyn(t) {
  const css = `.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.g2{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:18px}`;
  const card = ([c, name, items]) => sec(c, name, `<div class="stack">${items.map(x => st(c, esc(x), 'sm')).join('')}</div>`);
  const body = `<div class="g3">${t.groups.slice(0, 3).map(card).join('')}</div><div class="g2">${t.groups.slice(3).map(card).join('')}</div>`;
  return fj({ title: t.title, chips: t.chips, css, body, note: t.note });
}

// ---------------------------------------------------------------- Editora Futura: pesquisa, UX writing, IA conversacional e gamificação
const E = {
  pt: {
    research: {
      title: 'UX Research · Projeto Futura', chips: ['Diagnóstico', 'Auditoria', 'Benchmark'],
      cols: [
        ['y', 'Métodos', ['Diagnóstico da experiência digital anterior', 'Auditoria do fluxo de criação de role-plays no painel', 'Benchmark de role-play com IA: Duolingo Max, Speak e Babbel Speak', 'Jobs to Be Done por perfil', 'Teste A/B com grupo de controle']],
        ['p', 'Achados', ['Experiência concentrada em Speaking', 'Pouca autonomia do professor', 'Progresso pouco visível', 'Pouca interação', 'Famílias distantes', 'Avaliação formativa restrita', 'Dependência da internet']],
        ['b', 'Jobs', ['Aluno: saber o que fazer em seguida e ver a evolução', 'Professor: acompanhar e orientar a turma', 'Editora: dados para decisões pedagógicas']],
        ['g', 'Decisões', ['Jornada guiada, do livro às trilhas', 'Um padrão para as 4 habilidades', 'Atividades online e offline', 'Painel com um rodapé por etapa', 'Feedback do Mr. Brain testado em A/B']],
      ],
    },
    writing: {
      title: 'UX Writing · a voz do Mr. Brain', chips: ['Persona', 'Tom', 'Copy por módulo'],
      persona: 'Persona base', personaText: 'Inteligente, amigável e motivadora', tone: 'Tom', toneText: 'Positivo, claro e sem julgamento',
      never: 'Nunca', neverItems: ['Expor o erro de forma negativa', 'Comparar alunos'],
      modules: 'Copy por módulo', quotes: [['Speaking', 'Aqui é um espaço seguro. Pode falar sem medo.'], ['Nova tentativa', 'Quase lá! Que tal tentar de novo?'], ['Check your Proficiency', 'Não vale nota. Vale crescimento.'], ['Professor', 'Notei que alguns alunos estão com dificuldade em Listening. Quer conferir os detalhes?'], ['Versão infantil', 'Vamos brincar de inglês?']],
      micro: 'Microcopy do role-play', microItems: ['“Fale ou escreva em inglês”', '“Travou? Use a Dica”', '“Não tem resposta errada: o feedback vem no final”', '“Está demorando mais que o normal” + Tentar de novo'],
    },
    ia: {
      title: 'IA conversacional · role-play de Speaking', chips: ['Painel', 'Conversa', 'Feedback'],
      steps: [
        ['v', '1 · Criação no painel', ['4 etapas: introdução, instruções do aluno, configurações da IA e objetivos', '“Persona da IA”, com uma linha de ajuda', 'Prévia da simulação fixa na lateral']],
        ['y', '2 · Antes da conversa', ['Cenário, papel do aluno e personagem', 'Até 3 missões', 'Vocabulário com áudio', 'Teste de microfone opcional']],
        ['b', '3 · Durante', ['Falar, digitar ou alternar', 'Ouvir de novo, 0,75x, traduzir e dica', 'Toda espera tem indicador', 'Todo erro tem uma saída']],
        ['g', '4 · Depois', ['Comemoração curta: XP, missões e tempo', 'O que foi bem', 'Até 3 correções, com explicação de uma linha', '“Praticar esta frase”']],
        ['p', '5 · Qualidade', ['Fine-tuning: validar, rejeitar ou editar turnos da IA', 'O aluno pode reportar uma mensagem da IA']],
      ],
      note: '<b>Benchmark</b><small>Duolingo Max, Speak e Babbel Speak serviram de referência para cenários, tarefas, dicas e o feedback final.</small>',
    },
    game: {
      title: 'Gamificação · badges, vidas, goals, ranking e patentes', chips: [],
      cards: [
        ['badge', 'y', 'Badges', 'Reconhecem as conquistas da jornada', 'Ficam visíveis na home do aluno'],
        ['heart', 'p', 'Vidas', 'O aluno perde uma vida a cada erro', 'As vidas recarregam com o tempo'],
        ['target', 'b', 'Goals', 'Metas diárias de prática', 'Um objetivo claro para cada dia'],
        ['podium', 'o', 'Ranking da turma', 'O aluno acompanha a posição na própria turma', 'O Mr. Brain parabeniza, mas não ocupa a posição'],
        ['rank', 'v', 'Patentes', 'O aluno sobe de patente acumulando XP', 'O XP vem de atividades, desafios e role-plays'],
      ],
      note: '<b>Quem conquista é o aluno</b><small>O Mr. Brain entrega a medalha e comemora junto, mas o protagonismo é sempre do estudante.</small>',
    },
  },
  en: {
    research: {
      title: 'UX Research · Projeto Futura', chips: ['Diagnosis', 'Audit', 'Benchmark'],
      cols: [
        ['y', 'Methods', ['Diagnosis of the previous digital experience', 'Audit of the role-play authoring flow in the admin panel', 'AI role-play benchmark: Duolingo Max, Speak and Babbel Speak', 'Jobs to Be Done per user type', 'A/B test with a control group']],
        ['p', 'Findings', ['Experience focused on Speaking', 'Little teacher autonomy', 'Progress hard to see', 'Little interaction', 'Families kept at a distance', 'Limited formative assessment', 'Dependence on the internet']],
        ['b', 'Jobs', ['Student: know what to do next and see their progress', 'Teacher: follow and guide the class', 'Publisher: data for teaching decisions']],
        ['g', 'Decisions', ['A guided journey, from book to learning paths', 'One pattern for the 4 skills', 'Online and offline activities', 'One footer per step in the panel', 'Mr. Brain’s feedback tested in an A/B test']],
      ],
    },
    writing: {
      title: 'UX Writing · Mr. Brain’s voice', chips: ['Persona', 'Tone', 'Copy per module'],
      persona: 'Base persona', personaText: 'Smart, friendly and motivating', tone: 'Tone', toneText: 'Positive, clear and non-judgmental',
      never: 'Never', neverItems: ['Expose mistakes negatively', 'Compare students'],
      modules: 'Copy per module', quotes: [['Speaking', 'This is a safe space. Speak without fear.'], ['Retry', 'Almost there! How about trying again?'], ['Check your Proficiency', 'No grade. Just growth.'], ['Teacher', 'I noticed some students are struggling with Listening. Want to see the details?'], ['Kids version', 'Shall we play English?']],
      micro: 'Role-play microcopy', microItems: ['“Speak or type in English”', '“Stuck? Use a Hint”', '“There are no wrong answers: feedback comes at the end”', '“This is taking longer than usual” + Try again'],
    },
    ia: {
      title: 'Conversational AI · Speaking role-play', chips: ['Panel', 'Conversation', 'Feedback'],
      steps: [
        ['v', '1 · Authoring in the panel', ['4 steps: introduction, student instructions, AI settings and objectives', '“AI persona”, with a line of help text', 'A pinned simulation preview']],
        ['y', '2 · Before the conversation', ['Scenario, the student’s role and the character', 'Up to 3 missions', 'Vocabulary with audio', 'Optional microphone test']],
        ['b', '3 · During', ['Speak, type or switch', 'Replay, 0.75x, translate and hint', 'Every wait has an indicator', 'Every error has a way out']],
        ['g', '4 · After', ['A short celebration: XP, missions and time', 'What went well', 'Up to 3 corrections, each explained in one line', '“Practice this sentence”']],
        ['p', '5 · Quality', ['Fine-tuning: validate, reject or edit AI turns', 'Students can report an AI message']],
      ],
      note: '<b>Benchmark</b><small>Duolingo Max, Speak and Babbel Speak were the references for scenarios, tasks, hints and the final feedback.</small>',
    },
    game: {
      title: 'Gamification · badges, lives, goals, leaderboard and ranks', chips: [],
      cards: [
        ['badge', 'y', 'Badges', 'Recognize achievements along the journey', 'Shown on the student home'],
        ['heart', 'p', 'Lives', 'The student loses a life with each mistake', 'Lives refill over time'],
        ['target', 'b', 'Goals', 'Daily practice goals', 'A clear objective for each day'],
        ['podium', 'o', 'Class leaderboard', 'The student follows their position in their own class', 'Mr. Brain congratulates, but never takes the spot'],
        ['rank', 'v', 'Ranks', 'The student moves up in rank by earning XP', 'XP comes from activities, challenges and role-plays'],
      ],
      note: '<b>The student is the one who achieves</b><small>Mr. Brain hands over the medal and celebrates, but the student is always the hero.</small>',
    },
  },
};
function efResearch(t) {
  const css = `.fl{display:grid;grid-template-columns:1fr 26px 1fr 26px 1fr 26px 1fr;gap:10px;align-items:stretch}.fl>.ar{display:flex;align-items:center;justify-content:center}`;
  const body = `<div class="fl">${t.cols.map(([c, name, items], i) => (i ? `<span class="ar">${ARROW}</span>` : '') + sec(c, name, `<div class="stack">${items.map(x => st(c, esc(x), 'sm')).join('')}</div>`)).join('')}</div>`;
  return fj({ title: t.title, chips: t.chips, css, body });
}
function efWriting(t, P) {
  const css = `.wa{display:grid;grid-template-columns:240px 1fr 1fr 1fr;gap:18px;margin-bottom:18px;align-items:stretch}
.who{display:flex;align-items:center;justify-content:center;background:#faf7ff;border-radius:18px;border:2px solid #d6d6d2}
.who img{max-height:220px;max-width:92%}
.wb{display:grid;grid-template-columns:1.6fr 1fr;gap:18px}
.q{display:grid;gap:12px}
.bub{position:relative;background:#fff;border:2px solid #1e1e1e;border-radius:16px;padding:10px 14px 12px;font-size:17px;line-height:1.35}
.bub b{display:block;font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:#7240c4;margin-bottom:3px}
.bub:after{content:"";position:absolute;left:22px;bottom:-9px;width:14px;height:14px;background:#fff;border-right:2px solid #1e1e1e;border-bottom:2px solid #1e1e1e;transform:rotate(45deg)}`;
  const body = `<div class="wa"><div class="who"><img src="${P.welcome}" alt=""></div>${sec('v', t.persona, st('v', esc(t.personaText)))}${sec('b', t.tone, st('b', esc(t.toneText)))}${sec('p', t.never, `<div class="stack">${t.neverItems.map(x => st('p', esc(x), 'sm')).join('')}</div>`)}</div>
<div class="wb">${sec('y', t.modules, `<div class="q">${t.quotes.map(([m, q]) => `<div class="bub"><b>${esc(m)}</b>“${esc(q)}”</div>`).join('')}</div>`)}${sec('g', t.micro, `<div class="stack">${t.microItems.map(x => st('g', esc(x), 'sm')).join('')}</div>`)}</div>`;
  return fj({ title: t.title, chips: t.chips, css, body });
}
function efIa(t) {
  const css = `.g3{display:grid;grid-template-columns:1fr 26px 1fr 26px 1fr;gap:10px;align-items:stretch}.g3>.ar{display:flex;align-items:center;justify-content:center}
.g2{display:grid;grid-template-columns:1fr 26px 1fr;gap:10px;margin-top:18px;align-items:stretch}.g2>.ar{display:flex;align-items:center;justify-content:center}`;
  const card = ([c, name, items]) => sec(c, name, `<div class="stack">${items.map(x => st(c, esc(x), 'sm')).join('')}</div>`);
  const row = list => list.map((x, i) => (i ? `<span class="ar">${ARROW}</span>` : '') + card(x)).join('');
  const body = `<div class="g3">${row(t.steps.slice(0, 3))}</div><div class="g2">${row(t.steps.slice(3))}</div>`;
  return fj({ title: t.title, chips: t.chips, css, body, note: t.note });
}
const GLYPH = {
  badge: '<path d="M24 4l16 6v12c0 10-7 17-16 22C15 39 8 32 8 22V10z" fill="#ffd34d" stroke="#1e1e1e" stroke-width="3"/><path d="M17 23l5 5 10-11" fill="none" stroke="#1e1e1e" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>',
  heart: '<path d="M24 41S6 30 6 17a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 13-18 24-18 24z" fill="#ff5c8a" stroke="#1e1e1e" stroke-width="3"/>',
  target: '<circle cx="24" cy="24" r="18" fill="#fff" stroke="#1e1e1e" stroke-width="3"/><circle cx="24" cy="24" r="11" fill="#7cc4ff" stroke="#1e1e1e" stroke-width="3"/><circle cx="24" cy="24" r="4" fill="#1e1e1e"/>',
  podium: '<rect x="17" y="12" width="14" height="30" fill="#ffb347" stroke="#1e1e1e" stroke-width="3"/><rect x="4" y="22" width="13" height="20" fill="#fff" stroke="#1e1e1e" stroke-width="3"/><rect x="31" y="28" width="13" height="14" fill="#fff" stroke="#1e1e1e" stroke-width="3"/><text x="24" y="30" text-anchor="middle" font-size="12" font-weight="700" font-family="Inter">1</text>',
  rank: '<path d="M10 30l14-9 14 9" fill="none" stroke="#1e1e1e" stroke-width="4" stroke-linejoin="round"/><path d="M10 40l14-9 14 9" fill="none" stroke="#1e1e1e" stroke-width="4" stroke-linejoin="round"/><path d="M24 4l3.5 7 7.5 1-5.5 5 1.5 7.5L24 21l-7 3.5 1.5-7.5-5.5-5 7.5-1z" fill="#b48cff" stroke="#1e1e1e" stroke-width="2.5" stroke-linejoin="round"/>',
};
function efGame(t) {
  const css = `.g5{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
.ic{display:flex;align-items:center;justify-content:center;height:110px;background:#faf7ff;border-radius:12px;margin-bottom:12px}
.g5 .tag{font-size:15px}`;
  const body = `<div class="g5">${t.cards.map(([g, c, name, a, b]) => sec(c, name, `<div class="ic"><svg viewBox="0 0 48 48" width="74" height="74">${GLYPH[g]}</svg></div><div class="stack">${st(c, esc(a), 'sm')}${st('w', esc(b), 'sm')}</div>`)).join('')}</div>`;
  return fj({ title: t.title, chips: t.chips, css, body, note: t.note });
}

// ---------------------------------------------------------------- Mr. Brain
const M = {
  pt: {
    usos: {
      title: 'Mr. Brain · 4 usos na experiência', chips: ['Guia', 'Mentor', 'Incentivador'],
      cards: [['welcome', 'y', '1 · Boas-vindas e orientação', 'Recebe o aluno, apresenta as etapas e explica o que ele precisa fazer.'], ['magnifier', 'b', '2 · Desafios e descobertas', 'Introduz missões, contextualiza as atividades e incentiva a continuar.'], ['medal', 'g', '3 · Conquistas e reconhecimento', 'Celebra o progresso, entrega medalhas e reconhece o esforço do aluno.'], ['cheer', 'p', '4 · Incentivo e feedback', 'Encoraja novas tentativas com mensagens acolhedoras.']],
      note: '<b>Quem conquista é o aluno</b><small>O Mr. Brain é mentor, guia e incentivador, não o protagonista das conquistas.</small>',
    },
    proc: {
      title: 'Mr. Brain · processo de criação', chips: ['Esboço', 'Illustrator', 'Animação com IA'],
      steps: [
        ['v', '1 · Referências', null, ['Pitch: o papel do personagem em 5 momentos da jornada', 'Dossiê de personagens: personalidade e visual por faixa escolar (outra pessoa do time)']],
        ['y', '2 · Esboços', 'sketch', ['Estudos de ícone: enquadramentos, expressões, silhueta e versões com a marca']],
        ['b', '3 · Vetor no Illustrator', 'vector', ['Forma, cor e detalhes em vetor: o mesmo desenho escala do ícone à página inteira']],
        ['g', '4 · Poses', 'poses', ['Celebração, leitura, fala, escuta, descanso e apoio com objetos']],
        ['o', '5 · Sequências', 'seq', ['Storyboard em três quadros: dormindo, acordando e animado']],
        ['p', '6 · Animação com IA', null, ['14 estados com prompt padronizado', 'Clipes de 2 a 5 segundos que funcionam sem som', 'Produção das animações: time de vídeo']],
      ],
    },
    fund: {
      title: 'Mr. Brain · fundamentos do personagem', chips: ['Forma', 'Expressão', 'Regras'],
      form: 'Forma', formItems: ['Cúpula com o cérebro à mostra', 'Óculos redondos', 'Fones e antenas', 'Corpo branco com detalhes roxos'],
      sil: 'Silhueta', silText: 'Reconhecível só pela forma',
      color: 'Cor', colors: [['#9048d8', 'Roxo'], ['#a830f0', 'Violeta'], ['#f078f0', 'Rosa'], ['#c0a8f0', 'Lavanda'], ['#f0f0ff', 'Branco'], ['#483060', 'Contorno']], colorNote: 'Amostras da própria ilustração',
      emo: 'Cinco emoções base', emos: [['jump', 'Alegria'], ['medal', 'Orgulho'], ['magnifier', 'Curiosidade'], ['welcome', 'Apoio'], ['cloud', 'Calma']],
      rules: 'Regras de comportamento', ruleItems: ['Nunca reprova nem expõe o erro', 'Não apressa nem usa ironia', 'Não corrige no meio da conversa', 'Gestos legíveis mesmo sem áudio', 'Quem conquista é o aluno'],
    },
    ai: {
      menu: ['Arquivo', 'Editar', 'Objeto', 'Tipo', 'Selecionar', 'Efeito', 'Exibir', 'Janela', 'Ajuda'],
      tab: 'mr-brain_poses.ai @ 50% (RGB/Visualização)', boards: ['01 Estudos', '02 Boas-vindas', '03 Conquista', '04 Descoberta', '05 Incentivo'],
      props: 'Propriedades', transform: 'Transformar', appearance: 'Aparência', fill: 'Preenchimento', stroke: 'Traçado', opacity: 'Opacidade',
      swatches: 'Amostras', layers: 'Camadas', layerList: ['Boas-vindas', 'Cúpula e cérebro', 'Óculos', 'Fones e antenas', 'Corpo', 'Balão de fala', 'Estudos (modelo)'],
      status: ['50%', 'Prancheta 2 de 5', 'Seleção'],
    },
  },
  en: {
    usos: {
      title: 'Mr. Brain · 4 uses in the experience', chips: ['Guide', 'Mentor', 'Cheerleader'],
      cards: [['welcome', 'y', '1 · Welcome and guidance', 'Greets the student, presents the steps and explains what to do.'], ['magnifier', 'b', '2 · Challenges and discovery', 'Introduces missions, gives activities context and encourages the student to keep going.'], ['medal', 'g', '3 · Achievement and recognition', 'Celebrates progress, hands out medals and recognizes the student’s effort.'], ['cheer', 'p', '4 · Encouragement and feedback', 'Encourages another try with warm, supportive messages.']],
      note: '<b>The student is the one who achieves</b><small>Mr. Brain is a mentor, guide and cheerleader, not the hero of the achievements.</small>',
    },
    proc: {
      title: 'Mr. Brain · creation process', chips: ['Sketch', 'Illustrator', 'AI animation'],
      steps: [
        ['v', '1 · References', null, ['Pitch: the character’s role in 5 moments of the journey', 'Character dossier: personality and look by school stage (another team member)']],
        ['y', '2 · Sketches', 'sketch', ['Icon studies: framings, expressions, a silhouette and branded versions']],
        ['b', '3 · Vector in Illustrator', 'vector', ['Shape, color and detail in vector: the same drawing scales from icon to full page']],
        ['g', '4 · Poses', 'poses', ['Celebrating, reading, speaking, listening, resting and working with objects']],
        ['o', '5 · Sequences', 'seq', ['A three-frame storyboard: asleep, waking up and excited']],
        ['p', '6 · AI animation', null, ['14 states with a standard prompt', '2–5 second clips that work without sound', 'Animation production: the video team']],
      ],
    },
    fund: {
      title: 'Mr. Brain · character fundamentals', chips: ['Shape', 'Expression', 'Rules'],
      form: 'Shape', formItems: ['A dome with the brain on show', 'Round glasses', 'Headphones and antennas', 'White body with purple details'],
      sil: 'Silhouette', silText: 'Recognizable by shape alone',
      color: 'Color', colors: [['#9048d8', 'Purple'], ['#a830f0', 'Violet'], ['#f078f0', 'Pink'], ['#c0a8f0', 'Lavender'], ['#f0f0ff', 'White'], ['#483060', 'Outline']], colorNote: 'Sampled from the illustration itself',
      emo: 'Five base emotions', emos: [['jump', 'Joy'], ['medal', 'Pride'], ['magnifier', 'Curiosity'], ['welcome', 'Support'], ['cloud', 'Calm']],
      rules: 'Behavior rules', ruleItems: ['Never fails the student or exposes mistakes', 'Never rushes or uses irony', 'Never corrects mid-conversation', 'Gestures that read even without audio', 'The student is the one who achieves'],
    },
    ai: {
      menu: ['File', 'Edit', 'Object', 'Type', 'Select', 'Effect', 'View', 'Window', 'Help'],
      tab: 'mr-brain_poses.ai @ 50% (RGB/Preview)', boards: ['01 Studies', '02 Welcome', '03 Achievement', '04 Discovery', '05 Encouragement'],
      props: 'Properties', transform: 'Transform', appearance: 'Appearance', fill: 'Fill', stroke: 'Stroke', opacity: 'Opacity',
      swatches: 'Swatches', layers: 'Layers', layerList: ['Welcome', 'Dome and brain', 'Glasses', 'Headphones and antennas', 'Body', 'Speech bubble', 'Studies (template)'],
      status: ['50%', 'Artboard 2 of 5', 'Selection'],
    },
  },
};

function mbUsos(t, P) {
  const css = `.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.pic{height:230px;display:flex;align-items:center;justify-content:center;background:#faf7ff;border-radius:12px;margin-bottom:12px}
.pic img{max-height:210px;max-width:90%}`;
  const body = `<div class="g4">${t.cards.map(([pose, c, name, txt]) => sec(c, name, `<div class="pic"><img src="${P[pose]}" alt=""></div>${st(c, esc(txt), 'sm')}`)).join('')}</div>`;
  return fj({ title: t.title, chips: t.chips, css, body, note: t.note });
}
function mbProc(t, P, sketch, seq) {
  const css = `.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.g3+.g3{margin-top:22px}
.pic{height:220px;display:flex;align-items:center;justify-content:center;gap:6px;background:#faf7ff;border-radius:12px;margin-bottom:12px;overflow:hidden}
.tall .pic{height:300px}
.pic img{max-height:206px;max-width:96%}
.pic.sk img{border-radius:6px}
.tall .pic.sk img{max-height:290px}
.pic.vec{background:#fff;background-image:linear-gradient(45deg,#eee 25%,transparent 25%),linear-gradient(-45deg,#eee 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eee 75%),linear-gradient(-45deg,transparent 75%,#eee 75%);background-size:16px 16px;background-position:0 0,0 8px,8px -8px,-8px 0}
.vecbox{position:relative;display:inline-block;padding:6px}
.vecbox:before{content:"";position:absolute;inset:0;border:1.5px solid #1473e6}
.vecbox i{position:absolute;width:8px;height:8px;background:#fff;border:1.5px solid #1473e6}
.pic.ps{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:8px}
.pic.ps img{height:136px;max-height:none;max-width:100%;object-fit:contain;justify-self:center}
.stack .st{margin:0}`;
  const pic = kind => {
    if (kind === 'sketch') return `<div class="pic sk"><img src="${sketch}" alt=""></div>`;
    if (kind === 'seq') return `<div class="pic sk"><img src="${seq}" alt=""></div>`;
    if (kind === 'vector') return `<div class="pic vec">${selBox(`<img src="${P.welcome}" alt="" style="max-height:180px;display:block">`)}</div>`;
    if (kind === 'poses') return `<div class="pic ps">${['jump', 'reading', 'mic', 'cloud'].map(k => `<img src="${P[k]}" alt="">`).join('')}</div>`;
    return '';
  };
  const card = ([c, name, kind, items]) => sec(c, name, `${pic(kind)}<div class="stack">${items.map(x => st(c, esc(x), 'sm')).join('')}</div>`);
  const body = `<div class="g3">${t.steps.slice(0, 3).map(card).join('')}</div><div class="g3 tall">${t.steps.slice(3).map(card).join('')}</div>`;
  return fj({ title: t.title, chips: t.chips, css, body });
}
// caixa de seleção do Illustrator (contorno azul com 8 alças) em volta de um elemento
const selBox = inner => `<span class="vecbox">${inner}${[[0, 0], [50, 0], [100, 0], [0, 50], [100, 50], [0, 100], [50, 100], [100, 100]].map(([x, y]) => `<i style="left:calc(${x}% - 4px);top:calc(${y}% - 4px)"></i>`).join('')}</span>`;
function mbFund(t, P) {
  const css = `.ga{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:18px;margin-bottom:18px}
.gb{display:grid;grid-template-columns:1.9fr 1fr;gap:18px}
.form{display:grid;grid-template-columns:190px 1fr;gap:12px;align-items:center}
.form img{max-width:100%;max-height:250px;justify-self:center}
.sil{height:250px;display:flex;align-items:center;justify-content:center;background:#faf7ff;border-radius:12px;margin-bottom:10px}
.sil img{max-height:230px;filter:brightness(0)}
.sw{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sw div{display:flex;align-items:center;gap:10px;font-size:16px;font-weight:600}
.sw i{display:block;width:44px;height:44px;border-radius:10px;border:2px solid #1e1e1e}
.cn{font-size:14px;color:#5b5b57;margin-top:10px}
.emo{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.emo figure{margin:0;background:#faf7ff;border-radius:12px;padding:10px 6px 8px;text-align:center}
.emo img{height:150px;max-width:100%;object-fit:contain}
.emo figcaption{font-size:16px;font-weight:700;margin-top:6px}`;
  const body = `<div class="ga">${sec('v', t.form, `<div class="form"><img src="${P.welcome}" alt=""><div class="stack">${t.formItems.map(x => st('v', esc(x), 'sm')).join('')}</div></div>`)}${sec('k', t.sil, `<div class="sil"><img src="${P.cheer}" alt=""></div>${st('w', esc(t.silText), 'sm')}`)}${sec('b', t.color, `<div class="sw">${t.colors.map(([h, n]) => `<div><i style="background:${h}"></i>${esc(n)}</div>`).join('')}</div><p class="cn">${esc(t.colorNote)}</p>`)}</div>
<div class="gb">${sec('y', t.emo, `<div class="emo">${t.emos.map(([k, n]) => `<figure><img src="${P[k]}" alt=""><figcaption>${esc(n)}</figcaption></figure>`).join('')}</div>`)}${sec('p', t.rules, `<div class="stack">${t.ruleItems.map(x => st('p', esc(x), 'sm')).join('')}</div>`)}</div>`;
  return fj({ title: t.title, chips: t.chips, css, body });
}

// Montagem de uma tela do Illustrator (interface genérica, sem marcas), com as poses em pranchetas.
function mbIllustrator(t, P, sketch) {
  const icon = d => `<svg viewBox="0 0 24 24" width="22" height="22"><path d="${d}" fill="none" stroke="#d6d6d6" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const tools = ['M6 3l12 9-6 1-3 6z', 'M7 3l10 9-5 1-2 5z M7 3v13', 'M12 3l3 9h-6z M12 12v8 M9 20h6', 'M4 18c4-10 12-10 16 0', 'M6 5h12 M12 5v14', 'M5 19L19 5', 'M5 6h14v12H5z', 'M12 5a7 7 0 1 0 .01 0z', 'M4 20c3-1 4-3 5-6l8-9 2 2-9 8c-3 1-5 2-6 5z', 'M5 19l3-1L19 7l-2-2L6 16z', 'M14 5l5 5-8 8H6v-5z', 'M12 4a8 8 0 1 0 8 8 M20 4v5h-5', 'M4 12h16 M12 4v16', 'M8 4h8l-3 7h5l-9 9 2-7H6z', 'M5 12a7 7 0 0 1 14 0 7 7 0 0 1-14 0z M5 12h14', 'M6 18l6-12 6 12', 'M9 11V5a2 2 0 0 1 4 0v6 M13 10V8a2 2 0 0 1 4 0v5c0 4-3 7-7 7s-6-3-6-6v-2a2 2 0 0 1 4 0', 'M10 4a6 6 0 1 0 .01 0z M14.5 14.5L20 20'];
  const sw = ['#9048d8', '#a830f0', '#f078f0', '#c0a8f0', '#f0f0ff', '#483060', '#ffffff', '#1e1e1e', '#7b4fbf', '#ff8dc7', '#c9b8e8', '#f5f0ff'];
  const css = `
body{width:1280px;height:800px;padding:0;background:#1e1e1e;background-image:none;display:grid;grid-template-rows:30px 34px 1fr 26px;color:#d6d6d6;font-family:Inter,system-ui,sans-serif}
.menu{display:flex;align-items:center;gap:20px;padding:0 16px;background:#2b2b2b;font-size:13px;border-bottom:1px solid #1a1a1a}
.menu .dots{display:flex;gap:7px;margin-right:10px}.menu .dots i{width:11px;height:11px;border-radius:50%;background:#5a5a5a}
.tabs{display:flex;align-items:flex-end;padding:0 0 0 52px;background:#323232;border-bottom:1px solid #1a1a1a}
.tab{font-size:12.5px;background:#535353;color:#f0f0f0;padding:8px 16px;border-radius:4px 4px 0 0}
.main{display:grid;grid-template-columns:52px 1fr 286px;min-height:0}
.tools{background:#323232;border-right:1px solid #1a1a1a;display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 0}
.tools span{display:flex;width:34px;height:30px;align-items:center;justify-content:center;border-radius:4px}
.tools span.on{background:#4a4a4a}
.fs{position:relative;width:36px;height:36px;margin-top:8px}.fs i{position:absolute;width:24px;height:24px;border:2px solid #ddd}
.fs i:first-child{left:0;top:0;background:#9048d8}.fs i:last-child{right:0;bottom:0;background:transparent;border:5px solid #483060;outline:1px solid #ddd}
.canvas{position:relative;background:#535353;overflow:hidden}
.ab{position:absolute;background:#fff;box-shadow:0 0 0 1px #222}
.ab label{position:absolute;left:0;top:-18px;font-size:11.5px;color:#e6e6e6;white-space:nowrap}
.ab img{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-width:86%;max-height:86%}
.sel{position:absolute;border:1.5px solid #1473e6}
.sel i{position:absolute;width:9px;height:9px;margin:-5px 0 0 -5px;background:#fff;border:1.5px solid #1473e6}
.selwrap{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}
.selwrap img{position:static;transform:none;display:block;max-height:430px;max-width:340px}
.vecbox{position:relative;display:inline-block;padding:4px}
.vecbox:before{content:"";position:absolute;inset:0;border:1.5px solid #1473e6}
.vecbox i{position:absolute;width:9px;height:9px;background:#fff;border:1.5px solid #1473e6}
.panel{background:#323232;border-left:1px solid #1a1a1a;padding:0;overflow:hidden;font-size:12.5px}
.ph{display:flex;gap:14px;padding:9px 12px;background:#2b2b2b;border-bottom:1px solid #1a1a1a;font-weight:600;color:#f0f0f0}
.ph span{color:#9a9a9a;font-weight:500}
.pb{padding:10px 12px 12px;border-bottom:1px solid #262626}
.pt{font-weight:700;color:#f0f0f0;margin-bottom:8px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px}
.fld{display:flex;justify-content:space-between;background:#262626;border:1px solid #444;border-radius:3px;padding:4px 7px}
.fld b{color:#9a9a9a;font-weight:500}
.row{display:flex;align-items:center;gap:8px;margin:5px 0}
.chipc{width:18px;height:18px;border:1px solid #888}
.sws{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.sws i{display:block;height:26px;border:1px solid #1a1a1a;border-radius:2px}
.lay{display:flex;align-items:center;gap:8px;padding:5px 4px;border-bottom:1px solid #2a2a2a}
.lay.on{background:#3d4f66}
.lay .eye{width:14px;height:9px;border:1.5px solid #bbb;border-radius:50%}
.lay .c{width:3px;height:16px}
.lay.sub{padding-left:24px}
.status{display:flex;gap:24px;align-items:center;padding:0 14px;background:#2b2b2b;font-size:12px;color:#bdbdbd;border-top:1px solid #1a1a1a}`;
  const W = [180, 380, 230, 230, 230];
  const abs = [
    { l: 34, t: 70, w: 190, h: 250, img: sketch, sk: true },
    { l: 262, t: 70, w: 400, h: 520, img: P.welcome, sel: true },
    { l: 700, t: 70, w: 210, h: 250, img: P.medal },
    { l: 700, t: 350, w: 210, h: 250, img: P.magnifier },
    { l: 34, t: 350, w: 190, h: 250, img: P.cheer },
  ];
  void W;
  const body = `
<div class="menu"><span class="dots"><i></i><i></i><i></i></span>${t.menu.map(m => `<span>${esc(m)}</span>`).join('')}</div>
<div class="tabs"><span class="tab">${esc(t.tab)}  ×</span></div>
<div class="main">
<div class="tools">${tools.map((d, i) => `<span class="${i === 0 ? 'on' : ''}">${icon(d)}</span>`).join('')}<div class="fs"><i></i><i></i></div></div>
<div class="canvas">${abs.map((a, i) => `<div class="ab" style="left:${a.l}px;top:${a.t}px;width:${a.w}px;height:${a.h}px"><label>${esc(t.boards[i])}</label>${a.sel ? `<span class="selwrap">${selBox(`<img src="${a.img}" alt="">`)}</span>` : `<img src="${a.img}" alt=""${a.sk ? ' style="opacity:.9"' : ''}>`}</div>`).join('')}</div>
<aside class="panel">
<div class="ph">${esc(t.props)} <span>${esc(t.layers)}</span></div>
<div class="pb"><p class="pt">${esc(t.transform)}</p><div class="grid2"><span class="fld"><b>X:</b> 462 px</span><span class="fld"><b>${t.props === 'Properties' ? 'W' : 'L'}:</b> 224 px</span><span class="fld"><b>Y:</b> 330 px</span><span class="fld"><b>${t.props === 'Properties' ? 'H' : 'A'}:</b> 396 px</span></div></div>
<div class="pb"><p class="pt">${esc(t.appearance)}</p><div class="row"><span class="chipc" style="background:#9048d8"></span>${esc(t.fill)}</div><div class="row"><span class="chipc" style="background:transparent;border:4px solid #483060"></span>${esc(t.stroke)} · 2 pt</div><div class="row"><span class="chipc" style="background:#bbb"></span>${esc(t.opacity)} · 100%</div></div>
<div class="pb"><p class="pt">${esc(t.swatches)}</p><div class="sws">${sw.map(c => `<i style="background:${c}"></i>`).join('')}</div></div>
<div class="pb" style="border-bottom:0"><p class="pt">${esc(t.layers)}</p>${t.layerList.map((n, i) => `<div class="lay${i === 0 ? ' on' : ''}${i > 0 && i < t.layerList.length - 1 ? ' sub' : ''}"><span class="eye"></span><span class="c" style="background:${i === t.layerList.length - 1 ? '#888' : '#7240c4'}"></span>${esc(n)}</div>`).join('')}</div>
</aside>
</div>
<div class="status">${t.status.map(s => `<span>${esc(s)}</span>`).join('')}</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Inter;src:url(${FONT}) format('woff2');unicode-range:U+0000-00FF,U+2000-206F,U+2190-21FF}
@font-face{font-family:Inter;src:url(${FONT_EXT}) format('woff2');unicode-range:U+0100-024F}
*{box-sizing:border-box;margin:0}html{background:#1e1e1e}${css}</style></head><body>${body}</body></html>`;
}

export async function extraBoards() {
  const P = await cutPoses();
  // recortes dos esboços (e10: estudos de ícone; e11: sequência em três quadros)
  const sketch = path.join(CACHE, 'sketch.png');
  await sharp(path.join(SRC, 'e10.webp')).extract({ left: 40, top: 40, width: 1826, height: 1832 }).resize(700).png().toFile(sketch);
  const seq = path.join(CACHE, 'seq.png');
  await sharp(path.join(SRC, 'e11.webp')).resize(null, 900).png().toFile(seq);
  const out = {};
  for (const lang of ['pt', 'en']) {
    out[`ef_projeto_${lang}`] = efProjeto(T[lang].proj);
    out[`ef_tools_${lang}`] = efTools(T[lang].tools);
    out[`ef_frameworks_${lang}`] = efFrameworks(T[lang].fw);
    out[`ef_heur_${lang}`] = efHeur(T[lang].heur);
    out[`ef_dyn_${lang}`] = efDyn(T[lang].dyn);
    out[`ef_research_${lang}`] = efResearch(E[lang].research);
    out[`ef_writing_${lang}`] = efWriting(E[lang].writing, P);
    out[`ef_ia_${lang}`] = efIa(E[lang].ia);
    out[`ef_game_${lang}`] = efGame(E[lang].game);
    out[`mb_usos_${lang}`] = mbUsos(M[lang].usos, P);
    out[`mb_proc_${lang}`] = mbProc(M[lang].proc, P, file(sketch), file(seq));
    out[`mb_fund_${lang}`] = mbFund(M[lang].fund, P);
    out[`mb_ai_${lang}`] = mbIllustrator(M[lang].ai, P, file(sketch));
  }
  return out;
}
