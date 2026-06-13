(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    selectAll('[data-hero]').forEach(function (hero) {
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var index = 0;
        var timer;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var next = parseInt(dot.getAttribute('data-hero-dot'), 10) || 0;
                showSlide(next);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    });

    selectAll('[data-search-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-search-input]');
        var region = scope.querySelector('[data-filter-region]');
        var type = scope.querySelector('[data-filter-type]');
        var sort = scope.querySelector('[data-sort-control]');
        var grid = scope.querySelector('.sortable-grid');
        var cards = selectAll('[data-movie-card]', scope);

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilters() {
            var query = normalize(input && input.value);
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesRegion = !regionValue || card.getAttribute('data-region') === regionValue;
                var matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
                card.classList.toggle('is-hidden', !(matchesQuery && matchesRegion && matchesType));
            });
        }

        function applySort() {
            if (!sort || !grid) {
                return;
            }

            var value = sort.value;
            var sortedCards = cards.slice();

            if (value === 'year-desc') {
                sortedCards.sort(function (a, b) {
                    return parseInt(b.getAttribute('data-year'), 10) - parseInt(a.getAttribute('data-year'), 10);
                });
            }

            if (value === 'title-asc') {
                sortedCards.sort(function (a, b) {
                    return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
                });
            }

            sortedCards.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        [input, region, type].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilters);
                element.addEventListener('change', applyFilters);
            }
        });

        if (sort) {
            sort.addEventListener('change', function () {
                applySort();
                applyFilters();
            });
        }

        applyFilters();
    });

    selectAll('.player-card').forEach(function (card) {
        var video = card.querySelector('video');
        var source = video ? video.querySelector('source') : null;
        var cover = card.querySelector('.play-cover');
        var mediaUrl = source ? source.getAttribute('src') : '';
        var ready = false;
        var hlsInstance = null;

        function attachMedia() {
            if (!video || !mediaUrl || ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = mediaUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(mediaUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = mediaUrl;
            }

            ready = true;
        }

        function startPlayback() {
            attachMedia();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (video) {
                var playAction = video.play();
                if (playAction && typeof playAction.catch === 'function') {
                    playAction.catch(function () {});
                }
            }
        }

        if (cover) {
            cover.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });
            video.addEventListener('click', attachMedia, { once: true });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    });
})();
