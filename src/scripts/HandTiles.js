import * as TileConversion from './TileConversion';

function removeWinningTileFromHand(handString, winningTile) {
  const number = winningTile[0];
  const suit = winningTile[1];
  const pattern = '((' + number + ')[\\d]*' + suit + ')';
  const regex = new RegExp(pattern, 'g');
  const matches = [...handString.matchAll(regex)];
  const index = matches[0].index;

  return handString.slice(0, index) + handString.slice(index + 1);
}

function getConcealedTiles(agari) {
  return TileConversion.tileStringToArray(
    removeWinningTileFromHand(agari.hand, agari.winningTile),
  );
}

function getMeldSlots(meld) {
  const { calledMatrix, tileString } =
    TileConversion.extractDecoratorsFromTileString(meld);
  const slots = [];

  TileConversion.tileStringToArray(tileString).forEach((tile, index) => {
    const called = calledMatrix[index] === 1;
    const previousSlot = slots[slots.length - 1];

    if (called && previousSlot?.called) {
      previousSlot.tiles.push(tile);
    } else {
      slots.push({ called, tiles: [tile] });
    }
  });

  return slots;
}

function getMelds(agari) {
  return (agari.melds ?? []).map(getMeldSlots);
}

export { getConcealedTiles, getMelds };
