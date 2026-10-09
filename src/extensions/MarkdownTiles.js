import { escapeAttribute } from '../scripts/Escape';
import * as TileConversion from '../scripts/TileConversion';
import { getTileTextClass } from '../scripts/TileText';

const ORDER_MARK = '>';

const ORDER_ARROW = '\u2192';
const ORDER_ARROW_HTML = `<span class="tile-arrow"><span class="visually-hidden">${ORDER_ARROW}</span><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" viewBox="0 0 24 24"><path d="M3 12h18M14 5l7 7l-7 7" /></svg></span>`;

function getTileHtml(tile, t, fancy, showNames) {
  const alt = escapeAttribute(TileConversion.tileToName(tile, t));
  const src = escapeAttribute(TileConversion.tileToPath(tile, fancy));
  const label = showNames
    ? `<span aria-hidden="true" class="tile-label">${escapeAttribute(TileConversion.tileToLabel(tile, t))}</span>`
    : '';

  const tileText = TileConversion.tileToText(tile, t);
  const text = `<span aria-hidden="true" class="${getTileTextClass(tileText)}">${escapeAttribute(tileText)}</span>`;

  return `<span class="tile-cell"><span class="tile"><img alt="${alt}" src="${src}" />${text}</span>${label}</span>`;
}

export function getTilesHtml(tileString, t, fancy, showNames) {
  return tileString
    .trim()
    .split(/\s+/)
    .map((group) => {
      const tiles = group
        .split(ORDER_MARK)
        .map((part) =>
          TileConversion.tileStringToArray(part)
            .map((tile) => getTileHtml(tile, t, fancy, showNames))
            .join(''),
        )
        .join(ORDER_ARROW_HTML);

      return `<span class="help-tiles">${tiles}</span>`;
    })
    .join('');
}

export function getMarkdownTiles(t, fancy, showNames) {
  return {
    hooks: {
      preprocess: (text) =>
        text.replace(/\^\^(.*?)\^\^/g, (_match, tileString) =>
          getTilesHtml(tileString, t, fancy, showNames),
        ),
    },
  };
}
