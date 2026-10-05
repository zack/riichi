const DURATION_MS = 500;

const TAKEOVER_PX = 2;

function easeInOut(progress) {
  if (progress < 0.5) {
    return 2 * progress * progress;
  } else {
    return 1 - (-2 * progress + 2) ** 2 / 2;
  }
}

function scrollToBottom() {
  const start = window.scrollY;
  const end = document.documentElement.scrollHeight - window.innerHeight;
  const startTime = performance.now();
  let lastY = start;

  function step(now) {
    if (Math.abs(window.scrollY - lastY) > TAKEOVER_PX) {
      return;
    }

    const progress = Math.min((now - startTime) / DURATION_MS, 1);
    window.scrollTo(0, start + (end - start) * easeInOut(progress));
    lastY = window.scrollY;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  if (end <= start) {
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, end);
  } else {
    requestAnimationFrame(step);
  }
}

export { scrollToBottom };
