import {
  TABLE_FU,
  TABLE_HAN,
  TABLE_LIMITS,
  canRon,
  canTsumo,
  getBasicPoints,
  getLimitBasicPoints,
  getRonPoints,
  getTsumoPoints,
  isMangan,
} from '../scripts/ScoringTable';

const MARKER = '%%scoring-table%%';

const hide = (text) => `<span class="visually-hidden">${text}</span>`;

function getWords(t) {
  return {
    dealer: t('scoringTable.dealer'),
    fromEachNonDealer: t('scoringTable.fromEachNonDealer'),
    fromEachPlayer: t('scoringTable.fromEachPlayer'),
    fromTheDealer: t('scoringTable.fromTheDealer'),
    fu: t('pointCalculations.fu'),
    han: t('pointCalculations.han'),
    limitHan: t('scoringTable.limitHan'),
    mangan: t('quiz.limits.mangan'),
    nonDealer: t('scoringTable.nonDealer'),
    ron: t('scoringTable.ron'),
    seat: t('scoringTable.seat'),
    tsumo: t('scoringTable.tsumo'),
  };
}

function getOtherWinHtml(t, canWinByRon) {
  return `<span class="why">${t(canWinByRon ? 'scoringTable.ronOnly' : 'scoringTable.tsumoOnly')}</span>`;
}

function getNoHandHtml(t, fu) {
  return `<span class="why">${t(fu === 20 ? 'scoringTable.pinfuTsumoOnly' : 'scoringTable.sevenPairsOnly')}</span>`;
}

function getTsumoHtml(basicPoints, isDealer, words, pairBreak) {
  const [fromEach, fromDealer] = getTsumoPoints(basicPoints, isDealer);

  if (isDealer) {
    return `${fromEach}${hide(` ${words.fromEachPlayer}`)}`;
  } else {
    return `${fromEach}${hide(` ${words.fromEachNonDealer}, `)}<span aria-hidden="true">/</span>${pairBreak}${fromDealer}${hide(` ${words.fromTheDealer}`)}`;
  }
}

// THE FULL TABLE

function getPairHtml(ronHtml, tsumoHtml, words) {
  return `<span class="pair"><span class="ron">${hide(`${words.ron} `)}${ronHtml}</span><span class="tsumo"><span>${hide(`${words.tsumo} `)}${tsumoHtml}</span></span></span>`;
}

function getFullCellsHtml(han, fus, isDealer, kiriageMangan, t, words) {
  const side = isDealer ? 'st-d' : 'st-n';

  return fus
    .map((fu, index) => {
      const basicPoints = getBasicPoints(han, fu, kiriageMangan);
      const headers = `headers="${side} ${side}-${fu} st-h${han}"`;
      const pairHtml = getPairHtml(
        canRon(han, fu)
          ? getRonPoints(basicPoints, isDealer)
          : getOtherWinHtml(t, false),
        canTsumo(han, fu)
          ? `(${getTsumoHtml(basicPoints, isDealer, words, '<br>')})`
          : getOtherWinHtml(t, true),
        words,
      );

      if (isMangan(han, fu, kiriageMangan)) {
        // Each of these is still its own cell with its figures in it, visually
        // hidden so a screen reader can read them. A Windows contrast theme
        // drops the block's color, so the figures are shown there.
        const next = fus[index + 1];
        const edge = next && isMangan(han, next, kiriageMangan) ? '' : ' br';

        return `<td class="mangan${edge}" ${headers}><span class="in-block">${hide(`${words.mangan}. `)}${pairHtml}</span></td>`;
      } else if (!canRon(han, fu) && !canTsumo(han, fu)) {
        return `<td class="h${han} none" ${headers}>${getNoHandHtml(t, fu)}</td>`;
      } else {
        return `<td class="h${han}" ${headers}>${pairHtml}</td>`;
      }
    })
    .join('');
}

function getLimitFigureHtml(limit, isDealer, words) {
  const basicPoints = getLimitBasicPoints(limit.mangans);

  return `${hide(`${words.ron} `)}${getRonPoints(basicPoints, isDealer)}<br>${hide(`${words.tsumo} `)}(${getTsumoHtml(basicPoints, isDealer, words, '')})`;
}

