// Project 3 only. Progressive enhancement: the page reads the same without it.
(function () {
  // Scrubber: a slider over a strip of frames drives one large view.
  document.querySelectorAll('[data-scrub]').forEach(function (box) {
    var figs = Array.prototype.slice.call(box.querySelectorAll('.row figure'));
    var view = box.querySelector('.scrub-view img');
    var at = box.querySelector('.scrub-at');
    var input = box.querySelector('.scrub-range input');
    var ticks = box.querySelectorAll('.scrub-ticks span');
    if (!figs.length || !view || !input) return;
    function show(i) {
      var f = figs[i], img = f.querySelector('img');
      view.src = img.currentSrc || img.src;
      view.alt = img.alt;
      at.textContent = f.dataset.at;
      figs.forEach(function (g, j) { g.classList.toggle('on', j === i); });
      Array.prototype.forEach.call(ticks, function (s, j) { s.classList.toggle('on', j === i); });
      input.setAttribute('aria-valuetext', f.dataset.at);
    }
    input.addEventListener('input', function () { show(+input.value); });
    figs.forEach(function (f, i) {
      f.addEventListener('click', function () { input.value = i; show(i); });
    });
    box.classList.add('live');
    show(+input.value);
  });

  // Turn: tap or press to turn the anagram; hover turns it on a desktop.
  document.querySelectorAll('[data-turn]').forEach(function (fig) {
    var btn = fig.querySelector('.turn-stage');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var on = fig.classList.toggle('on');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  });

  // Walk away: one slider shrinks every hybrid in the figure the way distance does.
  document.querySelectorAll('[data-walk]').forEach(function (fig) {
    var frames = fig.querySelectorAll('.walk-frame');
    var input = fig.querySelector('input[type="range"]');
    var out = fig.querySelector('output');
    function set() {
      var d = parseFloat(input.value);
      Array.prototype.forEach.call(frames, function (f) { f.style.setProperty('--d', d); });
      out.textContent = (Math.round(d * 10) / 10) + '×';
    }
    input.addEventListener('input', set);
    set();
  });

  // Flipbook: plays frames of a sampling run from noise to digits, holds, and repeats.
  // Under reduced motion it stays on the last frame (the finished digits), as in print.
  document.querySelectorAll('[data-flip]').forEach(function (fig) {
    var img = fig.querySelector('img');
    var readout = fig.querySelector('.flip-t');
    var frames = (fig.dataset.frames || '').split(',');
    var ts = (fig.dataset.ts || '').split(',');
    if (!img || frames.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cache = frames.map(function (src) { var i = new Image(); i.src = src; return i; });
    var k = 0, step = 1000 / parseFloat(fig.dataset.fps || '8'), hold = parseFloat(fig.dataset.hold || '1800');
    function show(i) {
      img.src = cache[i].src;
      if (readout && ts[i]) readout.textContent = 't = ' + ts[i];
    }
    function tick() {
      show(k);
      var last = k === frames.length - 1;
      k = last ? 0 : k + 1;
      setTimeout(tick, last ? hold : k === 1 ? hold / 2 : step);
    }
    // Start once the picture is on screen, so the first thing seen is the noise.
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); tick(); }
    });
    io.observe(fig);
  });
})();
