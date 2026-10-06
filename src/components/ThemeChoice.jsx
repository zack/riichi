import { Text } from '@radix-ui/themes';

import { APPEARANCE_CHOICES, useAppearance } from '../AppearanceContext';
import { useTranslation } from '../i18n/I18nContext';

function ThemeChoice() {
  const { t } = useTranslation();
  const { appearanceChoice, chooseAppearance } = useAppearance();

  return (
    <div className='theme-choice'>
      <Text as='p' id='theme-label' size='3'>
        {t('options.theme')}
      </Text>
      <div
        aria-labelledby='theme-label'
        className='theme-segments'
        role='radiogroup'
      >
        {APPEARANCE_CHOICES.map((choice) => (
          <label className='theme-segment' key={choice}>
            <input
              checked={choice === appearanceChoice}
              className='visually-hidden'
              name='theme'
              onChange={() => chooseAppearance(choice)}
              type='radio'
              value={choice}
            />
            {t(`options.themes.${choice}`)}
          </label>
        ))}
      </div>
    </div>
  );
}

export { ThemeChoice };
