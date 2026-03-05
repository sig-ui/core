// @ts-nocheck

/**
 * SigUI core runtime module for animate.
 * @module
 */
const DURATION_MS = {
  instant: 100,
  fast: 150,
  normal: 200,
  moderate: 300,
  slow: 500
};
function resolveDuration(duration) {
  if (typeof duration === "number")
    return duration;
  if (!duration)
    return DURATION_MS.normal;
  return DURATION_MS[duration] ?? DURATION_MS.normal;
}
function resolveEasing(easing) {
  if (!easing)
    return "cubic-bezier(0.2, 0.0, 0.0, 1.0)";
  const map = {
    default: "cubic-bezier(0.2, 0.0, 0.0, 1.0)",
    standard: "cubic-bezier(0.2, 0.0, 0.0, 1.0)",
    emphasized: "cubic-bezier(0.3, 0.0, 0.0, 1.0)",
    decelerate: "cubic-bezier(0.0, 0.0, 0.0, 1.0)",
    accelerate: "cubic-bezier(0.3, 0.0, 1.0, 1.0)",
    linear: "linear"
  };
  return map[easing] ?? easing;
}
function toWaapiFrames(keyframes) {
  const from = {};
  const to = {};
  for (const [prop, value] of Object.entries(keyframes)) {
    if (Array.isArray(value)) {
      from[prop] = value[0];
      to[prop] = value[1];
    } else {
      from[prop] = value;
      to[prop] = value;
    }
  }
  return [from, to];
}
/**
 * animate.
 * @param {Element} target
 * @param {AnimateKeyframes} keyframes
 * @param {AnimateOptions} options
 * @returns {AnimationControls}
 */
export function animate(target, keyframes, options) {
  const animation = target.animate(toWaapiFrames(keyframes), {
    duration: resolveDuration(options?.duration),
    easing: resolveEasing(options?.easing),
    delay: options?.delay ?? 0,
    fill: options?.fill ?? "none",
    iterations: options?.iterations ?? 1,
    direction: options?.direction ?? "normal"
  });
  const animations = [animation];
  const finished = Promise.all(animations.map((a) => a.finished)).then(() => {});
  return {
    play: () => animation.play(),
    pause: () => animation.pause(),
    cancel: () => animation.cancel(),
    finish: () => animation.finish(),
    reverse: () => animation.reverse(),
    get playbackRate() {
      return animation.playbackRate;
    },
    set playbackRate(rate) {
      animation.playbackRate = rate;
    },
    finished,
    animations
  };
}
/**
 * inView.
 * @param {Element} target
 * @param {InViewCallback} callback
 * @param {InViewOptions} options
 * @returns {() => void}
 */
export function inView(target, callback, options) {
  const exitCallbacks = new Map;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const cleanup = callback(entry);
        if (typeof cleanup === "function") {
          exitCallbacks.set(entry.target, cleanup);
        }
        if (options?.once) {
          observer.unobserve(entry.target);
        }
      } else {
        const exit = exitCallbacks.get(entry.target);
        if (exit) {
          exit();
          exitCallbacks.delete(entry.target);
        }
      }
    }
  }, {
    threshold: options?.threshold ?? 0,
    rootMargin: options?.rootMargin ?? "0px",
    root: options?.root ?? null
  });
  observer.observe(target);
  return () => {
    observer.disconnect();
    for (const fn of exitCallbacks.values())
      fn();
    exitCallbacks.clear();
  };
}
/**
 * drag.
 * @param {Element} element
 * @param {DragOptions} options
 * @returns {() => void}
 */
