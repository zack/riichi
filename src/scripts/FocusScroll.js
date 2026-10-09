function scrollFocusIntoView(event) {
  const { currentTarget: dialog, target } = event;

  if (target === dialog) {
    return;
  }

  requestAnimationFrame(() => {
    if (!target.matches(':focus-visible')) {
      return;
    }

    const screenTop = window.visualViewport?.offsetTop ?? 0;
    const screenHeight = window.visualViewport?.height ?? window.innerHeight;
    const { bottom, height, top } = target.getBoundingClientRect();
    const isCutOff = top < screenTop || bottom > screenTop + screenHeight;

    if (isCutOff && height <= screenHeight) {
      target.scrollIntoView({ block: 'nearest' });
    }
  });
}

export { scrollFocusIntoView };
