import { Text } from '@radix-ui/themes';
import { useRef } from 'react';

import { useTranslation } from '../i18n/I18nContext';
import { useInfoRowFit } from '../scripts/InfoRow';
import * as TileConversion from '../scripts/TileConversion';
import { Tile } from './Tile';

const InfoItem = ({ children, label, stacked }) => (
  <div className='info-item'>
    <Text asChild className='info-label' size='1'>
      <dt>
        {stacked
          ? label.split(' ').map((word, index) => (
              <span className='info-label-line' key={index}>
                {word}
              </span>
            ))
          : label}
      </dt>
    </Text>
    <dd className='info-value'>{children}</dd>
  </div>
);

const RiichiStick = () => (
  <svg aria-hidden='true' className='riichi-stick' viewBox='0 0 64 10'>
    <rect height='9' rx='4.5' width='63' x='0.5' y='0.5' />
    <circle cx='32' cy='5' r='2.2' />
  </svg>
);

const MAX_COUNTABLE_HONBA = 3;

const HONBA_STICK_GAP = 2;
const HONBA_STICK_HEIGHT = 5;
const HONBA_STICK_WIDTH = 36;
const HONBA_DOT_COLUMNS = [13.5, 16.5, 19.5, 22.5];
const HONBA_DOT_ROWS = [1.6, 3.4];

const HonbaSticks = ({ count }) => {
  const sticks = Array.from({ length: count }, (_stick, index) => index);
  const height = count * HONBA_STICK_HEIGHT + (count - 1) * HONBA_STICK_GAP;

  return (
    <svg
      aria-label={count}
      className='honba-sticks'
      role='img'
      viewBox={`0 0 ${HONBA_STICK_WIDTH} ${height}`}
    >
      {sticks.map((stick) => {
        const top = stick * (HONBA_STICK_HEIGHT + HONBA_STICK_GAP);

        return (
          <g key={stick}>
            <rect
              height={HONBA_STICK_HEIGHT - 1}
              rx={(HONBA_STICK_HEIGHT - 1) / 2}
              width={HONBA_STICK_WIDTH - 1}
              x='0.5'
              y={top + 0.5}
            />
            {HONBA_DOT_ROWS.map((row) =>
              HONBA_DOT_COLUMNS.map((column) => (
                <circle
                  cx={column}
                  cy={top + row}
                  key={`${row}-${column}`}
                  r='0.6'
                />
              )),
            )}
          </g>
        );
      })}
    </svg>
  );
};

function InfoPanel({ agari, options }) {
  const { currentLanguage, t } = useTranslation();
  const infoRef = useRef(null);
  const fancy = options.fancyTiles;
  const showNames = options.showTileNames;
  useInfoRowFit(
    infoRef,
    [
      agari.doraIndicators,
      agari.honbaSticks,
      agari.isRiichi,
      agari.uraDoraIndicators,
      currentLanguage,
      fancy,
      options.testHonba,
      showNames,
    ].join(' '),
  );

  return (
    <div className='info' ref={infoRef}>
      <dl className='info-group'>
        <InfoItem label={t('info.round')} stacked>
          <Tile
            alt={TileConversion.windToName(agari.roundWind, t)}
            label={
              showNames
                ? TileConversion.windToLabel(agari.roundWind, t)
                : undefined
            }
            path={TileConversion.windToPath(agari.roundWind, fancy)}
          />
        </InfoItem>
        <InfoItem label={t('info.seatWind')} stacked>
          <Tile
            alt={TileConversion.tileToName(agari.seatWind, t)}
            label={
              showNames
                ? TileConversion.tileToLabel(agari.seatWind, t)
                : undefined
            }
            path={TileConversion.tileToPath(agari.seatWind, fancy)}
          />
        </InfoItem>
        {options.testHonba && agari.honbaSticks > 0 && (
          <InfoItem
            label={
              agari.honbaSticks === 1
                ? t('info.honbaStick')
                : t('info.honbaSticks')
            }
            stacked
          >
            <span className='tile-cell honba'>
              <span className='info-number'>
                <HonbaSticks count={agari.honbaSticks} />
              </span>
              {(showNames || agari.honbaSticks > MAX_COUNTABLE_HONBA) && (
                <span
                  aria-hidden='true'
                  className={`tile-label ${showNames ? '' : 'floating'}`}
                >
                  {agari.honbaSticks > MAX_COUNTABLE_HONBA
                    && `(${agari.honbaSticks})`}
                </span>
              )}
            </span>
          </InfoItem>
        )}
      </dl>
      {agari.isRiichi && (
        <div className='riichi'>
          <Text className='riichi-label' size='1'>
            {t('info.riichi')}
          </Text>
          <RiichiStick />
        </div>
      )}
      <dl className='info-group info-group-end'>
        <InfoItem
          label={
            agari.doraIndicators.length === 1
              ? t('info.doraIndicator')
              : t('info.doraIndicators')
          }
          stacked
        >
          {agari.doraIndicators.map((tile, index) => (
            <Tile
              alt={TileConversion.tileToName(tile, t)}
              key={index}
              label={
                showNames ? TileConversion.tileToLabel(tile, t) : undefined
              }
              path={TileConversion.tileToPath(tile, fancy)}
            />
          ))}
        </InfoItem>
        {agari.uraDoraIndicators.length > 0 && (
          <InfoItem
            label={
              agari.uraDoraIndicators.length === 1
                ? t('info.uraDoraIndicator')
                : t('info.uraDoraIndicators')
            }
            stacked
          >
            {agari.uraDoraIndicators.map((tile, index) => (
              <Tile
                alt={TileConversion.tileToName(tile, t)}
                key={index}
                label={
                  showNames ? TileConversion.tileToLabel(tile, t) : undefined
                }
                path={TileConversion.tileToPath(tile, fancy)}
              />
            ))}
          </InfoItem>
        )}
      </dl>
    </div>
  );
}

export { InfoPanel };
