const TABLE_HAN = [1, 2, 3, 4];
const TABLE_FU = [20, 25, 30, 40, 50, 60, 70];

const MANGAN_BASIC_POINTS = 2000;

// 4 han 30 fu and 3 han 60 fu both come to this, and they're the only two hands
// that Kiriage Mangan rounds up
const KIRIAGE_BASIC_POINTS = 1920;

const TABLE_LIMITS = [
  { han: '5', id: 'mangan', mangans: 1, minHan: 5 },
  { han: '6 - 7', id: 'haneman', mangans: 1.5, minHan: 6 },
  { han: '8 - 10', id: 'baiman', mangans: 2, minHan: 8 },
  { han: '11 - 12', id: 'sanbaiman', mangans: 3, minHan: 11 },
  { han: '13+', id: 'yakuman', mangans: 4, minHan: 13 },
];

const roundUpToHundred = (points) => Math.ceil(points / 100) * 100;

function getUncappedBasicPoints(han, fu) {
  return fu * 2 ** (han + 2);
}

function roundsUpToMangan(han, fu) {
  return getUncappedBasicPoints(han, fu) === KIRIAGE_BASIC_POINTS;
}

function getBasicPoints(han, fu, kiriageMangan) {
  if (kiriageMangan && roundsUpToMangan(han, fu)) {
    return MANGAN_BASIC_POINTS;
  } else {
    return Math.min(getUncappedBasicPoints(han, fu), MANGAN_BASIC_POINTS);
  }
}

function getLimitBasicPoints(mangans) {
  return MANGAN_BASIC_POINTS * mangans;
}

function getLimit(han) {
  return TABLE_LIMITS.findLast((limit) => han >= limit.minHan);
}

function isMangan(han, fu, kiriageMangan) {
  return getBasicPoints(han, fu, kiriageMangan) === MANGAN_BASIC_POINTS;
}

// Seven pairs is the only 25 fu hand, and it's worth 2 han before anything
// else: 2 han by ron, and 3 by tsumo with the han for a concealed self-draw.
// A 20 fu hand is pinfu won by tsumo, which is 2 han as well.
function canRon(han, fu) {
  return fu !== 20 && !(fu === 25 && han < 2);
}

function canTsumo(han, fu) {
  return !(fu === 20 && han < 2) && !(fu === 25 && han < 3);
}

function getRonMultiplier(isDealer) {
  return isDealer ? 6 : 4;
}

function getTsumoMultipliers(isDealer) {
  if (isDealer) {
    return [2];
  } else {
    return [1, 2];
  }
}

function getRonPoints(basicPoints, isDealer) {
  return roundUpToHundred(getRonMultiplier(isDealer) * basicPoints);
}

function getTsumoPoints(basicPoints, isDealer) {
  return getTsumoMultipliers(isDealer).map((multiplier) =>
    roundUpToHundred(multiplier * basicPoints),
  );
}

export {
  MANGAN_BASIC_POINTS,
  TABLE_FU,
  TABLE_HAN,
  TABLE_LIMITS,
  canRon,
  canTsumo,
  getBasicPoints,
  getLimit,
  getLimitBasicPoints,
  getRonMultiplier,
  getRonPoints,
  getTsumoMultipliers,
  getTsumoPoints,
  getUncappedBasicPoints,
  isMangan,
  roundUpToHundred,
  roundsUpToMangan,
};
