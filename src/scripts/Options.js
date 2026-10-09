const OPTIONS_STORAGE_KEY = 'mahjong-options';

const TEST_HAN = 'testHan';
const TEST_FU = 'testFu';
const TEST_POINTS = 'testPoints';

const EXACT_FU = 'exactFu';

const DEFAULT_OPTIONS = {
  [TEST_HAN]: true,
  [TEST_FU]: true,
  [TEST_POINTS]: true,
  kiriageMangan: false,
  testHonba: false,
  ignoreFuOnLimit: true,
  [EXACT_FU]: false,
  showTileNames: false,
  fancyTiles: false,
};

// Whatever is in localStorage could have been written by an older version with
// different options, or be mangled. Only take the options that exist today and
// hold a boolean.
function getStoredOptions() {
  const options = { ...DEFAULT_OPTIONS };

  try {
    const stored = JSON.parse(localStorage.getItem(OPTIONS_STORAGE_KEY));

    Object.keys(DEFAULT_OPTIONS).forEach((optionId) => {
      if (typeof stored?.[optionId] === 'boolean') {
        options[optionId] = stored[optionId];
      }
    });
  } catch {
    // Not JSON at all. The defaults are already in place.
  }

  return options;
}

// Only options that aren't at their default get stored. That way if a default
// ever changes, an untouched option follows it instead of holding on to a
// stored copy of the old default.
function storeOptions(options) {
  const changedOptions = Object.fromEntries(
    Object.entries(options).filter(
      ([optionId, value]) => value !== DEFAULT_OPTIONS[optionId],
    ),
  );

  try {
    if (Object.keys(changedOptions).length > 0) {
      localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(changedOptions));
    } else {
      localStorage.removeItem(OPTIONS_STORAGE_KEY);
    }
  } catch {
    // localStorage is blocked. The options still last until the page is closed.
  }
}

export {
  DEFAULT_OPTIONS,
  EXACT_FU,
  TEST_FU,
  TEST_HAN,
  TEST_POINTS,
  getStoredOptions,
  storeOptions,
};
