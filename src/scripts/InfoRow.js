import { useLayoutEffect } from 'react';

const MIN_TILE_WIDTH = 16;

const MAX_TRIES = 5;

const OVERFLOW_ALLOWED = 0.5;

function getOverflow(info) {
  const right = info.getBoundingClientRect().right;

  return Math.max(
    0,
    ...[...info.children].map(
      (child) => child.getBoundingClientRect().right - right,
    ),
  );
}

function overflows(info) {
  return getOverflow(info) > OVERFLOW_ALLOWED;
}

function shrinkToFit(info) {
  let width = parseFloat(
    getComputedStyle(info).getPropertyValue('--tile-width'),
  );
  const shrinking =
    info.querySelectorAll('.tile').length
    + info.querySelectorAll('.honba-sticks').length;

  for (let tries = 0; tries < MAX_TRIES && overflows(info); tries++) {
    if (width <= MIN_TILE_WIDTH) {
      return;
    }

    width = Math.max(MIN_TILE_WIDTH, width - getOverflow(info) / shrinking);
    info.style.setProperty('--tile-width', `${width}px`);
  }
}

function fitInfoRow(info) {
  info.style.removeProperty('--tile-width');
  delete info.dataset.wrapped;
  shrinkToFit(info);

  if (overflows(info)) {
    info.style.removeProperty('--tile-width');
    info.dataset.wrapped = '';
    shrinkToFit(info);
  }
}

// The labels are a different width in every language and the card can be any
// width, so the row is laid out at full size, measured, and shrunk just enough
// to fit. If the smallest tiles still don't fit, the indicators wrap onto their
// own line.
//
// This sets styles on the DOM directly instead of going through React, because
// each measurement needs the one before it to already be on the page.
function useInfoRowFit(infoRef, redrawKey) {
  useLayoutEffect(() => {
    const info = infoRef.current;
    const card = info?.parentElement;

    if (!info || !card) {
      return undefined;
    }

    let cardWidth = card.getBoundingClientRect().width;
    let frame;
    const handleResize = () => {
      const newWidth = card.getBoundingClientRect().width;
      if (newWidth !== cardWidth) {
        cardWidth = newWidth;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => fitInfoRow(info));
      }
    };
    const handleFonts = () => fitInfoRow(info);
    const resizeObserver = new ResizeObserver(handleResize);

    fitInfoRow(info);
    resizeObserver.observe(card);
    document.fonts.addEventListener('loadingdone', handleFonts);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      document.fonts.removeEventListener('loadingdone', handleFonts);
    };
  }, [infoRef, redrawKey]);
}

export { useInfoRowFit };
