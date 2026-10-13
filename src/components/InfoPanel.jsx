import { Text } from '@radix-ui/themes';
import { useRef } from 'react';

import { useTranslation } from '../i18n/I18nContext';
import { useInfoRowFit } from '../scripts/InfoRow';
import { getSpokenInfo } from '../scripts/SpokenHand';
import * as TileConversion from '../scripts/TileConversion';
import { HonbaCount, RiichiStick } from './Sticks';
import { Tile } from './Tile';

const LABEL_BREAK = /[ \u200b]/;

const InfoItem = ({ children, label, stacked }) => (
  <div className='info-item'>
    <Text asChild className='info-label' size='1'>
      <dt>
        {stacked
          ? label.split(LABEL_BREAK).map((word, index) => (
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

  const honbaLabel =
    agari.honbaSticks === 1 ? t('info.honbaStick') : t('info.honbaSticks');
  const doraLabel =
    agari.doraIndicators.length === 1
      ? t('info.doraIndicator')
      : t('info.doraIndicators');
  const uraDoraLabel =
    agari.uraDoraIndicators.length === 1
      ? t('info.uraDoraIndicator')
      : t('info.uraDoraIndicators');
  return (
    <>
      <span className='visually-hidden spoken-info'>
        {getSpokenInfo(agari, options.testHonba, t)}
      </span>
      <div aria-hidden='true' className='info' ref={infoRef}>
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
              text={TileConversion.windToLabel(agari.roundWind, t)}
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
              text={TileConversion.tileToText(agari.seatWind, t)}
            />
          </InfoItem>
          {options.testHonba && agari.honbaSticks > 0 && (
            <InfoItem label={honbaLabel} stacked>
              <HonbaCount count={agari.honbaSticks} showNames={showNames} />
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
          <InfoItem label={doraLabel} stacked>
            {agari.doraIndicators.map((tile, index) => (
              <Tile
                alt={TileConversion.tileToName(tile, t)}
                key={index}
                label={
                  showNames ? TileConversion.tileToLabel(tile, t) : undefined
                }
                path={TileConversion.tileToPath(tile, fancy)}
                text={TileConversion.tileToText(tile, t)}
              />
            ))}
          </InfoItem>
          {agari.uraDoraIndicators.length > 0 && (
            <InfoItem label={uraDoraLabel} stacked>
              {agari.uraDoraIndicators.map((tile, index) => (
                <Tile
                  alt={TileConversion.tileToName(tile, t)}
                  key={index}
                  label={
                    showNames ? TileConversion.tileToLabel(tile, t) : undefined
                  }
                  path={TileConversion.tileToPath(tile, fancy)}
                  text={TileConversion.tileToText(tile, t)}
                />
              ))}
            </InfoItem>
          )}
        </dl>
      </div>
    </>
  );
}

export { InfoPanel };
