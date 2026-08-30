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

  // Stages: <div class="stage" data-stage data-hold="0.6" data-loop="pingpong"
  //           data-fallback="x.gif" data-poster="x.jpg" data-duration="6.25">
  // Drives the stage's .barrel index from the video clock, swaps in the
  // fallback GIF if the video cannot play, exposes a pause/play control
  // (WCAG 2.2.2) and starts paused under prefers-reduced-motion.
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-stage]').forEach(function (stage) {
    var video = stage.querySelector('video');
    var ring = stage.querySelector('.barrel');
    var index = ring && ring.querySelector('.index');
    var toggle = stage.querySelector('.stage-toggle');
    if (!video) return;
    var hold = parseFloat(stage.dataset.hold || '0');
    var mode = stage.dataset.loop || 'pingpong';
    var playing = !reduceMotion;
    var swapped = false, img = null;

    function setToggle() {
      if (!toggle) return;
      toggle.hidden = false;
      toggle.textContent = playing ? 'Pause' : 'Play';
      toggle.setAttribute('aria-pressed', playing ? 'true' : 'false');
    }

    // pingpong: out (move), hold, back (move), hold
    function at(t, dur) {
      if (!dur) return 0;
      if (mode === 'linear') return t / dur;
      var move = (dur - 2 * hold) / 2;
      if (t < move) return t / move;
      if (t < move + hold) return 1;
      if (t < 2 * move + hold) return 1 - (t - move - hold) / move;
      return 0;
    }
    function tick() {
      if (index && video.duration && !swapped) index.style.setProperty('--at', at(video.currentTime, video.duration).toFixed(4));
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(tick);
      else requestAnimationFrame(tick);
    }
    tick();

    function useFallback() {
      if (swapped || !stage.dataset.fallback) return;
      swapped = true;
      img = document.createElement('img');
      img.alt = video.getAttribute('aria-label') || '';
      img.width = video.width; img.height = video.height;
      video.replaceWith(img);
      if (ring && stage.dataset.duration) ring.style.setProperty('--loop', stage.dataset.duration + 's');
      if (index) index.style.removeProperty('--at');
      applyState();
    }
    function applyState() {
      if (swapped) {
        // GIF fallback: "pause" means showing the poster and stopping the ring
        img.src = playing || !stage.dataset.poster ? stage.dataset.fallback : stage.dataset.poster;
        if (ring) ring.classList.toggle('barrel-freerun', playing);
      } else if (playing) {
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        video.pause();
      }
      setToggle();
    }
    if (toggle) toggle.addEventListener('click', function () { playing = !playing; applyState(); });

    // Fall back on a real error, or if nothing has arrived at all after a while
    // (a slow connection that is still downloading keeps the video).
    video.addEventListener('error', useFallback);
    var guard = setTimeout(function () {
      var stalled = video.readyState === 0 && video.networkState !== 2; // 2 = NETWORK_LOADING
      if (playing && stalled) useFallback();
    }, 8000);
    video.addEventListener('playing', function () { clearTimeout(guard); }, { once: true });
    if (reduceMotion) video.removeAttribute('autoplay');
    applyState();
  });
})();