function getFullTableHtml(kiriageMangan, t, words, describedBy) {
  const dealerFus = [...TABLE_FU].reverse();
  const columns = `<colgroup>${'<col class="side">'.repeat(TABLE_FU.length)}<col class="mid">${'<col class="side">'.repeat(TABLE_FU.length)}</colgroup>`;
  const getFuHeadsHtml = (fus, side, className) =>
    fus
      .map(
        (fu) =>
          `<th class="fu ${className}" headers="${side}" id="${side}-${fu}" scope="col">${fu} ${words.fu}</th>`,
      )
      .join('');
  const head =
    `<tr><th class="dealer" colspan="${TABLE_FU.length}" id="st-d" scope="colgroup">${words.dealer}</th><td class="corner" rowspan="2">${words.ron}<br>(${words.tsumo})</td><th class="non-dealer" colspan="${TABLE_FU.length}" id="st-n" scope="colgroup">${words.nonDealer}</th></tr>`
    + `<tr>${getFuHeadsHtml(dealerFus, 'st-d', 'of-dealer')}${getFuHeadsHtml(TABLE_FU, 'st-n', 'of-non-dealer')}</tr>`;
  const hanRows = TABLE_HAN.map(
    (han) =>
      `<tr>${getFullCellsHtml(han, dealerFus, true, kiriageMangan, t, words)}<th class="name hh${han}" id="st-h${han}" scope="row">${han} ${words.han}</th>${getFullCellsHtml(han, TABLE_FU, false, kiriageMangan, t, words)}</tr>`,
  ).join('');
  const limitRows = TABLE_LIMITS.map(
    (limit) =>
      `<tr><td class="limit ${limit.id}" colspan="${TABLE_FU.length}" headers="st-d st-${limit.id}">${getLimitFigureHtml(limit, true, words)}</td>`
      + `<th class="name ${limit.id}" id="st-${limit.id}" scope="row">${limit.han} ${words.limitHan}<br>${t(`quiz.limits.${limit.id}`)}</th>`
      + `<td class="limit ${limit.id}" colspan="${TABLE_FU.length}" headers="st-n st-${limit.id}">${getLimitFigureHtml(limit, false, words)}</td></tr>`,
  ).join('');

  return `<table class="score-table full"${describedBy}><caption class="visually-hidden">${t('scoringTable.caption')}</caption>${columns}<thead>${head}</thead><tbody>${hanRows}${limitRows}</tbody></table>`;
}

// THE LIST

