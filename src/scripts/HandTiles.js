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

// Has to match --seven-to-a-row in src/App.css
const TILES_TO_A_ROW = 7;

function getRowsBySuit(tiles) {
  const suits = [];
  for (const tile of tiles) {
    const suit = tile[tile.length - 1];
    const lastSuit = suits[suits.length - 1];

    if (lastSuit?.suit === suit) {
      lastSuit.tiles.push(tile);
    } else {
      suits.push({ suit, tiles: [tile] });
    }
  }

  const rows = [[]];
  for (const { tiles: suitTiles } of suits) {
    const row = rows[rows.length - 1];
    if (row.length > 0 && row.length + suitTiles.length > TILES_TO_A_ROW) {
      rows.push([]);
    }

    for (const tile of suitTiles) {
      if (rows[rows.length - 1].length === TILES_TO_A_ROW) {
        rows.push([]);
      }
      rows[rows.length - 1].push(tile);
    }
  }

  return rows;
}

export { getConcealedTiles, getMelds, getRowsBySuit };
