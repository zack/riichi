import { Dialog, Text } from '@radix-ui/themes';
import { useRef, useState } from 'react';

import { useTranslation } from '../i18n/I18nContext';
import {
  getConcealedTiles,
  getMelds,
  getRowsBySuit,
} from '../scripts/HandTiles';
import * as TileConversion from '../scripts/TileConversion';
import { useNamesOnTiles } from '../scripts/TileNames';
import { Meld } from './Meld';
import { HonbaCount, RiichiStick } from './Sticks';
import { Tile } from './Tile';

const MagnifierIcon = () => (
  <svg aria-hidden='true' height='14' viewBox='0 0 15 15' width='14'>
    <path
      clipRule='evenodd'
      d='M10 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-.691 3.516a4.5 4.5 0 1 1 .707-.707l2.838 2.837a.5.5 0 0 1-.708.708L9.31 10.016ZM6.5 4.5a.5.5 0 0 1 .5.5v1h1a.5.5 0 0 1 0 1H7v1a.5.5 0 0 1-1 0V7H5a.5.5 0 0 1 0-1h1V5a.5.5 0 0 1 .5-.5Z'
      fill='currentColor'
      fillRule='evenodd'
    />
  </svg>
);

const TileList = ({ fancy, showNames, tiles }) => {
  const { t } = useTranslation();

  return tiles.map((tile, index) => (
    <Tile
      alt={TileConversion.tileToName(tile, t)}
      key={index}
      label={showNames ? TileConversion.tileToLabel(tile, t) : undefined}
      path={TileConversion.tileToPath(tile, fancy)}
      text={TileConversion.tileToText(tile, t)}
    />
  ));
};

const InfoItem = ({ children, label }) => (
  <div className='bigger-hand-info-item'>
    <Text asChild color='gray' size='2'>
      <dt>{label}</dt>
    </Text>
    <dd className='bigger-hand-tiles'>{children}</dd>
  </div>
);

// This is its own component because Radix mounts a dialog's content after the
// dialog opens, so anything that measures has to be a child
function BiggerHandTiles({ agari, fancy, handLabel, showHonba, showNames }) {
  const { t } = useTranslation();
  const handRef = useRef(null);
  const concealedTiles = getConcealedTiles(agari);
  const melds = getMelds(agari);
  const concealedRows = getRowsBySuit(concealedTiles);
  const hasHonba = showHonba && agari.honbaSticks > 0;
  const namesOnTiles = useNamesOnTiles(
    handRef,
    showNames,
    `${handLabel} ${fancy} ${t('info.ron')}`,
  );

  return (
    <div
      className={`bigger-hand ${fancy ? 'fancy-tiles' : ''} ${namesOnTiles ? 'names-on-tiles' : ''}`}
      ref={handRef}
    >
      <div className='bigger-hand-info'>
        <dl className='bigger-hand-info-group'>
          <InfoItem label={t('info.round')}>
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
          <InfoItem label={t('info.seatWind')}>
            <TileList
              fancy={fancy}
              showNames={showNames}
              tiles={[agari.seatWind]}
            />
          </InfoItem>
        </dl>
        {(hasHonba || agari.isRiichi) && (
          <div className='bigger-hand-info-group'>
            {hasHonba && (
              <dl>
                <InfoItem
                  label={
                    agari.honbaSticks === 1
                      ? t('info.honbaStick')
                      : t('info.honbaSticks')
                  }
                >
                  <HonbaCount count={agari.honbaSticks} showNames={showNames} />
                </InfoItem>
              </dl>
            )}
            {agari.isRiichi && (
              <div className='bigger-hand-info-item bigger-hand-riichi'>
                <Text className='riichi-label' size='2'>
                  {t('info.riichi')}
                </Text>
                <span className='bigger-hand-tiles'>
                  <RiichiStick />
                </span>
              </div>
            )}
          </div>
        )}
        <dl className='bigger-hand-info-group'>
          <InfoItem
            label={
              agari.doraIndicators.length === 1
                ? t('info.doraIndicator')
                : t('info.doraIndicators')
            }
          >
            <TileList
              fancy={fancy}
              showNames={showNames}
              tiles={agari.doraIndicators}
            />
          </InfoItem>
          {agari.uraDoraIndicators.length > 0 && (
            <InfoItem
              label={
                agari.uraDoraIndicators.length === 1
                  ? t('info.uraDoraIndicator')
                  : t('info.uraDoraIndicators')
              }
            >
              <TileList
                fancy={fancy}
                showNames={showNames}
                tiles={agari.uraDoraIndicators}
              />
            </InfoItem>
          )}
        </dl>
      </div>

      <section>
        <Text asChild className='bigger-hand-heading' color='gray' size='2'>
          <h2>{t('handParts.concealed')}</h2>
        </Text>
        <div className='bigger-hand-rows'>
          {concealedRows.map((tiles, rowIndex) => (
            <div className='bigger-hand-tiles' key={rowIndex}>
              <TileList fancy={fancy} showNames={showNames} tiles={tiles} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <Text asChild className='bigger-hand-heading bigger-hand-win' size='2'>
          <h2>
            {agari.isTsumo
              ? t('handParts.wonOnTsumo')
              : t('handParts.wonOnRon')}
          </h2>
        </Text>
        <div className='bigger-hand-tiles'>
          <Tile
            alt={TileConversion.tileToName(agari.winningTile, t)}
            label={
              showNames
                ? TileConversion.tileToLabel(agari.winningTile, t)
                : undefined
            }
            path={TileConversion.tileToPath(agari.winningTile, fancy)}
            text={TileConversion.tileToText(agari.winningTile, t)}
            winning
          />
        </div>
      </section>

      {melds.length > 0 && (
        <section>
          <Text asChild className='bigger-hand-heading' color='gray' size='2'>
            <h2>
              {melds.length === 1 ? t('handParts.meld') : t('handParts.melds')}
            </h2>
          </Text>
          <div className='bigger-hand-melds'>
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
        </section>
      )}
    </div>
  );
}

function BiggerHand({
  agari,
  children,
  fancy,
  handLabel,
  showHonba,
  showNames,
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);

  return (
    <Dialog.Root onOpenChange={setOpen} open={open}>
      <div className='bigger-hand-tiles-area' onClick={() => setOpen(true)}>
        {children}
      </div>
      <Dialog.Trigger>
        <button className='bigger-hand-button' type='button'>
          <MagnifierIcon />
          {t('biggerHand.open')}
        </button>
      </Dialog.Trigger>

      <Dialog.Content
        aria-describedby={undefined}
        maxWidth='480px'
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          contentRef.current?.focus({ preventScroll: true });
        }}
        ref={contentRef}
      >
        <Dialog.Title>{handLabel}</Dialog.Title>

        <BiggerHandTiles
          agari={agari}
          fancy={fancy}
          handLabel={handLabel}
          showHonba={showHonba}
          showNames={showNames}
        />

        <div className='bigger-hand-close'>
          <Dialog.Close>
            <button className='action-button' type='button'>
              {t('common.close')}
            </button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export { BiggerHand };
