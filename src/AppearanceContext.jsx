import { Theme } from '@radix-ui/themes';
import { createContext, useContext, useEffect, useState } from 'react';

const DARK = 'dark';
const LIGHT = 'light';

const HIGH = 'high';
const NORMAL = 'normal';

const HIGH_CONTRAST = 'high-contrast';

const STORAGE_KEY = 'mahjong-appearance';
const CONTRAST_STORAGE_KEY = 'mahjong-contrast';
const DEVICE_DARK_QUERY = '(prefers-color-scheme: dark)';
const DEVICE_HIGH_CONTRAST_QUERY = '(prefers-contrast: more)';

const THEME_COLORS = {
  [DARK]: '#272a2d', // Radix's dark --slate-4
  [LIGHT]: '#ffffff', // Radix's light --color-background
};

const HIGH_CONTRAST_DARK_THEME_COLOR = '#111113'; // Radix's dark --slate-1

const AppearanceContext = createContext();

// The inline script in index.html has already set the appearance class on
// <html> by the time React starts (so the page doesn't flash white). Pick up
// from there.
function getStartingAppearance() {
  if (document.documentElement.classList.contains(DARK)) {
    return DARK;
  } else {
    return LIGHT;
  }
}

function getStartingContrast() {
  if (document.documentElement.classList.contains(HIGH_CONTRAST)) {
    return HIGH;
  } else {
    return NORMAL;
  }
}

function playerHasChosen(storageKey) {
  try {
    return Boolean(localStorage.getItem(storageKey));
  } catch {
    return false;
  }
}

function storeChoice(storageKey, value) {
  try {
    localStorage.setItem(storageKey, value);
  } catch {
    // localStorage is blocked. The choice still lasts until the page is closed.
  }
}

function useDeviceSetting(followsDevice, query, onChange) {
  useEffect(() => {
    if (!followsDevice) {
      return undefined;
    }

    const deviceSetting = matchMedia(query);
    const handleChange = (event) => {
      onChange(event.matches);
    };

    deviceSetting.addEventListener('change', handleChange);
    return () => {
      deviceSetting.removeEventListener('change', handleChange);
    };
  }, [followsDevice, onChange, query]);
}

export function AppearanceProvider({ children }) {
  const [appearance, setAppearance] = useState(getStartingAppearance);
  const [contrast, setContrast] = useState(getStartingContrast);
  const [followsDevice, setFollowsDevice] = useState(
    () => !playerHasChosen(STORAGE_KEY),
  );
  const [contrastFollowsDevice, setContrastFollowsDevice] = useState(
    () => !playerHasChosen(CONTRAST_STORAGE_KEY),
  );
  const isDark = appearance === DARK;
  const isHighContrast = contrast === HIGH;

  useEffect(() => {
    document.documentElement.classList.toggle(DARK, appearance === DARK);
    document.documentElement.classList.toggle(HIGH_CONTRAST, contrast === HIGH);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        'content',
        appearance === DARK && contrast === HIGH
          ? HIGH_CONTRAST_DARK_THEME_COLOR
          : THEME_COLORS[appearance],
      );
  }, [appearance, contrast]);

  useDeviceSetting(followsDevice, DEVICE_DARK_QUERY, (matches) => {
    setAppearance(matches ? DARK : LIGHT);
  });
  useDeviceSetting(
    contrastFollowsDevice,
    DEVICE_HIGH_CONTRAST_QUERY,
    (matches) => {
      setContrast(matches ? HIGH : NORMAL);
    },
  );

  const toggleDarkMode = () => {
    const newAppearance = isDark ? LIGHT : DARK;
    setFollowsDevice(false);
    storeChoice(STORAGE_KEY, newAppearance);
    setAppearance(newAppearance);
  };

  const toggleHighContrast = () => {
    const newContrast = isHighContrast ? NORMAL : HIGH;
    setContrastFollowsDevice(false);
    storeChoice(CONTRAST_STORAGE_KEY, newContrast);
    setContrast(newContrast);
  };

  return (
    <AppearanceContext.Provider
      value={{ isDark, isHighContrast, toggleDarkMode, toggleHighContrast }}
    >
      <Theme accentColor='indigo' appearance={appearance} grayColor='slate'>
        {children}
      </Theme>
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
}