function getListTableHtml(isDealer, kiriageMangan, t, words, describedBy) {
  const id = isDealer ? 'sl-d' : 'sl-n';
  const fuClass = isDealer ? 'of-dealer' : 'of-non-dealer';
  const head =
    `<tr><th class="${isDealer ? 'dealer' : 'non-dealer'}" colspan="4" id="${id}" scope="colgroup">${isDealer ? words.dealer : words.nonDealer}</th></tr>`
    + `<tr><td class="corner" colspan="2"></td><th class="fu ${fuClass}" id="${id}-ron" scope="col">${words.ron}</th><th class="fu ${fuClass}" id="${id}-tsumo" scope="col">${words.tsumo}</th></tr>`;

  const hanGroups = TABLE_HAN.map((han) => {
    const plainFus = TABLE_FU.filter((fu) => !isMangan(han, fu, kiriageMangan));
    const manganFus = TABLE_FU.filter((fu) => isMangan(han, fu, kiriageMangan));
    const rows = plainFus.map((fu) => {
      const basicPoints = getBasicPoints(han, fu, kiriageMangan);
      const headers = `${id}-h${han} ${id}-h${han}-f${fu}`;

      const fuHead = `<th class="fu ${fuClass}" id="${id}-h${han}-f${fu}" scope="row">${fu} ${words.fu}</th>`;

      if (!canRon(han, fu) && !canTsumo(han, fu)) {
        return `${fuHead}<td class="h${han} none" colspan="2" headers="${headers}">${getNoHandHtml(t, fu)}</td>`;
      } else {
        return (
          fuHead
          + `<td class="h${han} is-ron" headers="${id}-ron ${headers}">${canRon(han, fu) ? getRonPoints(basicPoints, isDealer) : getOtherWinHtml(t, false)}</td>`
          + `<td class="h${han} is-tsumo" headers="${id}-tsumo ${headers}">${canTsumo(han, fu) ? getTsumoHtml(basicPoints, isDealer, words, '') : getOtherWinHtml(t, true)}</td>`
        );
      }
    });

    if (manganFus.length > 0) {
      const first = manganFus[0];
      const last = manganFus[manganFus.length - 1];
      const range =
        first === last
          ? `${first} ${words.fu}`
          : t('scoringTable.fuRange').replace('{}', first).replace('{}', last);

      rows.push(
        `<th class="fu range ${fuClass}" id="${id}-h${han}-cap" scope="row">${range}</th>`
          + `<td class="mangan shown" colspan="2" headers="${id}-h${han} ${id}-h${han}-cap">${words.mangan}</td>`,
      );
    }

    return rows
      .map(
        (row, index) =>
          `<tr>${index === 0 ? `<th class="name hh${han}" id="${id}-h${han}" rowspan="${rows.length}" scope="rowgroup">${han} ${words.han}</th>` : ''}${row}</tr>`,
      )
      .join('');
  }).join('');

  const limitRows = TABLE_LIMITS.map((limit) => {
    const basicPoints = getLimitBasicPoints(limit.mangans);

    return (
      `<tr><th class="name ${limit.id}" colspan="2" id="${id}-${limit.id}" scope="row">${limit.han} ${words.limitHan}<br>${t(`quiz.limits.${limit.id}`)}</th>`
      + `<td class="limit ${limit.id}" headers="${id}-ron ${id}-${limit.id}">${getRonPoints(basicPoints, isDealer)}</td>`
      + `<td class="limit ${limit.id}" headers="${id}-tsumo ${id}-${limit.id}">${getTsumoHtml(basicPoints, isDealer, words, '')}</td></tr>`
    );
  }).join('');

  const caption = t(
    isDealer ? 'scoringTable.captionDealer' : 'scoringTable.captionNonDealer',
  );

  return `<table class="score-table listed ${isDealer ? 'for-dealer' : 'for-non-dealer'}"${describedBy}><caption class="visually-hidden">${caption}</caption><colgroup><col class="for-han"><col class="for-fu"><col class="for-ron"><col class="for-tsumo"></colgroup><thead>${head}</thead><tbody>${hanGroups}${limitRows}</tbody></table>`;
}

function getSeatChoiceHtml(words) {
  const getSegmentHtml = (seat, name, isChecked) =>
    `<label class="segment"><input class="visually-hidden"${isChecked ? ' checked' : ''} name="score-seat" type="radio" value="${seat}">${name}</label>`;

  return `<div aria-label="${words.seat}" class="segments seat-choice" role="radiogroup">${getSegmentHtml('dealer', words.dealer, false)}${getSegmentHtml('non-dealer', words.nonDealer, true)}</div>`;
}

function getScoringTableHtml(t, kiriageMangan) {
  const words = getWords(t);
  const note = kiriageMangan
    ? `<p class="score-note" id="st-note">${t('scoringTable.kiriageNote')}</p>`
    : '';
  const describedBy = kiriageMangan ? ' aria-describedby="st-note"' : '';

  return `<div class="scoring-table">${note}${getFullTableHtml(kiriageMangan, t, words, describedBy)}<div aria-label="${t('scoringTable.name')}" class="score-lists" role="region" tabindex="0">${getSeatChoiceHtml(words)}${getListTableHtml(true, kiriageMangan, t, words, describedBy)}${getListTableHtml(false, kiriageMangan, t, words, describedBy)}</div></div>`;
}

export function getMarkdownScoringTable(t, kiriageMangan) {
  return {
    hooks: {
      preprocess: (text) =>
        text.replace(MARKER, () => getScoringTableHtml(t, kiriageMangan)),
    },
  };
}
