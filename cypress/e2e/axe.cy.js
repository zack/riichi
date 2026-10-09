import 'cypress-axe';
import en from '../../src/i18n/translations/en.json';
import ja from '../../src/i18n/translations/ja.json';
import ko from '../../src/i18n/translations/ko.json';
import zhCn from '../../src/i18n/translations/zh_cn.json';
import { switchToDarkMode } from '../support/options';
import { waitForAnimations } from '../support/wait';

const RON_HAND_PAGE = '/?hand=2011010101gm-00a9-0000-370cfc0a2';

const RON_HAND_TILE_COUNT = 19;

const TSUMO_HAND_PAGE = '/?hand=2011010100gm-00a9-0000-73f384767';

const RIICHI_HAND_PAGE = '/?hand=2011010102gm-00a9-0000-4c03f0d02';

const LIMIT_HAND_PAGE = '/?hand=2011010100gm-00b9-0000-fc334cbf2';

const PHONE_WIDTH = 360;
const PHONE_HEIGHT = 740;

const HOME_PAGE_LANGUAGES = [
  { code: 'ko', lang: 'ko', name: 'Korean', strings: ko },
  { code: 'zh_cn', lang: 'zh-cn', name: 'Chinese', strings: zhCn },
];

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

function getColorOver(color, behind) {
  const [red, green, blue, alpha = 1] = color.match(/[\d.]+/g).map(Number);
  const behindChannels = behind.match(/[\d.]+/g).map(Number);
  const channels = [red, green, blue].map(
    (channel, index) => channel * alpha + behindChannels[index] * (1 - alpha),
  );
  return `rgb(${channels.join(', ')})`;
}

