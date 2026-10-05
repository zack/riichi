import { useLayoutEffect, useState } from 'react';

const LABEL_SELECTOR = '.tile-cell:not(.honba) > .tile-label';

const MOST_OF_FACE_COVERED = 0.6;

// Has to match the tab's padding in App.css
const TAB_PADDING_HEIGHT = 2;
const TAB_PADDING_WIDTH = 3;

// Where the front face of a fancy tile is, as fractions of the tile's width.
// Measured from the drawings, which all share one frame. These have to match
// --face-* in App.css.
const FANCY_FACE_BOTTOM = 0.0624;
const FANCY_FACE_LEFT = 0.0634;
const FANCY_FACE_RIGHT = 0.2252;
const FANCY_FACE_TOP = 0.2505;

function getFaceSize(tile, fancy) {
  const box = tile.getBoundingClientRect();
  const border = parseFloat(getComputedStyle(tile).borderTopWidth);

  if (!fancy) {
    return { height: box.height - 2 * border, width: box.width - 2 * border };
  } else if (tile.classList.contains('called')) {
    const tileWidth = box.height;
    return {
      height: box.height - tileWidth * (FANCY_FACE_LEFT + FANCY_FACE_RIGHT),
      width: box.width - tileWidth * (FANCY_FACE_TOP + FANCY_FACE_BOTTOM),
    };
  } else {
    const tileWidth = box.width;
    return {
      height: box.height - tileWidth * (FANCY_FACE_TOP + FANCY_FACE_BOTTOM),
      width: box.width - tileWidth * (FANCY_FACE_RIGHT + FANCY_FACE_LEFT),
    };
  }
}

function getCoverage(label, fancy) {
  const face = getFaceSize(label.parentElement.querySelector('.tile'), fancy);
  const text = document.createRange();
  text.selectNodeContents(label);
  const textBox = text.getBoundingClientRect();
  const tabWidth = textBox.width + TAB_PADDING_WIDTH;
  const tabHeight =
    parseFloat(getComputedStyle(label).fontSize) + TAB_PADDING_HEIGHT;

  if (tabWidth > face.width) {
    return 1;
  } else {
    return (tabWidth / face.width) * Math.min(1, tabHeight / face.height);
  }
}

function namesFitOnTiles(root) {
  const fancy = root.classList.contains('fancy-tiles');
  const labels = [...root.querySelectorAll(LABEL_SELECTOR)].filter(
    (label) => label.textContent,
  );

  return labels.every(
    (label) => getCoverage(label, fancy) <= MOST_OF_FACE_COVERED,
  );
}

function useNamesOnTiles(rootRef, showNames, redrawKey) {
  const [fit, setFit] = useState(false);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!showNames || !root) {
      return undefined;
    }

    const handleChange = () => {
      setFit(namesFitOnTiles(root));
    };
    const resizeObserver = new ResizeObserver(handleChange);

    handleChange();
    resizeObserver.observe(root);
    root
      .querySelectorAll(LABEL_SELECTOR)
      .forEach((label) => resizeObserver.observe(label));
    document.fonts.addEventListener('loadingdone', handleChange);
    return () => {
      resizeObserver.disconnect();
      document.fonts.removeEventListener('loadingdone', handleChange);
    };
  }, [redrawKey, rootRef, showNames]);

  return showNames && fit;
}

export { useNamesOnTiles };
