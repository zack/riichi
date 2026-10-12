import './App.css';
import './celebration.css';
import { Container, Flex, Text } from '@radix-ui/themes';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { AnswerKey } from './components/AnswerKey';
import { BiggerHand } from './components/BiggerHand';
import { CopyHandLink } from './components/CopyHandLink';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HelpPanel } from './components/HelpPanel';
import { InfoPanel } from './components/InfoPanel';
import { OptionsMenu } from './components/OptionsMenu';
import { QuizPanel } from './components/QuizPanel';
import { TilePanel } from './components/TilePanel';
import { WelcomeDialog } from './components/WelcomeDialog';
import { WinRate } from './components/WinRate';
import { useTranslation } from './i18n/I18nContext';
import {
  HAND_FILE_EXTENSION,
  HAND_PARAM,
  getHandId,
  getHandUrl,
} from './scripts/Hands';
import { showHandWithAnswer } from './scripts/HandWithAnswer';
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
  getStatusMessage,
} from './scripts/QuizFields';
import { getStoredSession, isCount, storeSession } from './scripts/Session';
import { fetchEveryTileDrawing } from './scripts/TileDrawings';
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

function getLinkedHandFile() {
  const params = new URLSearchParams(window.location.search);
  return getHandId(params.get(HAND_PARAM) ?? '') + HAND_FILE_EXTENSION;
}

function getHandNumberInHistory() {
  const handNumber = window.history.state?.handNumber;
  return isCount(handNumber) ? handNumber : undefined;
}

