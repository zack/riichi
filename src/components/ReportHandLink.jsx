import { Text } from '@radix-ui/themes';

import { useTranslation } from '../i18n/I18nContext';
import { HAND_PARAM, getHandId } from '../scripts/Hands';

const NEW_ISSUE_URL = 'https://github.com/zack/riichi/issues/new';

// Link to the hand on the real site instead of wherever the page happens to be
// open (locally or w/e)
const APP_URL = 'https://riichi.youngren.io/';

// Feather's external link icon (https://feathericons.com, MIT)
const NewTabIcon = () => (
  <svg
    aria-hidden='true'
    className='new-tab-icon'
    fill='none'
    height='12'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='2.5'
    viewBox='0 0 24 24'
    width='12'
  >
    <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
    <polyline points='15 3 21 3 21 9' />
    <line x1='10' x2='21' y1='14' y2='3' />
  </svg>
);

function getIssueUrl(handId) {
  const handUrl = new URL(APP_URL);
  handUrl.searchParams.set(HAND_PARAM, handId);

  const issueUrl = new URL(NEW_ISSUE_URL);
  issueUrl.searchParams.set('title', `Hand ${handId}`);
  issueUrl.searchParams.set('body', `${handUrl.href}\n\n`);
  return issueUrl.href;
}

function ReportHandLink({ handFile }) {
  const { t } = useTranslation();

  return (
    <Text as='p' className='report-hand' size='2'>
      <a
        className='text-link'
        href={getIssueUrl(getHandId(handFile))}
        rel='noopener noreferrer'
        target='_blank'
      >
        {t('options.reportHand')}
        <NewTabIcon />
        <span className='visually-hidden'> {t('options.opensNewTab')}</span>
      </a>{' '}
      {t('options.onGitHub')}
    </Text>
  );
}

export { ReportHandLink };
