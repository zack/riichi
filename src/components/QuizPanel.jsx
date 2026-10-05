import { Flex, Text } from '@radix-ui/themes';
import { RadioGroup } from 'radix-ui';
import { useRef } from 'react';

import { useTranslation } from '../i18n/I18nContext';
import { TEST_FU, TEST_HAN, TEST_POINTS } from '../scripts/Options';
import {
  CORRECT,
  REVEALED,
  WRONG,
  answerIsCorrect,
  answerIsNumber,
  getGradedFields,
  getSkippedOptionIds,
} from '../scripts/QuizFields';

const CHECK_MARK = String.fromCodePoint(0x2713);
const CROSS_MARK = String.fromCodePoint(0x2717);

const OPTION_NAMES = {
  [TEST_FU]: 'quiz.fu',
  [TEST_HAN]: 'quiz.han',
  [TEST_POINTS]: 'quiz.points',
};

const MARKS = {
  [CORRECT]: CHECK_MARK,
  [WRONG]: CROSS_MARK,
};

const MARK_NAMES = {
  [CORRECT]: 'quiz.marks.correct',
  [WRONG]: 'quiz.marks.wrong',
};

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

const RealAnswer = ({ answers, field, graded }) => {
  const { t } = useTranslation();

  if (!graded) {
    return (
      <Text color='gray' weight='bold'>
        {field.answer}
      </Text>
    );
  } else if (answerIsCorrect(field, answers)) {
    return (
      <Text className='correct' weight='bold'>
        {field.answer}{' '}
        <span aria-label={t('winRate.correct')} role='img'>
          {CHECK_MARK}
        </span>
      </Text>
    );
  } else {
    return (
      <Text className='wrong' weight='bold'>
        {field.answer}{' '}
        <span aria-label={t('winRate.wrong')} role='img'>
          {CROSS_MARK}
        </span>
      </Text>
    );
  }
};

const DisabledNote = ({ field }) => {
  const { t } = useTranslation();

  return (
    <Text className='field-note' color='gray' id={`${field.id}-note`} size='1'>
      {t('quiz.disabledOnLimit')}
    </Text>
  );
};

const NotANumberNote = ({ field }) => {
  const { t } = useTranslation();

  return (
    <Text
      as='span'
      className='field-note field-error'
      id={`${field.id}-error`}
      size='2'
    >
      <span className='visually-hidden'>{t('quiz.errorPrefix')} </span>
      {field.notANumber}
    </Text>
  );
};

const NumberField = ({ answers, checked, field, graded, onChangeAnswer }) => {
  const notANumber =
    !checked && !field.ignored && !answerIsNumber(field, answers);
  const describedBy = [
    field.ignored && `${field.id}-note`,
    notANumber && `${field.id}-error`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <Text as='label' htmlFor={field.id} size='3'>
        {field.label}
      </Text>
      <span className='number-input-cell'>
        <input
          aria-describedby={describedBy || undefined}
          aria-invalid={notANumber || undefined}
          className='number-input'
          disabled={field.ignored}
          id={field.id}
          inputMode='numeric'
          onChange={(event) => onChangeAnswer(field.id, event.target.value)}
          readOnly={checked}
          type='text'
          value={answers[field.id] ?? ''}
        />
        {field.ignored && <DisabledNote field={field} />}
        {notANumber && <NotANumberNote field={field} />}
      </span>
      <span className='real-answer'>
        {checked && (
          <RealAnswer answers={answers} field={field} graded={graded} />
        )}
      </span>
    </>
  );
};

const ChoiceField = ({ answers, checked, field, onChangeAnswer }) => {
  const { t } = useTranslation();

  return (
    <div className='choice-field'>
      <Text className='choice-label' id={`${field.id}-label`} size='3'>
        {field.label}
      </Text>
      <RadioGroup.Root
        aria-describedby={field.ignored ? `${field.id}-note` : undefined}
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

                  return (
                    <RadioGroup.Item
                      aria-describedby={
                        group.limit ? `${field.id}-${group.limit}` : undefined
                      }
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
    </div>
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
  const hiddenNames = getSkippedOptionIds(fields, answers).map((optionId) =>
    t(OPTION_NAMES[optionId]).toLowerCase(),
  );
  const showHideNote = !checked && hiddenNames.length > 0;
  const checkLabel =
    gradedFields.length > 0
      ? t('buttons.checkAnswer')
      : t('buttons.justTellMe');
  const resultLabel = RESULT_LABELS[result];

  const handleSubmit = (event) => {
    event.preventDefault();

    const notANumberField = fields.find(
      (field) =>
        !field.choiceRows && !field.ignored && !answerIsNumber(field, answers),
    );
    if (notANumberField && !checked) {
      document.getElementById(notANumberField.id)?.focus();
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

        <Flex align='start' gap='3' justify='center'>
          <Flex align='center' direction='column' gap='1'>
            {resultLabel ? (
              <span className={`verdict ${result}`}>
                <span aria-hidden='true' className='verdict-sizer'>
                  {checkLabel}
                </span>
                <span className='verdict-label'>{t(resultLabel)}</span>
              </span>
            ) : (
              <button
                aria-describedby={showHideNote ? 'hide-note' : undefined}
                className='action-button'
                disabled={checked || fields.length === 0}
                type='submit'
              >
                {checkLabel}
              </button>
            )}
            <span className='hide-note-line'>
              {showHideNote && (
                <Text color='gray' id='hide-note' size='1'>
                  {t('buttons.andHide').replace('{}', hiddenNames.join(', '))}
                </Text>
              )}
            </span>
          </Flex>
          <button
            className='action-button'
            onClick={onNewHand}
            ref={newHandRef}
            type='button'
          >
            {t('buttons.newHand')}
          </button>
        </Flex>
      </form>
    </section>
  );
}

export { QuizPanel };
