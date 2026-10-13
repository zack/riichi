import { getConcealedTiles, getMelds } from './HandTiles';
import * as TileConversion from './TileConversion';

const ZERO_WIDTH_SPACE = '\u200b';

function getMeldTileName(called, tile, t) {
  const name = TileConversion.tileToName(tile, t);

  if (called) {
    return t('tiles.called').replace('{}', name);
  } else {
    return name;
  }
}

function getSpokenRow(label, values) {
  return `${label.replaceAll(ZERO_WIDTH_SPACE, '')}: ${values.join(', ')}.`;
}

function getTileNames(tiles, t) {
  return tiles.map((tile) => TileConversion.tileToName(tile, t));
}

// The rows above the hand, as one sentence for a screen reader
function getSpokenInfo(agari, showHonba, t) {
  const dora = agari.doraIndicators;
  const uraDora = agari.uraDoraIndicators;

  return [
    getSpokenRow(t('info.round'), [
      TileConversion.windToName(agari.roundWind, t),
    ]),
    getSpokenRow(t('info.seatWind'), getTileNames([agari.seatWind], t)),
    showHonba
      && agari.honbaSticks > 0
      && getSpokenRow(
        agari.honbaSticks === 1 ? t('info.honbaStick') : t('info.honbaSticks'),
        [agari.honbaSticks],
      ),
    agari.isRiichi && t('info.riichi'),
    getSpokenRow(
      dora.length === 1 ? t('info.doraIndicator') : t('info.doraIndicators'),
      getTileNames(dora, t),
    ),
    uraDora.length > 0
      && getSpokenRow(
        uraDora.length === 1
          ? t('info.uraDoraIndicator')
          : t('info.uraDoraIndicators'),
        getTileNames(uraDora, t),
      ),
  ]
    .filter(Boolean)
    .join(' ');
}

// The hand, as one sentence for a screen reader
function getSpokenHand(agari, t) {
  return [
    getSpokenRow(
      t('handParts.concealed'),
      getTileNames(getConcealedTiles(agari), t),
    ),
    getSpokenRow(
      agari.isTsumo ? t('handParts.wonOnTsumo') : t('handParts.wonOnRon'),
      getTileNames([agari.winningTile], t),
    ),
    ...getMelds(agari).map((slots, meldIndex) =>
      getSpokenRow(
        t('handParts.meldNumber').replace('{}', meldIndex + 1),
        slots.flatMap(({ called, tiles }) =>
          tiles.map((tile) => getMeldTileName(called, tile, t)),
        ),
      ),
    ),
  ].join(' ');
}

export { getMeldTileName, getSpokenHand, getSpokenInfo };
