(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-menu]");
        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            var isOpen = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var container = document.querySelector("[data-card-container]");
        if (!panel || !container) {
            return;
        }

        var input = panel.querySelector("[data-filter-input]");
        var regionSelect = panel.querySelector("[data-filter-region]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var sortSelect = panel.querySelector("[data-filter-sort]");
        var count = panel.querySelector("[data-filter-count]");
        var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));

        if (input) {
            input.value = getQueryValue("q");
        }

        function applyFilters() {
            var keyword = normalize(input ? input.value : "");
            var region = regionSelect ? regionSelect.value : "all";
            var type = typeSelect ? typeSelect.value : "all";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.tags,
                    card.querySelector("p") ? card.querySelector("p").textContent : ""
                ].join(" "));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchRegion = region === "all" || card.dataset.region === region;
                var matchType = type === "all" || card.dataset.type === type;
                var show = matchKeyword && matchRegion && matchType;
                card.classList.toggle("is-hidden", !show);
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + " 部影片";
            }
        }

        function applySort() {
            if (!sortSelect) {
                return;
            }
            var mode = sortSelect.value;
            var sorted = cards.slice();
            sorted.sort(function (a, b) {
                if (mode === "year") {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                }
                if (mode === "rating") {
                    return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                }
                if (mode === "views") {
                    return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                }
                return 0;
            });
            sorted.forEach(function (card) {
                container.appendChild(card);
            });
        }

        [input, regionSelect, typeSelect].forEach(function (element) {
            if (element) {
                element.addEventListener("input", applyFilters);
                element.addEventListener("change", applyFilters);
            }
        });

        if (sortSelect) {
            sortSelect.addEventListener("change", function () {
                applySort();
                applyFilters();
            });
        }

        applySort();
        applyFilters();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".video-player[data-video-src]"));
        players.forEach(function (video) {
            var source = video.getAttribute("data-video-src");
            var shell = video.closest(".video-shell");
            var button = shell ? shell.querySelector("[data-play-button]") : null;
            var initialized = false;
            var hlsInstance = null;

            function initialize() {
                if (initialized || !source) {
                    return;
                }
                initialized = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function play() {
                initialize();
                if (button) {
                    button.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }

            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });

            video.addEventListener("pause", function () {
                if (!video.ended && button) {
                    button.classList.remove("is-hidden");
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupFilters();
        setupPlayers();
    });
})();
