const WIKI = 'https://riichi.wiki/';

// These are the wiki's real page names. Shorter names like Toitoi and Honitsu
// work too, but only as redirects.
const YAKU_PAGES = {
  0: 'Menzenchin_tsumohou',
  1: 'Riichi',
  2: 'Ippatsu',
  3: 'Chankan',
  4: 'Rinshan_kaihou',
  5: 'Haitei_raoyue_and_houtei_raoyui',
  6: 'Haitei_raoyue_and_houtei_raoyui',
  7: 'Pinfu',
  8: 'Tanyao',
  9: 'Iipeikou',
  10: 'Yakuhai',
  11: 'Yakuhai',
  12: 'Yakuhai',
  13: 'Yakuhai',
  14: 'Yakuhai',
  15: 'Yakuhai',
  16: 'Yakuhai',
  17: 'Yakuhai',
  18: 'Yakuhai',
  19: 'Yakuhai',
  20: 'Yakuhai',
  21: 'Daburu_riichi',
  22: 'Chiitoitsu',
  23: 'Chanta',
  24: 'Ikki_tsuukan',
  25: 'Sanshoku_doujun',
  26: 'Sanshoku_doukou',
  27: 'Sankantsu',
  28: 'Toitoihou',
  29: 'Sanankou',
  30: 'Shousangen',
  31: 'Honroutou',
  32: 'Ryanpeikou',
  33: 'Junchantaiyaochuu',
  34: 'Honiisou',
  35: 'Chiniisou',
  36: 'Renhou',
  37: 'Tenhou_and_chiihou',
  38: 'Tenhou_and_chiihou',
  39: 'Daisangen',
  40: 'Suuankou',
  41: 'Suuankou',
  42: 'Tsuuiisou',
  43: 'Ryuuiisou',
  44: 'Chinroutou',
  45: 'Chuuren_poutou',
  46: 'Chuuren_poutou',
  47: 'Kokushi_musou',
  48: 'Kokushi_musou',
  49: 'Suushiihou',
  50: 'Suushiihou',
  51: 'Suukantsu',
  52: 'Dora',
  53: 'Dora#Uradora',
  54: 'Dora#Akadora',
};

const FU_PAGES = {
  base: 'Fu#Counting_fu',
  closed_kan: 'Fu#Tile_groups',
  closed_pon: 'Fu#Tile_groups',
  closed_terminal_kan: 'Fu#Tile_groups',
  closed_terminal_pon: 'Fu#Tile_groups',
  double_valued_pair: 'Fu#Yakuhai_pair',
  hand_without_fu: 'Fu#Special_cases',
  kanchan: 'Fu#Waits',
  open_kan: 'Fu#Tile_groups',
  open_pon: 'Fu#Tile_groups',
  open_terminal_kan: 'Fu#Tile_groups',
  open_terminal_pon: 'Fu#Tile_groups',
  pair_wait: 'Fu#Waits',
  penchan: 'Fu#Waits',
  rounding: 'Fu#Counting_fu',
  tsumo: 'Fu#Winning_condition',
  valued_pair: 'Fu#Yakuhai_pair',
};

function getWikiUrl(page, language) {
  if (page && language === 'en') {
    return WIKI + page;
  } else {
    return undefined;
  }
}

function getYakuWikiUrl(yakuId, language) {
  return getWikiUrl(YAKU_PAGES[yakuId], language);
}

function getFuWikiUrl(reason, language) {
  return getWikiUrl(FU_PAGES[reason], language);
}

export { FU_PAGES, YAKU_PAGES, getFuWikiUrl, getYakuWikiUrl };
