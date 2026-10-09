import { Heading, Text } from '@radix-ui/themes';
import { RadioGroup, Tabs } from 'radix-ui';
import { useRef, useState } from 'react';

import { useTranslation } from '../i18n/I18nContext';
import { MARK_NAMES } from '../scripts/Marks';
import {
  CORRECT,
  REVEALED,
  WRONG,
  answerIsCorrect,
  answerIsNumber,
  getGradedFields,
  getMissingFields,
} from '../scripts/QuizFields';
import { GearIcon } from './GearIcon';
import { Mark } from './Mark';

const BUTTON_LABELS = [
  'buttons.checkAnswer',
  'buttons.justTellMe',
  'buttons.newHand',
];
const VERDICT_LABELS = ['quiz.correct', 'quiz.incorrect', 'quiz.toldYou'];

const RESULT_LABELS = {
  [CORRECT]: 'quiz.correct',
  [REVEALED]: 'quiz.toldYou',
  [WRONG]: 'quiz.incorrect',
};

const MAX_BOX_LENGTH = 8;

const ENTER_GOES_ON = 'next';
const ENTER_CHECKS = 'done';

const ENTER_KEY = 'Enter';
const PRESSING_KEYS = [ENTER_KEY, ' '];

const ANSWER_TAB = 'answer';
const YOUR_ANSWER_TAB = 'your-answer';

function getChoiceResult(answers, checked, choice, field) {
  if (!checked) {
    return undefined;
  } else if (choice === field.answer) {
    return CORRECT;
  } else if (choice === answers[field.id] && !field.ignored) {
    return WRONG;
  } else {
    return undefined;
  }
}

function getBoxResult(answers, checked, field, graded) {
  if (!checked || !graded) {
    return undefined;
  } else if (answerIsCorrect(field, answers)) {
    return CORRECT;
  } else {
    return WRONG;
  }
}

const RealAnswer = ({ field }) => {
  const { t } = useTranslation();

  return (
    <span className='answer-stack'>
      <span className='answer-caption'>
        {t('quiz.realAnswer')}
        <span className='visually-hidden'>: </span>
      </span>
      <Text className='answer-number' weight='bold'>
        {field.answer} <Mark result={CORRECT} />
      </Text>
    </span>
  );
};

const DisabledNote = ({ field }) => {
  const { t } = useTranslation();

  return (
    <Text className='field-note' color='gray' id={`${field.id}-note`} size='1'>
      {t('quiz.disabledOnLimit')}
    </Text>
  );
};

const NoAnswerNote = ({ answered, field }) => {
  const { t } = useTranslation();

  return (
    <Text
      as='span'
      className={`field-note ${answered ? 'field-error' : ''}`}
      color={answered ? undefined : 'gray'}
      id={`${field.id}-no-answer`}
      size='1'
    >
      {t('quiz.noFuOnLimit')}
    </Text>
  );
};

const NotANumberNote = ({ field }) => {
  const { t } = useTranslation();

  return (
    <Text
      as='span'
      className='field-error field-note not-a-number-note'
      id={`${field.id}-error`}
      size='2'
    >
      <span className='visually-hidden'>{t('quiz.errorPrefix')} </span>
      {t('quiz.notANumber')}
    </Text>
  );
};

const MissingNote = ({ field }) => {
  const { t } = useTranslation();

  return (
    <Text
      as='span'
      className='field-error field-note missing-note'
      id={`${field.id}-missing`}
      size={field.choiceRows ? '1' : '2'}
    >
      <span className='visually-hidden'>{t('quiz.errorPrefix')} </span>
      {field.missing}
    </Text>
  );
};

const NumberField = ({
  answers,
  checked,
  field,
  graded,
  missing,
  onBoxKeyDown,
  onChangeAnswer,
  opensNextBox,
}) => {
  const { t } = useTranslation();
  const notANumber =
    !checked && !field.ignored && !answerIsNumber(field, answers);
  const noAnswer = checked && !field.ignored && field.answer === '';
  const result = getBoxResult(answers, checked, field, graded);
  const showsAnswer = checked && result !== CORRECT && field.answer !== '';
  const describedBy = [
    field.ignored && `${field.id}-note`,
    result && `${field.id}-verdict`,
    showsAnswer && `${field.id}-answer`,
    noAnswer && `${field.id}-no-answer`,
    notANumber && `${field.id}-error`,
    missing && `${field.id}-missing`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <Text as='label' htmlFor={field.id} size='3'>
        {field.label}
      </Text>
      <span className={`number-input-cell ${result ?? ''}`}>
        <input
          aria-describedby={describedBy || undefined}
          aria-invalid={notANumber || missing || undefined}
          autoComplete='off'
          className='number-input'
          disabled={field.ignored}
          enterKeyHint={opensNextBox ? ENTER_GOES_ON : ENTER_CHECKS}
          id={field.id}
          inputMode='numeric'
          maxLength={MAX_BOX_LENGTH}
          onChange={(event) => onChangeAnswer(field.id, event.target.value)}
          onKeyDown={(event) => onBoxKeyDown(event, field)}
          readOnly={checked}
          type='text'
          value={answers[field.id] ?? ''}
        />
        {result && (
          <span className='box-mark'>
            <Mark result={result} />
          </span>
        )}
        {result && (
          <span className='visually-hidden' id={`${field.id}-verdict`}>
            {t(MARK_NAMES[result])}.
          </span>
        )}
        {field.ignored && <DisabledNote field={field} />}
        {noAnswer && <NoAnswerNote answered={graded} field={field} />}
        {notANumber && <NotANumberNote field={field} />}
        {missing && <MissingNote field={field} />}
      </span>
      <span className='real-answer' id={`${field.id}-answer`}>
        {showsAnswer && <RealAnswer field={field} />}
      </span>
    </>
  );
};

