(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function getPrefix() {
    return document.body.getAttribute('data-root-prefix') || './';
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var holder = document.querySelector('[data-hero-carousel]');
    if (!holder) {
      return;
    }
    var slides = Array.prototype.slice.call(holder.querySelectorAll('[data-hero-slide]'));
    var nextButton = holder.querySelector('[data-hero-next]');
    var prevButton = holder.querySelector('[data-hero-prev]');
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      slides[index].classList.remove('is-active');
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add('is-active');
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    holder.addEventListener('mouseenter', stop);
    holder.addEventListener('mouseleave', start);
    start();
  }

  function setupGlobalSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
    var movies = Array.isArray(window.SITE_SEARCH_MOVIES) ? window.SITE_SEARCH_MOVIES : [];
    var prefix = getPrefix();

    forms.forEach(function (form) {
      var input = form.querySelector('[data-search-input]');
      var suggest = form.querySelector('[data-search-suggest]');
      if (!input) {
        return;
      }

      function closeSuggest() {
        if (suggest) {
          suggest.classList.remove('is-open');
          suggest.innerHTML = '';
        }
      }

      function openSuggest(items) {
        if (!suggest) {
          return;
        }
        if (!items.length) {
          closeSuggest();
          return;
        }
        suggest.innerHTML = items.map(function (item) {
          return '<a href="' + prefix + item.url + '"><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.type + ' · ' + item.category + '</span></a>';
        }).join('');
        suggest.classList.add('is-open');
      }

      input.addEventListener('input', function () {
        var q = normalize(input.value);
        if (!q) {
          closeSuggest();
          return;
        }
        var matches = movies.filter(function (item) {
          return normalize(item.title + ' ' + item.year + ' ' + item.type + ' ' + item.region + ' ' + item.tags).indexOf(q) !== -1;
        }).slice(0, 8);
        openSuggest(matches);
      });

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var q = input.value.trim();
        if (!q) {
          closeSuggest();
          return;
        }
        window.location.href = prefix + 'search.html?q=' + encodeURIComponent(q);
      });

      document.addEventListener('click', function (event) {
        if (!form.contains(event.target)) {
          closeSuggest();
        }
      });
    });
  }

  function setupLocalFilters() {
    var areas = Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]'));
    areas.forEach(function (area) {
      var container = area.parentElement;
      var cards = Array.prototype.slice.call(container.querySelectorAll('[data-movie-card]'));
      var input = area.querySelector('[data-local-search]');
      var typeSelect = area.querySelector('[data-filter-type]');
      var yearSelect = area.querySelector('[data-filter-year]');
      var empty = container.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';

      if (input && query) {
        input.value = query;
      }

      function apply() {
        var q = normalize(input ? input.value : '');
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-type') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-tags'));
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (type && card.getAttribute('data-type') !== type) {
            ok = false;
          }
          if (year && card.getAttribute('data-year') !== year) {
            ok = false;
          }
          card.classList.toggle('is-hidden', !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
      apply();
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupGlobalSearch();
    setupLocalFilters();
  });
})();
