(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function bindMobileMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
            button.textContent = expanded ? '☰' : '×';
        });
    }

    function bindHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dots button'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function buildSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<a class="movie-card" href="./' + escapeHtml(movie.file) + '">' +
                '<figure class="poster-box">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="movie-year">' + escapeHtml(movie.year) + '</span>' +
                '</figure>' +
                '<div class="movie-card-body">' +
                    '<h3>' + escapeHtml(movie.title) + '</h3>' +
                    '<p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>' +
                    '<p class="card-line">' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</a>';
    }

    function uniqueValues(items, field) {
        var values = [];
        var seen = Object.create(null);
        items.forEach(function (item) {
            var value = item[field] || '';
            if (value && !seen[value]) {
                seen[value] = true;
                values.push(value);
            }
        });
        return values.sort(function (a, b) {
            return String(a).localeCompare(String(b), 'zh-CN');
        });
    }

    function fillSelect(select, values, label) {
        if (!select) {
            return;
        }
        select.innerHTML = '<option value="">' + label + '</option>' + values.map(function (value) {
            return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
        }).join('');
    }

    function bindSearchPage() {
        var root = document.querySelector('[data-search-page]');
        if (!root || !window.MovieIndex) {
            return;
        }
        var input = root.querySelector('[name="q"]');
        var region = root.querySelector('[name="region"]');
        var type = root.querySelector('[name="type"]');
        var year = root.querySelector('[name="year"]');
        var results = root.querySelector('[data-search-results]');
        var status = root.querySelector('[data-search-status]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        fillSelect(region, uniqueValues(window.MovieIndex, 'region'), '全部地区');
        fillSelect(type, uniqueValues(window.MovieIndex, 'type'), '全部类型');
        fillSelect(year, uniqueValues(window.MovieIndex, 'year').sort(function (a, b) {
            return parseInt(b, 10) - parseInt(a, 10);
        }), '全部年份');

        if (input) {
            input.value = initialQuery;
        }

        function render() {
            var query = normalize(input && input.value);
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';
            var filtered = window.MovieIndex.filter(function (movie) {
                var text = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.oneLine,
                    (movie.tags || []).join(' ')
                ].join(' '));
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchRegion = !regionValue || movie.region === regionValue;
                var matchType = !typeValue || movie.type === typeValue;
                var matchYear = !yearValue || movie.year === yearValue;
                return matchQuery && matchRegion && matchType && matchYear;
            }).slice(0, 96);

            if (status) {
                if (filtered.length) {
                    status.textContent = '为你找到相关影片';
                } else {
                    status.textContent = '暂未找到匹配影片';
                }
            }
            if (results) {
                if (filtered.length) {
                    results.className = 'movie-grid';
                    results.innerHTML = filtered.map(buildSearchCard).join('');
                } else {
                    results.className = 'empty-state';
                    results.innerHTML = '<p>请尝试更换关键词、地区、类型或年份。</p>';
                }
            }
        }

        ['input', 'change'].forEach(function (eventName) {
            if (input) {
                input.addEventListener(eventName, render);
            }
            if (region) {
                region.addEventListener(eventName, render);
            }
            if (type) {
                type.addEventListener(eventName, render);
            }
            if (year) {
                year.addEventListener(eventName, render);
            }
        });

        var form = root.querySelector('form');
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                render();
            });
        }
        render();
    }

    window.initMoviePlayer = function (source) {
        var video = document.getElementById('video-player');
        var cover = document.getElementById('play-cover');
        if (!video || !cover || !source) {
            return;
        }
        var loaded = false;
        var started = false;
        var hls = null;

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        function loadSource() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (started) {
                        playVideo();
                    }
                });
            } else {
                video.src = source;
            }
        }

        function start() {
            started = true;
            loadSource();
            cover.classList.add('is-hidden');
            playVideo();
        }

        cover.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            cover.classList.add('is-hidden');
        });
        video.addEventListener('ended', function () {
            cover.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        bindMobileMenu();
        bindHero();
        bindSearchPage();
    });
})();
