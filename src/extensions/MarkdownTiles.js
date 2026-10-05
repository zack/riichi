import * as TileConversion from '../scripts/TileConversion';

function escapeAttribute(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function getTileHtml(tile, t, fancy, showNames) {
  const alt = escapeAttribute(TileConversion.tileToName(tile, t));
  const src = escapeAttribute(TileConversion.tileToPath(tile, fancy));
  const label = showNames
    ? `<span aria-hidden="true" class="tile-label">${escapeAttribute(TileConversion.tileToLabel(tile, t))}</span>`
    : '';

  return `<span class="tile-cell"><span class="tile"><img alt="${alt}" src="${src}" /></span>${label}</span>`;
}

export function getMarkdownTiles(t, fancy, showNames) {
  return {
    hooks: {
      preprocess: (text) =>
        text.replace(/\^\^(.*?)\^\^/g, (_match, tileString) =>
          TileConversion.tileStringToArray(tileString)
            .map((tile) => getTileHtml(tile, t, fancy, showNames))
            .join(''),
        ),
    },
  };
}
