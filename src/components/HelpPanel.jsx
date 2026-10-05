import { Dialog, Flex } from '@radix-ui/themes';
import { Marked } from 'marked';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { useRef } from 'react';

import { getMarkdownTiles } from '../extensions/MarkdownTiles';
import scoringEn from '../helpPages/scoring.en.md?raw';
import scoringJa from '../helpPages/scoring.ja.md?raw';
import scoringKo from '../helpPages/scoring.ko.md?raw';
import scoringZhCn from '../helpPages/scoring.zh_cn.md?raw';
import { useTranslation } from '../i18n/I18nContext';
import { useNamesOnTiles } from '../scripts/TileNames';

const HELP_PAGES = {
  en: scoringEn,
  ja: scoringJa,
  ko: scoringKo,
  zh_cn: scoringZhCn,
};

// This is its own component because Radix mounts a dialog's content after the
// dialog opens, so anything that measures has to be a child
function HelpContent({ fancyTiles, showNames }) {
  const { currentLanguage, t } = useTranslation();
  const helpRef = useRef(null);
  const namesOnTiles = useNamesOnTiles(
    helpRef,
    showNames,
    `${currentLanguage} ${fancyTiles}`,
  );

  const markdown = new Marked(getMarkdownTiles(t, fancyTiles, showNames), {
    renderer: {
      link({ href, tokens }) {
        const text = this.parser.parseInline(tokens);
        return `<a href="${href}" rel="noopener noreferrer" target="_blank">${text}</a>`;
      },
    },
  });
  const helpHtml = markdown.parse(HELP_PAGES[currentLanguage] ?? HELP_PAGES.en);

  // This is safe because it's only ever our own help pages, which ship with the
  // app
  return (
    <div
      className={`help-content ${fancyTiles ? 'fancy-tiles' : ''} ${namesOnTiles ? 'names-on-tiles' : ''}`}
      dangerouslySetInnerHTML={{ __html: helpHtml }}
      ref={helpRef}
    />
  );
}

function HelpPanel({ fancyTiles, showNames }) {
  const { t } = useTranslation();
  const contentRef = useRef(null);

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <button
          aria-label={t('common.help')}
          className='icon-button'
          type='button'
        >
          <strong aria-hidden='true'>?</strong>
        </button>
      </Dialog.Trigger>

      <Dialog.Content
        aria-describedby={undefined}
        className='help-dialog'
        maxWidth='800px'
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          contentRef.current?.focus({ preventScroll: true });
        }}
        ref={contentRef}
      >
        <Flex align='center' className='help-header' gap='3' justify='between'>
          <DialogPrimitive.Title asChild>
            <h1 className='help-title'>{t('common.help')}</h1>
          </DialogPrimitive.Title>
          <Dialog.Close>
            <button className='action-button' type='button'>
              {t('common.close')}
            </button>
          </Dialog.Close>
        </Flex>

        <HelpContent fancyTiles={fancyTiles} showNames={showNames} />
      </Dialog.Content>
    </Dialog.Root>
  );
}

export { HelpPanel };
