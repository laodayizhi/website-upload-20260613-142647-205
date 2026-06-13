(function () {
  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();
  const input = document.querySelector('[data-search-input]');
  const title = document.querySelector('[data-search-title]');
  const results = document.querySelector('[data-search-results]');
  const index = window.MOVIE_SEARCH_INDEX || [];

  if (input) {
    input.value = query;
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function render(items, keyword) {
    if (!results) {
      return;
    }

    if (!keyword) {
      items = index.slice(0, 36);
    }

    if (title) {
      title.textContent = keyword ? '搜索：' + keyword : '热门影片搜索';
    }

    if (!items.length) {
      results.innerHTML = '<div class="empty-state">没有找到相关影片，换一个关键词再试试。</div>';
      return;
    }

    results.innerHTML = items.slice(0, 120).map(function (item) {
      const tags = (item.tags || []).slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<a class="search-card" href="' + item.url + '">' +
        '<span class="search-cover media-bg" style="--cover: url(\'' + item.cover + '\');"></span>' +
        '<span>' +
          '<h2>' + escapeHtml(item.title) + '</h2>' +
          '<p>' + escapeHtml(item.oneLine) + '</p>' +
          '<span class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.category) + '</span></span>' +
          '<span class="tag-row">' + tags + '</span>' +
        '</span>' +
      '</a>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function search(keyword) {
    const normalizedKeyword = normalize(keyword);
    if (!normalizedKeyword) {
      return index.slice(0, 36);
    }

    return index.filter(function (item) {
      const text = normalize([
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        item.category,
        item.oneLine,
        (item.tags || []).join(' ')
      ].join(' '));
      return text.includes(normalizedKeyword);
    });
  }

  render(search(query), query);

  const form = document.querySelector('[data-search-form]');
  if (form && input) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const keyword = input.value.trim();
      const nextUrl = keyword ? './search.html?q=' + encodeURIComponent(keyword) : './search.html';
      window.location.href = nextUrl;
    });
  }
})();
