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
  const controls = document.createElement('div');
  controls.className = 'kb-music-controls';
  controls.append(...details.childNodes);
  const timeline = document.createElement('div');
  timeline.className = 'kb-music-timeline';
  const elapsed = document.createElement('span');
  elapsed.id = 'kb-music-elapsed';
  const duration = document.createElement('span');
  duration.id = 'kb-music-duration';
  const progress = document.createElement('input');
  progress.id = 'kb-music-progress';
  progress.type = 'range';
  progress.min = 0;
  progress.step = 0.1;
  progress.setAttribute('aria-label', '播放进度');
  timeline.append(elapsed, progress, duration);
  details.append(controls);
  panel.append(timeline);
  const previous = document.getElementById('kb-music-prev');
  const next = document.getElementById('kb-music-next');
  const key = 'blog-playlist-v1';
  const sessionKey = 'blog-playlist-session-v1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { /* Storage is optional. */ }
  function readSession() {
    try { return JSON.parse(sessionStorage.getItem(sessionKey) || '{}') || {}; } catch { return {}; }
  }
  const session = readSession();
  let index = Math.max(0, tracks.findIndex(track => track.id === (session.track || saved.track)));
  let playSequence = 0, errorMessage = '', collapseTimer, collapsing = false, pendingPosition = 0, lastSaved = 0;
  const initialVolume = Number.isFinite(saved.volume) ? saved.volume : Number(audio.dataset.volume);
  audio.volume = Number.isFinite(initialVolume) ? Math.max(0, Math.min(1, initialVolume)) : 0.25;
  volume.value = Math.round(audio.volume * 100);

  // Long-lived storage retains preferences only; positions belong to this tab.
  // Old localStorage positions and autoplay flags are discarded.
  function persist() {
    try { localStorage.setItem(key, JSON.stringify({ track: tracks[index].id, volume: audio.volume })); } catch { /* Playback still works without storage. */ }
  }
  function persistSession() {
    try { sessionStorage.setItem(sessionKey, JSON.stringify({ track: tracks[index].id, position: pendingPosition || audio.currentTime })); } catch { /* Storage is optional. */ }
  }
  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const value = Math.floor(seconds);
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  }
  function syncProgress() {
    const length = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
    const position = pendingPosition || (length ? Math.min(audio.currentTime, length) : 0);
    progress.disabled = !length;
    progress.max = length || Math.max(1, position);
    progress.value = position;
    progress.setAttribute('aria-valuetext', `${formatTime(position)} / ${formatTime(length)}`);
    elapsed.textContent = formatTime(position);
    duration.textContent = length ? formatTime(length) : '--:--';
  }
  function sync() {
    const playing = !audio.paused && !audio.ended;
    dock.dataset.playing = String(playing);
    play.setAttribute('aria-label', playing ? '暂停背景音乐' : '播放背景音乐');
    play.title = `${playing ? '暂停背景音乐' : '播放背景音乐'} · ${tracks[index].title}`;
    status.textContent = errorMessage || (playing ? '正在播放' : audio.currentTime > 0 ? '已暂停' : '待播放');
  }
  async function start() {
    const sequence = ++playSequence;
    errorMessage = '';
    try {
      await audio.play();
      if (sequence !== playSequence) return;
      sync();
    } catch (error) {
      if (sequence !== playSequence || error.name === 'AbortError') return;
      errorMessage = error.name === 'NotAllowedError' ? '请点击播放' : '音频暂时无法播放';
      sync();
    }
  }
  function selectTrack(nextIndex, shouldPlay = false, position = 0) {
    ++playSequence;
    audio.pause();
    index = (nextIndex + tracks.length) % tracks.length;
    const track = tracks[index];
    document.getElementById('kb-current-track').textContent = track.title;
    dock.dataset.track = track.id;
    errorMessage = '';
    pendingPosition = Number.isFinite(position) && position > 0 ? position : 0;
    audio.src = track.src;
    audio.load();
    syncProgress();
    sync();
    persist();
    persistSession();
    if (shouldPlay) start();
  }
  function stop() {
    ++playSequence;
    audio.pause();
    persistSession();
    errorMessage = '';
    syncProgress();
    sync();
    collapse();
  }
  previous.disabled = next.disabled = tracks.length < 2;
  previous.addEventListener('click', () => { if (tracks.length > 1) selectTrack(index - 1, true); });
  next.addEventListener('click', () => { if (tracks.length > 1) selectTrack(index + 1, true); });
  play.addEventListener('click', () => {
    expand();
    if (audio.paused) start();
    else { ++playSequence; audio.pause(); sync(); }
  });
  audio.addEventListener('loadedmetadata', () => {
    if (pendingPosition && pendingPosition < audio.duration) audio.currentTime = pendingPosition;
    pendingPosition = 0;
    syncProgress();
    sync();
  });
  for (const type of ['durationchange', 'timeupdate', 'emptied', 'seeked']) audio.addEventListener(type, syncProgress);
  audio.addEventListener('timeupdate', () => {
    if (Date.now() - lastSaved > 1500) { persistSession(); lastSaved = Date.now(); }
  });
  audio.addEventListener('playing', sync);
  audio.addEventListener('pause', () => { sync(); persistSession(); });
  audio.addEventListener('ended', () => selectTrack(index + 1, true));
  audio.addEventListener('error', () => { errorMessage = '音频暂时无法播放'; sync(); });
  progress.addEventListener('input', () => {
    if (progress.disabled) return;
    audio.currentTime = Number(progress.value);
    syncProgress();
    sync();
    persistSession();
  });
  volume.addEventListener('input', () => { audio.volume = Number(volume.value) / 100; persist(); });

  function close(returnFocus = false) {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggle.focus();
  }
  function scheduleCollapse() {
    clearTimeout(collapseTimer);
    if (dock.dataset.collapsed === 'true' || document.hidden || document.documentElement.dataset.stargazing === 'true') return;
    collapseTimer = setTimeout(() => {
      if (details.contains(document.activeElement) || panel.contains(document.activeElement)) scheduleCollapse();
      else collapse();
    }, 5000);
  }
  function collapse() {
    clearTimeout(collapseTimer);
    const returnFocus = details.contains(document.activeElement) || panel.contains(document.activeElement);
    close();
    collapsing = true;
    if (returnFocus && !document.hidden && document.documentElement.dataset.stargazing !== 'true') play.focus({ preventScroll: true });
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
  dock.addEventListener('click', expand);
  for (const type of ['input', 'change']) dock.addEventListener(type, scheduleCollapse);
  dock.addEventListener('focusin', event => {
    if (event.target.matches(':focus-visible')) expand();
  });
  // Mouse and touch actions must not leave controls owning Space or arrow keys.
  let pointerControl;
  dock.addEventListener('pointerdown', event => { pointerControl = event.target.closest('button, input'); });
  window.addEventListener('pointerup', () => {
    pointerControl?.blur();
    pointerControl = null;
  });
  dock.addEventListener('click', event => {
    if (event.detail > 0) event.target.closest('button, input')?.blur();
  });
  dock.addEventListener('pointermove', scheduleCollapse);
  toggle.addEventListener('click', () => { panel.hidden = !panel.hidden; toggle.setAttribute('aria-expanded', String(!panel.hidden)); });
  document.addEventListener('pointerdown', event => { if (!dock.contains(event.target)) close(); });
  dock.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) close(true); });
  document.addEventListener('kb:stargazing', event => { if (event.detail.active) collapse(); else scheduleCollapse(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) collapse(); else scheduleCollapse(); });
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const destination = new URL(link.href, location.href);
    if (!/^https?:$/.test(destination.protocol)) return;
    if (destination.origin === location.origin && destination.pathname === location.pathname && destination.search === location.search) return;
    stop();
  });
  // pagehide also covers reload, address-bar navigation and browser history.
  // A page restored from the back-forward cache uses this visit's latest position.
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    const latest = readSession();
    const selected = tracks.findIndex(track => track.id === latest.track);
    selectTrack(selected < 0 ? index : selected, false, latest.position);
    collapse();
  });
  document.body.classList.add('kb-has-music');
  selectTrack(index, false, session.position);
  collapse();
})();
