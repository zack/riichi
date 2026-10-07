import { scrollPageTo } from './ScrollPage';

const MARGIN_PX = 8;

// Firefox for Android can report the window as taller than what's on screen
// (see VisibleArea.js), so use the visual viewport. Unless the page is pinch
// zoomed, where the visual viewport is tiny and we don't want to treat it like
// a very small phone.
function getVisibleHeight() {
  const visible = window.visualViewport;

  if (visible && visible.scale === 1) {
    return visible.height;
  } else {
    return window.innerHeight;
  }
}

function showHandWithAnswer(hand, card, heightBeforeCheck) {
  const visibleHeight = getVisibleHeight();
  const handBox = hand.getBoundingClientRect();
  const gap = card.getBoundingClientRect().top - handBox.bottom;
  const room = visibleHeight - handBox.height - gap - 2 * MARGIN_PX;

  if (
    Math.max(card.getBoundingClientRect().height, heightBeforeCheck) <= room
  ) {
    card.style.minHeight = `${heightBeforeCheck}px`;
  }

  const cardBox = card.getBoundingClientRect();
  const furthest = handBox.top + window.scrollY - MARGIN_PX;
  const nearest = cardBox.bottom + window.scrollY + MARGIN_PX - visibleHeight;

  let target;
  if (cardBox.height <= room) {
    target = Math.min(Math.max(window.scrollY, nearest), furthest);
  } else {
    target = nearest;
  }

  scrollPageTo(Math.max(target, 0));
}

export { showHandWithAnswer };
