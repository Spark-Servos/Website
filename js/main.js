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
      ['Nicholas', '8th'], ['Jake', '8th'], ['Ahaan', '7th']
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

  /* ---------- simulator fullscreen ---------- */
  var simBtn = document.getElementById('simfs'), simWrap = document.getElementById('simwrap');
  if (simBtn && simWrap) simBtn.addEventListener('click', function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (simWrap.requestFullscreen) simWrap.requestFullscreen();
    else window.open(simWrap.querySelector('iframe').src, '_blank');
  });

  /* ---------- pick & place stage (human controlled) ---------- */
  var stage = document.getElementById('stage');
  if (stage) buildStage(stage);

  function buildStage(svg) {
    var BASE = { x: 500, y: 372 }, L1 = 210, L2 = 190, TS = 64, GRIP = 48;
    var FLOOR = 380, SLOT_Y = 130, FLOOR_Y = FLOOR - TS / 2 - 2;
    var VALUES = [2, 3, 5, 19, 67], GOAL = 38190;
    var SLOT_X = [300, 400, 500, 600, 700];
    var FLOOR_X = [110, 182, 254, 326, 398, 602, 674, 746, 818, 890];
    var START = [8, 1, 0, 7, 2]; // floor spot for each value
    var REST = { x: BASE.x, y: BASE.y - 340 };
    var statusEl = document.getElementById('status');
    var productEl = document.getElementById('product');
    var MONO = 'Share Tech Mono, monospace';

    /* scenery */
    var defs = svgEl('defs', {}, svg);
    var g = svgEl('linearGradient', { id: 'metal', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    svgEl('stop', { offset: 0, 'stop-color': '#f2f4f8' }, g);
    svgEl('stop', { offset: 1, 'stop-color': '#8e98aa' }, g);
    svgEl('line', { x1: 0, y1: FLOOR, x2: 1000, y2: FLOOR, stroke: '#1d3157', 'stroke-width': 3 }, svg);
    for (var x = 0; x < 1000; x += 40) svgEl('line', { x1: x, y1: FLOOR, x2: x - 20, y2: FLOOR + 18, stroke: '#14305a', 'stroke-width': 2 }, svg);
    svgEl('text', { x: 20, y: 406, fill: '#8d9bb5', 'font-family': MONO, 'font-size': 14 }, svg).textContent = 'PARTS BIN';
    svgEl('text', { x: 500, y: 214, fill: '#8d9bb5', 'font-family': MONO, 'font-size': 14, 'text-anchor': 'middle' }, svg).textContent = 'ASSEMBLY RAIL';
    svgEl('rect', { x: 230, y: SLOT_Y + 40, width: 540, height: 8, fill: '#14305a', stroke: '#1d3157' }, svg);
    var slots = SLOT_X.map(function (sx) {
      var s = svgEl('g', { 'class': 'slot' }, svg);
      svgEl('rect', { x: sx - TS / 2, y: SLOT_Y - TS / 2, width: TS, height: TS, rx: 6 }, s);
      return s;
    });
    var tileLayer = svgEl('g', {}, svg);

    /* arm */
    var arm = svgEl('g', {}, svg);
    svgEl('rect', { x: BASE.x - 60, y: FLOOR - 14, width: 120, height: 14, rx: 3, fill: '#14305a', stroke: '#ff6a00', 'stroke-width': 2 }, arm);
    svgEl('rect', { x: BASE.x - 22, y: BASE.y - 6, width: 44, height: 20, fill: '#0f1b33', stroke: '#1d3157', 'stroke-width': 2 }, arm);
    function link(w, outer) {
      return [
        svgEl('line', { stroke: '#14305a', 'stroke-width': outer, 'stroke-linecap': 'round' }, arm),
        svgEl('line', { stroke: 'url(#metal)', 'stroke-width': w, 'stroke-linecap': 'round' }, arm),
        svgEl('line', { stroke: '#ff6a00', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '2 14' }, arm)
      ];
    }
    var link1 = link(22, 30), link2 = link(18, 26);
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
    jawL.style.transition = jawR.style.transition = 'transform .15s';
    function setJaws(open) {
      jawL.style.transform = 'rotate(' + (-14 * open + 4) + 'deg)';
      jawR.style.transform = 'rotate(' + (14 * open - 4) + 'deg)';
    }
    function place(el, x, y) { el.setAttribute('transform', 'translate(' + x + ' ' + y + ')'); }

    /* kinematics */
    var E = { x: REST.x, y: REST.y }, H = { x: REST.x, y: REST.y };
    function ik(tx, ty) {
      var dx = tx - BASE.x, dy = ty - BASE.y;
      var d = Math.hypot(dx, dy) || 1, max = L1 + L2 - 1, min = Math.abs(L1 - L2) + 1;
      var dc = Math.min(max, Math.max(min, d)), k = dc / d;
      dx *= k; dy *= k;
      var a = Math.atan2(dy, dx);
      var b = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + dc * dc - L2 * L2) / (2 * L1 * dc))));
      var best = null;
      [a - b, a + b].forEach(function (s) {
        var ex = BASE.x + L1 * Math.cos(s), ey = BASE.y + L1 * Math.sin(s);
        if (!best || ey < best.y) best = { x: ex, y: ey };
      });
      return { elbow: best, hand: { x: BASE.x + dx, y: BASE.y + dy } };
    }
    function setLine(l, x1, y1, x2, y2) {
      l.forEach(function (e) { e.setAttribute('x1', x1); e.setAttribute('y1', y1); e.setAttribute('x2', x2); e.setAttribute('y2', y2); });
    }
    function pose() {
      var r = ik(E.x, E.y), el = r.elbow;
      H = r.hand;
      setLine(link1, BASE.x, BASE.y, el.x, el.y);
      setLine(link2, el.x, el.y, H.x, H.y);
      place(jShoulder, BASE.x, BASE.y); place(jElbow, el.x, el.y); place(hand, H.x, H.y);
      if (held) { held.x = H.x; held.y = H.y + GRIP; place(held.el, held.x, held.y); }
    }

    /* parts */
    var tiles = [], held = null, slotOcc, floorOcc, wasDone = false;
    function makeTile(v) {
      var t = svgEl('g', { 'class': 'tile' }, tileLayer), s = String(v);
      svgEl('rect', { x: -TS / 2, y: -TS / 2, width: TS, height: TS, rx: 6 }, t);
      svgEl('text', { x: 0, y: 2, 'font-size': s.length > 1 ? 24 : 30 }, t).textContent = s;
      return { el: t, v: v, x: 0, y: 0, tx: 0, ty: 0, spot: null };
    }
    function assign(t, kind, i) {
      t.spot = { kind: kind, i: i };
      if (kind === 'slot') { slotOcc[i] = t; t.tx = SLOT_X[i]; t.ty = SLOT_Y; }
      else { floorOcc[i] = t; t.tx = FLOOR_X[i]; t.ty = FLOOR_Y; }
    }
    function burst(x, y, n) {
      for (var i = 0; i < (n || 14); i++) {
        var c = svgEl('circle', { cx: x, cy: y, r: 2 + Math.random() * 2, fill: i % 2 ? '#ffa23a' : '#ff6a00' }, svg);
        var ang = Math.random() * 6.283, dist = 30 + Math.random() * 50;
        c.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: 'translate(' + Math.cos(ang) * dist + 'px,' + Math.sin(ang) * dist + 'px)', opacity: 0 }],
          { duration: 600 + Math.random() * 300, easing: 'ease-out' }).onfinish = (function (n) { return function () { n.remove(); }; })(c);
      }
    }
    function updateReadout() {
      var placed = slotOcc.filter(Boolean), prod = placed.reduce(function (a, t) { return a * t.v; }, 1);
      slots.forEach(function (s, i) { s.firstChild.style.stroke = slotOcc[i] ? '#ff6a00' : ''; s.firstChild.style.fill = ''; });
      var done = placed.length === 5;
      statusEl.textContent = done ? 'ASSEMBLED' : (held ? 'HOLDING ' + held.v : 'BUILDING ' + placed.length + '/5');
      if (done) {
        productEl.innerHTML = slotOcc.map(function (t) { return t.v; }).join(' × ') + ' = <b>' + prod + '</b>';
        if (!wasDone) { SLOT_X.forEach(function (sx, i) { setTimeout(function () { burst(sx, SLOT_Y, 10); }, i * 90); }); }
      } else productEl.innerHTML = 'PRODUCT: <b>' + (placed.length ? prod : 0) + '</b> / ' + GOAL;
      wasDone = done;
    }
    function pick(t) {
      if (t.spot) { (t.spot.kind === 'slot' ? slotOcc : floorOcc)[t.spot.i] = null; t.spot = null; }
      held = t; tileLayer.appendChild(t.el); setJaws(0); updateReadout();
    }
    function nearestSlot(t) {
      var bi = -1, bd = 62;
      SLOT_X.forEach(function (sx, i) {
        var d = Math.hypot(t.x - sx, t.y - SLOT_Y);
        if (!slotOcc[i] && d < bd) { bd = d; bi = i; }
      });
      return bi;
    }
    function drop() {
      var t = held; held = null; setJaws(1);
      var si = nearestSlot(t);
      if (si >= 0) { assign(t, 'slot', si); burst(SLOT_X[si], SLOT_Y + TS / 2, 8); }
      else {
        var fi = -1, bd = 1e9;
        FLOOR_X.forEach(function (fx, i) { var d = Math.abs(fx - t.x); if (!floorOcc[i] && d < bd) { bd = d; fi = i; } });
        assign(t, 'floor', fi);
      }
      updateReadout();
    }

    function reset() {
      token++; mode = 'manual'; held = null; wantPtr = false; wasDone = false;
      tiles.forEach(function (t) { t.el.remove(); });
      slotOcc = [null, null, null, null, null]; floorOcc = new Array(FLOOR_X.length).fill(null);
      tiles = VALUES.map(function (v, n) {
        var t = makeTile(v); assign(t, 'floor', START[n]);
        t.x = t.tx; t.y = t.ty; place(t.el, t.x, t.y); return t;
      });
      E.x = REST.x; E.y = REST.y; aim = { x: REST.x, y: REST.y + GRIP }; setJaws(1); pose(); updateReadout();
    }

    /* human input */
    var mode = 'manual', token = 0, aim = { x: REST.x, y: REST.y + GRIP }, wantPtr = false, spaceDown = false, visible = true;
    var keys = { l: 0, r: 0, u: 0, d: 0 };
    function toSvg(e) {
      var r = svg.getBoundingClientRect();
      return { x: (e.clientX - r.left) * 1000 / r.width, y: (e.clientY - r.top) * 420 / r.height };
    }
    svg.addEventListener('pointermove', function (e) {
      if (mode === 'manual' && (e.pointerType === 'mouse' || wantPtr)) aim = toSvg(e);
    });
    svg.addEventListener('pointerdown', function (e) {
      if (mode !== 'manual') return;
      aim = toSvg(e); wantPtr = true; svg.focus({ preventScroll: true });
      try { svg.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    });
    ['pointerup', 'pointercancel'].forEach(function (n) { svg.addEventListener(n, function () { wantPtr = false; }); });
    function keyMap(e) { return { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd' }[e.key]; }
    svg.addEventListener('keydown', function (e) {
      var k = keyMap(e);
      if (k) keys[k] = 1; else if (e.key === ' ' || e.key === 'Enter') spaceDown = true; else return;
      e.preventDefault();
    });
    svg.addEventListener('keyup', function (e) {
      var k = keyMap(e);
      if (k) keys[k] = 0; else if (e.key === ' ' || e.key === 'Enter') spaceDown = false;
    });
    svg.addEventListener('blur', function () { keys = { l: 0, r: 0, u: 0, d: 0 }; spaceDown = false; });

    function updateGrab() {
      var want = wantPtr || spaceDown;
      if (want && !held) {
        var best = null, bd = 46;
        tiles.forEach(function (t) {
          var d = Math.hypot(t.x - H.x, t.y - (H.y + GRIP));
          if (d < bd) { bd = d; best = t; }
        });
        if (best) pick(best);
      } else if (!want && held) drop();
    }

    var last = performance.now();
    (function frame(t) {
      requestAnimationFrame(frame);
      var dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (!visible) return;
      if (mode === 'manual') {
        var sp = 460 * dt;
        aim.x = Math.max(10, Math.min(990, aim.x + (keys.r - keys.l) * sp));
        aim.y = Math.max(40, Math.min(410, aim.y + (keys.d - keys.u) * sp));
        var k = 1 - Math.exp(-dt * 14);
        E.x += (aim.x - E.x) * k; E.y += (aim.y - GRIP - E.y) * k;
        pose(); updateGrab();
      } else pose();
      var k2 = 1 - Math.exp(-dt * 18);
      tiles.forEach(function (tl) {
        if (tl === held) return;
        tl.x += (tl.tx - tl.x) * k2; tl.y += (tl.ty - tl.y) * k2; place(tl.el, tl.x, tl.y);
      });
      if (held) {   // preview the slot the part will drop into
        var si = nearestSlot(held);
        slots.forEach(function (s, i) { s.firstChild.style.fill = i === si ? 'rgba(255,162,58,.28)' : ''; });
      }
    })(last);

    if ('IntersectionObserver' in window)
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(svg);

    /* auto demo: the old hands-free assembly */
    function moveTo(x, y, ms, my) {
      var s = { x: E.x, y: E.y }, t0 = performance.now();
      return new Promise(function (res) {
        if (reduced) { E.x = x; E.y = y; pose(); return res(); }
        (function step(t) {
          if (my !== token) return res();
          var p = Math.min(1, (t - t0) / ms), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          E.x = s.x + (x - s.x) * e; E.y = s.y + (y - s.y) * e; pose();
          if (p < 1) requestAnimationFrame(step); else res();
        })(t0);
      });
    }
    async function demo() {
      reset(); var my = token; mode = 'demo';
      var alive = function () { return my === token; };
      await sleep(400);
      for (var n = 0; n < 5 && alive(); n++) {
        var t = tiles[n], sx = SLOT_X[n], fx = t.x;
        setJaws(1);
        await moveTo(fx, FLOOR_Y - GRIP - 110, 800, my); if (!alive()) return;
        await moveTo(fx, FLOOR_Y - GRIP, 550, my); if (!alive()) return;
        pick(t); await sleep(220);
        await moveTo(fx, 190, 700, my); if (!alive()) return;
        await moveTo(sx, 60, 900, my); if (!alive()) return;
        await moveTo(sx, SLOT_Y - GRIP, 550, my); if (!alive()) return;
        drop(); await sleep(250);
        await moveTo(sx, 40, 450, my);
      }
      if (!alive()) return;
      await moveTo(REST.x, REST.y, 900, my);
      if (!alive()) return;
      mode = 'manual'; aim = { x: E.x, y: E.y + GRIP };
    }

    document.getElementById('reset').addEventListener('click', reset);
    document.getElementById('demo').addEventListener('click', demo);
    reset();
    window.__stage = {
      reset: reset, demo: demo,
      state: function () { return { placed: slotOcc.filter(Boolean).length, status: statusEl.textContent, product: productEl.textContent, held: held && held.v, mode: mode }; }
    };
  }
})();