const ChoiceField = ({ answers, checked, field, missing, onChangeAnswer }) => {
  const { t } = useTranslation();
  const noAnswer = checked && !field.ignored && field.answer === '';
  const describedBy = [
    field.ignored && `${field.id}-note`,
    noAnswer && `${field.id}-no-answer`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`choice-field ${missing ? 'missing' : ''}`}>
      <Text className='choice-label' id={`${field.id}-label`} size='3'>
        {field.label}
      </Text>
      <RadioGroup.Root
        aria-describedby={describedBy || undefined}
        aria-invalid={missing || undefined}
        aria-labelledby={`${field.id}-label`}
        aria-readonly={checked || undefined}
        className={`choices ${field.id}-choices`}
        disabled={field.ignored}
        onValueChange={(value) => {
          if (!checked) {
            onChangeAnswer(field.id, value);
          }
        }}
        value={answers[field.id] ?? ''}
      >
        {field.choiceRows.map((row, rowIndex) => (
          <div className='choice-row' key={rowIndex}>
            {row.map((group) => (
              <div
                className={`choice-group ${group.limit ?? ''}`}
                key={group.choices[0]}
                style={{ '--choice-count': group.choices.length }}
              >
                {group.limit && (
                  <span
                    className='choice-group-label'
                    id={`${field.id}-${group.limit}`}
                  >
                    {t(`quiz.limits.${group.limit}`)}
                  </span>
                )}
                {group.choices.map((choice) => {
                  const result = getChoiceResult(
                    answers,
                    checked,
                    choice,
                    field,
                  );

                  const choiceDescribedBy = [
                    group.limit && `${field.id}-${group.limit}`,
                    missing && `${field.id}-missing`,
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <RadioGroup.Item
                      aria-describedby={choiceDescribedBy || undefined}
                      className={`choice ${result ?? ''}`}
                      key={choice}
                      value={choice}
                    >
                      {result === WRONG && (
                        <span className='visually-hidden'>
                          {t('quiz.youPicked')}
                        </span>
                      )}
                      <span className='choice-value'>
                        {choice}
                        {result && (
                          <Mark name={t(MARK_NAMES[result])} result={result} />
                        )}
                      </span>
                    </RadioGroup.Item>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </RadioGroup.Root>
      {field.ignored && <DisabledNote field={field} />}
      {noAnswer && (
        <NoAnswerNote answered={Boolean(answers[field.id])} field={field} />
      )}
      {missing && <MissingNote field={field} />}
    </div>
  );
};

const ActionSizer = () => {
  const { tEveryLanguage } = useTranslation();

  return (
    <span aria-hidden='true' className='quiz-action-sizer'>
      {[...new Set(BUTTON_LABELS.flatMap(tEveryLanguage))].map((label) => (
        <span data-label={label} key={label} />
      ))}
      {[...new Set(VERDICT_LABELS.flatMap(tEveryLanguage))].map((label) => (
        <span className='verdict-words' data-label={label} key={label} />
      ))}
    </span>
  );
};

function QuizPanel({
  answerKey,
  answers,
  cardColor,
  cardRef,
  checked,
  fields,
  onChangeAnswer,
  onCheck,
  onNewHand,
  result,
}) {
  const { t } = useTranslation();
  const newHandRef = useRef(null);
  const gradedFields = getGradedFields(fields, answers);
  const checkLabel =
    gradedFields.length > 0
      ? t('buttons.checkAnswer')
      : t('buttons.justTellMe');
  const resultLabel = RESULT_LABELS[result];
  const revealed = result === REVEALED;

  const [flaggedIds, setFlaggedIds] = useState([]);
  const missingFields = getMissingFields(fields, answers);
  const fieldIsFlagged = (field) =>
    !checked && flaggedIds.includes(field.id) && missingFields.includes(field);

  const focusField = (field) => {
    if (field.choiceRows) {
      const choices = [
        ...document.querySelectorAll(`.${field.id}-choices [role='radio']`),
      ];
      const tabStop = choices.find((choice) => choice.tabIndex === 0);
      (tabStop ?? choices[0])?.focus();
    } else {
      document.getElementById(field.id)?.focus();
    }
  };

  const problemFields = fields.filter(
    (field) =>
      missingFields.includes(field)
      || (!field.choiceRows
        && !field.ignored
        && !answerIsNumber(field, answers)),
  );

  const getEmptyBoxesAfter = (field) =>
    missingFields.filter(
      (missingField) =>
        !missingField.choiceRows
        && fields.indexOf(missingField) > fields.indexOf(field),
    );

  // Enter in an input checks the hand, like in any form. But when the only
  // thing left to do is fill in the inputs after this one, Enter goes to the
  // next one instead and nothing gets checked
  const handleBoxKeyDown = (event, field) => {
    const emptyBoxesAfter = getEmptyBoxesAfter(field);
    const onlyLaterBoxesAreLeft =
      problemFields.length > 0
      && problemFields.every((problemField) =>
        emptyBoxesAfter.includes(problemField),
      );

    if (
      event.key === ENTER_KEY
      && !event.nativeEvent.isComposing
      && !checked
      && onlyLaterBoxesAreLeft
    ) {
      event.preventDefault();
      focusField(emptyBoxesAfter[0]);
    }
  };

  // Ignore key repeat. Holding Enter on Check Answer would otherwise deal the
  // next hand before the answer could be read.
  const handleNewHandKeyDown = (event) => {
    if (event.repeat && PRESSING_KEYS.includes(event.key)) {
      event.preventDefault();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // A form with a single text input submits on Enter even with no submit
    // button, and that includes a read-only input on a checked hand
    if (checked) {
      return;
    }

    if (gradedFields.length > 0 && problemFields.length > 0) {
      setFlaggedIds(missingFields.map((field) => field.id));
      focusField(problemFields[0]);
      return;
    }

    onCheck();
    newHandRef.current?.focus({ preventScroll: true });
  };

  const [beforeGear, afterGear] = t('quiz.noOptionsSelected').split('{}');
  const questions =
    fields.length > 0 ? (
      <div className='quiz-fields'>
        {fields.map((field) => {
          const Field = field.choiceRows ? ChoiceField : NumberField;
          return (
            <Field
              answers={answers}
              checked={checked}
              field={field}
              graded={gradedFields.includes(field)}
              key={field.id}
              missing={fieldIsFlagged(field)}
              onBoxKeyDown={handleBoxKeyDown}
              onChangeAnswer={onChangeAnswer}
              opensNextBox={getEmptyBoxesAfter(field).length > 0}
            />
          );
        })}
      </div>
    ) : (
      <Text as='p' size='3'>
        {beforeGear}
        <span className='inline-icon'>
          <GearIcon />
        </span>
        {afterGear}
      </Text>
    );

  let contents;
  if (!checked) {
    contents = questions;
  } else if (revealed) {
    contents = <div className='answer-panel'>{answerKey}</div>;
  } else {
    contents = (
      <Tabs.Root className='answer-tabs' defaultValue={ANSWER_TAB}>
        <Tabs.List className='segments'>
          <Tabs.Trigger className='segment' value={ANSWER_TAB}>
            {t('quiz.realAnswer')}
          </Tabs.Trigger>
          <Tabs.Trigger className='segment' value={YOUR_ANSWER_TAB}>
            {t('quiz.yourAnswer')}
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content className='answer-panel' value={ANSWER_TAB}>
          {answerKey}
        </Tabs.Content>
        <Tabs.Content className='answer-panel' value={YOUR_ANSWER_TAB}>
          {questions}
        </Tabs.Content>
      </Tabs.Root>
    );
  }

  return (
    <section className={`color-card ${cardColor}`} ref={cardRef}>
      {revealed ? (
        <Heading as='h2' id='quiz-heading' size='4'>
          {t('quiz.realAnswer')}
        </Heading>
      ) : (
        <h2 className='visually-hidden' id='quiz-heading'>
          {checked ? t('quiz.realAnswer') : t('quiz.yourAnswer')}
        </h2>
      )}
      <form
        aria-labelledby='quiz-heading'
        className={`quiz-form ${checked ? 'checked' : ''}`}
        onSubmit={handleSubmit}
      >
        {contents}

        <div className='quiz-actions'>
          <ActionSizer />
          {resultLabel && (
            <span className={`verdict ${result}`}>
              <span className='verdict-label'>{t(resultLabel)}</span>
            </span>
          )}
          {!resultLabel && fields.length > 0 && (
            <button className='action-button primary' type='submit'>
              {checkLabel}
            </button>
          )}
          <button
            className={`action-button new-hand-button ${checked ? 'primary' : ''}`}
            onClick={onNewHand}
            onKeyDown={handleNewHandKeyDown}
            ref={newHandRef}
            type='button'
          >
            {t('buttons.newHand')}
          </button>
        </div>
      </form>
    </section>
  );
}

export { QuizPanel };
