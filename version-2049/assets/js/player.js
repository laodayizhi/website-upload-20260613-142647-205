(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.getElementById('moviePlayer');
    var overlay = document.querySelector('[data-play-overlay]');
    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared || !stream) {
        return;
      }
      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return;
      }

      video.src = stream;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function showOverlay() {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    }

    function playVideo() {
      prepare();
      hideOverlay();
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          showOverlay();
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('ended', showOverlay);

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
