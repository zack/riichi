import './App.css';
import './celebration.css';
import { Container, Flex, Heading } from '@radix-ui/themes';
import { Analytics } from '@vercel/analytics/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { AnswerKey } from './components/AnswerKey';
import { BiggerHand } from './components/BiggerHand';
import { CopyHandLink } from './components/CopyHandLink';
import { HelpPanel } from './components/HelpPanel';
import { InfoPanel } from './components/InfoPanel';
import { OptionsMenu } from './components/OptionsMenu';
import { QuizPanel } from './components/QuizPanel';
import { TilePanel } from './components/TilePanel';
import { WinRate } from './components/WinRate';
import { useTranslation } from './i18n/I18nContext';
import { HAND_FILE_EXTENSION, HAND_PARAM, getHandId } from './scripts/Hands';
import { EXACT_FU, getStoredOptions, storeOptions } from './scripts/Options';
import { calculatePoints } from './scripts/PointCalculation';
import {
  CORRECT,
  REVEALED,
  WRONG,
  answerIsCorrect,
  fuIsIgnored,
  getGradedFields,
  getQuizFields,
} from './scripts/QuizFields';
import { scrollToBottom } from './scripts/ScrollToBottom';
import { useNamesOnTiles } from './scripts/TileNames';

const HANDS = import.meta.glob('./data/*.json', {
  eager: true,
  import: 'default',
});
const HAND_PATH = './data/';
const HAND_FILES = Object.keys(HANDS).map((path) =>
  path.slice(HAND_PATH.length),
);

const CARD_COLORS = {
  [CORRECT]: 'green',
  [WRONG]: 'red',
};
const UNANSWERED_CARD_COLOR = 'orange';

const WIDEST_HAND_NUMBER = 80;

const CELEBRATION_INTERVAL = 10;

function getRandomHandFile() {
  return HAND_FILES[Math.floor(Math.random() * HAND_FILES.length)];
}

function getStartingHandFile() {
  const params = new URLSearchParams(window.location.search);
  const handId = getHandId(params.get(HAND_PARAM) ?? '');
  const handFile = handId + HAND_FILE_EXTENSION;

  if (HAND_FILES.includes(handFile)) {
    return handFile;
  } else {
    return getRandomHandFile();
  }
}

function clearHandParam() {
  const url = new URL(window.location.href);

  if (url.searchParams.has(HAND_PARAM)) {
    url.searchParams.delete(HAND_PARAM);
    window.history.replaceState(null, '', url);
  }
}

function countMeetsWinType(hand) {
  const count = hand?.querySelector('.tile-label.floating');
  const winType = hand?.querySelector('.win-type');

  if (!count || !winType) {
    return false;
  }

  const countText = document.createRange();
  countText.selectNodeContents(count);
  const countBox = countText.getBoundingClientRect();
  const winTypeBox = winType.getBoundingClientRect();

  return countBox.left < winTypeBox.right && winTypeBox.left < countBox.right;
}

