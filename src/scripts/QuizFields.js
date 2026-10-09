import { FU_CHOICE_ROWS, HAN_CHOICE_ROWS } from './Choices';
import { TEST_FU, TEST_HAN, TEST_POINTS } from './Options';

const CORRECT = 'correct';
const REVEALED = 'revealed';
const WRONG = 'wrong';

const MAX_NON_LIMIT_HAN = 4;

const ROUNDING = 'rounding';

// Things that can be typed in a number without changing it: a . or ' that
// groups thousands (only when exactly three digits follow it), and 点 at the end
const GROUPING_MARK_BETWEEN_DIGITS = /(\d)[.'](?=\d{3}(?!\d))/g;
const POINTS_WORD_AFTER_DIGIT = /(\d)点$/;

function getExactFu(agari) {
  let exactFu = 0;
  agari.fu_details.forEach((detail) => {
    if (detail.reason !== ROUNDING) {
      exactFu += detail.fu;
    }
  });

  return exactFu;
}

// This goes by the han the player picked, not by the hand itself. Otherwise the
// fu question turning itself off would give away whether they're right.
function fuIsIgnored(options, answers) {
  return (
    options.ignoreFuOnLimit
    && options.testHan
    && Number(answers.han) > MAX_NON_LIMIT_HAN
  );
}

function fuHasNoAnswer(agari, options) {
  return (
    options.ignoreFuOnLimit && options.testHan && agari.han > MAX_NON_LIMIT_HAN
  );
}

function limitWasWronglyPicked(field) {
  return field.ignored && field.answer !== '';
}

function getQuizFields(agari, options, points, answers, t) {
  const fields = [];
  const fuIgnored = fuIsIgnored(options, answers);
  const fuUnanswerable = fuHasNoAnswer(agari, options);

  if (options.testHan) {
    fields.push({
      answer: String(agari.han),
      choiceRows: HAN_CHOICE_ROWS,
      id: 'han',
      ignored: false,
      label: t('quiz.han'),
      missing: t('quiz.missing.han'),
      optionId: TEST_HAN,
    });
  }

  if (options.testFu && options.exactFu) {
    fields.push({
      answer: fuUnanswerable ? '' : String(getExactFu(agari)),
      id: 'fu',
      ignored: fuIgnored,
      label: t('quiz.exactFu'),
      missing: t('quiz.missing.exactFu'),
      optionId: TEST_FU,
    });
  } else if (options.testFu) {
    fields.push({
      answer: fuUnanswerable ? '' : String(agari.fu),
      choiceRows: FU_CHOICE_ROWS,
      id: 'fu',
      ignored: fuIgnored,
      label: t('quiz.fu'),
      missing: t('quiz.missing.fu'),
      optionId: TEST_FU,
    });
  }

  if (options.testPoints && agari.isTsumo && agari.isDealer) {
    fields.push({
      answer: String(points.pointValue),
      id: 'points',
      ignored: false,
      label: t('quiz.pointsFromEach'),
      missing: t('quiz.missing.points'),
      optionId: TEST_POINTS,
    });
  } else if (options.testPoints && agari.isTsumo) {
    fields.push({
      answer: String(points.pointValue),
      id: 'points',
      ignored: false,
      label: t('quiz.pointsFromNonDealer'),
      missing: t('quiz.missing.points'),
      optionId: TEST_POINTS,
    });
    fields.push({
      answer: String(points.pointValueDealer),
      id: 'pointsDealer',
      ignored: false,
      label: t('quiz.pointsFromDealer'),
      missing: t('quiz.missing.points'),
      optionId: TEST_POINTS,
    });
  } else if (options.testPoints) {
    fields.push({
      answer: String(points.pointValue),
      id: 'points',
      ignored: false,
      label: t('quiz.points'),
      missing: t('quiz.missing.points'),
      optionId: TEST_POINTS,
    });
  }

  return fields;
}

function readAnswer(field, answers) {
  const answer = (answers[field.id] ?? '')
    .normalize('NFKC')
    .replace(/[\s,]/g, '')
    .replace(POINTS_WORD_AFTER_DIGIT, '$1')
    .replace(GROUPING_MARK_BETWEEN_DIGITS, '$1');

  if (/^\d+$/.test(answer)) {
    return String(Number(answer));
  } else {
    return answer;
  }
}

function answerIsBlank(field, answers) {
  return readAnswer(field, answers) === '';
}

function answerIsNumber(field, answers) {
  return /^\d*$/.test(readAnswer(field, answers));
}

function answerIsCorrect(field, answers) {
  return field.answer === readAnswer(field, answers);
}

function getGradedFields(fields, answers) {
  return fields.filter(
    (field) => !field.ignored && !answerIsBlank(field, answers),
  );
}

function getMissingFields(fields, answers) {
  return fields.filter(
    (field) => !field.ignored && answerIsBlank(field, answers),
  );
}

function getStatusMessage(fields, answers, result, t) {
  const gradedFields = getGradedFields(fields, answers);
  const getRealAnswer = (field) =>
    `${field.label}: ${field.answer === '' ? t('quiz.noFuOnLimit') : field.answer}`;
  const getGradedAnswer = (field) => {
    if (limitWasWronglyPicked(field)) {
      return `${getRealAnswer(field)}, ${t('quiz.youPickedLimit')}`;
    } else if (!gradedFields.includes(field)) {
      return getRealAnswer(field);
    } else if (answerIsCorrect(field, answers)) {
      return `${getRealAnswer(field)}, ${t('quiz.marks.correct')}`;
    } else {
      return `${getRealAnswer(field)}, ${t('quiz.youPicked')} ${answers[field.id].trim()}`;
    }
  };
  const realAnswers = fields.map(getRealAnswer).join(', ');

  switch (result) {
    case REVEALED:
      return realAnswers;
    case CORRECT:
      return `${t('winRate.correct')}. ${realAnswers}`;
    default:
      return `${t('winRate.wrong')}. ${fields.map(getGradedAnswer).join('. ')}`;
  }
}

export {
  CORRECT,
  REVEALED,
  ROUNDING,
  WRONG,
  answerIsCorrect,
  answerIsNumber,
  fuHasNoAnswer,
  fuIsIgnored,
  getExactFu,
  getGradedFields,
  getMissingFields,
  getQuizFields,
  getStatusMessage,
  limitWasWronglyPicked,
};
