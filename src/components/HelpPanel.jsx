import { Dialog, Flex, Text } from '@radix-ui/themes';
import { Marked } from 'marked';
import { Dialog as DialogPrimitive, Tabs } from 'radix-ui';
import { useRef, useState } from 'react';

import { getMarkdownScoringTable } from '../extensions/MarkdownScoringTable';
import { getMarkdownSteps } from '../extensions/MarkdownSteps';
import { getMarkdownTiles } from '../extensions/MarkdownTiles';
import { getMarkdownYakuList } from '../extensions/MarkdownYakuList';
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

const STEPS_TAB = 'steps';
const YAKU_TAB = 'yaku';
const TABS = [STEPS_TAB, YAKU_TAB, 'table', 'site'];

const YEAR_MARKER = '%%year%%';
const CURRENT_YEAR = new Date().getFullYear();

function getTabs(page) {
  return page
    .split(/^# /m)
    .slice(1)
    .map((part, index) => {
      const [names, ...lines] = part.split('\n');
      const [label, longLabel] = names.split('|').map((name) => name.trim());

      return { id: TABS[index], label, longLabel, text: lines.join('\n') };
    });
}

// This is its own component because Radix mounts a dialog's content after the
// dialog opens, so anything that measures has to be a child
function HelpContent({ fancyTiles, id, kiriageMangan, showNames, text }) {
  const { currentLanguage, t } = useTranslation();
  const helpRef = useRef(null);
  const namesOnTiles = useNamesOnTiles(
    helpRef,
    showNames,
    `${currentLanguage} ${fancyTiles}`,
  );

  const markdown = new Marked(
    getMarkdownTiles(t, fancyTiles, showNames),
    getMarkdownYakuList(t, currentLanguage, fancyTiles, showNames),
    getMarkdownScoringTable(t, kiriageMangan),
    id === STEPS_TAB ? getMarkdownSteps() : {},
    {
      renderer: {
        link({ href, tokens }) {
          const text = this.parser.parseInline(tokens);
          return `<a href="${href}" rel="noopener noreferrer" target="_blank">${text}</a>`;
        },
      },
    },
  );
  const helpHtml = markdown.parse(text.replaceAll(YEAR_MARKER, CURRENT_YEAR));

  const hasLinks = helpHtml.includes('<a ');
  const isYakuTab = id === YAKU_TAB;

  const handleImageError = (event) => {
    event.target.closest('.tile')?.classList.add('failed');
  };

  // This is safe because it's only ever our own help pages, which ship with the
  // app
  return (
    <>
      {(hasLinks || isYakuTab) && (
        <div className='help-top'>
          {isYakuTab && (
            <p className='yaku-legend tone-gray'>
              <span aria-hidden='true' className='han-badge'>
                +
              </span>
              {t('helpYaku.legend.plus')}
            </p>
          )}
          <div className='help-notes'>
            {hasLinks && (
              <Text as='p' color='gray' size='1'>
                {t('quiz.linksOpenNewTab')}
              </Text>
            )}
            {isYakuTab && (
              <Text as='p' color='gray' size='1'>
                {t('helpYaku.unusedNotListed')}
              </Text>
            )}
          </div>
        </div>
      )}
      <div
        className={`help-content help-${id} ${fancyTiles ? 'fancy-tiles' : ''} ${namesOnTiles ? 'names-on-tiles' : ''}`}
        dangerouslySetInnerHTML={{ __html: helpHtml }}
        onErrorCapture={handleImageError}
        ref={helpRef}
      />
    </>
  );
}

function HelpPanel({ fancyTiles, kiriageMangan, showNames }) {
  const { currentLanguage, t } = useTranslation();
  const contentRef = useRef(null);
  const [tab, setTab] = useState(STEPS_TAB);
  const tabs = getTabs(HELP_PAGES[currentLanguage] ?? HELP_PAGES.en);

  function handleTabChange(newTab) {
    setTab(newTab);
    contentRef.current?.parentElement.scrollIntoView();
  }

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
        align='start'
        aria-describedby={undefined}
        className='help-dialog'
        maxWidth='800px'
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          contentRef.current?.focus({ preventScroll: true });
        }}
        ref={contentRef}
      >
        <Tabs.Root onValueChange={handleTabChange} value={tab}>
          <div className='help-header'>
            <Flex align='center' gap='3' justify='between'>
              <DialogPrimitive.Title asChild>
                <h1 className='help-title'>{t('common.help')}</h1>
              </DialogPrimitive.Title>
              <Dialog.Close>
                <button className='action-button' type='button'>
                  {t('common.close')}
                </button>
              </Dialog.Close>
            </Flex>
            <Tabs.List className='segments help-tabs'>
              {tabs.map((each) => (
                <Tabs.Trigger className='segment' key={each.id} value={each.id}>
                  {each.longLabel ? (
                    <>
                      <span className='tab-short'>{each.label}</span>
                      <span className='tab-long'>{each.longLabel}</span>
                    </>
                  ) : (
                    each.label
                  )}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </div>

          {tabs.map((each) => (
            <Tabs.Content className='help-panel' key={each.id} value={each.id}>
              <HelpContent
                fancyTiles={fancyTiles}
                id={each.id}
                kiriageMangan={kiriageMangan}
                showNames={showNames}
                text={each.text}
              />
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export { HelpPanel };
