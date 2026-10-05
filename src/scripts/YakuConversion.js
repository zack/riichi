const yakuList = [
  'Tsumo',
  'Riichi',
  'Ippatsu',
  'Chankan',
  'Rinshan',
  'Haitei',
  'Houtei',
  'Pinfu',
  'Tanyao',
  'Ippeiko',
  'Yakuhai',
  'Yakuhai',
  'Yakuhai',
  'Yakuhai',
  'Yakuhai',
  'Yakuhai',
  'Yakuhai',
  'Yakuhai',
  'Yakuhai',
  'Yakuhai',
  'Yakuhai',
  'Daburu Riichi',
  'Chiitoi',
  'Chanta',
  'Itsuu',
  'Sanshoku Doujun',
  'Sanshoku Doukou',
  'Sankantsu',
  'Toitoi',
  'Sanankou',
  'Shousangen',
  'Honrouto',
  'Ryanpeikou',
  'Junchan',
  'Honitsu',
  'Chinitsu',
  'Renhou',
  'Tenhou',
  'Chihou',
  'Daisangen',
  'Suuankou',
  'Suuankou',
  'Tsuiisou',
  'Ryuuiisou',
  'Chinrouto',
  'Chuuren poutou',
  'Chuuren poutou (Nine tile wait)',
  'Kokushi musou',
  'Kokushi musou (13 tile wait)',
  'Daisuushi',
  'Shousuushi',
  'Suukantsu',
  'Dora',
  'Uradora',
  'Akadora',
];

/**
 * @param {string} yakuId - The ID of the yaku
 * @param {function} t - Translation function (optional). If not provided, returns English name.
 * @returns {string} - The translated name of the yaku
 */
export function YakuIdToName(yakuId, t = null) {
  const ID = parseInt(yakuId);

  // If translation function is provided, use it
  if (t) {
    return t(`yaku.${ID}`, yakuList[ID]);
  }

  // Otherwise return the default English name
  return yakuList[ID];
}
