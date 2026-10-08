import { dropScrollbarRoom } from '../support/page';
import {
  waitForAnimations,
  waitForImages,
  waitForScrollToStop,
} from '../support/wait';

const RON_HAND = '2011010101gm-00a9-0000-370cfc0a2';

const RIICHI_HAND = '2011010107gm-00a9-0000-49ee978a2';

const PHONE_WIDTH = 412;
const NARROW_PHONE_WIDTH = 320;
const DESKTOP_WIDTH = 1280;

// A full page screenshot is stitched together from as many screens as it takes,
// so the viewport can be short. A dialog doesn't scroll with the page, so only
// what fits in the viewport gets captured. The window in cypress.config.js has
// to be taller than both, because a viewport taller than the window gets
// cropped.
const PAGE_HEIGHT = 600;
const DIALOG_HEIGHT = 1400;

const COMPARISON = {
  errorThreshold: 0.0005,
  pixelmatchOptions: { threshold: 0 },
};

const FULL_PAGE = { ...COMPARISON, capture: 'fullPage' };

const visit = (
  appearance,
  {
    contrast,
    hand = RON_HAND,
    height = PAGE_HEIGHT,
    options,
    width = PHONE_WIDTH,
  } = {},
) => {
  cy.viewport(width, height);
  cy.visit(`/?hand=${hand}`, {
    onBeforeLoad(win) {
      if (appearance === 'dark') {
        win.localStorage.setItem('mahjong-appearance', 'dark');
      }
      if (contrast) {
        win.localStorage.setItem('mahjong-contrast', contrast);
      }
      if (options) {
        win.localStorage.setItem('mahjong-options', JSON.stringify(options));
      }
    },
  });
  dropScrollbarRoom();
  cy.document().its('fonts.status').should('equal', 'loaded');
  cy.get('.hand .tile img').should('be.visible');
};

const pick = (choice) => {
  cy.contains('[role="radio"]', new RegExp(`^${choice}$`)).click();
};

const checkAnswer = () => {
  cy.contains('button', 'Check Answer').click();
  cy.get('.answer-key').should('exist');
  waitForScrollToStop();
};

const answerRonHand = () => {
  pick(2);
  pick(60);
  cy.get('#points').type('1000');
  checkAnswer();
};

const pageShouldMatch = (name) => {
  waitForImages();
  cy.compareSnapshot(name, FULL_PAGE);
};

const dialogShouldMatch = (name) => {
  cy.get('[role="dialog"]').should('be.visible');
  waitForAnimations();
  waitForImages();
  cy.get('[role="dialog"]').compareSnapshot(name, COMPARISON);
};

const checkStates = (appearance) => {
  describe('The page', () => {
    beforeEach(() => {
      visit(appearance);
    });

    it('should match the starting screen', () => {
      pageShouldMatch(`${appearance}-start`);
    });

    it('should match the answers once picked', () => {
      pick(2);
      pick(60);
      cy.get('#points').type('2000').blur();
      pageShouldMatch(`${appearance}-picked`);
    });

    it('should match an unfinished answer that was turned away', () => {
      pick(60);
      cy.get('button[type="submit"]').click();
      cy.get('.missing-note').should('have.length', 2);
      pageShouldMatch(`${appearance}-refused`);
    });

    it('should match a checked answer', () => {
      answerRonHand();
      pageShouldMatch(`${appearance}-checked`);
    });

    it('should match the questions of a checked answer', () => {
      answerRonHand();
      cy.contains('[role="tab"]', 'Your Answer').click().blur();
      cy.get('.quiz-fields').should('exist');
      pageShouldMatch(`${appearance}-your-answer`);
    });
  });

  [NARROW_PHONE_WIDTH, DESKTOP_WIDTH].forEach((width) => {
    describe(`The page at ${width}px`, () => {
      beforeEach(() => {
        visit(appearance, { width });
      });

      it('should match the starting screen', () => {
        pageShouldMatch(`${appearance}-${width}-start`);
      });

      it('should match a checked answer', () => {
        answerRonHand();
        pageShouldMatch(`${appearance}-${width}-checked`);
      });
    });
  });

  describe('A riichi tsumo with honba', () => {
    beforeEach(() => {
      visit(appearance, { hand: RIICHI_HAND, options: { testHonba: true } });
    });

    it('should match the starting screen', () => {
      pageShouldMatch(`${appearance}-riichi-start`);
    });

    it('should match a checked answer', () => {
      pick(6);
      cy.get('#points').type('3200');
      cy.get('#pointsDealer').type('6000');
      checkAnswer();
      pageShouldMatch(`${appearance}-riichi-checked`);
    });

    it('should match the bigger hand, with its sticks', () => {
      cy.viewport(PHONE_WIDTH, DIALOG_HEIGHT);
      cy.contains('button', 'Tap the tiles to see them bigger').click();
      dialogShouldMatch(`${appearance}-riichi-bigger-hand`);
    });
  });

  describe('Display options', () => {
    it('should match fancy tiles with their names', () => {
      visit(appearance, {
        hand: RIICHI_HAND,
        options: { fancyTiles: true, showTileNames: true },
      });
      pageShouldMatch(`${appearance}-fancy-start`);
    });

    it('should match a checked answer in high contrast', () => {
      visit(appearance, { contrast: 'high' });
      answerRonHand();
      pageShouldMatch(`${appearance}-contrast-checked`);
    });
  });

  describe('Dialogs', () => {
    beforeEach(() => {
      visit(appearance, { height: DIALOG_HEIGHT });
    });

    it('should match the options dialog', () => {
      cy.get('button[aria-label="Options"]').click();
      dialogShouldMatch(`${appearance}-options`);
    });

    it('should match the bigger hand', () => {
      cy.contains('button', 'Tap the tiles to see them bigger').click();
      dialogShouldMatch(`${appearance}-bigger-hand`);
    });

    it('should match the points table in the help', () => {
      cy.get('button[aria-label="Scoring Help"]').click();
      cy.contains('.help-tabs [role="tab"]', 'Table').click().blur();
      dialogShouldMatch(`${appearance}-points-table`);
    });
  });
};

describe('Visual Tests', () => {
  describe('Light mode', () => {
    checkStates('light');
  });

  describe('Dark mode', () => {
    checkStates('dark');
  });
});
