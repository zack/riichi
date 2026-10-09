import { Flex } from '@radix-ui/themes';
import { useState } from 'react';

import { useTranslation } from '../i18n/I18nContext';

const NO_RATE = String.fromCodePoint(0x2013);

const SHORTEST_RATE = '0%';

function WinRate({ celebrate, correctAnswers, wrongAnswers }) {
  const { t } = useTranslation();
  const [rainbowDoneAt, setRainbowDoneAt] = useState();
  const handsAnswered = correctAnswers + wrongAnswers;
  const rate = Math.round((correctAnswers / Math.max(handsAnswered, 1)) * 100);

  // The class comes off when the animation is done, because its hidden layers
  // still change how the text in the row is drawn
  const celebrating = celebrate && rainbowDoneAt !== correctAnswers;

  return (
    <Flex align='center' className='win-rate' gap='2' justify='center'>
      <span
        className={`badge correct ${celebrating ? 'celebrating' : ''}`}
        onAnimationEnd={() => setRainbowDoneAt(correctAnswers)}
      >
        {t('winRate.correct')}: {correctAnswers}
      </span>
      <span className='badge wrong'>
        {t('winRate.wrong')}: {wrongAnswers}
      </span>
      {handsAnswered > 0 ? (
        <span className='badge rate'>
          {t('winRate.rate')}: {rate}%
        </span>
      ) : (
        <span className='badge rate'>
          <span>
            {t('winRate.rate')}:{' '}
            <span className='no-rate'>
              <span aria-hidden='true' className='no-rate-sizer'>
                {SHORTEST_RATE}
              </span>
              <span aria-hidden='true'>{NO_RATE}</span>
              <span className='visually-hidden'>{t('winRate.noRate')}</span>
            </span>
          </span>
        </span>
      )}
    </Flex>
  );
}

export { WinRate };
