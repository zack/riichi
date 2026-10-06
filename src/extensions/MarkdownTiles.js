import * as TileConversion from '../scripts/TileConversion';

function escapeAttribute(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

const ORDER_MARK = '>';
const ORDER_ARROW = '\u2192';

function getTileHtml(tile, t, fancy, showNames) {
  const alt = escapeAttribute(TileConversion.tileToName(tile, t));
  const src = escapeAttribute(TileConversion.tileToPath(tile, fancy));
  const label = showNames
    ? `<span aria-hidden="true" class="tile-label">${escapeAttribute(TileConversion.tileToLabel(tile, t))}</span>`
    : '';

  return `<span class="tile-cell"><span class="tile"><img alt="${alt}" src="${src}" /></span>${label}</span>`;
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
        .join(`<span class="tile-arrow">${ORDER_ARROW}</span>`);

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
