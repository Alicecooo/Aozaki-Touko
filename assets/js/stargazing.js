(() => {
  const canvas = document.getElementById('kb-starfield');
  if (!canvas || !document.body.classList.contains('kb-has-starfield')) return;
  const seconds = Number(canvas.dataset.idleSeconds);
  if (Number.isFinite(seconds) && seconds <= 0) return;
  const delay = Math.max(5, seconds || 30) * 1000;
  const root = document.documentElement;
  const controls = [...document.querySelectorAll('body > .header, body > .main, body > .footer, #kb-music-dock, #top-link')];
  let timer, active = false, lastWake = -1000, focused;
  const previous = new Map();
  controls.forEach(control => control.classList.add('kb-idle-ui'));
  function schedule() {
    clearTimeout(timer);
    // Once entered, the sky stays open until the reader deliberately wakes it.
    if (!active && !document.hidden) timer = setTimeout(enter, delay);
  }
  function notify(fromGesture = false) {
    document.dispatchEvent(new CustomEvent('kb:stargazing', {detail: {active, fromGesture}}));
  }
  function enter() {
    if (document.hidden || active) return;
    focused = document.activeElement;
    if (focused instanceof HTMLElement) focused.blur();
    controls.forEach(control => {
      previous.set(control, {inert: control.inert, ariaHidden: control.getAttribute('aria-hidden')});
      control.inert = true;
      control.setAttribute('aria-hidden', 'true');
    });
    active = true;
    root.dataset.stargazing = 'true';
    notify();
  }
  function exit(fromGesture = false, keyboard = false) {
    if (!active) return;
    active = false;
    delete root.dataset.stargazing;
    controls.forEach(control => {
      const state = previous.get(control);
      control.inert = state.inert;
      if (state.ariaHidden === null) control.removeAttribute('aria-hidden');
      else control.setAttribute('aria-hidden', state.ariaHidden);
    });
    previous.clear();
    notify(fromGesture);
    if (keyboard && focused instanceof HTMLElement && focused.isConnected) focused.focus({preventScroll: true});
  }
  function activity(event) {
    if (!active) return;
    const now = performance.now();
    lastWake = now;
    exit(true, event.type === 'keydown');
    if (event.cancelable) event.preventDefault();
    event.stopImmediatePropagation();
    schedule();
  }
  // Time spent on the visible homepage triggers the effect, regardless of input.
  // Only deliberate input wakes it; moving the mouse leaves the stars visible.
  for (const type of ['pointerdown', 'keydown', 'wheel']) {
    document.addEventListener(type, activity, {capture: true, passive: false});
  }
  document.addEventListener('click', event => {
    if (performance.now() - lastWake < 400) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  // Background tabs pause rendering without dismissing an already formed sky.
  document.addEventListener('visibilitychange', () => { clearTimeout(timer); schedule(); });
  window.addEventListener('pagehide', () => { clearTimeout(timer); exit(); });
  window.addEventListener('pageshow', schedule);
  schedule();
})();