function getShadowColor(shadow) {
  return shadow.match(/^rgba?\([^)]*\)/)[0];
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
    cy.get('.answer-key').should('exist');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should pass the questions of a checked answer', () => {
    cy.contains('[role="radio"]', /^2$/).click();
    if (exactFu) {
      cy.get('#fu').type('70');
    } else {
      cy.contains('[role="radio"]', /^70$/).click();
    }
    cy.get('#points').type('1');
    cy.get('button[type="submit"]').click();
    cy.contains('[role="tab"]', strings.quiz.yourAnswer).click();
    cy.get('.quiz-fields').should('exist');
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

  it('should pass the link that could not be copied', () => {
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').rejects(new Error());
      cy.stub(win.document, 'execCommand').returns(false);
    });
    cy.get(`button[aria-label="${strings.handLink.copy}"]`).click();
    cy.get('.hand-link-box textarea').should('be.focused');
    waitForAnimations();
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

  // axe doesn't check the contrast of a control's border. WCAG 1.4.11 wants
  // 3:1. Radix draws both of these borders as a box-shadow (the checkbox's is
  // on its ::before).
  it('should give an unticked checkbox and the language select an edge that can be seen', () => {
    cy.get(`button[aria-label="${strings.options.title}"]`).click();
    cy.get('[role="dialog"]').should('be.visible');
    waitForAnimations();
    cy.get('.options-dialog').then((dialog) => {
      const panel = getComputedStyle(dialog[0]).backgroundColor;
      const getEdgeContrast = (shadow) =>
        getContrast(getColorOver(getShadowColor(shadow), panel), panel);

      cy.get('[role="checkbox"][data-state="unchecked"]')
        .should('have.length.at.least', 1)
        .each((box) => {
          const edge = getComputedStyle(box[0], '::before').boxShadow;
          expect(getEdgeContrast(edge)).to.be.at.least(3);
        });
      cy.get('#language-select').should((select) => {
        const edge = getComputedStyle(select[0]).boxShadow;
        expect(getEdgeContrast(edge)).to.be.at.least(3);
      });
    });
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
      cy.get('.help-dialog .dialog-title').should('be.visible');
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
  cy.get('[role="dialog"]').should('not.exist');
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

  describe('Welcome', () => {
    const checkWelcome = () => {
      cy.get('.welcome-dialog').should('have.focus');
      waitForAnimations();
      cy.injectAxe();
      cy.checkA11y();
    };

    it('should pass the dialog of a first visit', () => {
      cy.visitAsNewPlayer(RON_HAND_PAGE);
      checkWelcome();
    });

    it('should pass the dialog of a first visit in dark mode', () => {
      cy.visitAsNewPlayer(RON_HAND_PAGE, {
        onBeforeLoad(win) {
          win.localStorage.setItem('mahjong-appearance', 'dark');
        },
      });
      cy.get('html').should('have.class', 'dark');
      checkWelcome();
    });
  });

  describe('Nothing to ask', () => {
    it('should pass the page with every question switched off', () => {
      cy.visit(RON_HAND_PAGE, {
        onBeforeLoad: (win) => {
          win.localStorage.setItem(
            'mahjong-options',
            JSON.stringify({
              testFu: false,
              testHan: false,
              testPoints: false,
            }),
          );
        },
      });
      cy.get('.quiz-form p').should('exist');
      cy.get('button[type="submit"]').should('not.exist');
      cy.injectAxe();
      cy.checkA11y();
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

  describe('Phone width', () => {
    beforeEach(() => {
      cy.viewport(PHONE_WIDTH, PHONE_HEIGHT);
      cy.visit(RON_HAND_PAGE);
    });

    checkPages();
  });

  describe('Korean and Chinese', () => {
    HOME_PAGE_LANGUAGES.forEach(({ code, lang, name, strings }) => {
      it(`should pass the homepage in ${name}`, () => {
        cy.visit(RON_HAND_PAGE, {
          onBeforeLoad: (win) => {
            win.localStorage.setItem('mahjong-language', code);
          },
        });
        cy.get('html').should('have.attr', 'lang', lang);
        cy.contains('button[type="submit"]', strings.buttons.justTellMe);
        cy.injectAxe();
        cy.checkA11y();
      });
    });
  });

  describe('The open language list', () => {
    it('should pass with the list open', () => {
      cy.visit(RON_HAND_PAGE);
      cy.get('button[aria-label="Options"]').click();
      cy.get('#language-select').click();
      cy.get('[role="listbox"]').should('be.visible');
      waitForAnimations();
      cy.injectAxe();
      // Radix portals the select's list to the end of the body, outside of
      // every landmark, which is all the region rule looks at
      cy.checkA11y(null, { rules: { region: { enabled: false } } });
    });
  });

  describe('Tiles whose drawings fail to load', () => {
    it('should pass with each name printed where its drawing would be', () => {
      cy.intercept('**/assets/tiles/**', { statusCode: 404 });
      cy.visit(RON_HAND_PAGE);
      cy.get('.tile.failed').should('have.length', RON_HAND_TILE_COUNT);
      cy.get('.tile.failed > .tile-text').should('exist');
      cy.injectAxe();
      cy.checkA11y();
    });
  });

  describe('Tiles whose drawings are slow to load', () => {
    const SLOW_DRAWING_DELAY = 15000;

    it('should pass with each name printed until its drawing arrives', () => {
      // cy.visit doesn't resolve until the hand's drawings have loaded, so we
      // delay the fancy tiles instead, which the hand switches to afterwards
      cy.intercept('**/assets/tiles/fancy/**', (request) => {
        request.on('response', (response) => {
          response.setDelay(SLOW_DRAWING_DELAY);
        });
      });
      cy.visit(RON_HAND_PAGE);
      cy.injectAxe();
      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'Fancy tiles').click();
      cy.contains('button', 'Close').click();
      cy.get('[role="dialog"]').should('not.exist');
      cy.get('.tile.slow').should('have.length', RON_HAND_TILE_COUNT);
      cy.get('.tile.slow > .tile-text').should('exist');
      cy.checkA11y();
      cy.get('.tile.slow').should('have.length', RON_HAND_TILE_COUNT);
    });
  });

  describe('Other hands', () => {
    it('should pass a tsumo with two payments to fill in', () => {
      cy.visit(TSUMO_HAND_PAGE);
      cy.get('#points').should('exist');
      cy.get('#pointsDealer').should('exist');
      cy.injectAxe();
      cy.checkA11y();
    });

    it('should pass a correct answer', () => {
      cy.visit(TSUMO_HAND_PAGE);
      cy.contains('[role="radio"]', /^4$/).click();
      cy.contains('[role="radio"]', /^30$/).click();
      cy.get('#points').type('2000');
      cy.get('#pointsDealer').type('3900');
      cy.get('button[type="submit"]').click();
      cy.contains('.badge', 'Correct: 1');
      cy.get('.answer-key').should('exist');
      cy.injectAxe();
      cy.checkA11y();
    });

    it('should pass a hand won on a riichi', () => {
      cy.visit(RIICHI_HAND_PAGE);
      cy.get('.riichi-stick').should('be.visible');
      cy.injectAxe();
      cy.checkA11y();
    });

    it('should pass fu switched off by a limit han', () => {
      cy.visit(LIMIT_HAND_PAGE);
      cy.contains('[role="radio"]', /^6$/).click();
      cy.get('#fu-note').should('exist');
      cy.injectAxe();
      cy.checkA11y();
    });

    it('should pass the checked answer of a limit hand', () => {
      cy.visit(LIMIT_HAND_PAGE);
      cy.contains('[role="radio"]', /^6$/).click();
      cy.get('#points').type('18000');
      cy.get('button[type="submit"]').click();
      cy.contains('.badge', 'Correct: 1');
      cy.get('.answer-key').should('exist');
      cy.injectAxe();
      cy.checkA11y();
    });
  });

  describe('A link to a hand that is not here', () => {
    beforeEach(() => {
      cy.visit('/?hand=not-a-hand');
      cy.get('.link-note').should('exist');
    });

    it('should pass in light mode', () => {
      cy.injectAxe();
      cy.checkA11y();
    });

    it('should pass in dark mode', () => {
      switchToDarkMode();
      cy.injectAxe();
      cy.checkA11y();
    });
  });

  describe('A hand that cannot be shown', () => {
    beforeEach(() => {
      cy.visit(RON_HAND_PAGE);
      cy.window().then((win) => {
        const normalize = win.String.prototype.normalize;

        win.String.prototype.normalize = function (...args) {
          if (String(this) !== '') {
            throw new Error('planted');
          }
          return normalize.apply(this, args);
        };
      });
      cy.get('#points').type('2');
      cy.get('.hand-error').should('be.visible');
    });

    it('should pass in light mode', () => {
      cy.injectAxe();
      cy.checkA11y();
    });

    it('should pass in dark mode', () => {
      switchToDarkMode();
      cy.injectAxe();
      cy.checkA11y();
    });

    it('should pass in high contrast', () => {
      turnOnHighContrast();
      cy.injectAxe();
      cy.checkA11y();
    });
  });
});
