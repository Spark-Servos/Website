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
})();
