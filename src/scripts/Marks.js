import { CORRECT, WRONG } from './QuizFields';

const MARK_PATHS = {
  [CORRECT]: 'M3.5 12l5.5 5.5L20.5 6',
  [WRONG]: 'M4.5 4.5l15 15M19.5 4.5l-15 15',
};

const MARK_NAMES = {
  [CORRECT]: 'quiz.marks.correct',
  [WRONG]: 'quiz.marks.wrong',
};

export { MARK_NAMES, MARK_PATHS };
