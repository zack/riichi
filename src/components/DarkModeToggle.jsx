import { useAppearance } from '../AppearanceContext';
import { useTranslation } from '../i18n/I18nContext';

const MoonIcon = () => (
  <svg
    aria-hidden='true'
    fill='currentColor'
    height='18'
    viewBox='0 0 18 18'
    width='18'
  >
    <path d='M15.2 11.3A6.6 6.6 0 0 1 6.7 2.8a.6.6 0 0 0-.8-.7 7.4 7.4 0 1 0 10 10 .6.6 0 0 0-.7-.8Z' />
  </svg>
);

const SunIcon = () => (
  <svg
    aria-hidden='true'
    fill='none'
    height='18'
    stroke='currentColor'
    strokeLinecap='round'
    strokeWidth='2'
    viewBox='0 0 18 18'
    width='18'
  >
    <circle cx='9' cy='9' fill='currentColor' r='3.2' stroke='none' />
    <path d='M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4' />
  </svg>
);

function DarkModeToggle() {
  const { t } = useTranslation();
  const { isDark, toggleDarkMode } = useAppearance();

  return (
    <button
      aria-label={t('common.darkMode')}
      aria-pressed={isDark}
      className='icon-button'
      onClick={toggleDarkMode}
      type='button'
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export { DarkModeToggle };
