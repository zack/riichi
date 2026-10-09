import { escapeHtml } from '../scripts/Escape';
import { HELP_YAKU } from '../scripts/HelpYaku';
import { getYakuWikiUrl } from '../scripts/WikiLinks';
import { getTilesHtml } from './MarkdownTiles';

const MARKER = '%%yaku-list%%';

const CLOSED_CLASSES = 'closed tone-sanbaiman';

const hide = (text) => `<span class="visually-hidden">${text}</span>`;

function getBadge(yaku, t) {
  let className = 'han-badge';
  let drawn = String(yaku.han);
  let said = t('helpYaku.badge.han');

  if (yaku.closedOnly) {
    className += ` ${CLOSED_CLASSES}`;
    said = t('helpYaku.badge.closed');
  } else if (yaku.closedBonus) {
    drawn += '+';
    said = t('helpYaku.badge.plus');
  }

  return {
    badgeHtml: `<span aria-hidden="true" class="${className}">${drawn}</span>`,
    saidHtml: `<p class="visually-hidden yaku-worth">${said.replace('{}', yaku.han)}</p>`,
  };
}

function getNameHtml(yaku, t, language) {
  const name = escapeHtml(
    t(
      yaku.id === undefined
        ? `helpYaku.yaku.${yaku.key}.name`
        : `yaku.${yaku.id}`,
    ),
  );
  const href = getYakuWikiUrl(yaku.id ?? yaku.wikiId, language);

  if (href) {
    return `<a class="wiki-link" href="${href}" rel="noopener noreferrer" target="_blank">${name}${hide(` ${escapeHtml(t('quiz.opensWiki'))}`)}</a>`;
  } else {
    return name;
  }
}

function getExampleHtml(tiles, getTiles) {
  if (Array.isArray(tiles)) {
    const lines = tiles.map(
      (line) => `<span class="yaku-tiles">${getTiles(line)}</span>`,
    );

    return `<span class="yaku-tile-lines">${lines.join('')}</span>`;
  } else if (tiles) {
    return `<span class="yaku-tiles">${getTiles(tiles)}</span>`;
  } else {
    return '';
  }
}

function getYakuHtml(yaku, t, language, getTiles) {
  const name = getNameHtml(yaku, t, language);
  const gloss = t(`helpYaku.yaku.${yaku.key}.gloss`, '');
  const glossLanguage = t('helpYaku.glossLanguage', '');
  const langAttribute = glossLanguage ? ` lang="${glossLanguage}"` : '';
  const glossHtml = gloss
    ? `<span class="yaku-gloss"${langAttribute}>${escapeHtml(gloss)}</span>`
    : '';
  const description = escapeHtml(t(`helpYaku.yaku.${yaku.key}.description`));
  const tilesHtml = getExampleHtml(yaku.tiles, getTiles);
  const { badgeHtml, saidHtml } = getBadge(yaku, t);

  return (
    `<div class="yaku">${badgeHtml}`
    + `<div class="yaku-words"><h3 class="yaku-name">${name}${glossHtml}</h3>${saidHtml}`
    + `<p class="yaku-description"><span>${description}</span>${tilesHtml}</p></div></div>`
  );
}

function getYakuListHtml(t, language, getTiles) {
  const families = HELP_YAKU.map(
    (family) =>
      `<section class="yaku-family tone-${family.tone}"><h2>${escapeHtml(t(`helpYaku.families.${family.key}`))}</h2>`
      + `${family.yaku.map((yaku) => getYakuHtml(yaku, t, language, getTiles)).join('')}</section>`,
  );

  const columns = [];
  HELP_YAKU.forEach((family, index) => {
    if (index === 0 || family.startsColumn) {
      columns.push([]);
    }
    columns[columns.length - 1].push(families[index]);
  });
  const columnsHtml = columns.map(
    (column) => `<div class="yaku-column">${column.join('')}</div>`,
  );

  return `<div class="yaku-list">${columnsHtml.join('')}</div>`;
}

export function getMarkdownYakuList(t, language, fancy, showNames) {
  const getTiles = (tileString) =>
    getTilesHtml(tileString, t, fancy, showNames);

  return {
    hooks: {
      preprocess: (text) =>
        text.replace(MARKER, () => getYakuListHtml(t, language, getTiles)),
    },
  };
}
