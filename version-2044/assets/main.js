(function() {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var button = document.querySelector(".js-menu-toggle");
        var panel = document.querySelector(".js-mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function() {
            var open = panel.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", open);
        });
    }

    function initSearchForms() {
        var forms = document.querySelectorAll(".js-search-form");
        forms.forEach(function(form) {
            form.addEventListener("submit", function(event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "search.html";
                }
            });
        });
    }

    function initHero() {
        var hero = document.querySelector(".js-hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                show(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function initSearchPage() {
        var input = document.getElementById("pageSearchInput");
        var results = document.querySelector(".js-search-results");
        var count = document.getElementById("searchCount");
        if (!input || !results) {
            return;
        }
        var cards = Array.prototype.slice.call(results.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;

        function apply(value) {
            var keywords = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
            var shown = 0;
            cards.forEach(function(card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var match = keywords.length === 0 || keywords.every(function(word) {
                    return haystack.indexOf(word) !== -1;
                });
                card.classList.toggle("is-hidden-by-search", !match);
                if (match) {
                    shown += 1;
                }
            });
            if (count) {
                count.textContent = keywords.length === 0 ? "全部影片" : "找到 " + shown + " 部相关影片";
            }
        }

        input.addEventListener("input", function() {
            apply(input.value);
        });

        apply(query);
    }

    ready(function() {
        initMenu();
        initSearchForms();
        initHero();
        initSearchPage();
    });
})();
