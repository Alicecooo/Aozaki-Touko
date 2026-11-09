(() => {
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch { /* Preferences are optional. */ } };
  function disclosure(toggle, panel, focusTarget) {
    if (!toggle || !panel) return;
    function close(returnFocus = false) {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (returnFocus) toggle.focus();
    }
    toggle.addEventListener('click', () => {
      const opening = panel.hidden;
      panel.hidden = !opening;
      toggle.setAttribute('aria-expanded', String(opening));
      if (opening) {
        (focusTarget || panel.querySelector('button'))?.focus();
      }
    });
    document.addEventListener('pointerdown', event => {
      if (!panel.hidden && !panel.contains(event.target) && !toggle.contains(event.target)) close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); close(true); }
    });
    return close;
  }

  const tools = document.querySelector('.kb-reading-tools');
  if (tools) {
    const allowed = ['plain', 'grid', 'dusk', 'paper'];
    const key = `article-background:${location.pathname}`;
    const fallback = allowed.includes(tools.dataset.defaultBackground) ? tools.dataset.defaultBackground : 'plain';
    const apply = value => {
      const background = allowed.includes(value) ? value : fallback;
      document.documentElement.dataset.articleBackground = background;
      tools.querySelectorAll('[data-background]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.background === background)));
    };
    apply(read(key));
    tools.querySelectorAll('[data-background]').forEach(button => button.addEventListener('click', () => {
      write(key, button.dataset.background); apply(button.dataset.background);
    }));
    tools.querySelector('.kb-background-reset').addEventListener('click', () => { write(key, null); apply(fallback); });
    disclosure(document.getElementById('kb-background-toggle'), document.getElementById('kb-background-menu'));
  }

})();
