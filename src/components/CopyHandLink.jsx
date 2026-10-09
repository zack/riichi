import { Popover, Text, TextArea } from '@radix-ui/themes';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { useEffect, useRef, useState } from 'react';

import { useTranslation } from '../i18n/I18nContext';
import { HAND_PARAM, getHandId } from '../scripts/Hands';

const COPIED_TIME = 2000;

const LINK_ROWS = 3;

const FAILED_HEADING = 'hand-link-failed';
const LINK_BOX = 'hand-link-text';

// The link and the tick are Feather's (https://feathericons.com, MIT)
const LinkIcon = () => (
  <svg
    aria-hidden='true'
    fill='none'
    height='13'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2.5'
    viewBox='0 0 24 24'
    width='13'
  >
    <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
    <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
  </svg>
);

const CheckIcon = () => (
  <svg
    aria-hidden='true'
    fill='none'
    height='13'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='3'
    viewBox='0 0 24 24'
    width='13'
  >
    <polyline points='20 6 9 17 4 12' />
  </svg>
);

function getHandLink(handFile) {
  const url = new URL(window.location.href);
  url.hash = '';
  url.searchParams.set(HAND_PARAM, getHandId(handFile));
  return url.href;
}

function copyTheOldWay(text) {
  const focused = document.activeElement;
  const box = document.createElement('textarea');
  box.value = text;
  box.readOnly = true;
  box.style.opacity = '0';
  box.style.position = 'fixed';
  document.body.append(box);
  box.select();

  let copied;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }

  box.remove();
  focused?.focus();
  return copied;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return copyTheOldWay(text);
  }
}

function CopyHandLink({ handFile, onCopy }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [said, setSaid] = useState('');
  const [uncopied, setUncopied] = useState(null);
  const buttonRef = useRef(null);
  const linkRef = useRef(null);
  const showsLink = uncopied?.handFile === handFile;

  // A screen reader only announces a status message when it changes, so if we
  // left it the next copy would be silent. Clear it when the tick goes away,
  // unless something else has been announced in the meantime.
  useEffect(() => {
    if (said === '') {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setCopied(false);
      setSaid('');
      onCopy((message) => (message === said ? '' : message));
    }, COPIED_TIME);
    return () => clearTimeout(timeout);
  }, [onCopy, said]);

  const handleClick = async () => {
    const link = getHandLink(handFile);
    const hasCopied = await copyText(link);
    const message = hasCopied ? t('handLink.copied') : t('handLink.failed');

    setCopied(hasCopied);
    setSaid(message);
    setUncopied(hasCopied ? null : { handFile, link });
    onCopy(message);
  };

  const handleCloseFromInside = () => {
    setUncopied(null);
    buttonRef.current?.focus();
  };

  return (
    <Popover.Root
      onOpenChange={(open) => {
        if (!open) {
          setUncopied(null);
        }
      }}
      open={showsLink}
    >
      {/* Anchor instead of Trigger, because the button copies and only a failed
          copy opens the popover. This is Radix's primitive because the Themes
          version of Anchor throws away its children. */}
      <PopoverPrimitive.Anchor asChild>
        <button
          aria-label={t('handLink.copy')}
          className='badge hand-number hand-link'
          onClick={handleClick}
          ref={buttonRef}
          type='button'
        >
          {copied ? <CheckIcon /> : <LinkIcon />}
        </button>
      </PopoverPrimitive.Anchor>

      <Popover.Content
        align='end'
        aria-labelledby={FAILED_HEADING}
        className='hand-link-box'
        onCloseAutoFocus={(event) => event.preventDefault()}
        onEscapeKeyDown={handleCloseFromInside}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          linkRef.current?.focus({ preventScroll: true });
          linkRef.current?.select();
        }}
        size='1'
      >
        <Text as='p' id={FAILED_HEADING} size='3' weight='bold'>
          {t('handLink.failed')}
        </Text>
        <Text as='label' color='gray' htmlFor={LINK_BOX} size='2'>
          {t('handLink.link')}
        </Text>
        <TextArea
          className='hand-link-text'
          id={LINK_BOX}
          readOnly
          ref={linkRef}
          resize='none'
          rows={LINK_ROWS}
          size='3'
          value={uncopied?.link ?? ''}
        />
        <button
          className='action-button'
          onClick={handleCloseFromInside}
          type='button'
        >
          {t('common.close')}
        </button>
      </Popover.Content>
    </Popover.Root>
  );
}

export { CopyHandLink };
