(() => {
  const audio = document.getElementById('kb-audio');
  if (!audio) return;
  const tracks = JSON.parse(audio.dataset.tracks || '[]');
  if (!tracks.length) return;
  const dock = document.getElementById('kb-music-dock');
  const panel = document.getElementById('kb-music-panel');
  const toggle = document.getElementById('kb-music-toggle');
  const play = document.getElementById('kb-music-play');
  const volume = document.getElementById('kb-music-volume');
  const status = document.getElementById('kb-music-status');
  const details = document.getElementById('kb-music-details');
  const previous = document.getElementById('kb-music-prev');
  const next = document.getElementById('kb-music-next');
  const key = 'blog-playlist-v1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { /* Storage is optional. */ }
  let index = Math.max(0, tracks.findIndex(track => track.id === saved.track));
  const positions = saved.positions && typeof saved.positions === 'object' ? saved.positions : {};
  let userPaused = saved.userPaused === true, blocked = false, playSequence = 0, resume = 0;
  audio.volume = Number.isFinite(saved.volume) ? Math.max(0, Math.min(1, saved.volume)) : Number(audio.dataset.volume);
  volume.value = Math.round(audio.volume * 100);
  function persist() {
    if (audio.readyState >= 1) positions[tracks[index].id] = audio.currentTime;
    try { localStorage.setItem(key, JSON.stringify({track: tracks[index].id, positions, volume: audio.volume, userPaused})); } catch { /* Playback still works without storage. */ }
  }
  function sync() {
    const playing = !audio.paused;
    dock.dataset.playing = String(playing);
    play.setAttribute('aria-label', playing ? '暂停背景音乐' : '播放背景音乐');
    play.title = `${playing ? '暂停背景音乐' : '播放背景音乐'} · ${tracks[index].title}`;
    if (playing) status.textContent = '正在播放';
    else if (blocked) status.textContent = '点击播放';
    else status.textContent = userPaused ? '已暂停' : '准备播放';
  }
  async function start() {
    const sequence = ++playSequence;
    try {
      await audio.play();
      if (sequence !== playSequence) return;
      blocked = false; sync(); persist();
    } catch (error) {
      if (sequence !== playSequence || error.name === 'AbortError') return;
      blocked = error.name === 'NotAllowedError';
      sync();
      if (!blocked) status.textContent = '音频暂时无法播放';
    }
  }
  function selectTrack(next, shouldPlay, restore = false) {
    persist();
    ++playSequence;
    index = (next + tracks.length) % tracks.length;
    const track = tracks[index];
    resume = restore && Number.isFinite(positions[track.id]) ? positions[track.id] : 0;
    document.getElementById('kb-current-track').textContent = track.title;
    dock.dataset.track = track.id;
    audio.src = track.src;
    audio.load();
    blocked = false;
    sync(); persist();
    if (shouldPlay) start();
  }
  previous.disabled = next.disabled = tracks.length < 2;
  function skip(delta) {
    if (tracks.length < 2) return;
    userPaused = false;
    selectTrack(index + delta, true);
  }
  previous.addEventListener('click', () => skip(-1));
  next.addEventListener('click', () => skip(1));
  play.addEventListener('click', () => {
    expand();
    if (audio.paused) { userPaused = false; start(); }
    else { userPaused = true; ++playSequence; audio.pause(); sync(); persist(); }
  });
  audio.addEventListener('loadedmetadata', () => {
    if (!Number.isFinite(audio.duration)) return;
    if (resume > 0 && resume < audio.duration) audio.currentTime = resume;
    resume = 0;
  });
  let lastSaved = 0;
  audio.addEventListener('timeupdate', () => {
    if (Date.now() - lastSaved > 1500) { persist(); lastSaved = Date.now(); }
  });
  audio.addEventListener('playing', sync);
  audio.addEventListener('pause', sync);
  audio.addEventListener('ended', () => { positions[tracks[index].id] = 0; selectTrack(index + 1, true); });
  audio.addEventListener('error', () => { dock.dataset.playing = 'false'; status.textContent = '音频暂时无法播放'; });
  volume.addEventListener('input', () => { audio.volume = Number(volume.value) / 100; persist(); });
  function close(returnFocus = false) { panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); if (returnFocus) toggle.focus(); }
  let collapseTimer, collapsing = false;
  function scheduleCollapse() {
    clearTimeout(collapseTimer);
    if (!document.hidden && document.documentElement.dataset.stargazing !== 'true') collapseTimer = setTimeout(collapse, 5000);
  }
  function collapse() {
    clearTimeout(collapseTimer);
    const focused = document.activeElement;
    const returnFocus = details.contains(focused) || panel.contains(focused);
    close();
    collapsing = true;
    if (returnFocus && !document.hidden && document.documentElement.dataset.stargazing !== 'true') play.focus({preventScroll: true});
    dock.dataset.collapsed = 'true';
    details.inert = true;
    details.setAttribute('aria-hidden', 'true');
    collapsing = false;
  }
  function expand() {
    if (collapsing) return;
    dock.dataset.collapsed = 'false';
    details.inert = false;
    details.removeAttribute('aria-hidden');
    scheduleCollapse();
  }
  for (const type of ['pointerenter', 'pointermove', 'pointerdown', 'keydown', 'focusin', 'input', 'change']) dock.addEventListener(type, expand);
  toggle.addEventListener('click', () => { panel.hidden = !panel.hidden; toggle.setAttribute('aria-expanded', String(!panel.hidden)); });
  document.addEventListener('pointerdown', event => {
    if (!dock.contains(event.target)) close();
    if (blocked && !userPaused && !dock.contains(event.target)) start();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) close(true);
    else if (blocked && !userPaused && !dock.contains(event.target) && !event.ctrlKey && !event.metaKey) start();
  });
  document.addEventListener('kb:stargazing', event => {
    if (event.detail.active) collapse();
    else scheduleCollapse();
    if (!userPaused && (event.detail.active || event.detail.fromGesture) && audio.paused) start();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) collapse(); else scheduleCollapse(); });
  window.addEventListener('pagehide', () => { clearTimeout(collapseTimer); persist(); audio.pause(); });
  window.addEventListener('pageshow', event => { scheduleCollapse(); if (event.persisted && audio.dataset.autoplay === 'true' && !userPaused) start(); });
  document.body.classList.add('kb-has-music');
  selectTrack(index, audio.dataset.autoplay === 'true' && !userPaused, true);
  scheduleCollapse();
})();
