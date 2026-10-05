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
})();
