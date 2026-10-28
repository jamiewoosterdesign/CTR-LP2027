/* CTR 2027 hero loop.
   1. Sky + still bag show immediately (bag-poster.webp is frame 0 of the intro).
   2. intro.webm (silver <-> backpack, loops seamlessly on its own) starts as soon as it can play.
   3. rest.webm (the other four bags) downloads in full in the background, then the intro hands over to it at the
      backpack's peak-blur frame; at the end of rest it hands back to the intro. Both hand-offs wait for the incoming
      video's first drawn frame, so there is never a blank or stale frame. */
(() => {
  const root = document.querySelector('#report-top .ctr-hero');
  if (!root) return;
  const stage = root.querySelector('.ctr-stage'), bags = root.querySelector('.ctr-bags'), frame = root.querySelector('.ctr-bagframe');
  // size the 16:9 bag frame like object-fit:cover over the box, without clipping it
  const fit = () => { const w = bags.clientWidth, h = bags.clientHeight; const fw = Math.max(w, h * 16 / 9); frame.style.width = fw + 'px'; };
  fit(); new ResizeObserver(fit).observe(bags);
  const FPS = 24, BRANCH_FRAME = 290, REST_FRAMES = 844;
  const poster = root.querySelector('.ctr-bag-poster'), vI = root.querySelector('.ctr-intro'), vR = root.querySelector('.ctr-rest');
  const hi = stage.querySelector('.ctr-clouds-high'), lo = stage.querySelector('.ctr-clouds-low');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const params = new URLSearchParams(location.search);
  // Transparent VP9 is not rendered by Safari: it keeps the still bag over the moving sky.
  const alpha = !!vI.canPlayType('video/webm; codecs="vp9"') && !/^((?!chrome|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent) && params.get('hero') !== 'static';
  const hasRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
  let visible = true, current = null, restReady = false, restLoading = false, switching = false;

  // ---- sky: two cloud layers drifting left at different speeds (tile 2330x1080, repeat-x)
  let x1 = 0, x2 = 0, last = performance.now();
  const drift = t => {
    const dt = Math.min(0.1, (t - last) / 1000); last = t;
    if (visible && !document.hidden && !reduced.matches) {
      const h = stage.clientHeight || 1, tw = 2330 * h / 1080, k = h / 1080;
      x1 = (x1 - 9 * k * dt) % tw; x2 = (x2 - 20 * k * dt) % tw;
      hi.style.backgroundPosition = x1 + 'px 0'; lo.style.backgroundPosition = x2 + 'px 0';
    }
    requestAnimationFrame(drift);
  };
  requestAnimationFrame(drift);

  if (!alpha) return;
  const allowed = () => visible && !document.hidden && !reduced.matches;
  const seekTo = (v, t) => new Promise(r => { if (Math.abs(v.currentTime - t) < 0.001 && v.readyState >= 2) return r(); v.addEventListener('seeked', r, { once: true }); v.currentTime = t; });
  // wait for the incoming video's first drawn frame, but never stall if the callback doesn't fire (hidden/occluded windows)
  const drawn = v => Promise.race([new Promise(r => hasRVFC ? v.requestVideoFrameCallback(() => r()) : setTimeout(r, 40)), new Promise(r => setTimeout(r, 300))]);
  const showOnly = el => { [poster, vI, vR].forEach(x => x.classList.toggle('is-on', x === el)); };

  // Hand-offs. Intro and rest share frames 0..289 only; from frame 290 the intro turns back to silver.
  // So the switch to rest must happen while the intro is still on a shared frame, never after it.
  // The outgoing video is paused first, so nothing past the shared frames is ever shown while the
  // incoming one starts (worst case a frame or two holds at peak motion blur, which reads as part of the spin).
  const swap = async (from, to, toTime, fromPark) => {
    if (switching) return; switching = true;
    try {
      if (from) from.pause();
      if (Math.abs(to.currentTime - toTime) > 0.02) await seekTo(to, toTime);
      const d = drawn(to); await to.play(); await d;
      showOnly(to); current = to;
      if (from) await seekTo(from, fromPark);
    } catch (e) {} finally { switching = false; }
  };

  const loadRest = async () => {
    if (restLoading) return; restLoading = true;
    try {
      const res = await fetch(vR.dataset.src);
      if (!res.ok) throw Error('rest unavailable');
      vR.src = URL.createObjectURL(await res.blob());
      await new Promise((ok, bad) => { vR.addEventListener('loadeddata', ok, { once: true }); vR.addEventListener('error', bad, { once: true }); vR.load(); });
      await seekTo(vR, 0);
      restReady = true;
    } catch (e) { restLoading = false; }   // the intro simply keeps looping
  };

  const LAST_SHARED = BRANCH_FRAME - 1;
  const introFrame = () => Math.floor(vI.currentTime * FPS + 0.01);
  const toRest = () => {
    if (current !== vI || switching || !allowed() || !restReady) return;
    const f = introFrame();
    if (f >= LAST_SHARED - 2 && f <= LAST_SHARED) swap(vI, vR, 0, 0);   // too late (f >= 290): wait for the next intro loop
  };
  let armed = 0;
  const arm = () => {            // timer-based backup for when frame callbacks are throttled
    if (current !== vI || !restReady || armed) return;
    const f = vI.currentTime * FPS;
    if (f >= LAST_SHARED - 30 && f < LAST_SHARED - 2) {
      armed = setTimeout(() => { armed = 0; toRest(); }, Math.max(0, (LAST_SHARED - 1 - f) / FPS * 1000 / (vI.playbackRate || 1)));
    }
  };
  const onIntro = () => { toRest(); arm(); if (hasRVFC) vI.requestVideoFrameCallback(onIntro); };
  const onRest = () => {
    if (current === vR && !switching && allowed() && Math.floor(vR.currentTime * FPS + 0.01) >= REST_FRAMES - 1) swap(vR, vI, 0, 0);
    if (hasRVFC) vR.requestVideoFrameCallback(onRest);
  };
  if (hasRVFC) { vI.requestVideoFrameCallback(onIntro); vR.requestVideoFrameCallback(onRest); }
  vI.addEventListener('timeupdate', () => { toRest(); arm(); });
  vR.addEventListener('timeupdate', onRest);
  vR.addEventListener('ended', () => { if (current === vR) swap(vR, vI, 0, 0); });
  vI.loop = true; vI.muted = vR.muted = true;

  const start = () => {
    if (vI.src || !allowed()) return;
    vI.src = vI.dataset.src; vI.load();
    vI.addEventListener('canplay', () => { if (allowed()) swap(null, vI, 0, 0); }, { once: true });
    vI.addEventListener('playing', () => { if (document.readyState === 'complete') loadRest(); else addEventListener('load', loadRest, { once: true }); }, { once: true });
  };
  const sync = () => {
    if (!vI.src) return start();
    if (!current) return;
    if (allowed()) current.play().catch(() => {}); else current.pause();
  };
  new IntersectionObserver(e => { visible = e[0].isIntersecting; sync(); }, { threshold: 0 }).observe(stage.closest('section'));
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  start();
})();
