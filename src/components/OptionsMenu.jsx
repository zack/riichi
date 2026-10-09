import { Dialog, Flex, Select, Text } from '@radix-ui/themes';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { useRef, useState } from 'react';

import { useAppearance } from '../AppearanceContext';
import { useTranslation } from '../i18n/I18nContext';
import { useCloseWatcher } from '../scripts/CloseWatcher';
import { scrollFocusIntoView } from '../scripts/FocusScroll';
import { EXACT_FU, TEST_FU, TEST_HAN, TEST_POINTS } from '../scripts/Options';
import { GearIcon } from './GearIcon';
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
  { id: 'testHonba' },
];
const RULE_OPTIONS = [{ id: 'kiriageMangan' }];
const TILE_OPTIONS = [{ id: 'showTileNames' }, { id: 'fancyTiles' }];

function OptionsMenu({
  handFile,
  handIsChecked,
  handOptions,
  onChangeOption,
  options,
}) {
  const { changeLanguage, currentLanguage, languages, t } = useTranslation();
  const { isHighContrast, toggleHighContrast } = useAppearance();
  const contentRef = useRef(null);
  const [open, setOpen] = useState(false);
  useCloseWatcher(open, setOpen);

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
    <Dialog.Root onOpenChange={setOpen} open={open}>
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
        onFocus={scrollFocusIntoView}
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
            <h1 className='dialog-title'>{t('options.title')}</h1>
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
                size='3'
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
          <ReportHandLink handFile={handFile} options={handOptions} />
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export { OptionsMenu };
