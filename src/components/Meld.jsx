import { useTranslation } from '../i18n/I18nContext';
import { getMeldTileName } from '../scripts/SpokenHand';
import * as TileConversion from '../scripts/TileConversion';
import { Tile } from './Tile';

function Meld({ fancy, showNames, slots }) {
  const { t } = useTranslation();

  return (
    <span className='tile-group'>
      {slots.map(({ called, tiles }, slotIndex) => (
        <span
          className={tiles.length > 1 ? 'tile-slot pile' : 'tile-slot'}
          key={slotIndex}
        >
          {tiles.map((tile, index) => (
            <Tile
              alt={getMeldTileName(called, tile, t)}
              called={called}
              key={index}
              label={
                showNames ? TileConversion.tileToLabel(tile, t) : undefined
              }
              path={TileConversion.tileToPath(tile, fancy)}
              text={TileConversion.tileToText(tile, t)}
            />
          ))}
        </span>
      ))}
    </span>
  );
}

export { Meld };
