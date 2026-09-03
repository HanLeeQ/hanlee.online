/* ==========================================================
   Han Connects
   1. theme toggle (lightbulb)
   2. copy email
   3. ascii logo animation
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
     3. ascii logo animation

     Target positions are derived from the logo's real
     geometry: two uprights plus the stepped crossbar,
     expressed in the same 0-100 space as favicon.svg. Each
     grid cell whose centre falls inside a stroke becomes a
     landing spot for one character.
     ------------------------------------------------------ */

  var canvas = document.getElementById('ascii');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');

  var COLS = 26;
  var ROWS = 26;
  var CELL = 15;
  var W = COLS * CELL;
  var H = ROWS * CELL;

  var GLYPHS = '0123456789|/\\-_=+'.split('');

  // Stroke rectangles in 0-100 logo space. Stroke width 11
  // means each centreline spreads 5.5 either side.
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

  function scatterX() { return Math.random() * W; }
  function scatterY() { return Math.random() * H; }

  var particles = [];

  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      var lx = (c / (COLS - 1)) * 100;
      var ly = (r / (ROWS - 1)) * 100;
      if (!inLogo(lx, ly)) continue;
      particles.push({
        tx: c * CELL + CELL / 2,
        ty: r * CELL + CELL / 2,
        ax: scatterX(),
        ay: scatterY(),
        bx: scatterX(),
        by: scatterY(),
        delay: Math.random() * 0.35,
        glyph: GLYPHS[(Math.random() * GLYPHS.length) | 0],
        seed: Math.random()
      });
    }
  }

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

  var artColor = '#cfccc0';

  function readColor() {
    var v = getComputedStyle(root).getPropertyValue('--art').trim();
    if (v) artColor = v;
  }

  readColor();
  window.__asciiRecolor = readColor;

  // Phase boundaries in milliseconds.
  var FADE_IN = 1200;
  var GATHER  = 3900;
  var HOLD    = 6300;
  var SCATTER = 8900;
  var LOOP    = 10200;

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    // Draw the assembled state once and stop.
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.fillStyle = artColor;
    for (var k = 0; k < particles.length; k++) {
      ctx.fillText(particles[k].glyph, particles[k].tx, particles[k].ty);
    }
    return;
  }

  var start = null;
  var cycle = 0;

  function frame(now) {
    if (start === null) start = now;
    var t = (now - start) % LOOP;
    var thisCycle = Math.floor((now - start) / LOOP);

    // New scatter positions each time the loop restarts, so it
    // never replays the exact same dispersal.
    if (thisCycle !== cycle) {
      cycle = thisCycle;
      for (var i = 0; i < particles.length; i++) {
        particles[i].ax = particles[i].bx;
        particles[i].ay = particles[i].by;
        particles[i].bx = scatterX();
        particles[i].by = scatterY();
        particles[i].delay = Math.random() * 0.35;
      }
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = artColor;

    var settled = t >= GATHER && t < SCATTER;

    for (var p = 0; p < particles.length; p++) {
      var d = particles[p];
      var x, y, alpha;

      if (t < FADE_IN) {
        x = d.ax; y = d.ay;
        alpha = (t / FADE_IN) * 0.9;
      } else if (t < GATHER) {
        var g = clamp01(((t - FADE_IN) / (GATHER - FADE_IN) - d.delay) /
                        (1 - d.delay));
        var e = easeInOut(g);
        x = d.ax + (d.tx - d.ax) * e;
        y = d.ay + (d.ty - d.ay) * e;
        alpha = 0.9;
      } else if (t < HOLD) {
        x = d.tx; y = d.ty;
        alpha = 1;
      } else if (t < SCATTER) {
        var s = clamp01(((t - HOLD) / (SCATTER - HOLD) - d.delay) /
                        (1 - d.delay));
        var es = easeInOut(s);
        x = d.tx + (d.bx - d.tx) * es;
        y = d.ty + (d.by - d.ty) * es;
        alpha = 0.9 - es * 0.35;
      } else {
        x = d.bx; y = d.by;
        alpha = 0.55 * (1 - (t - SCATTER) / (LOOP - SCATTER));
      }

      // Characters churn while drifting and lock once assembled.
      if (!settled && Math.random() < 0.04) {
        d.glyph = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }

      ctx.globalAlpha = alpha < 0 ? 0 : alpha;
      ctx.fillText(d.glyph, x, y);
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

});
