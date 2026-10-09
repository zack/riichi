const HAND_PARAM = 'hand';
const HAND_FILE_EXTENSION = '.json';

function getHandId(handFile) {
  return handFile.trim().toLowerCase().replace(HAND_FILE_EXTENSION, '');
}

function getHandUrl(handFile) {
  const url = new URL(window.location.href);
  url.hash = '';
  url.searchParams.set(HAND_PARAM, getHandId(handFile));
  return url;
}

export { HAND_FILE_EXTENSION, HAND_PARAM, getHandId, getHandUrl };