export function drag(element, options) {
  const el = element;
  const axis = options?.axis;
  let startX = 0;
  let startY = 0;
  let x = 0;
  let y = 0;
  let lastX = 0;
  let lastY = 0;
  let lastT = 0;
  let dragging = false;
  function onPointerDown(e) {
    dragging = true;
    startX = e.clientX - x;
    startY = e.clientY - y;
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = e.timeStamp;
    el.setPointerCapture(e.pointerId);
    options?.onDragStart?.({ x, y, dx: 0, dy: 0, clientX: e.clientX, clientY: e.clientY });
  }
  function onPointerMove(e) {
    if (!dragging)
      return;
    const nextX = axis === "y" ? 0 : e.clientX - startX;
    const nextY = axis === "x" ? 0 : e.clientY - startY;
    const dx = nextX - x;
    const dy = nextY - y;
    x = nextX;
    y = nextY;
    if (options?.transform !== false) {
      el.style.transform = `translateX(${x}px) translateY(${y}px)`;
    }
    options?.onDrag?.({ x, y, dx, dy, clientX: e.clientX, clientY: e.clientY });
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = e.timeStamp;
  }
  function onPointerUp(e) {
    if (!dragging)
      return;
    dragging = false;
    el.releasePointerCapture(e.pointerId);
    const dt = Math.max(1, e.timeStamp - lastT) / 1000;
    const velocityX = (e.clientX - lastX) / dt;
    const velocityY = (e.clientY - lastY) / dt;
    options?.onDragEnd?.({ x, y, dx: 0, dy: 0, clientX: e.clientX, clientY: e.clientY, velocityX, velocityY });
  }
  el.addEventListener("pointerdown", onPointerDown);
  el.addEventListener("pointermove", onPointerMove);
  el.addEventListener("pointerup", onPointerUp);
  el.addEventListener("pointercancel", onPointerUp);
  return () => {
    el.removeEventListener("pointerdown", onPointerDown);
    el.removeEventListener("pointermove", onPointerMove);
    el.removeEventListener("pointerup", onPointerUp);
    el.removeEventListener("pointercancel", onPointerUp);
  };
}
/**
 * swipe.
 * @param {Element} element
 * @param {SwipeOptions} options
 * @returns {() => void}
 */
export function swipe(element, options) {
  const el = element;
  const allowed = options.direction ? Array.isArray(options.direction) ? options.direction : [options.direction] : null;
  const velocityThreshold = options.velocityThreshold ?? 300;
  const displacementThreshold = options.displacementThreshold ?? 20;
  let startX = 0;
  let startY = 0;
  let startT = 0;
  function onPointerDown(e) {
    startX = e.clientX;
    startY = e.clientY;
    startT = e.timeStamp;
    el.setPointerCapture(e.pointerId);
  }
  function onPointerUp(e) {
    el.releasePointerCapture(e.pointerId);
    const dt = Math.max(1, e.timeStamp - startT) / 1000;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const vx = dx / dt;
    const vy = dy / dt;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    let dir = null;
    if (ax >= ay && ax >= displacementThreshold && Math.abs(vx) >= velocityThreshold) {
      dir = dx > 0 ? "right" : "left";
    } else if (ay > ax && ay >= displacementThreshold && Math.abs(vy) >= velocityThreshold) {
      dir = dy > 0 ? "down" : "up";
    }
    if (dir && (!allowed || allowed.includes(dir))) {
      options.onSwipe(dir, { x: vx, y: vy });
    }
  }
  el.addEventListener("pointerdown", onPointerDown);
  el.addEventListener("pointerup", onPointerUp);
  el.addEventListener("pointercancel", onPointerUp);
  return () => {
    el.removeEventListener("pointerdown", onPointerDown);
    el.removeEventListener("pointerup", onPointerUp);
    el.removeEventListener("pointercancel", onPointerUp);
  };
}
/**
 * onScroll.
 * @param {(info: ScrollInfo)} callback
 * @param {ScrollProgressOptions} options
 * @returns {() => void}
 */
export function onScroll(callback, options) {
  const axis = options?.axis ?? "y";
  const source = document.scrollingElement ?? document.documentElement;
  let lastPos = 0;
  let lastTime = performance.now();
  let rafPending = false;
  function update() {
    rafPending = false;
    const now = performance.now();
    const pos = axis === "y" ? source.scrollTop : source.scrollLeft;
    const max = axis === "y" ? source.scrollHeight - source.clientHeight : source.scrollWidth - source.clientWidth;
    const progress = max > 0 ? Math.max(0, Math.min(1, pos / max)) : 0;
    const dt = (now - lastTime) / 1000;
    const velocity = dt > 0 ? (pos - lastPos) / dt : 0;
    lastPos = pos;
    lastTime = now;
    callback({ progress, velocity });
  }
  function onScrollEvent() {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(update);
    }
  }
  window.addEventListener("scroll", onScrollEvent, { passive: true });
  update();
  return () => window.removeEventListener("scroll", onScrollEvent);
}
/**
 * onScrollView.
 * @param {(info: ScrollInfo)} callback
 * @param {ScrollViewProgressOptions} options
 * @returns {() => void}
 */
