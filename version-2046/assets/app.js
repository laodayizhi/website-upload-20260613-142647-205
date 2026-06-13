(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function textOf(element) {
        return (element.textContent || '').toLowerCase();
    }

    function bindNavigation() {
        var button = document.querySelector('.nav-toggle');
        var menu = document.querySelector('.mobile-menu');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('is-open');
            });
        });
    }

    function bindHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var prev = carousel.querySelector('.hero-prev');
        var next = carousel.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        restart();
    }

    function bindSearchAndFilters() {
        var input = document.querySelector('.search-input');
        var year = document.querySelector('.filter-year');
        var region = document.querySelector('.filter-region');
        var sort = document.querySelector('.sort-select');
        var scopes = Array.prototype.slice.call(document.querySelectorAll('.search-scope'));

        function getItems() {
            return Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-item'));
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var regionValue = region ? region.value : '';
            getItems().forEach(function (item) {
                var haystack = [
                    textOf(item),
                    (item.getAttribute('data-title') || '').toLowerCase(),
                    (item.getAttribute('data-genre') || '').toLowerCase(),
                    (item.getAttribute('data-region') || '').toLowerCase(),
                    item.getAttribute('data-year') || ''
                ].join(' ');
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedYear = !yearValue || item.getAttribute('data-year') === yearValue;
                var matchedRegion = !regionValue || item.getAttribute('data-region') === regionValue;
                item.classList.toggle('is-filtered-out', !(matchedQuery && matchedYear && matchedRegion));
            });
        }

        function sortItems() {
            if (!sort) {
                return;
            }
            var mode = sort.value;
            scopes.forEach(function (scope) {
                var items = Array.prototype.slice.call(scope.children);
                items.sort(function (a, b) {
                    if (mode === 'latest') {
                        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                    }
                    if (mode === 'title') {
                        return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                    }
                    return 0;
                });
                items.forEach(function (item) {
                    scope.appendChild(item);
                });
            });
            apply();
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (year) {
            year.addEventListener('change', apply);
        }
        if (region) {
            region.addEventListener('change', apply);
        }
        if (sort) {
            sort.addEventListener('change', sortItems);
        }
    }

    window.bindMoviePlayer = function (source) {
        var video = document.getElementById('moviePlayer');
        var overlay = document.querySelector('.player-overlay');
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
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

        function start() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        bindNavigation();
        bindHero();
        bindSearchAndFilters();
    });
}());
