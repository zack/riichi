import 'cypress-axe';
import en from '../../src/i18n/translations/en.json';
import ja from '../../src/i18n/translations/ja.json';
import { switchToDarkMode } from '../support/options';
import { waitForAnimations } from '../support/wait';

const RON_HAND_PAGE = '/?hand=2011010101gm-00a9-0000-370cfc0a2';

const EVERY_OPTION = {
  exactFu: true,
  fancyTiles: true,
  ignoreFuOnLimit: true,
  kiriageMangan: true,
  showTileNames: true,
  testFu: true,
  testHan: true,
  testHonba: true,
  testPoints: true,
};

// axe skips the contrast check on text that's only a character or two long, and
// that's every tile name. So we work out their contrast here, the same way WCAG
// does.
function getLuminance(color) {
  const [red, green, blue] = color
    .match(/[\d.]+/g)
    .slice(0, 3)
    .map((channel) => {
      const value = Number(channel) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function getContrast(foreground, background) {
  const [lighter, darker] = [
    getLuminance(foreground),
    getLuminance(background),
  ].sort((first, second) => second - first);
  return (lighter + 0.05) / (darker + 0.05);
}

// Same as TABS in src/components/HelpPanel.jsx
const HELP_TABS = ['steps', 'yaku', 'table', 'site'];

const checkPages = ({ exactFu = false, strings = en } = {}) => {
  it('should pass the homepage', () => {
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should pass a checked answer', () => {
    cy.contains('[role="radio"]', /^2$/).click();
    if (exactFu) {
      cy.get('#fu').type('70');
    } else {
      cy.contains('[role="radio"]', /^70$/).click();
    }
    cy.get('#points').type('1');
    cy.get('button[type="submit"]').click();
    cy.get('.color-card.purple').should('exist');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should pass an unfinished answer that was turned away', () => {
    cy.contains('[role="radio"]', /^2$/).click();
    cy.get('button[type="submit"]').click();
    cy.get('.missing-note').should('have.length', 2);
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should pass the options dialog', () => {
    cy.get(`button[aria-label="${strings.options.title}"]`).click();
    cy.get('[role="dialog"]').should('be.visible');
    waitForAnimations();
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should pass the bigger hand', () => {
    cy.contains('button', strings.biggerHand.open).click();
    cy.get('[role="dialog"]').should('be.visible');
    waitForAnimations();
    cy.injectAxe();
    cy.checkA11y();
  });

  HELP_TABS.forEach((tab, index) => {
    it(`should pass the help dialog's ${tab} tab`, () => {
      cy.get(`button[aria-label="${strings.common.help}"]`).click();
      cy.get('.help-title').should('be.visible');
      cy.get('.help-tabs [role="tab"]').eq(index).click();
      cy.get(`.help-${tab}`).should('exist');
      waitForAnimations();
      cy.injectAxe();
      cy.checkA11y();
    });
  });
};

const turnOnHighContrast = () => {
  cy.get('button[aria-label="Options"]').click();
  cy.contains('label', 'High contrast').click();
  cy.contains('button', 'Close').click();
  cy.get('html').should('have.class', 'high-contrast');
};

describe('aXe Tests', () => {
  describe('Light mode', () => {
    beforeEach(() => {
      cy.visit(RON_HAND_PAGE);
    });

    checkPages();
  });

  describe('Dark mode', () => {
    beforeEach(() => {
      cy.visit(RON_HAND_PAGE);
      switchToDarkMode();
    });

    checkPages();
  });

  describe('High contrast', () => {
    beforeEach(() => {
      cy.visit(RON_HAND_PAGE);
      turnOnHighContrast();
    });

    checkPages();
  });

  describe('High contrast, dark mode', () => {
    beforeEach(() => {
      cy.visit(RON_HAND_PAGE);
      switchToDarkMode();
      turnOnHighContrast();
    });

    checkPages();
  });

  describe('Every option on', () => {
    beforeEach(() => {
      cy.visit(RON_HAND_PAGE, {
        onBeforeLoad: (win) => {
          win.localStorage.setItem(
            'mahjong-options',
            JSON.stringify(EVERY_OPTION),
          );
        },
      });
      cy.get('.hand-card.fancy-tiles.names-on-tiles').should('exist');
      cy.get('.honba-sticks').should('exist');
      cy.get('input#fu').should('exist');
    });

    checkPages({ exactFu: true });

    it('should give the names on the tiles enough contrast', () => {
      cy.get('.hand .tile-label:not(:empty)').should('have.length', 13);
      cy.get('.hand .tile-label:not(:empty)').each((label) => {
        const style = getComputedStyle(label[0]);
        expect(getContrast(style.color, style.backgroundColor)).to.be.at.least(
          4.5,
        );
      });
    });
  });

  describe('Japanese', () => {
    beforeEach(() => {
      cy.visit(RON_HAND_PAGE, {
        onBeforeLoad: (win) => {
          win.localStorage.setItem('mahjong-language', 'ja');
        },
      });
      cy.get('html').should('have.attr', 'lang', 'ja');
    });

    checkPages({ strings: ja });
  });
});
