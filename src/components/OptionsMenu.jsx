import { Checkbox, Dialog, Flex, Link, Select, Text } from '@radix-ui/themes';
import { useRef } from 'react';

import { useAppearance } from '../AppearanceContext';
import { useTranslation } from '../i18n/I18nContext';
import { HAND_PARAM, getHandId } from '../scripts/Hands';
import { DEFAULT_OPTIONS, TEST_HAN } from '../scripts/Options';
import { HomeScreenIconPicker } from './HomeScreenIconPicker';

const REQUIRED_OPTIONS = {
  ignoreFuOnLimit: TEST_HAN,
};

const MenuIcon = () => (
  <svg
    aria-hidden='true'
    fill='currentColor'
    height='18'
    viewBox='0 0 18 18'
    width='18'
  >
    <rect height='2' rx='1' width='14' x='2' y='3' />
    <rect height='2' rx='1' width='14' x='2' y='8' />
    <rect height='2' rx='1' width='14' x='2' y='13' />
  </svg>
);

function OptionsMenu({ handIsChecked, handFile, onChangeOption, options }) {
  const { changeLanguage, currentLanguage, languages, t } = useTranslation();
  const { isHighContrast, toggleHighContrast } = useAppearance();
  const contentRef = useRef(null);
  const handId = getHandId(handFile);

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <button
          aria-label={t('options.title')}
          className='icon-button'
          type='button'
        >
          <MenuIcon />
        </button>
      </Dialog.Trigger>

      <Dialog.Content
        aria-describedby={handIsChecked ? 'next-hand-note' : undefined}
        maxWidth='400px'
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          contentRef.current?.focus({ preventScroll: true });
        }}
        ref={contentRef}
      >
        <Dialog.Title>{t('options.title')}</Dialog.Title>
        {handIsChecked && (
          <Text as='p' color='gray' id='next-hand-note' mb='4' mt='-2' size='2'>
            {t('options.nextHandNote')}
          </Text>
        )}

        <Flex direction='column' gap='3'>
          <Flex direction='column'>
            {Object.keys(DEFAULT_OPTIONS).map((optionId) => {
              const requiredOptionId = REQUIRED_OPTIONS[optionId];
              const disabled =
                requiredOptionId !== undefined && !options[requiredOptionId];

              const noteId = `${optionId}-note`;

              return (
                <div key={optionId}>
                  <Text
                    as='label'
                    color={disabled ? 'gray' : undefined}
                    size='3'
                  >
                    <Flex align='center' className='option-row' gap='2'>
                      <Checkbox
                        aria-describedby={disabled ? noteId : undefined}
                        aria-disabled={disabled || undefined}
                        checked={options[optionId]}
                        className={disabled ? 'option-unavailable' : undefined}
                        color={disabled ? 'gray' : undefined}
                        onCheckedChange={(checked) => {
                          if (!disabled) {
                            onChangeOption(optionId, checked === true);
                          }
                        }}
                        size='3'
                        variant={disabled ? 'soft' : undefined}
                      />
                      {t(`options.${optionId}`)}
                    </Flex>
                  </Text>
                  {disabled && (
                    <Text
                      as='p'
                      className='option-note'
                      color='gray'
                      id={noteId}
                      size='2'
                    >
                      {t('options.unavailableWhileOff').replace(
                        '{}',
                        t(`options.${requiredOptionId}`),
                      )}
                    </Text>
                  )}
                </div>
              );
            })}

            <Text as='label' size='3'>
              <Flex align='center' className='option-row' gap='2'>
                <Checkbox
                  checked={isHighContrast}
                  onCheckedChange={toggleHighContrast}
                  size='3'
                />
                {t('options.highContrast')}
              </Flex>
            </Text>
          </Flex>

          <Flex align='center' gap='2'>
            <Text as='label' htmlFor='language-select' size='3'>
              {t('options.language')}
            </Text>
            <Select.Root onValueChange={changeLanguage} value={currentLanguage}>
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

          <HomeScreenIconPicker />

          <Text as='p' color='gray' size='2'>
            {t('footer.logIssues')}{' '}
            <Link href='https://github.com/zack/riichi'>GitHub</Link>
          </Text>
          <Text as='p' className='hand-id' color='gray' size='2'>
            {t('options.handId')}{' '}
            <Link href={`?${HAND_PARAM}=${handId}`}>{handId}</Link>
          </Text>
        </Flex>

        <Flex justify='end' mt='4'>
          <Dialog.Close>
            <button className='action-button' type='button'>
              {t('common.close')}
            </button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export { OptionsMenu };
