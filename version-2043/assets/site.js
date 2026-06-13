(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function cardHtml(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"play-dot\">▶</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
            "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p>" + escapeHtml(movie.oneLine || "") + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var active = 0;
            var show = function (index) {
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === active);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === active);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            if (slides.length > 1) {
                setInterval(function () {
                    show(active + 1);
                }, 5600);
            }
        }

        var filterScope = document.querySelector("[data-filter-scope]");
        var filterList = document.querySelector("[data-filter-list]");
        if (filterScope && filterList) {
            var input = filterScope.querySelector("[data-filter-input]");
            var selects = Array.prototype.slice.call(filterScope.querySelectorAll("[data-filter-select]"));
            var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));
            var empty = document.createElement("div");
            empty.className = "empty-state is-hidden";
            empty.textContent = "没有找到匹配的影片";
            filterList.appendChild(empty);
            var applyFilter = function () {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var shown = 0;
                cards.forEach(function (card) {
                    var text = ["title", "region", "type", "year", "genre", "tags"].map(function (key) {
                        return (card.getAttribute("data-" + key) || "").toLowerCase();
                    }).join(" ");
                    var ok = !keyword || text.indexOf(keyword) !== -1;
                    selects.forEach(function (select) {
                        var key = select.getAttribute("data-filter-select");
                        var value = select.value;
                        if (value && (card.getAttribute("data-" + key) || "") !== value) {
                            ok = false;
                        }
                    });
                    card.classList.toggle("is-hidden", !ok);
                    if (ok) {
                        shown += 1;
                    }
                });
                empty.classList.toggle("is-hidden", shown !== 0);
            };
            if (input) {
                input.addEventListener("input", applyFilter);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", applyFilter);
            });
        }

        var results = document.querySelector("[data-search-results]");
        if (results && window.MovieSearchIndex) {
            var params = new URLSearchParams(window.location.search);
            var q = (params.get("q") || "").trim().toLowerCase();
            var title = document.querySelector("[data-search-title]");
            var matches = window.MovieSearchIndex.filter(function (movie) {
                if (!q) {
                    return true;
                }
                var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
                return text.indexOf(q) !== -1;
            }).slice(0, 96);
            if (title) {
                title.textContent = q ? "搜索结果：" + params.get("q") : "推荐影片";
            }
            results.innerHTML = matches.length ? matches.map(cardHtml).join("") : "<div class=\"empty-state\">没有找到匹配的影片</div>";
            var searchInputs = document.querySelectorAll("input[name='q']");
            searchInputs.forEach(function (input) {
                input.value = params.get("q") || "";
            });
        }
    });
})();
