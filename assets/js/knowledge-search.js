(() => {
  const root = document.getElementById('kb-search');
  if (!root) return;
  const form = document.getElementById('kb-search-form');
  const queryField = document.getElementById('kb-query');
  const results = document.getElementById('kb-search-results');
  const status = document.getElementById('kb-search-status');
  const pagination = document.getElementById('kb-search-pagination');
  const normalize = value => String(value).normalize('NFKC').toLocaleLowerCase();
  const size = 12;
  let items, loading, timer, page = 1;
  const node = (tag, text, className) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  };
  const message = text => { status.textContent = text; status.hidden = !text; };
  function syncURL() {
    const params = new URLSearchParams();
    if (queryField.value.trim()) params.set('q', queryField.value.trim());
    if (page > 1) params.set('page', page);
    history.replaceState(null, '', location.pathname + (params.size ? '?' + params : ''));
  }
  async function loadIndex() {
    if (items) return;
    if (!loading) loading = fetch(root.dataset.index).then(response => {
      if (!response.ok) throw new Error('Search index unavailable');
      return response.json();
    }).then(index => {
      items = index.items.map(item => ({...item,
        normalTitle: normalize(item.title),
        normalContent: normalize(item.content),
        searchText: normalize([item.title, item.summary, item.content, ...item.tags, ...item.topics.map(topic => topic.title)].join(' '))
      }));
    }).finally(() => { loading = null; });
    await loading;
  }
  async function render(sync = true) {
    const query = normalize(queryField.value.trim());
    results.replaceChildren(); pagination.replaceChildren();
    if (!query) { page = 1; message(''); results.setAttribute('aria-busy', 'false'); if (sync) syncURL(); return; }
    if (!items) {
      message('搜索中…'); results.setAttribute('aria-busy', 'true');
      try { await loadIndex(); } catch {
        if (queryField.value.trim()) message('暂时无法搜索，请重试。');
        results.setAttribute('aria-busy', 'false'); return;
      }
      results.setAttribute('aria-busy', 'false');
      return render(sync);
    }
    const words = query.split(/\s+/u).filter(Boolean);
    const matches = items.filter(item => words.every(word => item.searchText.includes(word))).map(item => ({item, score: words.reduce((sum, word) => sum + (item.normalTitle.includes(word) ? 10 : 0), 0)}));
    matches.sort((a, b) => b.score - a.score || b.item.updated.localeCompare(a.item.updated) || a.item.url.localeCompare(b.item.url));
    const total = Math.max(1, Math.ceil(matches.length / size));
    page = Math.min(page, total);
    if (sync) syncURL();
    message(matches.length ? `${matches.length} 篇文章` : '没有找到相关文章。');
    for (const {item} of matches.slice((page - 1) * size, page * size)) {
      const row = node('article', undefined, 'kb-row');
      const body = node('div');
      const heading = node('h2');
      const link = node('a', item.title); link.href = item.url; heading.append(link);
      let snippet = item.summary;
      if (!normalize(snippet).includes(words[0])) {
        const offset = item.normalContent.indexOf(words[0]);
        if (offset >= 0) snippet = '…' + item.content.slice(Math.max(0, offset - 30), offset + 110) + '…';
      }
      body.append(heading, node('p', snippet)); row.append(body); results.append(row);
    }
    if (total > 1) {
      const button = (label, target) => {
        const el = node('button', label); el.type = 'button';
        el.addEventListener('click', () => { page = target; render(); form.scrollIntoView({block: 'start'}); });
        return el;
      };
      if (page > 1) pagination.append(button('上一页', page - 1));
      pagination.append(node('span', `${page} / ${total}`));
      if (page < total) pagination.append(button('下一页', page + 1));
    }
  }
  const update = () => { page = 1; render(); };
  form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); update(); });
  queryField.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(update, 180); });
  function restore() {
    const params = new URLSearchParams(location.search);
    queryField.value = params.get('q') || '';
    page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
    render(false);
  }
  window.addEventListener('popstate', restore);
  restore();
})();
