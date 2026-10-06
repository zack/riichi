import { useTranslation } from '../i18n/I18nContext';
import * as TileConversion from '../scripts/TileConversion';
import { Tile } from './Tile';

function getMeldTileName(called, tile, t) {
  const name = TileConversion.tileToName(tile, t);

  if (called) {
    return t('tiles.called').replace('{}', name);
  } else {
    return name;
  }
}

function Meld({ fancy, name, showNames, slots }) {
  const { t } = useTranslation();

  return (
    <span aria-label={name} className='tile-group' role='group'>
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
            />
          ))}
        </span>
      ))}
    </span>
  );
}

export { Meld };
