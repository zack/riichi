const HAND_PARAM = 'hand';
const HAND_FILE_EXTENSION = '.json';

function getHandId(handFile) {
  return handFile.replace(HAND_FILE_EXTENSION, '');
}

export { HAND_FILE_EXTENSION, HAND_PARAM, getHandId };
