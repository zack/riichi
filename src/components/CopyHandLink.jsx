import { useEffect, useState } from 'react';

import { useTranslation } from '../i18n/I18nContext';
import { HAND_PARAM, getHandId } from '../scripts/Hands';

const COPIED_TIME = 2000;

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

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeout = setTimeout(() => setCopied(false), COPIED_TIME);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleClick = async () => {
    if (await copyText(getHandLink(handFile))) {
      setCopied(true);
      onCopy(t('handLink.copied'));
    } else {
      onCopy(t('handLink.failed'));
    }
  };

  return (
    <button
      aria-label={t('handLink.copy')}
      className='badge hand-number hand-link'
      onClick={handleClick}
      type='button'
    >
      {copied ? <CheckIcon /> : <LinkIcon />}
    </button>
  );
}

export { CopyHandLink };
