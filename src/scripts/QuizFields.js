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

function getQuizFields(agari, options, points, answers, t) {
  const fields = [];
  const fuIgnored = fuIsIgnored(options, answers);

  if (options.testHan) {
    fields.push({
      answer: String(agari.han),
      choiceRows: HAN_CHOICE_ROWS,
      id: 'han',
      ignored: false,
      label: t('quiz.han'),
      optionId: TEST_HAN,
    });
  }

  if (options.testFu && options.exactFu) {
    fields.push({
      answer: String(getExactFu(agari)),
      id: 'fu',
      ignored: fuIgnored,
      label: t('quiz.exactFu'),
      notANumber: t('quiz.notANumber.fu'),
      optionId: TEST_FU,
    });
  } else if (options.testFu) {
    fields.push({
      answer: String(agari.fu),
      choiceRows: FU_CHOICE_ROWS,
      id: 'fu',
      ignored: fuIgnored,
      label: t('quiz.fu'),
      optionId: TEST_FU,
    });
  }

  if (options.testPoints && agari.isTsumo && agari.isDealer) {
    fields.push({
      answer: String(points.pointValue),
      id: 'points',
      ignored: false,
      label: t('quiz.pointsFromEach'),
      notANumber: t('quiz.notANumber.points'),
      optionId: TEST_POINTS,
    });
  } else if (options.testPoints && agari.isTsumo) {
    fields.push({
      answer: String(points.pointValue),
      id: 'points',
      ignored: false,
      label: t('quiz.pointsFromNonDealer'),
      notANumber: t('quiz.notANumber.points'),
      optionId: TEST_POINTS,
    });
    fields.push({
      answer: String(points.pointValueDealer),
      id: 'pointsDealer',
      ignored: false,
      label: t('quiz.pointsFromDealer'),
      notANumber: t('quiz.notANumber.points'),
      optionId: TEST_POINTS,
    });
  } else if (options.testPoints) {
    fields.push({
      answer: String(points.pointValue),
      id: 'points',
      ignored: false,
      label: t('quiz.points'),
      notANumber: t('quiz.notANumber.points'),
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

function isPointsField(field) {
  return field.optionId === TEST_POINTS;
}

function getGradedFields(fields, answers) {
  const pointsAreAnswered = fields.some(
    (field) => isPointsField(field) && !answerIsBlank(field, answers),
  );

  return fields.filter((field) => {
    if (field.ignored) {
      return false;
    } else if (isPointsField(field)) {
      return pointsAreAnswered;
    } else {
      return !answerIsBlank(field, answers);
    }
  });
}

function getSkippedOptionIds(fields, answers) {
  const gradedFields = getGradedFields(fields, answers);
  const skippedOptionIds = [];

  if (gradedFields.length > 0) {
    fields.forEach((field) => {
      if (
        !field.ignored
        && !gradedFields.includes(field)
        && !skippedOptionIds.includes(field.optionId)
      ) {
        skippedOptionIds.push(field.optionId);
      }
    });
  }

  return skippedOptionIds;
}

export {
  CORRECT,
  REVEALED,
  ROUNDING,
  WRONG,
  answerIsCorrect,
  answerIsNumber,
  getExactFu,
  getGradedFields,
  getQuizFields,
  getSkippedOptionIds,
};
