import { Dialog, Flex, Select, Text } from '@radix-ui/themes';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { useRef } from 'react';

import { useAppearance } from '../AppearanceContext';
import { useTranslation } from '../i18n/I18nContext';
import { EXACT_FU, TEST_FU, TEST_HAN, TEST_POINTS } from '../scripts/Options';
import { HomeScreenIconPicker } from './HomeScreenIconPicker';
import { OptionCheckbox } from './OptionCheckbox';
import { OptionGroup } from './OptionGroup';
import { ReportHandLink } from './ReportHandLink';
import { ThemeChoice } from './ThemeChoice';

const ENGLISH = 'en';
const LANGUAGE_IN_ENGLISH = 'Language';

const QUESTION_OPTIONS = [
  { id: TEST_HAN },
  { id: TEST_FU },
  { id: EXACT_FU, indented: true, needs: [TEST_FU] },
  { id: 'ignoreFuOnLimit', indented: true, needs: [TEST_HAN, TEST_FU] },
  { id: TEST_POINTS },
];
const RULE_OPTIONS = [{ id: 'kiriageMangan' }, { id: 'testHonba' }];
const TILE_OPTIONS = [{ id: 'showTileNames' }, { id: 'fancyTiles' }];

// Feather's settings icon (https://feathericons.com, MIT)
const GearIcon = () => (
  <svg
    aria-hidden='true'
    fill='none'
    height='18'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2'
    viewBox='0 0 24 24'
    width='18'
  >
    <circle cx='12' cy='12' r='3' />
    <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' />
  </svg>
);

function OptionsMenu({ handIsChecked, handFile, onChangeOption, options }) {
  const { changeLanguage, currentLanguage, languages, t } = useTranslation();
  const { isHighContrast, toggleHighContrast } = useAppearance();
  const contentRef = useRef(null);

  const renderOption = ({ id, indented, needs = [] }) => {
    const [firstMissing, secondMissing] = needs
      .filter((neededId) => !options[neededId])
      .map((neededId) => t(`options.${neededId}`));
    let unavailableNote;
    if (secondMissing !== undefined) {
      unavailableNote = t('options.unavailableWhileBothOff')
        .replace('{}', firstMissing)
        .replace('{}', secondMissing);
    } else if (firstMissing !== undefined) {
      unavailableNote = t('options.unavailableWhileOff').replace(
        '{}',
        firstMissing,
      );
    }

    return (
      <OptionCheckbox
        checked={options[id]}
        id={id}
        indented={indented}
        key={id}
        label={t(`options.${id}`)}
        onChange={(checked) => onChangeOption(id, checked)}
        unavailableNote={unavailableNote}
      />
    );
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <button
          aria-label={t('options.title')}
          className='icon-button'
          type='button'
        >
          <GearIcon />
        </button>
      </Dialog.Trigger>

      <Dialog.Content
        aria-describedby={handIsChecked ? 'next-hand-note' : undefined}
        className='options-dialog'
        maxWidth='400px'
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          contentRef.current?.focus({ preventScroll: true });
        }}
        ref={contentRef}
      >
        <Flex
          align='center'
          className='options-header'
          gap='3'
          justify='between'
        >
          <DialogPrimitive.Title asChild>
            <h1 className='options-title'>{t('options.title')}</h1>
          </DialogPrimitive.Title>
          <Dialog.Close>
            <button className='action-button' type='button'>
              {t('common.close')}
            </button>
          </Dialog.Close>
        </Flex>
        {handIsChecked && (
          <Text as='p' color='gray' id='next-hand-note' mb='3' size='2'>
            {t('options.nextHandNote')}
          </Text>
        )}

        <Flex direction='column' gap='3'>
          <OptionGroup name={t('options.groups.questions')}>
            {QUESTION_OPTIONS.map(renderOption)}
          </OptionGroup>

          <OptionGroup name={t('options.groups.rules')}>
            {RULE_OPTIONS.map(renderOption)}
          </OptionGroup>

          <OptionGroup name={t('options.groups.display')}>
            <ThemeChoice />
            <OptionCheckbox
              checked={isHighContrast}
              id='highContrast'
              label={t('options.highContrast')}
              onChange={toggleHighContrast}
            />
            {TILE_OPTIONS.map(renderOption)}

            <Flex
              align='center'
              className='option-row'
              gap='3'
              justify='between'
            >
              <Text as='label' htmlFor='language-select' size='3'>
                {t('options.language')}
                {currentLanguage !== ENGLISH && (
                  <span lang={ENGLISH}> / {LANGUAGE_IN_ENGLISH}</span>
                )}
              </Text>
              <Select.Root
                onValueChange={changeLanguage}
                value={currentLanguage}
              >
                <Select.Trigger
                  className='language-select'
                  id='language-select'
                />
                <Select.Content>
                  {Object.entries(languages).map(([code, language]) => (
                    <Select.Item
                      key={code}
                      lang={code.replace('_', '-')}
                      value={code}
                    >
                      {language.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Flex>
          </OptionGroup>

          <HomeScreenIconPicker />
          <ReportHandLink handFile={handFile} />
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export { OptionsMenu };
