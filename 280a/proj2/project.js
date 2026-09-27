// Project 2 only. Progressive enhancement: the page reads the same without it.
(function () {
  // Walk away from a hybrid: shrink it by the chosen distance, switch between hybrids.
  document.querySelectorAll('[data-walk]').forEach(function (fig) {
    var frame = fig.querySelector('.walk-frame');
    var img = frame.querySelector('img');
    var input = fig.querySelector('input[type="range"]');
    var out = fig.querySelector('output');
    var buttons = fig.querySelectorAll('.walk-pick button');
    function set() {
      var d = parseFloat(input.value);
      frame.style.setProperty('--d', d);
      out.textContent = (Math.round(d * 10) / 10) + '×';
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        buttons.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        img.src = b.dataset.src;
        img.width = +b.dataset.w; img.height = +b.dataset.h;
        img.alt = b.dataset.alt + ', shrunk to simulate stepping back';
        frame.style.setProperty('--ar', b.dataset.w + ' / ' + b.dataset.h);
      });
    });
    input.addEventListener('input', set);
    set();
  });

  // Chart hover: a crosshair and the value at the nearest alpha.
  document.querySelectorAll('[data-chart]').forEach(function (fig) {
    var svg = fig.querySelector('svg');
    var hit = svg.querySelector('.hit');
    var hover = svg.querySelector('.hover');
    var tip = fig.querySelector('.chart-tip');
    if (!hit || !hover || !tip) return;
    var ds = hit.dataset;
    var r = ds.range.split(' ').map(Number);           // alpha min, alpha max, value min, value max
    var pts = ds.points.split(' ').map(function (p) { var a = p.split(':'); return [+a[0], +a[1]]; });
    var X = function (a) { return +ds.x0 + (a - r[0]) / (r[1] - r[0]) * (ds.x1 - ds.x0); };
    var Y = function (v) { return +ds.y0 + (r[3] - v) / (r[3] - r[2]) * (ds.y1 - ds.y0); };
    var line = hover.querySelector('line'), dot = hover.querySelector('circle');
    function show(e) {
      var ctm = svg.getScreenCTM();
      if (!ctm) return;
      var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      var x = p.matrixTransform(ctm.inverse()).x;
      var best = pts.reduce(function (b, q) { return Math.abs(X(q[0]) - x) < Math.abs(X(b[0]) - x) ? q : b; });
      var px = X(best[0]), py = Y(best[1]);
      line.setAttribute('x1', px); line.setAttribute('x2', px);
      dot.setAttribute('cx', px); dot.setAttribute('cy', py);
      hover.classList.add('on');
      var s = svg.createSVGPoint(); s.x = px; s.y = py;
      var at = s.matrixTransform(ctm), box = fig.getBoundingClientRect();
      tip.style.left = (at.x - box.left) + 'px';
      tip.style.top = (at.y - box.top) + 'px';
      tip.textContent = 'α = ' + best[0] + ' · RMS error ' + best[1].toFixed(4);
      tip.hidden = false;
    }
    function hide() { hover.classList.remove('on'); tip.hidden = true; }
    hit.addEventListener('pointermove', show);
    hit.addEventListener('pointerleave', hide);
  });
})();