function App() {
  const { t } = useTranslation();

  const [handFile, setHandFile] = useState(getStartingHandFile);
  const [handNumber, setHandNumber] = useState(0);
  const [options, setOptions] = useState(getStoredOptions);
  const [checkedOptions, setCheckedOptions] = useState(undefined);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(undefined);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [countIsCrowded, setCountIsCrowded] = useState(false);
  const handRef = useRef(null);

  // Move focus up to the new hand so a screen reader starts from the new tiles,
  // the same way it would on a new page. Not on page load though
  useEffect(() => {
    const hand = handRef.current;

    if (handNumber > 0 && hand) {
      // Only focusable while it has focus. If the tabindex is left on, some
      // screen readers announce the whole section as a control.
      hand.tabIndex = -1;
      hand.addEventListener('blur', () => hand.removeAttribute('tabindex'), {
        once: true,
      });
      hand.focus();
    }
  }, [handNumber]);

  useEffect(() => {
    storeOptions(options);
  }, [options]);

  useLayoutEffect(() => {
    setCountIsCrowded(countMeetsWinType(handRef.current));
  }, [handFile, options, t]);

  useEffect(() => {
    const hand = handRef.current;
    const handleChange = () => {
      setCountIsCrowded(countMeetsWinType(hand));
    };
    const resizeObserver = new ResizeObserver(handleChange);

    resizeObserver.observe(hand);
    document.fonts.addEventListener('loadingdone', handleChange);
    return () => {
      resizeObserver.disconnect();
      document.fonts.removeEventListener('loadingdone', handleChange);
    };
  }, []);

  useEffect(() => {
    if (result !== undefined) {
      scrollToBottom();
    }
  }, [result]);

  const checked = result !== undefined;
  const handOptions = checkedOptions
    ? {
        ...checkedOptions,
        fancyTiles: options.fancyTiles,
        showTileNames: options.showTileNames,
      }
    : options;
  const agari = HANDS[HAND_PATH + handFile];
  const points = calculatePoints(agari, handOptions, t);
  const fields = getQuizFields(agari, handOptions, points, answers, t);
  const handLabel = `${t('winRate.hand')} #${handNumber + 1}`;
  const namesOnTiles = useNamesOnTiles(
    handRef,
    options.showTileNames,
    `${handFile} ${options.fancyTiles} ${t('info.ron')}`,
  );

  const handleChangeAnswer = (fieldId, value) => {
    setAnswers((current) => {
      const next = { ...current, [fieldId]: value };

      if (fieldId === 'han' && fuIsIgnored(options, next)) {
        next.fu = '';
      }

      return next;
    });
  };

  const handleChangeOption = (optionId, value) => {
    setOptions((current) => ({ ...current, [optionId]: value }));

    const switchesFuOff = fuIsIgnored(
      { ...options, [optionId]: value },
      answers,
    );
    if ((optionId === EXACT_FU || switchesFuOff) && !checked) {
      setAnswers((current) => ({ ...current, fu: '' }));
    }
  };

  const handleCheck = () => {
    const gradedFields = getGradedFields(fields, answers);

    setCheckedOptions({ ...options });

    const isCorrect = gradedFields.every((field) =>
      answerIsCorrect(field, answers),
    );

    const realAnswers = fields
      .map(
        (field) =>
          `${field.label}: ${field.answer === '' ? t('quiz.noFuOnLimit') : field.answer}`,
      )
      .join(', ');

    if (gradedFields.length === 0) {
      setResult(REVEALED);
      setStatusMessage(realAnswers);
    } else if (isCorrect) {
      setResult(CORRECT);
      setCorrectAnswers(correctAnswers + 1);
      setStatusMessage(`${t('winRate.correct')}. ${realAnswers}`);
    } else {
      setResult(WRONG);
      setWrongAnswers(wrongAnswers + 1);
      setStatusMessage(`${t('winRate.wrong')}. ${realAnswers}`);
    }
  };

  const handleNewHand = () => {
    clearHandParam();
    setAnswers({});
    setCheckedOptions(undefined);
    setHandFile(getRandomHandFile());
    setHandNumber(handNumber + 1);
    setResult(undefined);
    setStatusMessage('');
  };

  return (
    <div className='app'>
      <a className='skip-link' href='#main'>
        {t('common.skipToMain')}
      </a>

      <Analytics />
      <Container size='2'>
        <header>
          <Flex align='center' gap='2' justify='between'>
            <Heading as='h1' size={{ initial: '4', xs: '6' }} weight='bold'>
              Riichi Scoring Trainer
            </Heading>
            <Flex gap='2'>
              <OptionsMenu
                handFile={handFile}
                handIsChecked={checked}
                onChangeOption={handleChangeOption}
                options={options}
              />
              <HelpPanel
                fancyTiles={options.fancyTiles}
                kiriageMangan={options.kiriageMangan}
                showNames={options.showTileNames}
              />
            </Flex>
          </Flex>
        </header>

        <main id='main' tabIndex={-1}>
          <Flex align='center' gap='2' justify='between' mt='3' wrap='wrap'>
            <WinRate
              celebrate={
                correctAnswers > 0
                && correctAnswers % CELEBRATION_INTERVAL === 0
              }
              correctAnswers={correctAnswers}
              wrongAnswers={wrongAnswers}
            />
            <Flex align='center' gap='2'>
              <CopyHandLink handFile={handFile} onCopy={setStatusMessage} />
              <span className='badge hand-count hand-number'>
                <span>
                  <span className='hand-word'>{t('winRate.hand')}</span>
                  <span aria-hidden='true' className='hand-word-short'>
                    {t('winRate.handShort')}
                  </span>
                  {` #${handNumber + 1}`}
                </span>
                <span aria-hidden='true' className='hand-number-sizer'>
                  <span className='hand-word'>{t('winRate.hand')}</span>
                  <span className='hand-word-short'>
                    {t('winRate.handShort')}
                  </span>
                  {` #${WIDEST_HAND_NUMBER}`}
                </span>
              </span>
            </Flex>
          </Flex>

          <section
            aria-labelledby='hand-heading'
            className={`color-card hand-card jade ${options.fancyTiles ? 'fancy-tiles' : ''} ${countIsCrowded ? 'count-crowded' : ''} ${namesOnTiles ? 'names-on-tiles' : ''}`}
            ref={handRef}
          >
            <h2 className='visually-hidden' id='hand-heading'>
              {handLabel}
            </h2>
            <InfoPanel agari={agari} options={handOptions} />
            <BiggerHand
              agari={agari}
              fancy={options.fancyTiles}
              handLabel={handLabel}
              showNames={options.showTileNames}
            >
              <TilePanel
                agari={agari}
                fancy={options.fancyTiles}
                showNames={options.showTileNames}
              />
            </BiggerHand>
          </section>

          <QuizPanel
            answers={answers}
            cardColor={CARD_COLORS[result] ?? UNANSWERED_CARD_COLOR}
            checked={checked}
            fields={fields}
            key={handNumber}
            onChangeAnswer={handleChangeAnswer}
            onCheck={handleCheck}
            onNewHand={handleNewHand}
            result={result}
          />

          {checked && (
            <AnswerKey agari={agari} options={handOptions} points={points} />
          )}

          <div aria-atomic='true' className='visually-hidden' role='status'>
            {statusMessage}
          </div>
        </main>
      </Container>
    </div>
  );
}

export default App;
