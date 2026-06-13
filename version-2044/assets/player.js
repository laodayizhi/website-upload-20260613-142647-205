(function() {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    window.initHlsPlayer = function(videoId, source, coverId) {
        ready(function() {
            var video = document.getElementById(videoId);
            var cover = document.getElementById(coverId);
            if (!video || !source) {
                return;
            }
            var prepared = false;
            var hlsInstance = null;

            function prepare() {
                if (prepared) {
                    return;
                }
                prepared = true;
                video.controls = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function play() {
                prepare();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function() {
                        if (cover) {
                            cover.classList.remove("is-hidden");
                        }
                    });
                }
            }

            if (cover) {
                cover.addEventListener("click", play);
            }

            video.addEventListener("click", function() {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });

            window.addEventListener("pagehide", function() {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    };
})();
