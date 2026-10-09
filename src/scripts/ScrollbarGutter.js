const WIDTH_PROPERTY = '--scrollbar-gutter-width';

const SCROLL_LOCKED_ATTRIBUTE = 'data-scroll-locked';

function measureScrollbarGutter() {
  const dialogIsOpen = document.body.hasAttribute(SCROLL_LOCKED_ATTRIBUTE);
  const isPinchZoomed = window.visualViewport?.scale !== 1;

  if (dialogIsOpen || isPinchZoomed) {
    return;
  }

  const width = Math.max(
    0,
    window.innerWidth - document.body.getBoundingClientRect().width,
  );
  document.documentElement.style.setProperty(WIDTH_PROPERTY, `${width}px`);
}

window.addEventListener('resize', measureScrollbarGutter);
measureScrollbarGutter();
