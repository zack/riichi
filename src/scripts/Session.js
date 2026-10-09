const SESSION_STORAGE_KEY = 'mahjong-session';

const ANSWER_IDS = ['fu', 'han', 'points', 'pointsDealer'];
const COUNT_IDS = ['correctAnswers', 'handNumber', 'wrongAnswers'];

function isCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function getStoredSession() {
  const session = {
    answers: {},
    correctAnswers: 0,
    handFile: '',
    handNumber: 0,
    wrongAnswers: 0,
  };

  try {
    const stored = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));

    ANSWER_IDS.forEach((answerId) => {
      if (typeof stored?.answers?.[answerId] === 'string') {
        session.answers[answerId] = stored.answers[answerId];
      }
    });
    COUNT_IDS.forEach((countId) => {
      if (isCount(stored?.[countId])) {
        session[countId] = stored[countId];
      }
    });
    if (typeof stored?.handFile === 'string') {
      session.handFile = stored.handFile;
    }
  } catch {
    // Not JSON at all, or sessionStorage is blocked. The session starts empty.
  }

  return session;
}

function storeSession(session) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage is blocked. The session still lasts until the page is
    // reloaded.
  }
}

export { getStoredSession, isCount, storeSession };
