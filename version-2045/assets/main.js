(function () {
    var menuButton = document.querySelector('[data-mobile-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var currentIndex = 0;

        function showSlide(index) {
            currentIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === currentIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === currentIndex);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(currentIndex + 1);
            }, 5200);
        }
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('[data-search-input]');
            var value = input ? input.value.trim() : '';
            var target = './search.html';
            if (value) {
                target += '?q=' + encodeURIComponent(value);
            }
            window.location.href = target;
        });
    });

    var queryValue = '';
    try {
        queryValue = new URLSearchParams(window.location.search).get('q') || '';
    } catch (error) {
        queryValue = '';
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('.filter-input');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
        var emptyState = document.querySelector('[data-empty-state]');

        if (!input || cards.length === 0) {
            return;
        }

        if (queryValue && !input.value) {
            input.value = queryValue;
        }

        function applyFilter() {
            var value = input.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
                var matched = !value || keywords.indexOf(value) !== -1;
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-active', visible === 0);
            }
        }

        input.addEventListener('input', applyFilter);
        applyFilter();
    });
})();
