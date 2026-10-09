import { tileToPath } from './TileConversion';

const FANCY_CLASS = 'fancy-tiles';

const SUITS = ['m', 'p', 's'];
const SUIT_NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const HONOR_NUMBERS = ['1', '2', '3', '4', '5', '6', '7'];
const FACE_DOWN_TILE = 'fs';
const EVERY_TILE = [
  ...SUITS.flatMap((suit) => SUIT_NUMBERS.map((number) => number + suit)),
  ...HONOR_NUMBERS.map((number) => number + 'h'),
  FACE_DOWN_TILE,
];

const fetchedImages = [];

let hasStarted = false;

function waitForImage(image) {
  return new Promise((resolve) => {
    if (image.complete) {
      resolve();
    } else {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    }
  });
}

function waitForPageLoad() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve, { once: true });
    }
  });
}

async function waitForDrawingsOnScreen(hand) {
  let unfinished = [...hand.querySelectorAll('img')].filter(
    (image) => !image.complete,
  );

  while (unfinished.length > 0) {
    await Promise.all(unfinished.map(waitForImage));
    unfinished = [...hand.querySelectorAll('img')].filter(
      (image) => !image.complete,
    );
  }
}

async function fetchTileSet(fancy) {
  const images = EVERY_TILE.map((tile) => {
    const image = new Image();
    image.src = tileToPath(tile, fancy);
    return image;
  });

  fetchedImages.push(...images);
  await Promise.all(images.map(waitForImage));
}

export async function fetchEveryTileDrawing(hand) {
  if (hasStarted) {
    return;
  }
  hasStarted = true;

  await waitForPageLoad();
  await waitForDrawingsOnScreen(hand);

  const fancy = hand.classList.contains(FANCY_CLASS);
  await fetchTileSet(fancy);
  await fetchTileSet(!fancy);
}
