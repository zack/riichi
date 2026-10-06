const YAKUHAI_WIKI_ID = 10;

const BLUE = 'h1';
const GRAY = 'gray';
const GREEN = 'h3';
const OLIVE = 'h4';
const ROSE = 'sanbaiman';
const TEAL = 'h2';

const HELP_YAKU = [
  {
    key: 'closed',
    tone: ROSE,
    yaku: [
      { closedOnly: true, han: 1, key: 'riichi', id: 1 },
      { closedOnly: true, han: 1, key: 'tsumo', id: 0 },
      {
        closedOnly: true,
        han: 1,
        key: 'pinfu',
        id: 7,
        tiles: '123s 456p 567m 22m 78p',
      },
      {
        closedOnly: true,
        han: 1,
        key: 'iipeikou',
        id: 9,
        tiles: '123p 123p',
      },
      {
        closedOnly: true,
        han: 2,
        key: 'chiitoitsu',
        id: 22,
        tiles: '22s 33p 88p 66m 99m 11h 66h',
      },
    ],
  },
  {
    key: 'value',
    tone: BLUE,
    yaku: [
      { han: 1, key: 'yakuhai', tiles: '777h', wikiId: YAKUHAI_WIKI_ID },
      {
        han: 2,
        key: 'shousangen',
        id: 30,
        nested: true,
        tiles: '666h 777h 55h',
      },
    ],
  },
  {
    key: 'flushes',
    tone: OLIVE,
    yaku: [
      {
        closedBonus: true,
        han: 2,
        key: 'honitsu',
        id: 34,
        tiles: '123s 444s 66h',
      },
      {
        closedBonus: true,
        han: 5,
        key: 'chinitsu',
        id: 35,
        nested: true,
        tiles: '123s 666s 99s',
      },
    ],
  },
  {
    key: 'runs',
    startsColumn: true,
    tone: TEAL,
    yaku: [
      { han: 1, key: 'tanyao', id: 8, tiles: '234s 666s 456p' },
      {
        closedBonus: true,
        han: 1,
        key: 'sanshokuDoujun',
        id: 25,
        tiles: '123s 123p 123m',
      },
      {
        closedBonus: true,
        han: 1,
        key: 'ikkitsuukan',
        id: 24,
        tiles: '123p 456p 789p',
      },
      {
        closedBonus: true,
        han: 1,
        key: 'chanta',
        id: 23,
        tiles: '123s 999p 11h',
      },
      {
        closedBonus: true,
        han: 2,
        key: 'junchan',
        id: 33,
        nested: true,
        tiles: '123s 789s 99m',
      },
      {
        han: 2,
        key: 'honroutou',
        id: 31,
        nested: true,
        tiles: '111s 999p 11h',
      },
    ],
  },
  {
    key: 'triplets',
    tone: GREEN,
    yaku: [
      { han: 2, key: 'toitoi', id: 28, tiles: '333s 777p 555m' },
      { han: 2, key: 'sanankou', id: 29 },
    ],
  },
  {
    key: 'dora',
    tone: GRAY,
    yaku: [
      {
        han: 1,
        key: 'dora',
        id: 52,
        tiles: ['9m>1m', '1h>2h>3h>4h>1h', '5h>6h>7h>5h'],
      },
      { han: 1, key: 'uradora', id: 53 },
      { han: 1, key: 'akadora', id: 54, tiles: '0s 0p 0m' },
    ],
  },
];

export { HELP_YAKU };
