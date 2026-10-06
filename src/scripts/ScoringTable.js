const TABLE_HAN = [1, 2, 3, 4];
const TABLE_FU = [20, 25, 30, 40, 50, 60, 70];

const MANGAN_BASIC_POINTS = 2000;

// 4 han 30 fu and 3 han 60 fu both come to this, and they're the only two hands
// that Kiriage Mangan rounds up
const KIRIAGE_BASIC_POINTS = 1920;

const TABLE_LIMITS = [
  { han: '5', id: 'mangan', mangans: 1 },
  { han: '6 - 7', id: 'haneman', mangans: 1.5 },
  { han: '8 - 10', id: 'baiman', mangans: 2 },
  { han: '11 - 12', id: 'sanbaiman', mangans: 3 },
  { han: '13+', id: 'yakuman', mangans: 4 },
];

const roundUpToHundred = (points) => Math.ceil(points / 100) * 100;

function getBasicPoints(han, fu, kiriageMangan) {
  const basicPoints = fu * 2 ** (han + 2);

  if (kiriageMangan && basicPoints === KIRIAGE_BASIC_POINTS) {
    return MANGAN_BASIC_POINTS;
  } else {
    return Math.min(basicPoints, MANGAN_BASIC_POINTS);
  }
}

function getLimitBasicPoints(mangans) {
  return MANGAN_BASIC_POINTS * mangans;
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

function getRonPoints(basicPoints, isDealer) {
  return roundUpToHundred((isDealer ? 6 : 4) * basicPoints);
}

function getTsumoPoints(basicPoints, isDealer) {
  if (isDealer) {
    return [roundUpToHundred(2 * basicPoints)];
  } else {
    return [roundUpToHundred(basicPoints), roundUpToHundred(2 * basicPoints)];
  }
}

export {
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
};
