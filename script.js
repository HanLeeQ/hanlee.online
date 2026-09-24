/* ==========================================================
   Han Connects
   1. theme toggle (lightbulb)
   2. copy email
   3. videos: one plays at a time
   4. ascii logo animation
   ========================================================== */

document.addEventListener('DOMContentLoaded', function () {

  var root = document.documentElement;

  /* ------------------------------------------------------
     1. theme toggle
     ------------------------------------------------------ */

  var BULB_LIT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" aria-hidden="true">' +
    '<circle cx="12" cy="10" r="4.5" fill="currentColor" stroke="none"/>' +
    '<line x1="9.8" y1="15.6" x2="14.2" y2="15.6"/>' +
    '<line x1="10.6" y1="17.8" x2="13.4" y2="17.8"/>' +
    '<line x1="12" y1="3.4" x2="12" y2="1.4"/>' +
    '<line x1="7.4" y1="5.4" x2="6.0" y2="4.0"/>' +
    '<line x1="16.6" y1="5.4" x2="18.0" y2="4.0"/>' +
    '<line x1="5.5" y1="10" x2="3.5" y2="10"/>' +
    '<line x1="18.5" y1="10" x2="20.5" y2="10"/>' +
    '</svg>';

  var BULB_DARK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" aria-hidden="true">' +
    '<circle cx="12" cy="10" r="4.5"/>' +
    '<line x1="9.8" y1="15.6" x2="14.2" y2="15.6"/>' +
    '<line x1="10.6" y1="17.8" x2="13.4" y2="17.8"/>' +
    '</svg>';

  var themeBtn = document.getElementById('theme');

  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  // The bulb shows the theme you are IN: lit in light mode,
  // hollow in dark mode.
  function paintButton() {
    if (!themeBtn) return;
    var dark = currentTheme() === 'dark';
    themeBtn.innerHTML = dark ? BULB_DARK : BULB_LIT;
    themeBtn.setAttribute('aria-label',
      dark ? 'Switch to light mode' : 'Switch to dark mode');
    themeBtn.setAttribute('title',
      dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  paintButton();

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      paintButton();
      if (window.__asciiRecolor) window.__asciiRecolor();
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', function () {
      var saved = null;
      try { saved = localStorage.getItem('theme'); } catch (e) {}
      if (!saved) {
        paintButton();
        if (window.__asciiRecolor) window.__asciiRecolor();
      }
    });

  /* ------------------------------------------------------
     2. copy email
     ------------------------------------------------------ */

  var copyBtn = document.getElementById('copy');
  var email = document.getElementById('email');

  if (copyBtn && email) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(email.textContent.trim()).then(
        function () {
          copyBtn.textContent = 'copied';
          setTimeout(function () { copyBtn.textContent = 'copy'; }, 1500);
        },
        function () {
          copyBtn.textContent = 'press ctrl+c';
          setTimeout(function () { copyBtn.textContent = 'copy'; }, 2500);
        }
      );
    });
  }

  /* ------------------------------------------------------
     3. videos: one plays at a time

     Starting any video pauses every other one, which is what
     lets the with / without pair be compared back to back.
     Closing a dropdown pauses whatever is playing inside it.
     ------------------------------------------------------ */

  var videos = document.querySelectorAll('video');

  if (videos.length) {
    document.addEventListener('play', function (ev) {
      for (var v = 0; v < videos.length; v++) {
        if (videos[v] !== ev.target && !videos[v].paused) videos[v].pause();
      }
    }, true);

    var folds = document.querySelectorAll('details');
    for (var f = 0; f < folds.length; f++) {
      folds[f].addEventListener('toggle', function () {
        if (this.open) return;
        var inside = this.querySelectorAll('video');
        for (var k = 0; k < inside.length; k++) inside[k].pause();
      });
    }
  }

  /* ------------------------------------------------------
     4. ascii logo animation

     The canvas covers everything to the right of the text.
     The logo is sized to that space and centred in it.

     Target positions come from the logo's real geometry: two
     uprights plus the stepped crossbar, in the same 0-100
     space as favicon.svg. Each grid cell whose centre falls
     inside a stroke becomes a landing spot for one character.

     Feathering, so there is never a visible box:
       - scattered characters spread across the whole area in
         a soft cloud, thinning out with distance
       - every character fades to nothing near any canvas edge
       - a halo of loose "dust" characters gathers around the
         logo but never locks in, so its edges stay soft

     Characters are coloured like a syntax highlighter:
     digits numeric, slashes and pipes operator, the rest the
     third hue.
     ------------------------------------------------------ */

  var canvas = document.getElementById('ascii');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');

  var CELL = 14;
  var FONT = '13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

  var DIGITS = '0123456789';
  var OPS    = '|/\\';
  var ALTS   = '-_=+';
  var GLYPHS = (DIGITS + OPS + ALTS).split('');

  var STROKES = [
    { x0: 26.5, x1: 37.5, y0: 14.0, y1: 86.0 },
    { x0: 62.5, x1: 73.5, y0: 14.0, y1: 86.0 },
    { x0: 10.0, x1: 55.5, y0: 54.5, y1: 65.5 },
    { x0: 44.5, x1: 55.5, y0: 40.0, y1: 65.5 },
    { x0: 44.5, x1: 90.0, y0: 34.5, y1: 45.5 }
  ];

  function inLogo(lx, ly) {
    for (var i = 0; i < STROKES.length; i++) {
      var s = STROKES[i];
      if (lx >= s.x0 && lx <= s.x1 && ly >= s.y0 && ly <= s.y1) return true;
    }
    return false;
  }

  function randGlyph() { return GLYPHS[(Math.random() * GLYPHS.length) | 0]; }

  // Roughly normal random number, mean 0, sd 1.
  function gauss() {
    return (Math.random() + Math.random() + Math.random() - 1.5) * 1.41;
  }

  function smooth(e0, e1, x) {
    var t = (x - e0) / (e1 - e0);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return t * t * (3 - 2 * t);
  }

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  var W = 0, H = 0, CX = 0, CY = 0, SPREAD = 0, EDGE = 0;
  var particles = [];

  // A scatter point: anywhere in the area, denser toward the
  // middle, some deliberately past the edges where they are
  // invisible, so the cloud has no boundary.
  function scatterPoint() {
    var a = Math.random() * Math.PI * 2;
    var r = SPREAD * (0.2 + 0.95 * Math.sqrt(Math.random()));
    return { x: CX + Math.cos(a) * r * (W / Math.max(W, H)) * 1.15,
             y: CY + Math.sin(a) * r * (H / Math.max(W, H)) * 1.15 };
  }

  function edgeFade(x, y) {
    return smooth(0, EDGE, x) * smooth(0, EDGE, W - x) *
           smooth(0, EDGE, y) * smooth(0, EDGE, H - y);
  }

  function build() {
    // Hidden on narrow screens: skip all the work.
    if (getComputedStyle(canvas).display === 'none') {
      W = H = 0;
      particles = [];
      return;
    }
    var rect = canvas.getBoundingClientRect();
    W = Math.max(0, Math.round(window.innerWidth - rect.left));
    H = Math.round(window.innerHeight);
    if (W < 50 || H < 50) { particles = []; return; }

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = FONT;

    CX = W / 2;
    CY = H / 2;
    SPREAD = Math.max(W, H) * 0.62;
    EDGE = Math.min(W, H) * 0.16;

    // Logo size: most of the free area, capped so it never
    // gets cartoonish on very wide screens.
    var size = Math.min(W * 0.78, H * 0.72, 760);
    var n = Math.max(20, Math.round(size / CELL));
    var ox = CX - (n * CELL) / 2;
    var oy = CY - (n * CELL) / 2;

    particles = [];
    var targets = [];

    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        var lx = ((c + 0.5) / n) * 100;
        var ly = ((r + 0.5) / n) * 100;
        if (!inLogo(lx, ly)) continue;
        targets.push({ x: ox + c * CELL + CELL / 2, y: oy + r * CELL + CELL / 2 });
      }
    }

    function add(tx, ty, dust) {
      var a = scatterPoint(), b = scatterPoint();
      particles.push({
        tx: tx, ty: ty, ax: a.x, ay: a.y, bx: b.x, by: b.y,
        delay: Math.random() * 0.4,
        dust: dust,
        seed: Math.random() * Math.PI * 2,
        glyph: randGlyph()
      });
    }

    for (var t = 0; t < targets.length; t++) add(targets[t].x, targets[t].y, false);

    // Dust: a loose halo around the strokes.
    var dustCount = Math.round(targets.length * 0.45);
    for (var d = 0; d < dustCount; d++) {
      var base = targets[(Math.random() * targets.length) | 0];
      var spread = CELL * (1.5 + Math.random() * 4);
      add(base.x + gauss() * spread, base.y + gauss() * spread, true);
    }
  }

  var ART = { num: '#93a6c9', op: '#c9ab88', alt: '#9dbb9a' };

  function readColors() {
    var cs = getComputedStyle(root);
    var n = cs.getPropertyValue('--art-num').trim();
    var o = cs.getPropertyValue('--art-op').trim();
    var a = cs.getPropertyValue('--art-alt').trim();
    if (n) ART.num = n;
    if (o) ART.op = o;
    if (a) ART.alt = a;
  }

  readColors();
  window.__asciiRecolor = function () { readColors(); if (reduced) drawStill(); };

  function colorFor(g) {
    if (DIGITS.indexOf(g) !== -1) return ART.num;
    if (OPS.indexOf(g) !== -1) return ART.op;
    return ART.alt;
  }

  // Phase boundaries in milliseconds.
  var FADE_IN = 1400;
  var GATHER  = 4600;
  var HOLD    = 7200;
  var SCATTER = 10200;
  var LOOP    = 11800;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function draw(p, x, y, alpha) {
    var a = alpha * edgeFade(x, y);
    if (a <= 0.01) return;
    ctx.globalAlpha = a;
    ctx.fillStyle = colorFor(p.glyph);
    ctx.fillText(p.glyph, x, y);
  }

  function drawStill() {
    ctx.clearRect(0, 0, W, H);
    for (var k = 0; k < particles.length; k++) {
      var p = particles[k];
      draw(p, p.tx, p.ty, p.dust ? 0.35 : 1);
    }
    ctx.globalAlpha = 1;
  }

  build();

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      build();
      if (reduced) drawStill();
    }, 150);
  });

  if (reduced) { drawStill(); return; }

  var start = null;
  var cycle = 0;

  function frame(now) {
    if (start === null) start = now;
    var elapsed = now - start;
    var t = elapsed % LOOP;
    var thisCycle = Math.floor(elapsed / LOOP);

    // Fresh scatter positions every loop, so it never replays
    // the exact same dispersal.
    if (thisCycle !== cycle) {
      cycle = thisCycle;
      for (var i = 0; i < particles.length; i++) {
        var np = scatterPoint();
        particles[i].ax = particles[i].bx;
        particles[i].ay = particles[i].by;
        particles[i].bx = np.x;
        particles[i].by = np.y;
        particles[i].delay = Math.random() * 0.4;
      }
    }

    ctx.clearRect(0, 0, W, H);

    var settled = t >= GATHER && t < SCATTER;

    for (var q = 0; q < particles.length; q++) {
      var d = particles[q];
      var x, y, alpha;
      var peak = d.dust ? 0.4 : 1;

      if (t < FADE_IN) {
        x = d.ax; y = d.ay;
        alpha = (t / FADE_IN) * 0.7;
      } else if (t < GATHER) {
        var g = clamp01(((t - FADE_IN) / (GATHER - FADE_IN) - d.delay) / (1 - d.delay));
        var e = easeInOut(g);
        x = d.ax + (d.tx - d.ax) * e;
        y = d.ay + (d.ty - d.ay) * e;
        alpha = 0.7 + (peak - 0.7) * e;
      } else if (t < HOLD) {
        x = d.tx; y = d.ty;
        alpha = peak;
      } else if (t < SCATTER) {
        var s = clamp01(((t - HOLD) / (SCATTER - HOLD) - d.delay) / (1 - d.delay));
        var es = easeInOut(s);
        x = d.tx + (d.bx - d.tx) * es;
        y = d.ty + (d.by - d.ty) * es;
        alpha = peak + (0.7 - peak) * es;
      } else {
        x = d.bx; y = d.by;
        alpha = 0.7 * (1 - (t - SCATTER) / (LOOP - SCATTER));
      }

      // Dust drifts a little the whole time, so the edges of
      // the logo breathe instead of sitting as a hard outline.
      if (d.dust) {
        x += Math.cos(elapsed / 1400 + d.seed) * 3;
        y += Math.sin(elapsed / 1700 + d.seed) * 3;
      }

      // Characters churn while drifting and lock once
      // assembled. Dust keeps churning slowly.
      var churn = settled ? (d.dust ? 0.01 : 0) : 0.04;
      if (churn && Math.random() < churn) d.glyph = randGlyph();

      draw(d, x, y, alpha);
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

});
