import { Flex } from '@radix-ui/themes';
import { useState } from 'react';

import { useTranslation } from '../i18n/I18nContext';

function WinRate({ celebrate, correctAnswers, wrongAnswers }) {
  const { t } = useTranslation();
  const [rainbowDoneAt, setRainbowDoneAt] = useState();
  const rate = Math.round(
    (correctAnswers / Math.max(correctAnswers + wrongAnswers, 1)) * 100,
  );

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
      <span className='badge rate'>
        {t('winRate.rate')}: {rate}%
      </span>
    </Flex>
  );
}

export { WinRate };
