import { Text } from '@radix-ui/themes';
import { useState, useSyncExternalStore } from 'react';

import { useTranslation } from '../i18n/I18nContext';
import {
  ICON_COLORS,
  applyIconColor,
  getStoredIconColor,
  storeIconColor,
} from '../scripts/HomeScreenIcon';
import {
  getInstallPrompt,
  getInstallWasAsked,
  isAppleMobile,
  isFirefoxAndroid,
  isInstalled,
  promptToInstall,
  subscribeToInstallPrompt,
} from '../scripts/InstallPrompt';

const INSTALL_ASKED_NOTE = 'install-asked-note';

function HomeScreenIconPicker() {
  const { t } = useTranslation();
  const installPrompt = useSyncExternalStore(
    subscribeToInstallPrompt,
    getInstallPrompt,
  );
  const installWasAsked = useSyncExternalStore(
    subscribeToInstallPrompt,
    getInstallWasAsked,
  );
  const [iconColor, setIconColor] = useState(getStoredIconColor);
  const appleMobile = isAppleMobile();

  let installHint;
  if (appleMobile) {
    installHint = 'options.installFromShareSheet';
  } else if (isFirefoxAndroid()) {
    installHint = 'options.installFromMenu';
  } else {
    installHint = null;
  }

  const hasInstallButton = installPrompt !== null || installWasAsked;
  if (isInstalled() || (!hasInstallButton && !installHint)) {
    return null;
  }

  const handleChange = (id) => {
    setIconColor(id);
    storeIconColor(id);
    applyIconColor(id);
  };

  const { hex } = ICON_COLORS.find((color) => color.id === iconColor);

  return (
    <div className='home-icon-picker'>
      <div className='home-icon-heading'>
        <span
          aria-hidden='true'
          className={`home-icon-preview ${appleMobile ? 'apple' : ''}`}
          style={{ '--icon-color': hex }}
        />
        <div>
          <Text as='p' id='home-icon-label' size='3' weight='bold'>
            {t('options.homeScreenIcon')}
          </Text>
          <Text as='p' color='gray' size='2'>
            {t(`options.iconColors.${iconColor}`)}
          </Text>
        </div>
      </div>

      <div
        aria-labelledby='home-icon-label'
        className='home-icon-swatches'
        role='radiogroup'
      >
        {ICON_COLORS.map((color) => (
          <input
            aria-label={t(`options.iconColors.${color.id}`)}
            checked={color.id === iconColor}
            className='home-icon-swatch'
            key={color.id}
            name='home-icon-color'
            onChange={() => handleChange(color.id)}
            style={{ '--swatch': color.hex }}
            type='radio'
            value={color.id}
          />
        ))}
      </div>

      {hasInstallButton ? (
        <>
          <button
            aria-describedby={installWasAsked ? INSTALL_ASKED_NOTE : undefined}
            className='action-button home-icon-install'
            disabled={installWasAsked}
            onClick={promptToInstall}
            type='button'
          >
            {t('options.installApp')}
          </button>
          {installWasAsked && (
            <Text as='p' color='gray' id={INSTALL_ASKED_NOTE} size='2'>
              {t('options.installAsked')}
            </Text>
          )}
        </>
      ) : (
        <Text as='p' color='gray' size='2'>
          {t(installHint)}
        </Text>
      )}
    </div>
  );
}

export { HomeScreenIconPicker };