function getStartingSession() {
  const linkedFile = getLinkedHandFile();
  const stored = getStoredSession();
  const hasLink = linkedFile !== HAND_FILE_EXTENSION;
  const linkIsBroken = hasLink && !HAND_FILES.includes(linkedFile);

  let handFile;
  let isStoredHand;
  if (hasLink && !linkIsBroken) {
    handFile = linkedFile;
    isStoredHand = linkedFile === stored.handFile;
  } else if (!hasLink && HAND_FILES.includes(stored.handFile)) {
    handFile = stored.handFile;
    isStoredHand = true;
  } else {
    handFile = getRandomHandFile();
    isStoredHand = false;
  }

  return {
    ...stored,
    answers: isStoredHand ? stored.answers : {},
    handFile,
    handNumber: isStoredHand
      ? stored.handNumber
      : (getHandNumberInHistory() ?? 0),
    linkIsBroken,
  };
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
  const { currentLanguage, t } = useTranslation();

  const [start] = useState(getStartingSession);
  const [handFile, setHandFile] = useState(start.handFile);
  const [handNumber, setHandNumber] = useState(start.handNumber);
  const [handChanges, setHandChanges] = useState(0);
  const [linkIsBroken, setLinkIsBroken] = useState(start.linkIsBroken);
  const [options, setOptions] = useState(getStoredOptions);
  const [checkedOptions, setCheckedOptions] = useState(undefined);
  const [answers, setAnswers] = useState(start.answers);
  const [result, setResult] = useState(undefined);
  const [correctAnswers, setCorrectAnswers] = useState(start.correctAnswers);
  const [wrongAnswers, setWrongAnswers] = useState(start.wrongAnswers);
  const [statusMessage, setStatusMessage] = useState(
    start.linkIsBroken ? t('handLink.notFound') : '',
  );
  const [countIsCrowded, setCountIsCrowded] = useState(false);
  const handRef = useRef(null);
  const quizRef = useRef(null);
  const quizHeightBeforeCheck = useRef(0);

  // Move focus up to the new hand so a screen reader starts from the new tiles,
  // the same way it would on a new page. Not on page load though
  useEffect(() => {
    const hand = handRef.current;

    if (handChanges > 0 && hand) {
      // Only focusable while it has focus. If the tabindex is left on, some
      // screen readers announce the whole section as a control.
      hand.tabIndex = -1;
      hand.addEventListener('blur', () => hand.removeAttribute('tabindex'), {
        once: true,
      });
      hand.focus();
    }
  }, [handChanges]);

  useEffect(() => {
    if (handRef.current) {
      fetchEveryTileDrawing(handRef.current);
    }
  }, [handChanges]);

  useEffect(() => {
    window.history.replaceState(
      { handNumber: start.handNumber },
      '',
      getHandUrl(start.handFile),
    );
  }, [start]);

  useLayoutEffect(() => {
    setCountIsCrowded(countMeetsWinType(handRef.current));
  }, [currentLanguage, handFile, options]);

  useEffect(() => {
    const hand = handRef.current;
    const handleChange = () => {
      setCountIsCrowded(countMeetsWinType(hand));
    };
    const resizeObserver = new ResizeObserver(handleChange);

    if (hand) {
      resizeObserver.observe(hand);
    }
    document.fonts.addEventListener('loadingdone', handleChange);
    return () => {
      resizeObserver.disconnect();
      document.fonts.removeEventListener('loadingdone', handleChange);
    };
  }, [handChanges]);

  useLayoutEffect(() => {
    if (result !== undefined && handRef.current && quizRef.current) {
      showHandWithAnswer(
        handRef.current,
        quizRef.current,
        quizHeightBeforeCheck.current,
      );
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

  const shownAnswers = fuIsIgnored(handOptions, answers)
    ? { ...answers, fu: '' }
    : answers;
  const namesOnTiles = useNamesOnTiles(
    handRef,
    options.showTileNames,
    `${handFile} ${options.fancyTiles} ${currentLanguage}`,
  );

  useEffect(() => {
    storeSession({
      answers: checked ? {} : answers,
      correctAnswers,
      handFile,
      handNumber,
      wrongAnswers,
    });
  }, [answers, checked, correctAnswers, handFile, handNumber, wrongAnswers]);

  const showHand = (nextHandFile, nextHandNumber) => {
    setAnswers({});
    setCheckedOptions(undefined);
    setHandChanges((current) => current + 1);
    setHandFile(nextHandFile);
    setHandNumber(nextHandNumber);
    setLinkIsBroken(false);
    setResult(undefined);
    setStatusMessage('');
  };

  useEffect(() => {
    const handlePopState = () => {
      const linkedFile = getLinkedHandFile();

      if (linkedFile !== handFile && HAND_FILES.includes(linkedFile)) {
        showHand(linkedFile, getHandNumberInHistory() ?? handNumber);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handFile, handNumber]);

  const handleChangeAnswer = (fieldId, value) => {
    setAnswers((current) => ({ ...current, [fieldId]: value }));
  };

  const handleChangeOption = (optionId, value) => {
    const nextOptions = { ...options, [optionId]: value };

    setOptions(nextOptions);
    storeOptions(nextOptions);

    if (optionId === EXACT_FU && !checked) {
      setAnswers((current) => ({ ...current, fu: '' }));
    }
  };

  const handleCheck = () => {
    const gradedFields = getGradedFields(fields, answers);

    setCheckedOptions({ ...options });
    quizHeightBeforeCheck.current =
      quizRef.current.getBoundingClientRect().height;

    let nextResult;
    if (gradedFields.length === 0) {
      nextResult = REVEALED;
    } else if (gradedFields.every((field) => answerIsCorrect(field, answers))) {
      nextResult = CORRECT;
      setCorrectAnswers(correctAnswers + 1);
    } else {
      nextResult = WRONG;
      setWrongAnswers(wrongAnswers + 1);
    }

    setResult(nextResult);
    setStatusMessage(getStatusMessage(fields, answers, nextResult, t));
  };

  const handleNewHand = () => {
    const nextHandFile = getRandomHandFile();
    const nextHandNumber = handNumber + 1;

    window.history.pushState(
      { handNumber: nextHandNumber },
      '',
      getHandUrl(nextHandFile),
    );
    showHand(nextHandFile, nextHandNumber);
  };

  return (
    <div className='app'>
      <a className='skip-link' href='#main'>
        {t('common.skipToMain')}
      </a>

      <Analytics />
      <SpeedInsights />
      <Container size='2'>
        <header>
          <Flex align='center' gap='2' justify='between'>
            <h1 className='app-title'>Riichi Scoring Trainer</h1>
            <Flex gap='2'>
              <OptionsMenu
                handFile={handFile}
                handIsChecked={checked}
                handOptions={handOptions}
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

          {linkIsBroken && (
            <Text as='p' className='link-note' color='gray' size='2'>
              {t('handLink.notFound')}
            </Text>
          )}

          <ErrorBoundary
            handFile={handFile}
            handLabel={handLabel}
            onNewHand={handleNewHand}
            options={handOptions}
            resetKey={handChanges}
          >
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
                showHonba={handOptions.testHonba}
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
              answerKey={
                checked && (
                  <AnswerKey
                    agari={agari}
                    answers={shownAnswers}
                    fields={fields}
                    options={handOptions}
                    points={points}
                  />
                )
              }
              answers={shownAnswers}
              cardColor={CARD_COLORS[result] ?? UNANSWERED_CARD_COLOR}
              cardRef={quizRef}
              checked={checked}
              fields={fields}
              key={handChanges}
              onChangeAnswer={handleChangeAnswer}
              onCheck={handleCheck}
              onNewHand={handleNewHand}
              onStatus={setStatusMessage}
              result={result}
            />
          </ErrorBoundary>

          <div aria-atomic='true' className='visually-hidden' role='status'>
            {statusMessage}
          </div>
        </main>
      </Container>
      <WelcomeDialog />
    </div>
  );
}

export default App;
