(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = $('[data-menu-toggle]');
    var nav = $('[data-main-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    var carousel = $('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = $all('[data-hero-slide]', carousel);
    var dots = $all('[data-hero-dot]', carousel);
    var prev = $('[data-hero-prev]', carousel);
    var next = $('[data-hero-next]', carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5500);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupLocalFilters() {
    $all('[data-filter-input]').forEach(function (input) {
      var section = input.closest('section') || document;
      var list = $('[data-filter-list]', section) || document;
      var cards = $all('[data-search]', list);
      var count = $('[data-filter-count]', section);

      function applyFilter() {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          card.classList.toggle('is-hidden-card', !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = visible + ' 部影片';
        }
      }

      input.addEventListener('input', applyFilter);
      applyFilter();
    });
  }

  function setupGlobalSearchForms() {
    $all('[data-global-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = form.getAttribute('action') || 'search.html';
        }
      });
    });
  }

  function movieCardTemplate(movie) {
    var cover = movie.cover + '.jpg';
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="movies/' + movie.file + '">',
      '    <img src="' + cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="play-pill">立即播放</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '    <h3><a href="movies/' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var form = $('[data-search-page-form]');
    var results = $('[data-search-results]');
    var summary = $('[data-search-summary]');
    var fallback = $('[data-search-fallback]');
    if (!form || !results || !summary || !window.SEARCH_DATA) {
      return;
    }

    var input = form.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function render(query) {
      var keyword = query.trim().toLowerCase();
      if (!keyword) {
        results.innerHTML = '';
        summary.textContent = '输入关键词后显示搜索结果。';
        if (fallback) {
          fallback.style.display = '';
        }
        return;
      }

      var matched = window.SEARCH_DATA.filter(function (movie) {
        return movie.search.indexOf(keyword) !== -1;
      }).slice(0, 240);

      results.innerHTML = matched.map(movieCardTemplate).join('');
      summary.textContent = '找到 ' + matched.length + ' 条相关结果' + (matched.length === 240 ? '，可继续输入更精准关键词。' : '。');
      if (fallback) {
        fallback.style.display = 'none';
      }
    }

    if (input) {
      input.value = initialQuery;
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input ? input.value : '');
    });

    render(initialQuery);
  }

  function setupPlayers() {
    $all('.player-shell').forEach(function (shell) {
      var button = $('[data-player-start]', shell);
      var stage = $('.player-stage', shell);
      var status = $('[data-player-status]', shell);
      var video = $('video', shell);
      var source = shell.getAttribute('data-video');
      var hlsInstance = null;
      var started = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function playVideo() {
        if (!video || !source) {
          setStatus('当前影片播放源暂不可用。');
          return;
        }
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        if (button) {
          button.classList.add('is-hidden');
        }
        setStatus('正在初始化播放源，请稍候。');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源已就绪。');
            video.play().catch(function () {
              setStatus('播放源已就绪，请再次点击播放按钮。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setStatus('播放加载遇到网络或浏览器限制，请刷新后重试。');
              if (hlsInstance) {
                hlsInstance.destroy();
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setStatus('播放源已就绪。');
            video.play().catch(function () {
              setStatus('播放源已就绪，请再次点击播放按钮。');
            });
          }, { once: true });
        } else {
          video.src = source;
          video.play().then(function () {
            setStatus('正在播放。');
          }).catch(function () {
            setStatus('当前浏览器可能需要启用 HLS 支持后播放。');
          });
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.stopPropagation();
          playVideo();
        });
      }
      if (stage) {
        stage.addEventListener('click', playVideo);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupLocalFilters();
    setupGlobalSearchForms();
    setupSearchPage();
    setupPlayers();
  });
}());
