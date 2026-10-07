import { CORRECT, WRONG } from './QuizFields';

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

export { CHECK_MARK, MARKS, MARK_NAMES };
