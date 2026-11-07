(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, reduced ? 0 : ms); }); };

  /* ---------- scroll reveal ---------- */
  function observe(sel, cls, cb) {
    var els = document.querySelectorAll(sel);
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add(cls); if (cb) cb(e); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add(cls); if (cb) cb(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.2 });
    els.forEach(function (e) { io.observe(e); });
  }
  observe('.reveal', 'in');

  /* ---------- typed text ---------- */
  var typed = document.getElementById('typed');
  if (typed) {
    var full = typed.dataset.text, i = 0;
    if (reduced) typed.textContent = full;
    else (function tick() { typed.textContent = full.slice(0, ++i); if (i < full.length) setTimeout(tick, 22); })();
  }

  /* ---------- count-up stats ---------- */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = +el.dataset.count;
    observe_one(el, function () {
      if (reduced) { el.textContent = target; return; }
      var t0 = performance.now();
      (function step(t) {
        var p = Math.min(1, (t - t0) / 1600);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  });
  function observe_one(el, cb) {
    if (!('IntersectionObserver' in window)) return cb();
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { cb(); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(el);
  }

  /* ---------- ember particles ---------- */
  var cv = document.getElementById('sparks');
  if (cv && !reduced) {
    var cx = cv.getContext('2d'), W, H, P = [];
    var resize = function () { W = cv.width = innerWidth; H = cv.height = innerHeight; };
    resize(); addEventListener('resize', resize);
    var spawn = function (x, y, burst) {
      P.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * (burst ? 5 : 0.6),
        vy: burst ? -Math.random() * 4 - 1 : -Math.random() * 0.8 - 0.3,
        life: 1, r: Math.random() * 1.8 + 0.6
      });
    };
    addEventListener('pointermove', function (e) { if (Math.random() < 0.3) spawn(e.clientX, e.clientY, true); });
    (function loop() {
      cx.clearRect(0, 0, W, H);
      if (P.length < 70 && Math.random() < 0.4) spawn(Math.random() * W, H + 5, false);
      for (var j = P.length - 1; j >= 0; j--) {
        var p = P[j];
        p.x += p.vx; p.y += p.vy; p.vy += 0.01; p.life -= 0.004;
        if (p.life <= 0 || p.y < -10) { P.splice(j, 1); continue; }
        cx.globalAlpha = Math.max(0, p.life);
        cx.fillStyle = p.life > 0.5 ? '#ffa23a' : '#ff6a00';
        cx.shadowColor = '#ff6a00'; cx.shadowBlur = 8;
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
      }
      cx.globalAlpha = 1;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- team page ---------- */
  var teamEl = document.getElementById('team');
  if (teamEl) {
    var members = [
      ['Austin', '7th'], ['Andy', '7th'], ['Ved', '7th'], ['Henry', '8th'],
      ['Nicholas', '7th'], ['Jake', '7th'], ['Ahaan', '7th']
    ];
    members.forEach(function (m, n) {
      var d = document.createElement('div');
      d.className = 'member';
      d.style.setProperty('--hover', (60 + n * 37) + 'deg');
      d.innerHTML =
        '<svg class="claw" viewBox="0 0 46 90" aria-hidden="true">' +
          '<rect x="19" y="0" width="8" height="46" fill="#d8dde6"/>' +
          '<rect x="12" y="40" width="22" height="16" rx="3" fill="#14305a" stroke="#ff6a00" stroke-width="2"/>' +
          '<circle cx="23" cy="48" r="3" fill="#ff6a00"/>' +
          '<path class="jaw jawL" d="M15 56 L9 80 L16 80 L21 58Z" fill="#d8dde6" style="transform-origin:15px 56px"/>' +
          '<path class="jaw jawR" d="M31 56 L37 80 L30 80 L25 58Z" fill="#d8dde6" style="transform-origin:31px 56px"/>' +
        '</svg>' +
        '<div class="card">' +
          '<span class="id">0' + (n + 1) + '</span>' +
          '<div class="dial"><svg viewBox="0 0 100 100" aria-hidden="true">' +
            '<circle cx="50" cy="50" r="46" fill="#0b1426" stroke="#1d3157" stroke-width="2"/>' +
            '<circle cx="50" cy="50" r="46" fill="none" stroke="#ff6a00" stroke-width="3" stroke-dasharray="3 9"/>' +
            '<g class="needle"><path d="M50 50 L50 8" stroke="#ff6a00" stroke-width="3" stroke-linecap="round"/></g>' +
          '</svg><div class="initial">' + m[0][0] + '</div></div>' +
          '<h3>' + m[0].toUpperCase() + '</h3>' +
          '<div class="grade">' + m[1] + ' GRADE</div>' +
        '</div>';
      d.querySelector('.claw').style.height = '90px';
      d.style.setProperty('--delay', (n * 0.1) + 's');
      teamEl.appendChild(d);
    });
    var cables = teamEl.querySelectorAll('.claw');
    cables.forEach(function (c) { c.style.overflow = 'visible'; });
    if (reduced) teamEl.querySelectorAll('.member').forEach(function (m) { m.classList.add('in'); });
    else observe('.member', 'in');
  }

  /* ---------- pick & place stage ---------- */
  var stage = document.getElementById('stage');
  if (stage) buildStage(stage);

  function buildStage(svg) {
    var BASE = { x: 500, y: 372 }, L1 = 210, L2 = 190, TS = 64;
    var FLOOR = 380, SLOT_Y = 130, HOLD = 34;
    var VALUES = ['2', '3', '5', '19', '67'];
    var statusEl = document.getElementById('status');
    var productEl = document.getElementById('product');
    var running = false, token = 0;

    /* static scenery */
    var defs = svgEl('defs', {}, svg);
    var g = svgEl('linearGradient', { id: 'metal', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    svgEl('stop', { offset: 0, 'stop-color': '#f2f4f8' }, g);
    svgEl('stop', { offset: 1, 'stop-color': '#8e98aa' }, g);
    svgEl('line', { x1: 0, y1: FLOOR, x2: 1000, y2: FLOOR, stroke: '#1d3157', 'stroke-width': 3 }, svg);
    for (var x = 0; x < 1000; x += 40) svgEl('line', { x1: x, y1: FLOOR, x2: x - 20, y2: FLOOR + 18, stroke: '#14305a', 'stroke-width': 2 }, svg);
    svgEl('text', { x: 20, y: 406, fill: '#8d9bb5', 'font-family': 'Share Tech Mono, monospace', 'font-size': 14 }, svg).textContent = 'PARTS BIN';
    svgEl('text', { x: 500, y: 214, fill: '#8d9bb5', 'font-family': 'Share Tech Mono, monospace', 'font-size': 14, 'text-anchor': 'middle' }, svg).textContent = 'ASSEMBLY RAIL';
    svgEl('rect', { x: 230, y: SLOT_Y + 40, width: 540, height: 8, fill: '#14305a', stroke: '#1d3157' }, svg);

    var slotX = [300, 400, 500, 600, 700];
    var slots = slotX.map(function (sx) {
      var s = svgEl('g', { 'class': 'slot' }, svg);
      svgEl('rect', { x: sx - TS / 2, y: SLOT_Y - TS / 2, width: TS, height: TS, rx: 6 }, s);
      return s;
    });

    /* tile start positions (shuffled so the arm criss-crosses the stage) */
    var bin = [{ x: 130, v: 2 }, { x: 800, v: 0 }, { x: 270, v: 3 }, { x: 730, v: 4 }, { x: 200, v: 1 }];
    var tiles = [];
    function makeTile(x, label) {
      var t = svgEl('g', { 'class': 'tile' }, svg);
      svgEl('rect', { x: -TS / 2, y: -TS / 2, width: TS, height: TS, rx: 6 }, t);
      svgEl('text', { x: 0, y: 2, 'font-size': label.length > 1 ? 24 : 30 }, t).textContent = label;
      place(t, x, FLOOR - TS / 2 - 2);
      return t;
    }
    function place(el, x, y) { el.setAttribute('transform', 'translate(' + x + ' ' + y + ')'); }

    /* arm */
    var arm = svgEl('g', {}, svg);
    svgEl('rect', { x: BASE.x - 60, y: FLOOR - 14, width: 120, height: 14, rx: 3, fill: '#14305a', stroke: '#ff6a00', 'stroke-width': 2 }, arm);
    svgEl('rect', { x: BASE.x - 22, y: BASE.y - 6, width: 44, height: 20, fill: '#0f1b33', stroke: '#1d3157', 'stroke-width': 2 }, arm);
    var l1o = svgEl('line', { stroke: '#14305a', 'stroke-width': 30, 'stroke-linecap': 'round' }, arm);
    var l1 = svgEl('line', { stroke: 'url(#metal)', 'stroke-width': 22, 'stroke-linecap': 'round' }, arm);
    var l1s = svgEl('line', { stroke: '#ff6a00', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '2 14' }, arm);
    var l2o = svgEl('line', { stroke: '#14305a', 'stroke-width': 26, 'stroke-linecap': 'round' }, arm);
    var l2 = svgEl('line', { stroke: 'url(#metal)', 'stroke-width': 18, 'stroke-linecap': 'round' }, arm);
    var l2s = svgEl('line', { stroke: '#ff6a00', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '2 14' }, arm);
    function joint(r) {
      var j = svgEl('g', {}, arm);
      svgEl('circle', { r: r, fill: '#d8dde6', stroke: '#14305a', 'stroke-width': 3 }, j);
      svgEl('circle', { r: r / 3, fill: '#ff6a00' }, j);
      return j;
    }
    var jShoulder = joint(18), jElbow = joint(15);
    var hand = svgEl('g', {}, arm);
    svgEl('rect', { x: -5, y: 0, width: 10, height: 12, fill: '#d8dde6' }, hand);
    svgEl('rect', { x: -20, y: 10, width: 40, height: 9, rx: 3, fill: '#14305a', stroke: '#ff6a00', 'stroke-width': 2 }, hand);
    var jawL = svgEl('path', { d: 'M-16 19 L-18 40 L-10 40 L-6 19Z', fill: '#d8dde6' }, hand);
    var jawR = svgEl('path', { d: 'M16 19 L18 40 L10 40 L6 19Z', fill: '#d8dde6' }, hand);
    jawL.style.transformOrigin = '-14px 19px'; jawR.style.transformOrigin = '14px 19px';
    function setJaws(open) { // open 0..1
      jawL.style.transform = 'rotate(' + (-14 * open + 4) + 'deg)';
      jawR.style.transform = 'rotate(' + (14 * open - 4) + 'deg)';
    }

    var E = { x: BASE.x, y: BASE.y - 340 };
    function ik(tx, ty) {
      var dx = tx - BASE.x, dy = ty - BASE.y;
      var d = Math.hypot(dx, dy), max = L1 + L2 - 1, min = Math.abs(L1 - L2) + 1;
      var k = Math.min(max, Math.max(min, d)) / (d || 1);
      dx *= k; dy *= k; d = Math.min(max, Math.max(min, d));
      var a = Math.atan2(dy, dx);
      var b = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
      var best = null;
      [a - b, a + b].forEach(function (s) {
        var ex = BASE.x + L1 * Math.cos(s), ey = BASE.y + L1 * Math.sin(s);
        if (!best || ey < best.y) best = { x: ex, y: ey };
      });
      return { elbow: best, hand: { x: BASE.x + dx, y: BASE.y + dy } };
    }
    function pose() {
      var r = ik(E.x, E.y), el = r.elbow, h = r.hand;
      [l1o, l1, l1s].forEach(function (l) { l.setAttribute('x1', BASE.x); l.setAttribute('y1', BASE.y); l.setAttribute('x2', el.x); l.setAttribute('y2', el.y); });
      [l2o, l2, l2s].forEach(function (l) { l.setAttribute('x1', el.x); l.setAttribute('y1', el.y); l.setAttribute('x2', h.x); l.setAttribute('y2', h.y); });
      place(jShoulder, BASE.x, BASE.y); place(jElbow, el.x, el.y);
      place(hand, h.x, h.y);
      if (held) place(held, h.x, h.y + HOLD + TS / 2 - 18);
    }
    var held = null;

    function moveTo(x, y, ms, my) {
      var s = { x: E.x, y: E.y }, t0 = performance.now(), tk = my;
      return new Promise(function (res) {
        if (reduced) { E.x = x; E.y = y; pose(); return res(); }
        (function step(t) {
          if (tk !== token) return res();
          var p = Math.min(1, (t - t0) / ms), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          E.x = s.x + (x - s.x) * e; E.y = s.y + (y - s.y) * e; pose();
          if (p < 1) requestAnimationFrame(step); else res();
        })(t0);
      });
    }

    function burst(x, y) {
      for (var i = 0; i < 14; i++) {
        var c = svgEl('circle', { cx: x, cy: y, r: 2 + Math.random() * 2, fill: i % 2 ? '#ffa23a' : '#ff6a00' }, svg);
        var ang = Math.random() * 6.283, dist = 30 + Math.random() * 50;
        c.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: 'translate(' + Math.cos(ang) * dist + 'px,' + Math.sin(ang) * dist + 'px)', opacity: 0 }],
          { duration: 600 + Math.random() * 300, easing: 'ease-out' }).onfinish = (function (n) { return function () { n.remove(); }; })(c);
      }
    }

    function reset() {
      token++;
      tiles.forEach(function (t) { t.remove(); });
      slots.forEach(function (s) { s.classList.remove('done'); s.firstChild.style.stroke = ''; });
      tiles = bin.map(function (b) { return makeTile(b.x, VALUES[b.v]); });
      held = null; E.x = BASE.x; E.y = BASE.y - 340; setJaws(1); pose();
      productEl.innerHTML = '2 × 3 × 5 × 19 × 67 = <b>38190</b>';
      statusEl.textContent = 'IDLE';
    }

    async function run() {
      reset();
      var my = token; running = true;
      var alive = function () { return my === token; };
      statusEl.textContent = 'BOOTING';
      await sleep(500);
      var built = [];
      for (var v = 0; v < 5 && alive(); v++) {
        var idx = bin.findIndex(function (b) { return b.v === v; });
        var t = tiles[idx], bx = bin[idx].x, sx = slotX[v];
        statusEl.textContent = 'PICK ' + VALUES[v];
        setJaws(1);
        await moveTo(bx, FLOOR - TS - HOLD - 70, 900, my); if (!alive()) break;
        await moveTo(bx, FLOOR - TS / 2 - 2 - (HOLD + TS / 2 - 18), 600, my); if (!alive()) break;
        setJaws(0); await sleep(250);
        held = t; t.parentNode.appendChild(t); pose();
        statusEl.textContent = 'PLACE ' + VALUES[v];
        await moveTo(bx, 190, 800, my); if (!alive()) break;
        await moveTo(sx, 60, 1000, my); if (!alive()) break;
        await moveTo(sx, SLOT_Y - (HOLD + TS / 2 - 18), 600, my); if (!alive()) break;
        held = null; place(t, sx, SLOT_Y); setJaws(1);
        slots[v].firstChild.style.stroke = '#ff6a00';
        burst(sx, SLOT_Y + TS / 2);
        built.push(VALUES[v]);
        productEl.innerHTML = built.join(' × ') + ' …';
        await sleep(300);
        await moveTo(sx, 40, 500, my);
      }
      if (!alive()) return;
      await moveTo(BASE.x, BASE.y - 340, 1000, my);
      statusEl.textContent = 'ASSEMBLED';
      productEl.innerHTML = '2 × 3 × 5 × 19 × 67 = <b>38190</b>';
      tiles.forEach(function (t, n) { t.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(2)' }, { filter: 'brightness(1)' }], { duration: 700, delay: n * 80 }); });
      running = false;
    }

    reset();
    var started = false;
    observe_one(svg, function () { started = true; run(); });
    document.getElementById('replay').addEventListener('click', function () { run(); });
    window.__stage = { run: run, reset: reset, isDone: function () { return statusEl.textContent === 'ASSEMBLED'; } };
  }
})();
