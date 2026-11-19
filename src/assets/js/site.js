/* Portfólio Gabriela Angelique · JS de melhoria progressiva. O site funciona sem este arquivo. */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement, body = d.body;
  var lang = body.getAttribute('data-lang') || 'pt';
  var PT = lang === 'pt';
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  /* links antigos (#/projetos/x) do site anterior */
  (function () {
    var m = (location.hash || '').match(/^#\/(projetos|log)\/([\w-]+)/);
    if (!m) return;
    var slug = m[2] === 'analytics' ? 'metrica' : m[2];
    var kind = slug === 'metrica' ? 'log' : m[1];
    var root = d.documentElement.getAttribute('data-base') || '';
    if (slug === 'huzaar') { location.replace(root + (PT ? '/projetos' : '/en/projects')); return; }
    var base = PT ? (kind === 'projetos' ? '/projetos/' : '/log/') : (kind === 'projetos' ? '/en/projects/' : '/en/log/');
    location.replace(root + base + slug);
  })();

  /* rolagem: toda página nova abre no topo; ao voltar (botão Voltar), a posição anterior é restaurada */
  (function () {
    var key = 'scroll:' + location.pathname;
    var nav = w.performance && performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
    var back = nav ? nav.type === 'back_forward' : false;
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
    function go(y) {
      try { w.scrollTo({ top: y, left: 0, behavior: 'instant' }); } catch (e) { w.scrollTo(0, y); }
    }
    function place() {
      if (location.hash && location.hash.length > 1 && location.hash.charAt(1) !== '/') return;
      var y = 0;
      if (back) { try { y = parseInt(sessionStorage.getItem(key), 10) || 0; } catch (e) {} }
      go(y);
    }
    var touched = false;
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (t) { w.addEventListener(t, function () { touched = true; }, { once: true, passive: true }); });
    place();
    w.addEventListener('load', function () { if (!touched) place(); });
    w.addEventListener('pagehide', function () { try { sessionStorage.setItem(key, String(Math.round(w.scrollY))); } catch (e) {} });
    w.addEventListener('pageshow', function (e) { if (e.persisted) back = true; });
  })();

  /* analítica (Umami) */
  function track(name, data) {
    try { if (w.umami && typeof w.umami.track === 'function') { w.umami.track(name, data); return true; } } catch (e) {}
    return false;
  }
  function trackLater(name, data, tries) {
    tries = tries || 0;
    if (!track(name, data) && tries < 20) setTimeout(function () { trackLater(name, data, tries + 1); }, 500);
  }
  var caseEl = $('[data-case]');
  if (caseEl) trackLater('case-view', { case: caseEl.getAttribute('data-case'), lang: lang });
  (function () {
    var marks = [25, 50, 75, 100], sent = {};
    function onScroll() {
      var h = root.scrollHeight - w.innerHeight;
      if (h <= 0) return;
      var p = Math.round((w.scrollY / h) * 100);
      for (var i = 0; i < marks.length; i++) {
        if (p >= marks[i] && !sent[marks[i]]) { sent[marks[i]] = 1; track('scroll', { depth: marks[i], page: location.pathname }); }
      }
    }
    w.addEventListener('scroll', function () { if (!onScroll.t) onScroll.t = setTimeout(function () { onScroll.t = 0; onScroll(); }, 300); }, { passive: true });
  })();

  /* menu no celular */
  var menuBtn = $('.menu-btn'), nav = $('#site-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? (PT ? 'Fechar' : 'Close') : 'Menu';
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a') && nav.classList.contains('open')) menuBtn.click(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { menuBtn.click(); menuBtn.focus(); } });
  }

  /* pontos do fundo do topo acendem perto do cursor (efeito do site original) */
  (function () {
    var hero = $('[data-hero]'); if (!hero || reduce) return;
    var raf = 0, mx = -999, my = -999;
    function paint() { raf = 0; hero.style.setProperty('--mx', mx + 'px'); hero.style.setProperty('--my', my + 'px'); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; if (!raf) raf = requestAnimationFrame(paint); });
    hero.addEventListener('pointerleave', function () { mx = my = -999; if (!raf) raf = requestAnimationFrame(paint); });
  })();

  /* ---------------------------------------------------------------- pássaros (animação do site original)
     O texto da página fica visível o tempo todo; os pássaros são desenhados num canvas por cima. */
  var SPR = ['.....oooo.', '..oooookyy', 'oooodooo..', '.odddddo..'];
  var SHADES = [{ o: '#bf5fff', d: '#8a3ec4', k: '#16121c' }, { o: '#e2c4ff', d: '#b356f2', k: '#16121c' }, { o: '#c870ff', d: '#6e2f9d', k: '#16121c' }, { o: '#f0e0ff', d: '#a24be0', k: '#16121c' }];
  function drawBird(ctx, b, px, t) {
    var rows = SPR.concat([b.fly ? '....y.....' : (Math.floor(b.walk) % 2 ? '...y.y....' : '...y..y...')]);
    var x0 = Math.round(b.x - 5 * px), y0 = Math.round(b.y - 5 * px);
    for (var j = 0; j < rows.length; j++) for (var i = 0; i < 10; i++) {
      var c = rows[j][i]; if (c === '.') continue;
      var col = b.face < 0 ? 9 - i : i;
      ctx.fillStyle = b.sh[c] || '#ffd24a';
      ctx.fillRect(x0 + col * px, y0 + j * px, px, px);
    }
    if (b.fly) {
      var f = Math.floor(t / 70) % 2, wy = y0 + 5 * px;
      ctx.globalAlpha = 0.85; ctx.fillStyle = '#bf5fff';
      ctx.fillRect(x0 + 2 * px, wy + px * (f ? 0.4 : 0.9), px, px * (f ? 1 : 0.6));
      ctx.fillRect(x0 + 7 * px, wy + px * (f ? 0.9 : 0.4), px, px * (f ? 0.6 : 1));
      ctx.globalAlpha = 1;
    }
  }
  function bubble(ctx, text, x, y) {
    ctx.font = '10px Silkscreen, ui-monospace, monospace';
    var wd = Math.ceil(ctx.measureText(text).width) + 14, h = 18, bx = Math.round(x - wd / 2), by = Math.round(y - h);
    ctx.fillStyle = '#0c0b0e'; ctx.fillRect(bx + 2, by + 2, wd, h);
    ctx.fillStyle = '#ece9f1'; ctx.fillRect(bx, by, wd, h);
    ctx.fillStyle = '#0c0b0e'; ctx.textBaseline = 'middle'; ctx.fillText(text, bx + 7, by + h / 2 + 1);
  }

  (function () {
    var hero = $('[data-hero]'); if (!hero) return;
    var ground = $('[data-ground]'), blocks = $$('.ground-blocks i', ground), domBird = $('[data-bird]', ground), domBubble = $('[data-bubble]', ground), skip = $('[data-skip-intro]');
    var restAt = 0.58;
    function say(text, ms) {
      domBubble.textContent = text; domBubble.hidden = false;
      /* perto das pontas, o balão abre para dentro, conforme a largura da frase */
      domBubble.classList.remove('to-r', 'to-l');
      var gw = ground.clientWidth || 1, at = (typeof idle === 'object' ? idle.pos : restAt) * gw, bw = domBubble.offsetWidth;
      if (at - bw / 2 < 0) domBubble.classList.add('to-r'); else if (at + bw / 2 > gw) domBubble.classList.add('to-l');
      clearTimeout(say.t); if (ms) say.t = setTimeout(function () { domBubble.hidden = true; }, ms);
    }

    /* frases do pássaro: a primeira é a de boas-vindas; as outras são lembretes de UX */
    var LINES = PT
      ? ['Oh! Hey, bem-vindo', 'Teste cedo, teste sempre', 'Menos cliques, mais clareza', 'Todo erro precisa de saída', 'Acessibilidade não é extra', 'Dados antes de opiniões', 'Consistência ensina', 'Mostre o status do sistema', 'Prevenir é melhor que corrigir', 'Escute quem usa', 'Simples não é fácil', 'Problema antes da tela']
      : ['Oh! Hey, welcome', 'Test early, test often', 'Fewer clicks, more clarity', 'Every error needs a way out', 'Accessibility isn’t extra', 'Data before opinions', 'Consistency teaches', 'Show the system status', 'Prevent errors, don’t just fix them', 'Listen to your users', 'Simple isn’t easy', 'Problem before screens'];
    var clicks = 0, lastTip = 0;
    function tip() { var i; do { i = 1 + Math.floor(Math.random() * (LINES.length - 1)); } while (i === lastTip && LINES.length > 2); lastTip = i; return LINES[i]; }
    function heroVisible() { var r = hero.getBoundingClientRect(); return r.bottom > 0 && r.top < (w.innerHeight || 800); }

    /* pássaro em repouso na barra: anda de vez em quando e, parado por um tempo, solta uma frase de UX */
    var idle = { pos: restAt, last: Date.now(), timer: 0 };
    function placeBird(p) { domBird.style.left = (p * 100).toFixed(2) + '%'; }
    function idleLoop() {
      if (reduce) return;
      clearTimeout(idle.timer);
      idle.timer = setTimeout(function () {
        if (d.hidden) return idleLoop();
        if ((Date.now() - idle.last) / 1000 > 10 && heroVisible()) { idle.last = Date.now(); say(tip(), 2800); return idleLoop(); }
        var to = Math.max(0.06, Math.min(0.94, idle.pos + (Math.random() - 0.5) * 0.3));
        domBird.classList.toggle('flip', to < idle.pos);
        domBird.classList.add('walking');
        placeBird(to); idle.pos = to;
        setTimeout(function () { domBird.classList.remove('walking'); }, 1200);
        idleLoop();
      }, 3500 + Math.random() * 3000);
    }
    function wake(msg, ms) {
      idle.last = Date.now();
      say(msg, ms || 1600);
      idleLoop();
    }
    domBird.addEventListener('click', function () { wake(clicks++ === 0 ? LINES[0] : tip(), 2600); });
    domBird.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') wake('Oh hey', 1800); });
    ['pointermove', 'keydown', 'scroll'].forEach(function (ev) { w.addEventListener(ev, function () { idle.last = Date.now(); }, { passive: true }); });

    var seen = store.get('intro-seen') === '1' && !/[?&]intro\b/.test(location.search);
    if (reduce || seen || /[?&]intro=0/.test(location.search)) { placeBird(restAt); idleLoop(); return; }

    /* intro */
    hero.classList.add('intro');
    skip.hidden = false;
    var cv = d.createElement('canvas'); cv.className = 'intro-canvas'; cv.setAttribute('aria-hidden', 'true');
    body.appendChild(cv);
    var ctx = cv.getContext('2d'), dpr = Math.min(2, w.devicePixelRatio || 1), W = 0, H = 0, px = 4;
    function size() { W = w.innerWidth; H = w.innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); px = Math.max(3, Math.round(Math.min(W, 1200) / 260)); }
    size(); w.addEventListener('resize', size);
    var rect = function (el) { return el.getBoundingClientRect(); };
    var gR = function () { return rect($('.ground-blocks', ground)); };
    var lead = { x: 0, y: 0, vx: 0, vy: 0, face: 1, walk: 0, fly: true, sh: SHADES[0] };
    var targets = [$('.hero-title'), $('.hero-tagline'), $('[data-build-target]'), $('.site-nav a'), $('.hero-intro'), $('.brand')].filter(Boolean);
    var builders = [], pieces = [], trail = [], phase = 'load', t0 = performance.now(), last = t0, lit = 0, raf = 0, done = false, phaseAt = 0;
    var b0 = rect($('[data-build-target]') || hero);
    lead.x = b0.right + 40; lead.y = b0.top + b0.height / 2;
    function spring(b, tx, ty, dt, k) { k = k || 120; b.vx += ((tx - b.x) * k - 14 * b.vx) * dt; b.vy += ((ty - b.y) * k - 14 * b.vy) * dt; b.x += b.vx * dt; b.y += b.vy * dt; if (Math.abs(b.vx) > 6) b.face = b.vx > 0 ? 1 : -1; }
    function startBuild(now) {
      phase = 'build'; phaseAt = now;
      for (var i = 0; i < 3; i++) {
        var q = targets.filter(function (_, j) { return j % 3 === i; });
        var r0 = rect(q[0] || hero);
        builders.push({ x: r0.left + r0.width * (0.2 + 0.3 * i), y: -30 - 40 * i, vx: 0, vy: 0, face: i % 2 ? -1 : 1, walk: 0, fly: true, sh: SHADES[(i + 1) % 4], q: q, work: 0, delay: i * 0.18, gone: false, at: false });
      }
    }
    function frame(now) {
      var dt = Math.min(1 / 30, (now - last) / 1000); last = now;
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      var g = gR();
      if (phase === 'load') {
        /* sai do lado do botão, desce até a barra e acende os blocos ("loading") */
        var p = Math.max(0, Math.min(1, (t - 0.35) / 1.9));
        var tx = t < 0.35 ? lead.x + 4 : g.left + g.width * p, ty = t < 0.35 ? lead.y : g.top - 4 * px - Math.sin(p * Math.PI) * 14;
        spring(lead, tx, ty, dt, 160);
        var n = Math.max(0, Math.min(20, Math.floor(((lead.x - g.left) / g.width) * 20 + 0.5)));
        if (t > 0.35) while (lit < n) { blocks[lit].classList.add('on'); lit++; }
        if (Math.random() < 0.4) trail.push({ x: lead.x - lead.face * 4 * px, y: lead.y + 2 * px, a: 1 });
        drawBird(ctx, lead, px, now);
        var pct = Math.min(100, Math.floor(lit / 20 * 10) * 10);
        bubble(ctx, lit >= 20 ? 'READY' : 'LOADING ' + pct + '%', lead.x, lead.y - 6 * px);
        if (lit >= 20 && t > 2.6) startBuild(now);
      } else {
        var tb = (now - phaseAt) / 1000;
        /* o pássaro guia pousa e fica no ponto de descanso */
        var rx = g.left + g.width * restAt, ry = g.top - 2;
        if (lead.fly) { spring(lead, rx, ry, dt, 90); if (Math.hypot(lead.x - rx, lead.y - ry) < 6) { lead.fly = false; lead.vx = lead.vy = 0; lead.x = rx; lead.y = ry; } }
        else { lead.x = rx; lead.y = ry; }
        drawBird(ctx, lead, px, now);
        var active = 0;
        builders.forEach(function (b) {
          if (b.gone || tb < b.delay) return;
          active++;
          var tgt = b.q[0];
          if (tgt) {
            var r = rect(tgt), ay = r.top - 4 * px, sx = r.left + Math.min(24, r.width / 3);
            if (!b.at) { spring(b, sx, ay, dt, 110); if (Math.hypot(b.x - sx, b.y - ay) < 18) b.at = true; }
            else {
              b.work += dt;
              var span = Math.min(r.width - 10, 420);
              spring(b, sx + span * Math.min(1, b.work / 0.6), ay + Math.sin(now / 90) * 3, dt, 160);
              if (Math.random() < 0.6) pieces.push({ x: b.x + (Math.random() - 0.5) * 10, y: b.y + 2 * px, ty: r.top + Math.random() * r.height, vy: 40 + Math.random() * 80, c: Math.random() < 0.5 ? '#bf5fff' : '#ece9f1', a: 1 });
              if (b.work > 0.6) {
                b.q.shift(); b.at = false; b.work = 0; tgt.classList.add('built');
                setTimeout(function () { tgt.classList.remove('built'); }, 260);
              }
            }
          } else {
            spring(b, b.x + b.face * 60, -80, dt, 60);
            if (b.y < -40) b.gone = true;
          }
          if (Math.random() < 0.35) trail.push({ x: b.x, y: b.y + 3 * px, a: 1 });
          drawBird(ctx, b, px, now);
        });
        if (phase === 'build' && !active && tb > 0.8) { phase = 'ship'; phaseAt = now; }
        if (phase === 'ship') { bubble(ctx, 'SHIPPED ✓', lead.x, lead.y - 6 * px); if ((now - phaseAt) / 1000 > 1.3) return end(); }
      }
      /* rastro pontilhado e peças caindo */
      for (var i = trail.length - 1; i >= 0; i--) { var tr = trail[i]; tr.a -= dt * 1.6; if (tr.a <= 0) { trail.splice(i, 1); continue; } ctx.globalAlpha = tr.a * 0.8; ctx.fillStyle = '#bf5fff'; ctx.fillRect(tr.x, tr.y, 2, 2); }
      for (var k = pieces.length - 1; k >= 0; k--) { var pc = pieces[k]; if (pc.y < pc.ty) { pc.y += pc.vy * dt; pc.vy += 600 * dt; } else pc.a -= dt * 3; if (pc.a <= 0) { pieces.splice(k, 1); continue; } ctx.globalAlpha = Math.max(0, pc.a); ctx.fillStyle = pc.c; ctx.fillRect(Math.round(pc.x), Math.round(pc.y), 3, 3); }
      ctx.globalAlpha = 1;
      if (!done) raf = requestAnimationFrame(frame);
    }
    function end() {
      if (done) return; done = true;
      cancelAnimationFrame(raf);
      cv.remove(); w.removeEventListener('resize', size);
      blocks.forEach(function (b) { b.classList.add('on'); });
      hero.classList.remove('intro');
      skip.hidden = true;
      $$('.built').forEach(function (el) { el.classList.remove('built'); });
      store.set('intro-seen', '1');
      d.removeEventListener('keydown', onKey);
      placeBird(restAt);
      say('SHIPPED ✓', 1600);
      idle.last = Date.now(); idleLoop();
    }
    function onKey(e) { if (e.key === 'Escape') end(); }
    skip.addEventListener('click', function () { end(); var m = $('#conteudo'); if (m) m.focus({ preventScroll: true }); });
    d.addEventListener('keydown', onKey);
    setTimeout(end, 9000); /* segurança: a intro nunca passa de 9 s */
    raf = requestAnimationFrame(frame);
  })();

  /* terminal */
  (function () {
    var term = $('[data-terminal]'); if (!term) return;
    var out = $('.terminal-out', term), form = $('[data-terminal-form]', term), input = $('input', form);
    form.hidden = false;
    var linkedin = term.getAttribute('data-linkedin') || '';
    var email = term.getAttribute('data-email') || '';
    var cvHref = term.getAttribute('data-cv');
    var cases = []; try { cases = JSON.parse(term.getAttribute('data-cases') || '[]'); } catch (e) {}
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function line(html, cls) { var p = d.createElement('p'); if (cls) p.className = cls; p.innerHTML = html; out.appendChild(p); out.scrollTop = out.scrollHeight; }
    function link(t, h, attrs) { return '<a href="' + h + '"' + (attrs || '') + '>' + esc(t) + '</a>'; }
    var T = PT ? {
      help: 'Comandos: sobre · cases · ab · cv · contato · limpar',
      about: 'Líder de design com formação em engenharia e artes, atuando na construção de times, em design systems e no uso real da IA no trabalho.',
      ab: 'Teste A/B com 12.432 alunos: o feedback personalizado do Mr. Brain elevou de 28,1% para 32,4% o início da atividade seguinte (+4,3 p.p., p = 0,0008).',
      cv: 'CV em PDF: ', contact: 'E-mail: ', hi: 'Olá! Digite ajuda para ver os comandos.', unknown: 'Não conheço esse comando. Digite ajuda.', found: 'Talvez você procure: ', cvLink: 'abrir CV',
      keys: { help: ['ajuda', 'help', '?', 'comandos'], about: ['sobre', 'quem', 'about', 'whoami'], cases: ['cases', 'projetos', 'ls', 'portfolio'], ab: ['ab', 'a/b', 'teste', 'resultado', 'numeros'], cv: ['cv', 'curriculo', 'pdf'], contact: ['contato', 'email', 'e-mail', 'linkedin'], clear: ['limpar', 'clear', 'cls'], hi: ['oi', 'ola', 'hello', 'hi'] }
    } : {
      help: 'Commands: about · cases · ab · cv · contact · clear',
      about: 'A design leader with an engineering and arts background, working on team building, design systems and how AI is actually used in the work.',
      ab: 'A/B test with 12,432 students: Mr. Brain’s personalized feedback raised starting the next activity from 28.1% to 32.4% (+4.3 pp, p = 0.0008).',
      cv: 'CV (PDF): ', contact: 'Email: ', hi: 'Hi! Type help to see the commands.', unknown: 'Unknown command. Type help.', found: 'Maybe you are looking for: ', cvLink: 'open CV',
      keys: { help: ['help', '?', 'commands'], about: ['about', 'whoami', 'who'], cases: ['cases', 'projects', 'ls', 'portfolio'], ab: ['ab', 'a/b', 'test', 'result', 'numbers'], cv: ['cv', 'resume', 'pdf'], contact: ['contact', 'email', 'linkedin'], clear: ['clear', 'cls'], hi: ['hi', 'hello', 'hey'] }
    };
    if (!cvHref) T.help = T.help.replace(' · cv', '');
    function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }
    function is(cmd, k) { return T.keys[k].some(function (x) { return norm(x) === cmd; }); }
    function run(q) {
      var cmd = norm(q);
      line(esc(q), 'me');
      track('terminal', { cmd: cmd.slice(0, 30) });
      if (is(cmd, 'clear')) { out.innerHTML = ''; return; }
      if (is(cmd, 'help')) return line(esc(T.help));
      if (is(cmd, 'hi')) return line(esc(T.hi));
      if (is(cmd, 'about')) return line(esc(T.about));
      if (is(cmd, 'ab')) return line(esc(T.ab));
      if (cvHref && is(cmd, 'cv')) return cvHref ? line(esc(T.cv) + link(T.cvLink, cvHref, ' target="_blank" rel="noopener" type="application/pdf"')) : line('LinkedIn: ' + link('LinkedIn', linkedin, ' target="_blank" rel="noopener"'));
      if (is(cmd, 'contact')) return line(esc(T.contact) + link(email, 'mailto:' + email) + ' · ' + link('LinkedIn', linkedin, ' target="_blank" rel="noopener"'));
      if (is(cmd, 'cases')) return line(cases.map(function (c, i) { return (i + 1) + '. ' + link(c.t, c.h); }).join('\n'));
      var words = cmd.split(/[^a-z0-9]+/).filter(function (x) { return x.length > 3; });
      var hit = cases.filter(function (c) { return norm(c.t + ' ' + c.k).split(/[^a-z0-9]+/).some(function (tk) { return tk.length > 3 && words.some(function (wd) { return tk.indexOf(wd) === 0 || wd.indexOf(tk) === 0; }); }); });
      if (hit.length) return line(esc(T.found) + hit.map(function (c) { return link(c.t, c.h); }).join(' · '));
      line(esc(T.unknown));
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); var q = input.value.trim(); if (!q) return; input.value = ''; run(q); });
  })();
})();
