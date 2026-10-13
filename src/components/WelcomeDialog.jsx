import { Dialog, Flex } from '@radix-ui/themes';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { useRef, useState } from 'react';

import { useTranslation } from '../i18n/I18nContext';
import { focusStaticElement } from '../scripts/StaticFocus';

const SEEN_STORAGE_KEY = 'mahjong-welcome-seen';
const SEEN = 'true';

function welcomeIsSeen() {
  try {
    return localStorage.getItem(SEEN_STORAGE_KEY) === SEEN;
  } catch {
    return false;
  }
}

function storeWelcomeSeen() {
  try {
    localStorage.setItem(SEEN_STORAGE_KEY, SEEN);
  } catch {
    // localStorage is blocked. The dialog still stays closed until the page is
    // reloaded.
  }
}

function WelcomeDialog({ handRef }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(() => !welcomeIsSeen());
  const contentRef = useRef(null);

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      storeWelcomeSeen();
    }
  };

  return (
    <Dialog.Root onOpenChange={handleOpenChange} open={open}>
      <Dialog.Content
        className='welcome-dialog'
        maxWidth='400px'
        // This dialog opens with the page, so no button opened it and there's
        // nothing to give focus back to. Left alone, focus lands on the body,
        // and a screen reader says the page's name or nothing at all.
        onCloseAutoFocus={(event) => {
          if (handRef.current) {
            event.preventDefault();
            focusStaticElement(handRef.current);
          }
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          contentRef.current?.focus({ preventScroll: true });
        }}
        ref={contentRef}
      >
        <DialogPrimitive.Title asChild>
          <h1 className='dialog-title'>{t('welcome.title')}</h1>
        </DialogPrimitive.Title>
        <Dialog.Description mt='3' size='3'>
          {t('welcome.body')}
        </Dialog.Description>

        <Flex justify='end' mt='4'>
          <Dialog.Close>
            <button className='action-button primary' type='button'>
              {t('welcome.start')}
            </button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export { WelcomeDialog };
