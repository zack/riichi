const HEIGHT_PROPERTY = '--visible-height';
const TOP_PROPERTY = '--visible-top';

function fitToVisibleArea() {
  const root = document.documentElement;
  const visible = window.visualViewport;
  const isShorter = root.clientHeight - visible.height > 1;
  const isMoved = visible.offsetTop > 1;

  if (visible.scale === 1 && (isShorter || isMoved)) {
    root.style.setProperty(HEIGHT_PROPERTY, `${visible.height}px`);
    root.style.setProperty(TOP_PROPERTY, `${visible.offsetTop}px`);
  } else {
    root.style.removeProperty(HEIGHT_PROPERTY);
    root.style.removeProperty(TOP_PROPERTY);
  }
}

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', fitToVisibleArea);
  window.visualViewport.addEventListener('scroll', fitToVisibleArea);
  fitToVisibleArea();
}