export function onScrollView(callback, options) {
  const target = options.target;
  const axis = options.axis ?? "y";
  let inViewNow = false;
  let rafPending = false;
  let lastProgress = 0;
  let lastTime = performance.now();
  function computeProgress() {
    const rect = target.getBoundingClientRect();
    const viewport = axis === "y" ? window.innerHeight : window.innerWidth;
    const pos = axis === "y" ? rect.top : rect.left;
    const size = axis === "y" ? rect.height : rect.width;
    const total = viewport + size;
    if (total <= 0)
      return 0;
    return Math.max(0, Math.min(1, (viewport - pos) / total));
  }
  function update() {
    rafPending = false;
    if (!inViewNow)
      return;
    const now = performance.now();
    const progress = computeProgress();
    const dt = (now - lastTime) / 1000;
    const velocity = dt > 0 ? (progress - lastProgress) / dt : 0;
    lastProgress = progress;
    lastTime = now;
    callback({ progress, velocity });
  }
  function onScrollEvent() {
    if (!rafPending && inViewNow) {
      rafPending = true;
      requestAnimationFrame(update);
    }
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      inViewNow = entry.isIntersecting;
      if (inViewNow)
        update();
    }
  });
  observer.observe(target);
  window.addEventListener("scroll", onScrollEvent, { passive: true });
  return () => {
    observer.disconnect();
    window.removeEventListener("scroll", onScrollEvent);
  };
}
/**
 * flipSnapshot.
 * @param {Element} element
 * @returns {FlipRect}
 */
export function flipSnapshot(element) {
  const rect = element.getBoundingClientRect();
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}
function wrapAnimations(animations) {
  const finished = animations.length > 0 ? Promise.all(animations.map((a) => a.finished)).then(() => {}) : Promise.resolve();
  return {
    play: () => animations.forEach((a) => a.play()),
    pause: () => animations.forEach((a) => a.pause()),
    cancel: () => animations.forEach((a) => a.cancel()),
    finish: () => animations.forEach((a) => a.finish()),
    reverse: () => animations.forEach((a) => a.reverse()),
    get playbackRate() {
      return animations[0]?.playbackRate ?? 1;
    },
    set playbackRate(rate) {
      animations.forEach((a) => {
        a.playbackRate = rate;
      });
    },
    finished,
    animations
  };
}
/**
 * flipAnimate.
 * @param {Element} element
 * @param {FlipRect} first
 * @param {FlipOptions} options
 * @returns {AnimationControls}
 */
export function flipAnimate(element, first, options) {
  const last = flipSnapshot(element);
  const dx = first.x - last.x;
  const dy = first.y - last.y;
  const sx = last.width !== 0 ? first.width / last.width : 1;
  const sy = last.height !== 0 ? first.height / last.height : 1;
  const animateSize = options?.animateSize !== false;
  if (dx === 0 && dy === 0 && (!animateSize || sx === 1 && sy === 1)) {
    return wrapAnimations([]);
  }
  const fromTransform = animateSize ? `translateX(${dx}px) translateY(${dy}px) scaleX(${sx}) scaleY(${sy})` : `translateX(${dx}px) translateY(${dy}px)`;
  const anim = element.animate([{ transform: fromTransform }, { transform: "translateX(0px) translateY(0px) scaleX(1) scaleY(1)" }], {
    duration: resolveDuration(options?.duration ?? "moderate"),
    easing: resolveEasing(options?.easing),
    fill: "none"
  });
  return wrapAnimations([anim]);
}
/**
 * createLayoutIdRegistry.
 * @returns {LayoutIdRegistry}
 */
export function createLayoutIdRegistry() {
  const elements = new Map;
  const snapshots = new Map;
  return {
    register(id, element) {
      const existing = elements.get(id);
      if (existing)
        snapshots.set(id, flipSnapshot(existing));
      elements.set(id, element);
    },
    unregister(id) {
      const existing = elements.get(id);
      if (existing) {
        const shot = flipSnapshot(existing);
        snapshots.set(id, shot);
        elements.delete(id);
        return shot;
      }
      return snapshots.get(id);
    },
    get(id) {
      return elements.get(id);
    }
  };
}
