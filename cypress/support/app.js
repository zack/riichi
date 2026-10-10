import { chooseTheme, switchToDarkMode } from './options';
import { dropScrollbarRoom, getPageWidth } from './page';

const RON_HAND = '2011010101gm-00a9-0000-370cfc0a2';

const RON_HAND_TILE_COUNT = 19;

// Same as CELEBRATION_INTERVAL in src/App.jsx
const CELEBRATION_INTERVAL = 10;

const TSUMO_HAND = '2011010100gm-00a9-0000-73f384767';

const DEALER_TSUMO_HAND = '2011010100gm-00a9-0000-58aad5ff4';

const TWO_URADORA_HAND = '2011010102gm-00a9-0000-1f9e90501';

const ADDED_KAN_HAND = '2011010101gm-00a9-0000-be1e94c96';

const KAN_BY_WIN_HAND = '2011010101gm-00a9-0000-e081ab8112';

const NO_CALLS_HAND = '2011010100gm-00a9-0000-3f2ec5bf2';
const FOUR_CALLS_HAND = '2011010109gm-00a9-0000-72a098154';
const LONG_SUIT_HAND = '2011010100gm-00a9-0000-3f2ec5bf5';

const RED_FIVE_HAND = '2011010100gm-00a9-0000-3f2ec5bf1';

const DORA_HAND = '2011010119gm-00a9-0000-35334fd91';

const CROWDED_INFO_HAND = '2011010102gm-00a9-0000-4c03f0d02';

const TWO_HONBA_HAND = '2011010107gm-00a9-0000-49ee978a2';
const EIGHT_HONBA_HAND = '2011010100gm-00a9-0000-73f3847613';

// sessionStorage keeps the answers and counters between visits in the same tab.
// delete them.
const visitHand = (handId) =>
  cy.visit(`/?hand=${handId}`, {
    onBeforeLoad(win) {
      win.sessionStorage.removeItem('mahjong-session');
    },
  });

const turnOnOptions = (...names) => {
  cy.get('button[aria-label="Options"]').click();
  names.forEach((name) => {
    cy.get('[role="dialog"]').contains('label', name).click();
  });
  cy.contains('button', 'Close').click();
};

const openHelp = (tab) => {
  cy.get('button[aria-label="Help"]').click();
  if (tab) {
    cy.contains('.help-tabs [role="tab"]', tab).click();
  }
};

const getInfoLabels = () =>
  cy
    .get('.info .info-label')
    .then((labels) =>
      [...labels].map((label) =>
        [...label.querySelectorAll('.info-label-line')]
          .map((line) => line.textContent)
          .join(' '),
      ),
    );

const LIMIT_HAND = '2011010100gm-00b9-0000-fc334cbf2';

const THREE_HONBA_HAND = '2011010100gm-00a9-0000-58aad5ff11';

const NO_URADORA_HAND = '2011010100gm-00a9-0000-58aad5ff12';

// New Hand picks its hand with Math.random. Stub it so the next press deals the
// first hand in the list, which is RED_FIVE_HAND.
const dealTheFirstHandNext = () =>
  cy.window().then((win) => {
    win.Math.random = () => 0;
  });

const typeInBox = (boxId, text) =>
  cy
    .get(`label[for="${boxId}"]`)
    .should('be.visible')
    .invoke('attr', 'for')
    .then((id) => cy.get(`#${id}`).type(text));

const pick = (group, choice) =>
  cy
    .get(`[aria-labelledby="${group}-label"]`)
    .contains('[role="radio"]', new RegExp(`^${choice}$`))
    .click();

const layOutAsOnAPhone = (width) => {
  dropScrollbarRoom();
  cy.document().should((doc) => {
    expect(getPageWidth(doc)).to.equal(width);
  });
};

const showYourAnswer = () => cy.contains('[role="tab"]', 'Your Answer').click();

const getHue = (color) => {
  const [red, green, blue] = color.match(/[\d.]+/g).map(Number);
  const strongest = Math.max(red, green, blue);
  const spread = strongest - Math.min(red, green, blue);

  let sixth;
  if (strongest === red) {
    sixth = ((green - blue) / spread + 6) % 6;
  } else if (strongest === green) {
    sixth = (blue - red) / spread + 2;
  } else {
    sixth = (red - green) / spread + 4;
  }

  return sixth * 60;
};

const isGreen = (color) => {
  const hue = getHue(color);
  return hue > 90 && hue < 180;
};

const isRed = (color) => {
  const hue = getHue(color);
  return hue < 30 || hue > 330;
};

const cardBorderMatchesTotals = (card, total) => {
  const borderMatches = () => {
    cy.get(total).then((totals) => {
      cy.get(card).should(
        'have.css',
        'border-top-color',
        getComputedStyle(totals[0]).color,
      );
    });
  };

  borderMatches();
  switchToDarkMode();
  borderMatches();
  turnOnOptions('High contrast');
  cy.get('html').should('have.class', 'high-contrast');
  borderMatches();
  chooseTheme('Light');
  cy.get('html').should('not.have.class', 'dark');
  borderMatches();
};

export {
  ADDED_KAN_HAND,
  CELEBRATION_INTERVAL,
  CROWDED_INFO_HAND,
  DEALER_TSUMO_HAND,
  DORA_HAND,
  EIGHT_HONBA_HAND,
  FOUR_CALLS_HAND,
  KAN_BY_WIN_HAND,
  LIMIT_HAND,
  LONG_SUIT_HAND,
  NO_CALLS_HAND,
  NO_URADORA_HAND,
  RED_FIVE_HAND,
  RON_HAND,
  RON_HAND_TILE_COUNT,
  THREE_HONBA_HAND,
  TSUMO_HAND,
  TWO_HONBA_HAND,
  TWO_URADORA_HAND,
  cardBorderMatchesTotals,
  dealTheFirstHandNext,
  getHue,
  getInfoLabels,
  isGreen,
  isRed,
  layOutAsOnAPhone,
  openHelp,
  pick,
  showYourAnswer,
  turnOnOptions,
  typeInBox,
  visitHand,
};
