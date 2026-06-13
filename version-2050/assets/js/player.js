import { H as Hls } from './hls-dru42stk.js';

function startPlayer(frame) {
  const video = frame.querySelector('video[data-m3u8]');
  const button = frame.querySelector('.player-start');

  if (!video || video.dataset.started === 'true') {
    return;
  }

  const source = video.dataset.m3u8;
  video.dataset.started = 'true';

  if (button) {
    button.classList.add('hidden');
  }

  if (window.__activeHlsPlayer && window.__activeHlsPlayer.destroy) {
    window.__activeHlsPlayer.destroy();
    window.__activeHlsPlayer = null;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    window.__activeHlsPlayer = hls;
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play().catch(function () {});
    });
    hls.on(Hls.Events.ERROR, function (eventName, data) {
      if (data && data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        hls.destroy();
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.addEventListener('loadedmetadata', function () {
      video.play().catch(function () {});
    }, { once: true });
  } else {
    video.src = source;
    video.play().catch(function () {});
  }
}

document.querySelectorAll('.video-frame').forEach(function (frame) {
  const button = frame.querySelector('.player-start');

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      startPlayer(frame);
    });
  }

  frame.addEventListener('click', function (event) {
    if (event.target && event.target.tagName === 'VIDEO') {
      return;
    }
    startPlayer(frame);
  });
});
