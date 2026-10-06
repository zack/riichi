import { Text } from '@radix-ui/themes';

import { useTranslation } from '../i18n/I18nContext';
import { getConcealedTiles, getMelds } from '../scripts/HandTiles';
import * as TileConversion from '../scripts/TileConversion';
import { Meld } from './Meld';
import { Tile } from './Tile';

// Sizes in px. TILE_BORDER has to match --tile-border in App.css.
const GROUP_GAP = 4;
const TILE_BORDER = 1;
const TILE_GAP = 0;
const FANCY_TILE_GAP = 1;

const PLAIN_HAND_TILES = 14;

// These have to match --plain-tile-ratio and --tile-ratio in App.css
const TILE_RATIO = 4 / 3;
const FANCY_TILE_RATIO = 255 / 210;

function TilePanel({ agari, fancy, showNames }) {
  const { t } = useTranslation();
  const concealedTiles = getConcealedTiles(agari);
  const melds = getMelds(agari);
  const meldSlots = melds.flat();

  const calledCount = meldSlots.filter((slot) => slot.called).length;
  const slotCount = concealedTiles.length + 1 + meldSlots.length;
  const groupCount = 2 + melds.length;
  const calledTileWidths = fancy ? FANCY_TILE_RATIO : TILE_RATIO;
  const tileWidths = slotCount - calledCount + calledCount * calledTileWidths;
  const tileGap = fancy ? FANCY_TILE_GAP : TILE_GAP;
  const tileBorder = fancy ? 0 : TILE_BORDER;

  const calledBorderSlack =
    calledCount * 2 * tileBorder * (calledTileWidths - 1);
  const gaps =
    tileGap * (slotCount - groupCount)
    + GROUP_GAP * (groupCount - 1)
    - calledBorderSlack;

  const plainHandGaps = tileGap * (PLAIN_HAND_TILES - 2) + GROUP_GAP;

  const style = {
    '--group-gap': `${GROUP_GAP}px`,
    '--line-tile-width': `calc((100cqw - ${gaps}px) / ${tileWidths})`,
    '--row-tile-width': `calc((100cqw - ${plainHandGaps}px) / ${PLAIN_HAND_TILES})`,
    '--tile-gap': `${tileGap}px`,
  };

  const classNames = ['hand'];
  if (meldSlots.some((slot) => slot.tiles.length > 1)) {
    classNames.push('piled');
  }
  if (showNames) {
    classNames.push('named');
  }

  const lastGroupClass = melds.length === 0 ? 'last' : '';

  const getLabel = (tile) => {
    if (showNames) {
      return TileConversion.tileToLabel(tile, t);
    } else {
      return undefined;
    }
  };

  return (
    <div className='hand-container'>
      <div className={classNames.join(' ')} style={style}>
        <span
          aria-label={t('handParts.concealed')}
          className='tile-group'
          role='group'
        >
          {concealedTiles.map((tile, index) => (
            <Tile
              alt={TileConversion.tileToName(tile, t)}
              key={index}
              label={getLabel(tile)}
              path={TileConversion.tileToPath(tile, fancy)}
            />
          ))}
        </span>
        <span
          aria-label={
            agari.isTsumo ? t('handParts.wonOnTsumo') : t('handParts.wonOnRon')
          }
          className={`tile-group winning-group ${lastGroupClass}`}
          role='group'
        >
          <Text aria-hidden='true' className='win-type' size='1'>
            {agari.isTsumo ? t('info.tsumo') : t('info.ron')}
          </Text>
          <Tile
            alt={TileConversion.tileToName(agari.winningTile, t)}
            label={getLabel(agari.winningTile)}
            path={TileConversion.tileToPath(agari.winningTile, fancy)}
            winning
          />
        </span>
        {melds.map((slots, meldIndex) => (
          <Meld
            fancy={fancy}
            key={meldIndex}
            name={t('handParts.meldNumber').replace('{}', meldIndex + 1)}
            showNames={showNames}
            slots={slots}
          />
        ))}
      </div>
    </div>
  );
}

export { TilePanel };
