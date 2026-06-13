(function () {
    function initPlayer(root) {
        var video = root.querySelector('video');
        var button = root.querySelector('[data-play-trigger]');
        var cover = root.querySelector('[data-player-cover]');

        if (!video || !button) {
            return;
        }

        var streamUrl = video.getAttribute('data-stream-url');
        var loaded = false;
        var hlsInstance = null;

        function hideCover() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        }

        function showCover() {
            if (cover) {
                cover.classList.remove('is-hidden');
            }
        }

        function loadStream() {
            if (loaded || !streamUrl) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            }

            loaded = true;
        }

        function playVideo() {
            loadStream();
            hideCover();

            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    showCover();
                });
            }
        }

        button.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', hideCover);

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(initPlayer);
})();
