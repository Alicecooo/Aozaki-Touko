(() => {
  const drawer = document.querySelector('.kb-toc-drawer');
  if (!drawer) return;
  drawer.addEventListener('click', event => { if (event.target.closest('a')) drawer.open = false; });
  document.addEventListener('pointerdown', event => { if (drawer.open && !drawer.contains(event.target)) drawer.open = false; });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && drawer.open) { drawer.open = false; drawer.querySelector('summary').focus(); }
  });
})();
