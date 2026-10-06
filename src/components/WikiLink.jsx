import { useTranslation } from '../i18n/I18nContext';

function WikiLink({ children, href }) {
  const { t } = useTranslation();

  if (!href) {
    return children;
  }

  return (
    <a
      className='wiki-link'
      href={href}
      rel='noopener noreferrer'
      target='_blank'
    >
      {children}
      <span className='visually-hidden'> {t('quiz.opensWiki')}</span>
    </a>
  );
}

export { WikiLink };
