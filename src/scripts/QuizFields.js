import { FU_CHOICE_ROWS, HAN_CHOICE_ROWS } from './Choices';
import { TEST_FU, TEST_HAN, TEST_POINTS } from './Options';

const CORRECT = 'correct';
const REVEALED = 'revealed';
const WRONG = 'wrong';

const MAX_NON_LIMIT_HAN = 4;

const ROUNDING = 'rounding';

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
    .replace(/[\s,]/g, '');

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
  limitWasWronglyPicked,
};
