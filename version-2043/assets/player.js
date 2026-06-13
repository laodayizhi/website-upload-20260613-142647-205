(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        document.querySelectorAll(".movie-player").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".player-start");
            var src = player.getAttribute("data-play");
            var hls = null;
            var attached = false;
            var pendingPlay = false;

            function requestPlay() {
                player.classList.add("is-playing");
                video.controls = true;
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {});
                }
            }

            function attach() {
                if (attached || !src) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (pendingPlay) {
                            requestPlay();
                        }
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal && hls) {
                            hls.destroy();
                            hls = null;
                            attached = false;
                        }
                    });
                    return;
                }
                video.src = src;
            }

            function play() {
                pendingPlay = true;
                attach();
                requestPlay();
            }

            if (button) {
                button.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    if (!video.ended) {
                        player.classList.remove("is-playing");
                    }
                });
            }
        });
    });
})();
