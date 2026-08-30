// CS 280A shared behaviour. Progressive enhancement only: every page
// reads correctly with this file missing.
(function () {
  // Wipe comparators: <figure class="wipe" data-wipe> with a .wipe-frame and a range input.
  document.querySelectorAll('[data-wipe]').forEach(function (fig) {
    var frame = fig.querySelector('.wipe-frame');
    var input = fig.querySelector('input[type="range"]');
    if (!frame || !input) return;
    var set = function () { frame.style.setProperty('--pos', input.value + '%'); };
    input.addEventListener('input', set);
    set();
  });

  // Stages: <div class="stage" data-stage data-hold="0.6" data-loop="pingpong" data-fallback="x.gif">
  // Drives the stage's .barrel index from the video clock and swaps in the
  // fallback image if the video cannot play.
  document.querySelectorAll('[data-stage]').forEach(function (stage) {
    var video = stage.querySelector('video');
    var ring = stage.querySelector('.barrel');
    if (!video) return;
    var hold = parseFloat(stage.dataset.hold || '0');
    var mode = stage.dataset.loop || 'pingpong';

    function at(t, dur) {
      if (!dur) return 0;
      if (mode === 'linear') return t / dur;
      var half = dur / 2, move = half - hold;
      if (t < half) return Math.min(t / move, 1);
      var r = t - half;
      return r < hold ? 1 : Math.max(1 - (r - hold) / move, 0);
    }
    function tick() {
      if (ring && video.duration) ring.style.setProperty('--at', at(video.currentTime, video.duration).toFixed(4));
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(tick);
      else requestAnimationFrame(tick);
    }
    tick();

    var swapped = false;
    function useFallback() {
      if (swapped || !stage.dataset.fallback) return;
      swapped = true;
      var img = document.createElement('img');
      img.src = stage.dataset.fallback;
      img.alt = video.getAttribute('aria-label') || '';
      video.replaceWith(img);
      if (ring) {
        ring.classList.add('barrel-freerun');
        if (stage.dataset.duration) ring.style.setProperty('--loop', stage.dataset.duration + 's');
      }
    }
    video.addEventListener('error', useFallback);
    var guard = setTimeout(function () { if (video.readyState < 2) useFallback(); }, 5000);
    video.addEventListener('playing', function () { clearTimeout(guard); }, { once: true });
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  });
})();
