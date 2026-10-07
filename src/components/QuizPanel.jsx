import { Text } from '@radix-ui/themes';
import { RadioGroup } from 'radix-ui';
import { useRef, useState } from 'react';

import { useTranslation } from '../i18n/I18nContext';
import {
  CORRECT,
  REVEALED,
  WRONG,
  answerIsCorrect,
  answerIsNumber,
  getGradedFields,
  getMissingFields,
} from '../scripts/QuizFields';

const CHECK_MARK = String.fromCodePoint(0x2713);
const CROSS_MARK = String.fromCodePoint(0x2717);

const MARKS = {
  [CORRECT]: CHECK_MARK,
  [WRONG]: CROSS_MARK,
};

const MARK_NAMES = {
  [CORRECT]: 'quiz.marks.correct',
  [WRONG]: 'quiz.marks.wrong',
};

const BUTTON_LABELS = [
  'buttons.checkAnswer',
  'buttons.justTellMe',
  'buttons.newHand',
];
const VERDICT_LABELS = ['buttons.justTellMe', 'quiz.correct', 'quiz.incorrect'];

const RESULT_LABELS = {
  [CORRECT]: 'quiz.correct',
  [REVEALED]: 'buttons.justTellMe',
  [WRONG]: 'quiz.incorrect',
};

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
        {field.answer} <span aria-hidden='true'>{CHECK_MARK}</span>
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
  onChangeAnswer,
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
          className='number-input'
          disabled={field.ignored}
          id={field.id}
          inputMode='numeric'
          onChange={(event) => onChangeAnswer(field.id, event.target.value)}
          readOnly={checked}
          type='text'
          value={answers[field.id] ?? ''}
        />
        {result && (
          <span aria-hidden='true' className='box-mark'>
            {MARKS[result]}
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
                          <span aria-label={t(MARK_NAMES[result])} role='img'>
                            {MARKS[result]}
                          </span>
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
  answers,
  cardColor,
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

  const handleSubmit = (event) => {
    event.preventDefault();

    // A form with a single text input submits on Enter even with no submit
    // button, and that includes a read-only input on a checked hand
    if (checked) {
      return;
    }

    const problemFields = fields.filter(
      (field) =>
        missingFields.includes(field)
        || (!field.choiceRows
          && !field.ignored
          && !answerIsNumber(field, answers)),
    );
    if (gradedFields.length > 0 && problemFields.length > 0) {
      setFlaggedIds(missingFields.map((field) => field.id));
      focusField(problemFields[0]);
      return;
    }

    onCheck();
    newHandRef.current?.focus({ preventScroll: true });
  };

  return (
    <section className={`color-card ${cardColor}`}>
      <h2 className='visually-hidden' id='quiz-heading'>
        {t('quiz.yourAnswer')}
      </h2>
      <form
        aria-labelledby='quiz-heading'
        className='quiz-form'
        onSubmit={handleSubmit}
      >
        {fields.length > 0 ? (
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
                  onChangeAnswer={onChangeAnswer}
                />
              );
            })}
          </div>
        ) : (
          <Text as='p' size='3'>
            {t('quiz.noOptionsSelected')}
          </Text>
        )}

        <div className='quiz-actions'>
          <ActionSizer />
          {resultLabel ? (
            <span className={`verdict ${result}`}>
              <span className='verdict-label'>{t(resultLabel)}</span>
            </span>
          ) : (
            <button
              className='action-button'
              disabled={checked || fields.length === 0}
              type='submit'
            >
              {checkLabel}
            </button>
          )}
          <button
            className='action-button'
            onClick={onNewHand}
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
