import en from '../../src/i18n/translations/en.json';
import { FU_PAGES, YAKU_PAGES } from '../../src/scripts/WikiLinks';
import { chooseTheme, switchToDarkMode } from '../support/options';
import { dropScrollbarRoom, getPageWidth } from '../support/page';

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

const DORA_HAND = '2011010119gm-00a9-0000-35334fd91';

const CROWDED_INFO_HAND = '2011010102gm-00a9-0000-4c03f0d02';

const TWO_HONBA_HAND = '2011010107gm-00a9-0000-49ee978a2';
const EIGHT_HONBA_HAND = '2011010100gm-00a9-0000-73f3847613';

const visitHand = (handId) => cy.visit(`/?hand=${handId}`);

const turnOnOptions = (...names) => {
  cy.get('button[aria-label="Options"]').click();
  names.forEach((name) => {
    cy.contains('label', name).click();
  });
  cy.contains('button', 'Close').click();
};

const openHelp = (tab) => {
  cy.get('button[aria-label="Scoring Help"]').click();
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

const cardBorderMatchesVerdict = (card, verdict) => {
  const borderMatches = () => {
    cy.get(`${verdict} .verdict-label`).then((label) => {
      cy.get(card).should(
        'have.css',
        'border-top-color',
        getComputedStyle(label[0]).color,
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

describe('Riichi Scoring Trainer E2E Tests', () => {
  it('should render the app correctly', () => {
    visitHand(RON_HAND);
    cy.get('h1').contains('Riichi Scoring Trainer');
    cy.get('.hand .tile').should('have.length', 15);
    cy.get('.win-type').should('contain', 'Ron!');
  });

  describe('Riichi', () => {
    it('should show a riichi stick for a hand won on a riichi', () => {
      visitHand(TSUMO_HAND);
      cy.get('.riichi').should('contain', 'Riichi!');
      cy.get('.riichi-stick').should('be.visible');
    });

    it('should not show one otherwise', () => {
      visitHand(RON_HAND);
      cy.get('.info').should('exist');
      cy.get('.riichi').should('not.exist');
    });
  });

  describe('Honba', () => {
    it('should show one stick per honba, and say how many', () => {
      visitHand(TWO_HONBA_HAND);
      cy.get('.honba-sticks').should('not.exist');

      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'Honba sticks').click();
      cy.contains('button', 'Close').click();

      cy.get('.honba-sticks').should('have.attr', 'aria-label', '2');
      cy.get('.honba-sticks rect').should('have.length', 2);
      cy.get('.honba .tile-label').should('not.exist');
    });

    it('should write the count under a pile of more than three', () => {
      visitHand(EIGHT_HONBA_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'Honba sticks').click();
      cy.contains('button', 'Close').click();

      cy.get('.honba-sticks rect').should('have.length', 8);
      cy.get('.honba .tile-label').should('have.text', '(8)');
    });

    it('should write the count where a name goes when names are on', () => {
      visitHand(EIGHT_HONBA_HAND);
      turnOnOptions('Honba sticks', 'Names on tiles');

      cy.get('.honba .tile-label').should('have.text', '(8)');
      cy.get('.honba .tile-label').should('not.have.class', 'floating');

      visitHand(TWO_HONBA_HAND);
      cy.get('.honba .tile-label').should('have.text', '');
      cy.get('.honba .tile-label').should('not.have.class', 'floating');
    });

    it('should move the hand down when the count lands on Tsumo', () => {
      cy.viewport(360, 740);
      visitHand('2011010120gm-00a9-0000-a64bc7d46');
      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'Honba sticks').click();
      cy.contains('button', 'Close').click();

      cy.get('.hand-card.count-crowded').should('exist');
      cy.get('.honba .tile-label').then((count) => {
        cy.get('.win-type').should((winType) => {
          expect(count[0].getBoundingClientRect().bottom).to.be.at.most(
            winType[0].getBoundingClientRect().top,
          );
        });
      });
    });

    it('should show nothing when there are none', () => {
      visitHand(TSUMO_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'Honba sticks').click();
      cy.contains('button', 'Close').click();

      cy.get('.info').should('contain', 'Seat');
      cy.get('.info').should('not.contain', 'Honba');
    });
  });

  describe('Row above the hand', () => {
    const shouldStayInTheCard = () => {
      cy.get('.info').should((info) => {
        const right = info[0].getBoundingClientRect().right;
        [...info[0].children].forEach((child) => {
          expect(child.getBoundingClientRect().right).to.be.at.most(
            right + 0.5,
          );
        });
      });
      cy.document().should((doc) => {
        expect(doc.documentElement.scrollWidth).to.be.at.most(
          getPageWidth(doc),
        );
      });
    };

    it('should shrink its tiles to fit a crowded row on a phone', () => {
      cy.viewport(360, 740);
      visitHand(CROWDED_INFO_HAND);
      turnOnOptions('Honba sticks');

      shouldStayInTheCard();
      cy.get('.info').should('not.have.attr', 'data-wrapped');
      cy.get('.info .tile')
        .first()
        .should((tile) => {
          expect(tile[0].getBoundingClientRect().width).to.be.below(27);
        });
    });

    it('should move the indicators to a line of their own when that is not enough', () => {
      cy.viewport(320, 740);
      visitHand(CROWDED_INFO_HAND);
      turnOnOptions('Honba sticks');

      shouldStayInTheCard();
      cy.get('.info').should('have.attr', 'data-wrapped');
    });

    it('should give the tiles their full size back when there is room again', () => {
      cy.viewport(360, 740);
      visitHand(CROWDED_INFO_HAND);
      turnOnOptions('Honba sticks');
      cy.get('.info .tile')
        .first()
        .should((tile) => {
          expect(tile[0].getBoundingClientRect().width).to.be.below(27);
        });

      cy.viewport(1024, 740);
      cy.get('.info .tile')
        .first()
        .should((tile) => {
          expect(tile[0].getBoundingClientRect().width).to.equal(27);
        });
    });
  });

  describe('Indicators', () => {
    it('should say indicator for one and indicators for more', () => {
      visitHand(TSUMO_HAND);
      getInfoLabels().should('include', 'Dora indicator');
      getInfoLabels().should('include', 'Uradora indicator');
      cy.get('.info-group-end .info-item')
        .eq(1)
        .find('.tile')
        .should('have.length', 1);

      visitHand(TWO_URADORA_HAND);
      getInfoLabels().should('include', 'Dora indicators');
      getInfoLabels().should('include', 'Uradora indicators');
      cy.get('.info-group-end .info-item')
        .eq(1)
        .find('.tile')
        .should('have.length', 2);
    });

    it('should leave the uradora out when there are none', () => {
      visitHand(RON_HAND);
      getInfoLabels().then((labels) => {
        expect(labels.join(' ')).not.to.contain('Uradora');
      });
      cy.get('.info-group-end .info-item').should('have.length', 1);
    });
  });

  describe('Tiles', () => {
    const tilesShouldBeVisible = () => {
      cy.get('.tile img').should('have.length', RON_HAND_TILE_COUNT);
      cy.get('.tile img').each((tile) => {
        cy.wrap(tile).should('be.visible');
        cy.wrap(tile).should((img) => {
          expect(img[0].naturalWidth).to.be.greaterThan(0);
        });
      });
    };

    it('should show every tile in light mode', () => {
      visitHand(RON_HAND);
      tilesShouldBeVisible();
    });

    it('should show every tile in dark mode', () => {
      visitHand(RON_HAND);
      switchToDarkMode();
      tilesShouldBeVisible();
    });

    it('should pile the fourth tile of an added kan on the called one', () => {
      visitHand(ADDED_KAN_HAND);
      const kan = '.hand [role="group"][aria-label="Meld 3"]';

      cy.get(`${kan} .tile-slot`).should((slots) => {
        const sizes = [...slots].map(
          (slot) => slot.querySelectorAll('.tile').length,
        );
        expect(sizes).to.eql([1, 1, 2]);
      });
      cy.get(`${kan} .tile-slot`)
        .last()
        .find('.tile')
        .should((tiles) => {
          const [bottom, top] = [...tiles].map((tile) =>
            tile.getBoundingClientRect(),
          );
          [...tiles].forEach((tile) => {
            expect(tile).to.have.class('called');
            expect(tile.querySelector('img').alt).to.equal('8 man (called)');
          });
          expect(top.left).to.be.closeTo(bottom.left, 0.5);
          expect(top.bottom).to.be.at.most(bottom.top + 0.5);
        });
    });

    it('should name both tiles of the pile when the names are on the tiles', () => {
      cy.viewport(360, 740);
      visitHand(ADDED_KAN_HAND);
      turnOnOptions('Names on tiles');
      cy.get('.hand-card.names-on-tiles').should('exist');

      cy.get('.hand .tile-slot.pile .tile-cell').should((cells) => {
        expect(cells).to.have.length(2);
        [...cells].forEach((cell) => {
          const tile = cell.querySelector('.tile').getBoundingClientRect();
          const tab = cell.querySelector('.tile-label').getBoundingClientRect();
          expect(cell.querySelector('.tile-label').textContent).to.equal('8');
          expect(tab.height).to.be.greaterThan(0);
          expect(tab.top).to.be.at.least(tile.top);
          expect(tab.bottom).to.be.at.most(tile.bottom);
        });
      });

      cy.document().then((doc) => {
        const style = doc.createElement('style');
        style.textContent = '.tile-label { font-size: 24px !important; }';
        doc.head.append(style);
      });
      cy.get('.hand-card').should('not.have.class', 'names-on-tiles');
      cy.get('.hand .tile-slot.pile .tile-label').should((labels) => {
        expect(getComputedStyle(labels[0]).display).not.to.equal('none');
        expect(getComputedStyle(labels[1]).display).to.equal('none');
      });
    });

    [360, 1280].forEach((width) => {
      it(`should keep the hand card one height whatever the hand at ${width}px`, () => {
        const heights = [];
        cy.viewport(width, 1400);

        [
          NO_CALLS_HAND,
          FOUR_CALLS_HAND,
          ADDED_KAN_HAND,
          KAN_BY_WIN_HAND,
        ].forEach((handId) => {
          visitHand(handId);
          cy.get('.hand .tile img').should('be.visible');
          cy.document().its('fonts.status').should('equal', 'loaded');
          layOutAsOnAPhone(width);
          cy.get('.hand-card').then((card) => {
            heights.push(card[0].getBoundingClientRect().height);
          });
        });

        cy.then(() => {
          expect(heights).to.have.length(4);
          heights.forEach((height) => {
            expect(height).to.be.closeTo(heights[0], 0.5);
          });
        });
      });
    });

    it('should show the tiles in the help page', () => {
      visitHand(RON_HAND);
      openHelp('Yaku');
      cy.get('.help-content .tile img').should('have.length.at.least', 100);
      // These are far down a scrolling dialog, where Cypress' idea of visible
      // is flaky. Just check that each one loaded and isn't hidden.
      cy.get('.help-content .tile img').each((tile) => {
        cy.wrap(tile).should((img) => {
          expect(img[0].naturalWidth).to.be.greaterThan(0);
          expect(getComputedStyle(img[0]).display).not.to.equal('none');
        });
      });
    });
  });

  describe('Hand number', () => {
    it('should stay one width until the number has three digits', () => {
      visitHand(RON_HAND);
      cy.get('.hand-count').should('contain.text', '#1');
      cy.get('.hand-count').then((badge) => {
        const firstWidth = badge[0].getBoundingClientRect().width;

        Cypress._.times(9, () => {
          cy.contains('button', 'New Hand').click();
        });
        cy.get('.hand-count > span').first().should('contain.text', '#10');
        cy.get('.hand-count').should((later) => {
          expect(later[0].getBoundingClientRect().width).to.equal(firstWidth);
        });
      });
      cy.get('.hand-number-sizer').should('have.attr', 'aria-hidden', 'true');
    });
    it('should fit on one line with the counts on the narrowest phones', () => {
      cy.viewport(320, 1400);
      visitHand(RON_HAND);
      cy.document().its('fonts.status').should('equal', 'loaded');
      layOutAsOnAPhone(320);
      cy.get('.hand-count').should((badge) => {
        const count = badge[0].ownerDocument.querySelector('.badge.correct');
        expect(badge[0].getBoundingClientRect().top).to.equal(
          count.getBoundingClientRect().top,
        );
      });
    });
  });

  describe('Wiki links', () => {
    const reveal = () => cy.contains('button', 'Just tell me').click();

    it('should link each han and fu line to its page on the wiki', () => {
      visitHand(RON_HAND);
      reveal();

      cy.get('.color-card.purple .wiki-link').should((links) => {
        const pages = [...links].map((link) => [
          link.firstChild.textContent,
          link.getAttribute('href'),
        ]);
        expect(pages).to.eql([
          ['Round Wind', 'https://riichi.wiki/Yakuhai'],
          ['Closed Terminal Kan', 'https://riichi.wiki/Fu#Tile_groups'],
          ['Base', 'https://riichi.wiki/Fu#Counting_fu'],
          ['Open Terminal Pon', 'https://riichi.wiki/Fu#Tile_groups'],
          ['Open Pon', 'https://riichi.wiki/Fu#Tile_groups'],
          ['Rounding', 'https://riichi.wiki/Fu#Counting_fu'],
        ]);
      });
      cy.get('.color-card.purple .wiki-link').each((link) => {
        cy.wrap(link).should('have.attr', 'target', '_blank');
        cy.wrap(link).should('have.attr', 'rel', 'noopener noreferrer');
        cy.wrap(link).should('contain.text', '(opens the wiki in a new tab)');
      });
      cy.get('.color-card.purple h2 + p').should(
        'have.text',
        'Links open in a new tab',
      );
      cy.get('.color-card.purple .breakdown-label')
        .first()
        .should('have.text', 'Round Wind (opens the wiki in a new tab):');
    });

    it('should link dora and its two special kinds to the dora page', () => {
      visitHand(DORA_HAND);
      reveal();
      cy.contains('.wiki-link', 'Riichi').should(
        'have.attr',
        'href',
        'https://riichi.wiki/Riichi',
      );
      cy.contains('.wiki-link', 'Tsumo').should(
        'have.attr',
        'href',
        'https://riichi.wiki/Menzenchin_tsumohou',
      );
      cy.contains('.wiki-link', /^Dora/).should(
        'have.attr',
        'href',
        'https://riichi.wiki/Dora',
      );
      cy.contains('.wiki-link', 'Uradora').should(
        'have.attr',
        'href',
        'https://riichi.wiki/Dora#Uradora',
      );
      cy.contains('.wiki-link', 'Akadora').should(
        'have.attr',
        'href',
        'https://riichi.wiki/Dora#Akadora',
      );
    });

    it('should keep the links far enough apart for a finger', () => {
      cy.viewport(360, 740);
      visitHand(DORA_HAND);
      reveal();
      cy.get('.color-card.purple .breakdown.linked')
        .first()
        .find('.wiki-link')
        .should((links) => {
          const tops = [...links].map(
            (link) => link.getBoundingClientRect().top,
          );
          expect(tops).to.have.length.greaterThan(3);
          tops.slice(1).forEach((top, index) => {
            expect(top - tops[index]).to.be.at.least(24);
          });
        });
    });

    it('should have a wiki page for every yaku and every kind of fu', () => {
      cy.wrap(Object.keys(en.yaku)).each((yakuId) => {
        expect(YAKU_PAGES[yakuId], `yaku ${yakuId}`).to.be.a('string');
      });
      cy.wrap(Object.keys(en.fuDetails)).each((reason) => {
        expect(FU_PAGES[reason], reason).to.match(/^Fu#/);
      });
    });

    it('should not warn about links when no line has one', () => {
      visitHand(RON_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', /^Han$/).click();
      cy.contains('label', /^Fu$/).click();
      cy.contains('button', 'Close').click();
      reveal();
      cy.get('.color-card.purple .breakdown').should('exist');
      cy.get('.wiki-link').should('not.exist');
      cy.get('.color-card.purple h2 + p').should('not.exist');
    });

    it('should leave the names as plain text in another language', () => {
      cy.visit(`/?hand=${RON_HAND}`, {
        onBeforeLoad(win) {
          win.localStorage.setItem('mahjong-language', 'ja');
        },
      });
      cy.get('html').should('have.attr', 'lang', 'ja');
      cy.get('button[type="submit"]').click();
      cy.get('.color-card.purple .breakdown-label').should(
        'have.length.greaterThan',
        3,
      );
      cy.get('.wiki-link').should('not.exist');
      cy.get('.breakdown.linked').should('not.exist');
      cy.get('.color-card.purple h2 + p').should('not.exist');
    });
  });

  describe('Checking answers', () => {
    it('should mark a right answer as correct', () => {
      visitHand(RON_HAND);
      pick('han', '1');
      pick('fu', '60');
      cy.get('#points').type('2000');
      cy.contains('button', 'Check Answer').click();

      cy.get('.color-card.green').should('exist');
      cy.get('.verdict.correct .verdict-label').should('have.text', 'Correct!');
      cy.contains('button', 'Check Answer').should('not.exist');
      cy.contains('.badge', 'Correct: 1');
      cy.contains('.badge', 'Wrong: 0');
      cy.contains('.badge', 'Rate: 100%');
      cy.get('.color-card.purple').should('contain', 'Answer');
      cardBorderMatchesVerdict('.color-card.green', '.verdict.correct');
    });

    it('should mark a wrong answer as wrong and show the right one', () => {
      visitHand(RON_HAND);
      pick('han', '2');
      pick('fu', '60');
      cy.get('#points').type('2000');
      cy.contains('button', 'Check Answer').click();

      cy.get('.color-card.red').should('exist');
      cy.get('.verdict.wrong .verdict-label').should('have.text', 'Incorrect');
      cy.contains('button', 'Check Answer').should('not.exist');
      cy.contains('.badge', 'Correct: 0');
      cy.contains('.badge', 'Wrong: 1');
      cy.get('[role="radio"].wrong').should('have.length', 1);
      cy.get('[role="radio"].wrong').should('contain', '2');
      cardBorderMatchesVerdict('.color-card.red', '.verdict.wrong');
      cy.get('[role="radio"].wrong .visually-hidden').should(
        'have.text',
        'You picked',
      );
      cy.get('[role="radio"] .visually-hidden').should('have.length', 1);
      cy.get('[role="radio"].correct').should('have.length', 2);
    });

    it('should mark wrong points as wrong', () => {
      visitHand(RON_HAND);
      pick('han', '1');
      pick('fu', '60');
      cy.get('#points').type('1000');
      cy.contains('button', 'Check Answer').click();

      cy.contains('.badge', 'Wrong: 1');
      cy.get('.number-input-cell.wrong #points').should('have.value', '1000');
      cy.get('.number-input-cell.wrong .box-mark').should('have.text', '✗');
      cy.get('#points-verdict').should('have.text', 'Wrong.');
      cy.get('#points-answer').should('have.text', 'Answer: 2000 ✓');
      cy.get('#points').should(
        'have.attr',
        'aria-describedby',
        'points-verdict points-answer',
      );
    });

    it('should mark right points in their box, with nothing beside it', () => {
      visitHand(RON_HAND);
      pick('han', '2');
      pick('fu', '60');
      cy.get('#points').type('2000');
      cy.contains('button', 'Check Answer').click();

      cy.contains('.badge', 'Wrong: 1');
      cy.get('.number-input-cell.correct #points').should('exist');
      cy.get('.number-input-cell.correct .box-mark').should('have.text', '✓');
      cy.get('#points-verdict').should('have.text', 'Correct.');
      cy.get('#points-answer').should('be.empty');
      cy.get('#points').should(
        'have.attr',
        'aria-describedby',
        'points-verdict',
      );
    });

    it("should mark each of a tsumo's two payments on its own", () => {
      visitHand(TSUMO_HAND);
      pick('han', '4');
      pick('fu', '30');
      cy.get('#points').type('2000');
      cy.get('#pointsDealer').type('2000');
      cy.contains('button', 'Check Answer').click();

      cy.get('.number-input-cell.correct #points').should('exist');
      cy.get('.number-input-cell.wrong #pointsDealer').should('exist');
      cy.get('#points-answer').should('be.empty');
      cy.get('#pointsDealer-answer').should('have.text', 'Answer: 3900 ✓');
    });

    it('should not move anything when the boxes are marked', () => {
      visitHand(TSUMO_HAND);
      pick('han', '4');
      pick('fu', '30');
      cy.get('#points').type('2000');
      cy.get('#pointsDealer').type('2000');
      cy.get('.quiz-fields').then((fields) => {
        const before = fields[0].getBoundingClientRect().height;
        cy.contains('button', 'Check Answer').click();
        cy.get('.number-input-cell.wrong').should('exist');
        cy.get('.quiz-fields').should((checkedFields) => {
          expect(checkedFields[0].getBoundingClientRect().height).to.equal(
            before,
          );
        });
      });
    });

    it('should ask for both payments on a non-dealer tsumo', () => {
      visitHand(TSUMO_HAND);
      cy.get('.win-type').should('contain', 'Tsumo!');
      pick('han', '4');
      pick('fu', '30');
      cy.get('#points').type('2000');
      cy.get('#pointsDealer').type('3900');
      cy.contains('button', 'Check Answer').click();

      cy.contains('.badge', 'Correct: 1');
    });

    it('should ask a dealer tsumo for what each player pays', () => {
      visitHand(DEALER_TSUMO_HAND);
      cy.get('label[for="points"]').should('have.text', 'Points (from each)');
      cy.get('#pointsDealer').should('not.exist');
      pick('han', '1');
      pick('fu', '30');
      cy.get('#points').type('500');
      cy.contains('button', 'Check Answer').click();

      cy.contains('.badge', 'Correct: 1');
    });

    it('should lock the answers once they are checked', () => {
      visitHand(RON_HAND);
      pick('han', '1');
      pick('fu', '60');
      cy.get('#points').type('2000');
      cy.contains('button', 'Check Answer').click();

      cy.get('[role="radio"]').should('not.be.disabled');
      cy.get('[role="radiogroup"]').should(
        'have.attr',
        'aria-readonly',
        'true',
      );
      pick('han', '2');
      cy.get('[aria-labelledby="han-label"] [data-state="checked"]').should(
        'have.text',
        '1✓',
      );
      cy.get('[aria-labelledby="han-label"] [data-state="checked"]').focus();
      cy.focused().type('{rightArrow}');
      cy.focused().should('contain', '2');
      cy.get('[aria-labelledby="han-label"] [data-state="checked"]').should(
        'contain',
        '1',
      );
      cy.get('#points').should('have.attr', 'readonly');
      cy.get('#points').should('not.be.disabled');
      cy.get('button[type="submit"]').should('not.exist');
    });

    it('should not grade the hand again on enter in a checked box', () => {
      visitHand(RON_HAND);
      pick('han', '2');
      pick('fu', '60');
      cy.get('#points').type('2000{enter}');
      cy.contains('.badge', 'Wrong: 1');

      cy.window().then(
        (win) =>
          new Cypress.Promise((resolve) => {
            const form = win.document.querySelector('.quiz-form');
            form.requestSubmit();
            form.requestSubmit();
            win.requestAnimationFrame(() => win.requestAnimationFrame(resolve));
          }),
      );
      cy.contains('.badge', 'Wrong: 1');
    });
  });

  describe('Check and New Hand buttons', () => {
    const getActionBoxes = () =>
      cy.get('.quiz-actions').then((actions) =>
        [...actions[0].querySelectorAll(':scope > :not([aria-hidden])')].map(
          (action) => {
            const box = action.getBoundingClientRect();
            return `${box.left} ${box.width}`;
          },
        ),
      );

    const visitIn = (language, width) => {
      cy.visit(`/?hand=${RON_HAND}`, {
        onBeforeLoad(win) {
          win.localStorage.setItem('mahjong-language', language);
        },
      });
      cy.document().its('fonts.status').should('equal', 'loaded');
      layOutAsOnAPhone(width);
    };

    [320, 1280].forEach((width) => {
      it(`should stay one size and in one place at ${width}px`, () => {
        cy.viewport(width, 2400);
        const seen = [];
        const look = () => {
          getActionBoxes().then((boxes) => {
            seen.push(boxes);
          });
        };

        ['en', 'ja', 'ko', 'zh_cn'].forEach((language) => {
          visitIn(language, width);
          look();
          pick('han', '2');
          look();
          cy.get('button[type="submit"]').click();
          cy.get('.missing-note').should('have.length', 2);
          look();
          pick('fu', '60');
          cy.get('#points').type('2000');
          cy.get('button[type="submit"]').click();
          cy.get('.verdict.wrong').should('exist');
          look();

          visitIn(language, width);
          pick('han', '1');
          pick('fu', '60');
          cy.get('#points').type('2000');
          cy.get('button[type="submit"]').click();
          cy.get('.verdict.correct').should('exist');
          look();

          visitIn(language, width);
          cy.get('button[type="submit"]').click();
          cy.get('.verdict.revealed').should('exist');
          look();
        });

        cy.then(() => {
          expect(seen).to.have.length(24);
          seen.forEach((boxes) => {
            expect(boxes).to.deep.equal(seen[0]);
          });
          const widths = seen[0].map((box) => box.split(' ')[1]);
          expect(widths[0]).to.equal(widths[1]);
          cy.document().should((doc) => {
            expect(doc.documentElement.scrollWidth).to.equal(width);
          });
        });
      });
    });

    it('should not move sideways when the answer makes the page scroll', () => {
      cy.viewport(1280, 900);
      visitHand(RON_HAND);
      cy.document().its('fonts.status').should('equal', 'loaded');
      cy.document().should((doc) => {
        expect(doc.documentElement.scrollHeight).to.equal(900);
      });
      getActionBoxes().then((before) => {
        cy.get('button[type="submit"]').click();
        cy.get('.color-card.purple').should('exist');
        cy.document().should((doc) => {
          expect(doc.documentElement.scrollHeight).to.be.above(900);
        });
        getActionBoxes().should('deep.equal', before);
      });
    });

    it('should not move sideways while a dialog is open', () => {
      [900, 600].forEach((height) => {
        cy.viewport(1280, height);
        visitHand(RON_HAND);
        cy.document().its('fonts.status').should('equal', 'loaded');
        getActionBoxes().then((before) => {
          cy.get('button[aria-label="Options"]').click();
          cy.get('[role="dialog"]').should('be.visible');
          getActionBoxes().should('deep.equal', before);
          cy.contains('button', 'Close').click();
          cy.get('[role="dialog"]').should('not.exist');
          getActionBoxes().should('deep.equal', before);
        });
      });
    });
  });

  describe('Celebrating', () => {
    it('should light up the counter on every tenth right answer only', () => {
      const FIRST_HAND = '2011010100gm-00a9-0000-3f2ec5bf1';

      const rigTheWindow = () =>
        cy.window().then((win) => {
          const matchMedia = win.matchMedia.bind(win);
          win.Math.random = () => 0;
          win.matchMedia = (query) =>
            query.includes('prefers-reduced-motion')
              ? { matches: true }
              : matchMedia(query);
        });

      const answerCorrectly = () => {
        pick('han', '2');
        pick('fu', '30');
        cy.get('#points').type('500');
        cy.get('#pointsDealer').type('1000');
        cy.get('button[type="submit"]').click();
        cy.get('.verdict.correct').should('exist');
      };

      visitHand(FIRST_HAND);
      rigTheWindow();

      for (let count = 1; count < CELEBRATION_INTERVAL; count++) {
        answerCorrectly();
        cy.contains('.badge', `Correct: ${count}`);
        cy.get('.badge.correct.celebrating').should('not.exist');
        cy.contains('button', 'New Hand').click();
      }

      answerCorrectly();
      cy.contains('.badge', `Correct: ${CELEBRATION_INTERVAL}`);
      cy.get('.badge.correct.celebrating').should('exist');

      cy.contains('button', 'New Hand').click();
      answerCorrectly();
      cy.contains('.badge', `Correct: ${CELEBRATION_INTERVAL + 1}`).then(
        (badge) => {
          expect(badge).not.to.have.class('celebrating');
        },
      );
    });
  });

  describe('Skipping questions', () => {
    it('should reveal the answers without scoring when nothing is answered', () => {
      visitHand(RON_HAND);
      cy.contains('button', 'Just tell me').click();
      cy.get('button[type="submit"]').should('not.exist');
      cy.get('.verdict.revealed .verdict-label').should(
        'have.text',
        'Just tell me',
      );

      cy.contains('.badge', 'Correct: 0');
      cy.contains('.badge', 'Wrong: 0');
      cy.get('[role="radio"].correct').should('have.length', 2);
      cy.get('.number-input-cell.correct, .number-input-cell.wrong').should(
        'not.exist',
      );
      cy.get('.box-mark').should('not.exist');
      cy.get('#points-answer').should('have.text', 'Answer: 2000 ✓');
      cy.get('#points').should(
        'have.attr',
        'aria-describedby',
        'points-answer',
      );
      cy.get('.color-card.purple').should('exist');
    });

    it('should not reveal anything once a question is answered', () => {
      visitHand(RON_HAND);
      pick('han', '1');
      cy.get('button[type="submit"]').should('have.text', 'Check Answer');
      cy.get('button[type="submit"]').click();

      cy.get('.missing-note').should('have.length', 2);
      cy.get('.verdict').should('not.exist');
      cy.get('[role="radio"].correct').should('not.exist');
      cy.get('.real-answer').should('have.text', '');
      cy.get('.color-card.purple').should('not.exist');
      cy.contains('.badge', 'Correct: 0');
      cy.contains('.badge', 'Wrong: 0');
    });
  });

  describe('Unfinished answers', () => {
    const check = () => cy.get('button[type="submit"]').click();

    const noteIsGone = (id) =>
      cy.document().then((doc) => {
        expect(doc.getElementById(`${id}-missing`)).to.equal(null);
      });

    it('should mark each question left out, and only those', () => {
      visitHand(RON_HAND);
      pick('han', '1');
      check();

      cy.get('#fu-missing').should('have.text', 'Error: Pick the fu.');
      cy.get('#points-missing').should('have.text', 'Error: Enter the points.');
      noteIsGone('han');
      cy.get('.choice-field.missing').should('have.length', 1);
      cy.get('#fu-missing .visually-hidden').should('have.text', 'Error: ');
    });

    it('should take the player to the first one, and say it once', () => {
      visitHand(RON_HAND);
      cy.get('#points').type('2000{enter}');

      cy.focused().should('have.attr', 'role', 'radio');
      cy.focused().should('have.text', '1');
      cy.focused()
        .parents('[role="radiogroup"]')
        .should('have.attr', 'aria-labelledby', 'han-label');
      cy.get('[aria-labelledby="han-label"]')
        .should('have.attr', 'aria-invalid', 'true')
        .and('not.have.attr', 'aria-describedby');
      cy.get('[aria-labelledby="han-label"] [role="radio"]').each((choice) => {
        expect(choice.attr('aria-describedby')).to.match(/\bhan-missing$/);
      });
      cy.contains('[role="radio"]', /^5$/).should(
        'have.attr',
        'aria-describedby',
        'han-mangan han-missing',
      );
      cy.get('#points').should('not.have.attr', 'aria-invalid');
      cy.get('[aria-required="true"]').should('not.exist');
      cy.get('[role="status"]').should('have.text', '');
    });

    it('should take the player to a box when a box is first', () => {
      visitHand(TSUMO_HAND);
      pick('han', '4');
      pick('fu', '30');
      cy.get('#points').type('2000');
      check();

      cy.focused().should('have.id', 'pointsDealer');
      cy.get('#pointsDealer')
        .should('have.attr', 'aria-invalid', 'true')
        .and('have.attr', 'aria-describedby', 'pointsDealer-missing');
      noteIsGone('points');
      cy.get('.verdict').should('not.exist');
      cy.contains('.badge', 'Wrong: 0');
    });

    it('should turn away one tsumo payment without the other, whichever it is', () => {
      visitHand(TSUMO_HAND);
      pick('han', '4');
      pick('fu', '30');
      cy.get('#pointsDealer').type('3900');
      check();

      cy.focused().should('have.id', 'points');
      cy.get('#points-missing').should('exist');
      noteIsGone('pointsDealer');
      cy.get('.verdict').should('not.exist');
      cy.contains('.badge', 'Wrong: 0');
    });

    it('should ask for a typed exact fu in its own words', () => {
      visitHand(RON_HAND);
      turnOnOptions('Exact fu, not rounded up');
      pick('han', '1');
      cy.get('#points').type('2000');
      check();

      cy.get('#fu-missing').should('have.text', 'Error: Enter the fu.');
      cy.focused().should('have.id', 'fu');
    });

    it('should not ask for a question that is switched off in the options', () => {
      visitHand(RON_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.get('[role="dialog"]').contains('label', /^Fu$/).click();
      cy.get('[role="dialog"]')
        .contains('label', /^Points$/)
        .click();
      cy.contains('button', 'Close').click();
      pick('han', '1');
      check();

      cy.contains('.badge', 'Correct: 1');
    });

    it('should not ask for han when it is switched off in the options', () => {
      visitHand(RON_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.get('[role="dialog"]').contains('label', /^Han$/).click();
      cy.contains('button', 'Close').click();
      pick('fu', '60');
      cy.get('#points').type('2000');
      check();

      cy.contains('.badge', 'Correct: 1');
    });

    it('should ask for fu again when it comes back on', () => {
      visitHand(LIMIT_HAND);
      pick('han', '6');
      check();
      cy.get('#points-missing').should('exist');
      noteIsGone('fu');

      pick('han', '3');
      cy.get('[aria-labelledby="fu-label"] [role="radio"]').should(
        'be.enabled',
      );
      noteIsGone('fu');

      cy.get('#points').type('18000');
      check();
      cy.get('#fu-missing').should('exist');
      cy.get('.verdict').should('not.exist');
    });

    it('should ask for fu on a limit hand while the han picked is under the limit', () => {
      visitHand(LIMIT_HAND);
      pick('han', '4');
      cy.get('#points').type('18000');
      check();

      cy.get('#fu-missing').should('exist');
      cy.get('.verdict').should('not.exist');
      cy.contains('.field-note', 'No fu on limit hands').should('not.exist');
    });

    it('should show a blank question and a box that is not a number together', () => {
      visitHand(RON_HAND);
      pick('han', '1');
      cy.get('#points').type('2k');
      check();

      cy.get('#fu-missing').should('exist');
      cy.get('#points-error').should('exist');
      noteIsGone('points');
      cy.focused().should('have.text', '20');
    });

    it('should clear each note as its question is answered', () => {
      visitHand(RON_HAND);
      pick('han', '1');
      check();
      cy.get('.missing-note').should('have.length', 2);

      pick('fu', '60');
      cy.get('.missing-note').should('have.length', 1);
      cy.get('#points-missing').should('exist');
      cy.get('.choice-field.missing').should('not.exist');

      cy.get('#points').type('2');
      cy.get('.missing-note').should('not.exist');
      cy.get('#points').should('not.have.attr', 'aria-invalid');
    });

    it('should check the hand, once, when the rest is filled in', () => {
      visitHand(RON_HAND);
      pick('han', '1');
      check();
      check();
      cy.contains('.badge', 'Correct: 0');

      pick('fu', '60');
      cy.get('#points').type('2000');
      check();
      cy.get('.verdict.correct').should('exist');
      cy.contains('.badge', 'Correct: 1');
      cy.contains('.badge', 'Wrong: 0');
    });

    it('should start the next hand with no notes', () => {
      visitHand(RON_HAND);
      pick('han', '1');
      check();
      cy.get('.missing-note').should('have.length', 2);

      cy.contains('button', 'New Hand').click();
      cy.get('.hand-number').should('contain', '#2');
      cy.get('.missing-note').should('not.exist');
      cy.get('.choice-field.missing').should('not.exist');
    });

    [320, 412].forEach((width) => {
      it(`should take up no room of its own at ${width}px`, () => {
        const measure = () =>
          cy.get('.quiz-form').then((form) => {
            const card = form[0].closest('section').getBoundingClientRect();
            const newHand = form[0]
              .querySelector('.quiz-actions button[type="button"]')
              .getBoundingClientRect();
            return `${card.height} ${newHand.top} ${newHand.left}`;
          });

        const RING = 5;

        cy.viewport(width, 2400);
        ['en', 'ko'].forEach((language) => {
          [
            [RON_HAND, 'han', '1'],
            [RON_HAND, 'fu', '30'],
            [TSUMO_HAND, 'han', '1'],
          ].forEach(([hand, group, choice]) => {
            cy.visit(`/?hand=${hand}`, {
              onBeforeLoad(win) {
                win.localStorage.setItem('mahjong-language', language);
              },
            });
            cy.document().its('fonts.status').should('equal', 'loaded');
            layOutAsOnAPhone(width);
            pick(group, choice);
            measure().then((before) => {
              check();
              cy.get('.missing-note').should('have.length.at.least', 2);
              measure().should('equal', before);
            });
            cy.get('.missing-note').each((note) => {
              const card = note[0].closest('section').getBoundingClientRect();
              const box = note[0].getBoundingClientRect();
              expect(box.left).to.be.at.least(card.left);
              expect(box.right).to.be.at.most(card.right);
            });
            cy.get('.number-input-cell > .missing-note').each((note) => {
              const input = note[0].parentElement.querySelector('input');
              expect(note[0].getBoundingClientRect().left).to.equal(
                input.getBoundingClientRect().left,
              );
            });
            cy.get('.choice-field > .missing-note').each((note) => {
              const field = note[0].parentElement;
              const next = field.nextElementSibling;
              const nextRing = next.matches('.choice-field') ? RING : 0;
              const box = note[0].getBoundingClientRect();
              const around = field.getBoundingClientRect();
              const words = note[0].ownerDocument.createRange();
              words.selectNodeContents(note[0].lastChild);
              const text = words.getBoundingClientRect();
              expect(text.left + text.right).to.be.closeTo(
                around.left + around.right,
                1,
              );
              expect(box.top).to.be.at.least(around.bottom + RING);
              expect(
                next.getBoundingClientRect().top - nextRing - box.bottom,
              ).to.be.at.least(2 * (box.top - around.bottom));
            });
          });
        });
      });
    });
  });

  describe('Options', () => {
    it('should remember the options after a reload', () => {
      visitHand(RON_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'Exact fu, not rounded up').click();
      cy.contains('button', 'Close').click();
      cy.get('#fu').should('exist');

      cy.reload();
      cy.get('#fu').should('exist');
    });

    it('should take the fu before rounding when exact fu is on', () => {
      visitHand(RON_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'Exact fu, not rounded up').click();
      cy.contains('button', 'Close').click();

      // 20 base + 32 for the kan + 4 + 2 for the pons, before rounding
      pick('han', '1');
      cy.get('#fu').type('58');
      cy.get('#points').type('2000');
      cy.contains('button', 'Check Answer').click();
      cy.contains('.badge', 'Correct: 1');
    });

    it('should read the points however the number is written', () => {
      for (const typed of ['2,000', '２０００', '02000', ' 2 000 ']) {
        visitHand(RON_HAND);
        pick('han', '1');
        pick('fu', '60');
        cy.get('#points').type(typed);
        cy.get('.field-error').should('not.exist');
        cy.get('button[type="submit"]').click();
        cy.get('.verdict.correct').should('exist');
      }
    });

    it('should stop and say so when the points are not a number', () => {
      visitHand(RON_HAND);
      pick('han', '1');
      pick('fu', '60');
      cy.get('#points').type('2k');
      cy.get('#points').should('have.attr', 'aria-invalid', 'true');
      cy.get('#points').should('have.attr', 'aria-describedby', 'points-error');
      cy.get('#points-error').should('have.text', 'Error: Enter a number.');
      cy.get('#points-error').then((note) => {
        expect(note[0].getBoundingClientRect().left).to.equal(
          note[0].parentElement.querySelector('input').getBoundingClientRect()
            .left,
        );
      });

      cy.get('button[type="submit"]').click();
      cy.get('.verdict').should('not.exist');
      cy.focused().should('have.id', 'points');

      cy.get('#points').type('{backspace}');
      cy.get('#points-error').should('not.exist');
    });

    it('should start the fu answer over when exact fu is switched', () => {
      visitHand(RON_HAND);
      pick('fu', '30');
      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'Exact fu, not rounded up').click();
      cy.contains('button', 'Close').click();
      cy.get('#fu').should('have.value', '');

      cy.get('#fu').type('58');
      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'Exact fu, not rounded up').click();
      cy.contains('button', 'Close').click();
      cy.get('.fu-choices [data-state="checked"]').should('not.exist');
      cy.get('button[type="submit"]').should('have.text', 'Just tell me');
    });

    it('should leave a checked hand alone and change the next one', () => {
      visitHand(RON_HAND);
      pick('han', '1');
      pick('fu', '60');
      cy.get('#points').type('2000');
      cy.contains('button', 'Check Answer').click();
      cy.get('.verdict.correct').should('exist');

      cy.get('button[aria-label="Options"]').click();
      cy.get('[role="dialog"]').should(
        'have.attr',
        'aria-describedby',
        'next-hand-note',
      );
      cy.get('#next-hand-note').should(
        'have.text',
        'Changes to the quiz start with the next hand.',
      );
      cy.contains('label', 'Exact fu, not rounded up').click();
      cy.contains('button', 'Close').click();

      cy.get('#fu').should('not.exist');
      cy.get('.verdict.correct').should('exist');
      cy.get('form .wrong').should('not.exist');

      cy.contains('button', 'New Hand').click();
      cy.get('#fu').should('exist');
      cy.get('button[aria-label="Options"]').click();
      cy.get('#next-hand-note').should('not.exist');
    });

    it('should name each group, as a group and as a heading', () => {
      const groupOf = (name) =>
        cy
          .get('[role="dialog"]')
          .contains('label', name)
          .closest('fieldset')
          .find('legend h2');

      visitHand(RON_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.get('fieldset.option-group legend h2').then((headings) => {
        expect([...headings].map((heading) => heading.textContent)).to.eql([
          'Ask for',
          'Rules',
          'Display',
        ]);
      });
      groupOf(/^Points$/).should('have.text', 'Ask for');
      groupOf('Skip fu on limit hands').should('have.text', 'Ask for');
      groupOf('Honba sticks').should('have.text', 'Rules');
      groupOf('High contrast').should('have.text', 'Display');
      groupOf(/^Language$/).should('have.text', 'Display');
    });

    it('should switch the fu options off, and say why, while fu is not asked', () => {
      const exactFu = () =>
        cy
          .contains('label', 'Exact fu, not rounded up')
          .find('[role="checkbox"]');

      visitHand(RON_HAND);
      cy.get('button[aria-label="Options"]').click();
      exactFu().should('not.have.attr', 'aria-disabled');
      cy.get('#exactFu-note').should('not.exist');

      cy.contains('label', /^Fu$/).click();
      exactFu().should('have.attr', 'aria-disabled', 'true');
      exactFu().should('have.attr', 'aria-describedby', 'exactFu-note');
      cy.get('#exactFu-note').should(
        'have.text',
        'Unavailable while Fu is off.',
      );
      cy.get('#ignoreFuOnLimit-note').should(
        'have.text',
        'Unavailable while Fu is off.',
      );

      exactFu().click();
      exactFu().should('have.attr', 'aria-checked', 'false');
    });

    it('should keep Close in reach while the options scroll', () => {
      cy.viewport(360, 500);
      visitHand(RON_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.contains('a', 'Report a problem with this hand').scrollIntoView();
      cy.contains('a', 'Report a problem with this hand').should((link) => {
        expect(link[0].getBoundingClientRect().bottom).to.be.at.most(500);
      });
      cy.get('.options-title').should((title) => {
        const { bottom, top } = title[0].getBoundingClientRect();
        expect(top).to.be.at.least(0);
        expect(bottom).to.be.at.most(500);
      });
      cy.contains('[role="dialog"] button', 'Close').click();
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should report a hand in a new tab, with the hand in the report', () => {
      visitHand(RON_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.contains('a', 'Report a problem with this hand')
        .should('have.attr', 'target', '_blank')
        .and('have.attr', 'rel', 'noopener noreferrer')
        .and('contain', '(opens in a new tab)')
        .and('have.descendants', 'svg[aria-hidden="true"]')
        .and('have.attr', 'href')
        .then((href) => {
          const issueUrl = new URL(href);
          expect(issueUrl.origin + issueUrl.pathname).to.equal(
            'https://github.com/zack/riichi/issues/new',
          );
          expect(issueUrl.searchParams.get('title')).to.equal(
            `Hand ${RON_HAND}`,
          );
          expect(issueUrl.searchParams.get('body')).to.contain(
            `https://riichi.youngren.io/?hand=${RON_HAND}`,
          );
        });
    });

    it('should say Language in English too when the page is not', () => {
      visitHand(RON_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.get('label[for="language-select"]').should('have.text', 'Language');
      cy.get('#language-select').click();
      cy.contains('[role="option"]', '日本語').click();
      cy.get('label[for="language-select"]').should(
        'have.text',
        '言語 / Language',
      );
      cy.get('label[for="language-select"] [lang="en"]').should(
        'have.text',
        ' / Language',
      );
    });
  });

  describe('Home screen icon', () => {
    const offerToInstall = () =>
      cy.window().then((win) => {
        const event = new win.Event('beforeinstallprompt');
        event.fromTest = true;
        event.prompt = cy.stub().as('prompt').resolves();
        win.dispatchEvent(event);
      });

    it('should only be offered when the app can be installed', () => {
      visitHand(RON_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.contains('Home screen icon').should('not.exist');
    });

    it('should point the install links at the color picked', () => {
      visitHand(RON_HAND);
      offerToInstall();
      cy.get('button[aria-label="Options"]').click();
      cy.get('input[aria-label="Mat blue"]').click();
      cy.get('link[rel="manifest"]').should(
        'have.attr',
        'href',
        '/manifests/mat-blue.json',
      );
      cy.get('link[rel="apple-touch-icon"]').should(
        'have.attr',
        'href',
        '/icons/mat-blue/apple-touch-icon.png',
      );

      cy.reload();
      cy.get('link[rel="manifest"]').should(
        'have.attr',
        'href',
        '/manifests/mat-blue.json',
      );
    });

    it('should tell Firefox on Android where its own install is', () => {
      visitHand(RON_HAND);
      cy.window().then((win) => {
        Object.defineProperty(win.navigator, 'userAgent', {
          value:
            'Mozilla/5.0 (Android 15; Mobile; rv:143.0) Gecko/143.0 Firefox/143.0',
        });
      });
      cy.get('button[aria-label="Options"]').click();
      cy.contains('To install app, tap the menu, then "Install".');
      cy.contains('button', 'Install app').should('not.exist');
    });

    it('should install from its own button', () => {
      visitHand(RON_HAND);
      offerToInstall();
      cy.get('button[aria-label="Options"]').click();
      cy.contains('button', 'Install app').click();
      cy.get('@prompt').should('have.been.calledOnce');
    });
  });

  describe('Skipping fu on limit hands', () => {
    const fuChoices = () =>
      cy.get('[aria-labelledby="fu-label"] [role="radio"]');

    it('should switch fu off when a limit hand is picked, and back on after', () => {
      visitHand(RON_HAND);
      pick('fu', '40');
      fuChoices().should('be.enabled');
      cy.get('#fu-note').should('not.exist');

      pick('han', '5');
      fuChoices().should('be.disabled');
      cy.get('#fu-note').should('have.text', 'Disabled on limit hands');
      cy.contains('[role="radio"]', /^40$/).should(
        'have.attr',
        'aria-checked',
        'false',
      );

      pick('han', '1');
      fuChoices().should('be.enabled');
      cy.get('#fu-note').should('not.exist');
      cy.contains('[role="radio"]', /^40$/).should(
        'have.attr',
        'aria-checked',
        'false',
      );
    });

    it('should empty a typed exact fu when a limit hand is picked', () => {
      visitHand(RON_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'Exact fu, not rounded up').click();
      cy.contains('button', 'Close').click();
      cy.get('#fu').type('40');
      pick('han', '5');
      cy.get('#fu').should('be.disabled').and('have.value', '');
    });

    it('should empty fu when the option switches it off for the han picked', () => {
      const toggleIgnoreFu = () => {
        cy.get('button[aria-label="Options"]').click();
        cy.contains('label', 'Skip fu on limit hands').click();
        cy.contains('button', 'Close').click();
      };

      visitHand(RON_HAND);
      toggleIgnoreFu();
      pick('han', '6');
      pick('fu', '40');
      cy.contains('[role="radio"]', /^40$/).should(
        'have.attr',
        'aria-checked',
        'true',
      );

      toggleIgnoreFu();
      fuChoices().should('be.disabled');
      cy.contains('[role="radio"]', /^40$/).should(
        'have.attr',
        'aria-checked',
        'false',
      );
    });

    it('should leave fu out of the result while it is switched off', () => {
      visitHand(LIMIT_HAND);
      pick('fu', '70');
      pick('han', '6');
      cy.get('#points').type('18000');
      cy.contains('button', 'Check Answer').click();

      cy.contains('.badge', 'Correct: 1');
      cy.get('[role="radio"].wrong').should('not.exist');
      cy.get('.field-note')
        .filter(':contains("limit hands")')
        .should('have.length', 1);
    });

    it('should keep asking for fu after it was switched off and left blank', () => {
      visitHand(LIMIT_HAND);
      pick('han', '6');
      cy.get('#points').type('18000');
      cy.contains('button', 'Check Answer').click();
      cy.contains('.badge', 'Correct: 1');

      cy.contains('button', 'New Hand').click();
      cy.get('[aria-labelledby="fu-label"]').should('exist');
    });

    it('should be switched off, and keep its tick, while han is not asked', () => {
      const ignoreFu = () =>
        cy
          .contains('label', 'Skip fu on limit hands')
          .find('[role="checkbox"]');

      visitHand(LIMIT_HAND);
      cy.get('button[aria-label="Options"]').click();
      ignoreFu().should('be.enabled');
      ignoreFu().should('have.attr', 'aria-checked', 'true');

      cy.contains('label', /^Han$/).click();
      ignoreFu().should('have.attr', 'aria-disabled', 'true');
      ignoreFu().should('have.attr', 'aria-checked', 'true');
      cy.get('#ignoreFuOnLimit-note').should(
        'have.text',
        'Unavailable while Han is off.',
      );
      ignoreFu().should(
        'have.attr',
        'aria-describedby',
        'ignoreFuOnLimit-note',
      );

      ignoreFu().click();
      ignoreFu().should('have.attr', 'aria-checked', 'true');
      cy.contains('button', 'Close').click();

      fuChoices().should('be.enabled');
      cy.get('#fu-note').should('not.exist');
      pick('fu', '70');
      cy.get('#points').type('18000');
      cy.contains('button', 'Check Answer').click();
      cy.contains('.badge', 'Wrong: 1');

      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', /^Han$/).click();
      ignoreFu().should('be.enabled');
      ignoreFu().should('have.attr', 'aria-checked', 'true');
    });

    it('should mark any fu wrong on a limit hand, and show none as the answer', () => {
      visitHand(LIMIT_HAND);
      pick('han', '4');
      pick('fu', '70');
      cy.get('#points').type('18000');
      cy.contains('button', 'Check Answer').click();

      cy.contains('.badge', 'Wrong: 1');
      cy.get('[role="status"]').should('contain', 'Fu: No fu on limit hands');
      cy.get('[aria-labelledby="fu-label"] [role="radio"].wrong').should(
        'contain',
        '70',
      );
      cy.get('[aria-labelledby="fu-label"] [role="radio"].correct').should(
        'not.exist',
      );
      cy.contains('.field-note', 'No fu on limit hands').should(
        'have.class',
        'field-error',
      );
      cy.get('[aria-labelledby="fu-label"]').should(
        'have.attr',
        'aria-describedby',
        'fu-no-answer',
      );
      cy.get('.answer-key').should('not.contain', 'Fu:');
    });

    it('should mark a typed exact fu wrong on a limit hand', () => {
      visitHand(LIMIT_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'Exact fu, not rounded up').click();
      cy.contains('button', 'Close').click();
      pick('han', '4');
      cy.get('#fu').type('40');
      cy.get('#points').type('18000');
      cy.contains('button', 'Check Answer').click();

      cy.contains('.badge', 'Wrong: 1');
      cy.get('.number-input-cell.wrong').should('have.length', 1);
      cy.get('.number-input-cell.wrong #fu').should('exist');
      cy.get('#fu-answer').should('be.empty');
      cy.get('.number-input-cell.correct #points').should('exist');
      cy.get('#fu-no-answer')
        .should('have.text', 'No fu on limit hands')
        .and('have.class', 'field-error');
      cy.get('#fu').should(
        'have.attr',
        'aria-describedby',
        'fu-verdict fu-no-answer',
      );
      cy.get('.answer-key').should('not.contain', 'Exact fu');
    });

    it('should keep the note about a typed exact fu inside a narrow phone', () => {
      cy.viewport(320, 640);
      visitHand(LIMIT_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'Exact fu, not rounded up').click();
      cy.contains('button', 'Close').click();
      pick('han', '4');
      cy.get('#fu').type('40');
      cy.get('#points').type('18000');
      cy.contains('button', 'Check Answer').click();

      cy.get('#fu-no-answer').should('be.visible');
      cy.document().then((doc) => {
        expect(doc.documentElement.scrollWidth).to.equal(getPageWidth(doc));
      });
    });

    it('should not select a fu or show its breakdown when fu is left blank', () => {
      visitHand(LIMIT_HAND);
      pick('han', '6');
      cy.get('#points').type('18000');
      cy.contains('button', 'Check Answer').click();

      cy.contains('.badge', 'Correct: 1');
      cy.get('[aria-labelledby="fu-label"] [role="radio"].correct').should(
        'not.exist',
      );
      cy.get('.answer-key').should('not.contain', 'Fu:');
    });

    it('should still grade fu when a non-limit hand is picked', () => {
      visitHand(RON_HAND);
      pick('han', '1');
      pick('fu', '40');
      cy.get('#points').type('2000');
      cy.contains('button', 'Check Answer').click();

      cy.contains('.badge', 'Wrong: 1');
      cy.get('[role="radio"].wrong').should('contain', '40');
    });
  });

  describe('Hand parts', () => {
    it('should name each part of the hand for a screen reader', () => {
      visitHand(RON_HAND);
      cy.get('.hand [role="group"]').then((groups) => {
        expect(
          [...groups].map((group) => group.getAttribute('aria-label')),
        ).to.eql(['Concealed', 'Won on a ron', 'Meld 1', 'Meld 2']);
      });
      cy.get('.hand [role="group"]').then((groups) => {
        expect(
          [...groups].map((group) => group.querySelectorAll('img').length),
        ).to.eql([7, 1, 4, 3]);
      });
      cy.get('.win-type').should('have.attr', 'aria-hidden', 'true');
    });
  });

  describe('Bigger hand', () => {
    it('should show the same tiles, split into their parts', () => {
      visitHand(RON_HAND);
      cy.contains('button', 'Tap the tiles to see them bigger').click();

      cy.get('[role="dialog"]').within(() => {
        cy.get('h1').should('have.text', 'Hand #1');
        cy.get('h2').then((headings) => {
          expect([...headings].map((heading) => heading.textContent)).to.eql([
            'Concealed',
            'Won on a ron',
            'Melds',
          ]);
        });
        cy.get('.tile').should('have.length', RON_HAND_TILE_COUNT);
        cy.get('.tile.winning').should('have.length', 1);
      });
    });

    const concealedRowsShouldBe = (tileCounts) => {
      cy.get('.bigger-hand-rows .bigger-hand-tiles').then((rows) => {
        expect([...rows].map((row) => row.children.length)).to.eql(tileCounts);

        for (const row of rows) {
          const bottoms = [...row.querySelectorAll('.tile')].map((tile) =>
            Math.round(tile.getBoundingClientRect().bottom),
          );
          expect(new Set(bottoms).size).to.equal(1);
        }
      });
    };

    it('should start a new row of concealed tiles where the suit changes', () => {
      cy.viewport(360, 740);
      visitHand(NO_CALLS_HAND);
      cy.get('.bigger-hand-button').click();

      concealedRowsShouldBe([3, 5, 5]);
    });

    it('should break a suit too long for one row when the row is full', () => {
      cy.viewport(360, 740);
      visitHand(LONG_SUIT_HAND);
      cy.get('.bigger-hand-button').click();

      concealedRowsShouldBe([7, 6]);
    });

    it('should open from the tiles, and give focus back on close', () => {
      visitHand(RON_HAND);
      cy.get('.hand').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.focused().should('have.attr', 'role', 'dialog');

      cy.get('body').type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
      cy.focused().should('have.class', 'bigger-hand-button');
    });
  });

  describe('Tile names', () => {
    it('should print a name under every tile, hidden from screen readers', () => {
      visitHand(RON_HAND);
      cy.get('.tile-label').should('not.exist');

      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'Names on tiles').click();
      cy.contains('button', 'Close').click();

      cy.get('.tile-label').should('have.length', RON_HAND_TILE_COUNT);
      cy.get('.tile-label').each((label) => {
        cy.wrap(label).should('have.attr', 'aria-hidden', 'true');
      });
      cy.get('.hand .tile-label').should((labels) => {
        const text = [...labels].map((label) => label.textContent).join(' ');
        expect(text).to.equal('1 1 7 7 5 6 7 1  E E  8 8 8');
      });
      cy.get('.info .tile-label').first().should('have.text', 'E');
    });

    it('should put the names on the tiles when there is room', () => {
      cy.viewport(360, 740);
      visitHand(RON_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'Names on tiles').click();
      cy.contains('button', 'Close').click();

      cy.get('.hand-card.names-on-tiles').should('exist');
      cy.get('.hand .tile-cell').each((cell) => {
        const label = cell[0].querySelector('.tile-label');
        if (label?.textContent) {
          const tile = cell[0].querySelector('.tile').getBoundingClientRect();
          const tab = label.getBoundingClientRect();
          expect(tab.top).to.be.at.least(tile.top);
          expect(tab.right).to.be.at.most(tile.right);
        }
      });
    });

    it('should put them back under the tiles when the text gets too big', () => {
      cy.viewport(360, 740);
      visitHand(RON_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'Names on tiles').click();
      cy.contains('button', 'Close').click();
      cy.get('.hand-card.names-on-tiles').should('exist');

      cy.document().then((doc) => {
        const style = doc.createElement('style');
        style.textContent = '.tile-label { font-size: 24px !important; }';
        doc.head.append(style);
      });
      cy.get('.hand-card').should('not.have.class', 'names-on-tiles');
    });
  });

  describe('Fancy tiles', () => {
    it('should swap every tile for its fancy version', () => {
      visitHand(RON_HAND);
      cy.get('.hand-card img[src*="/fancy/"]').should('not.exist');

      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'Fancy tiles').click();
      cy.contains('button', 'Close').click();

      cy.get('.hand-card img').should('have.length.greaterThan', 14);
      cy.get('.hand-card img').each((tile) => {
        expect(tile.attr('src')).to.contain('/assets/tiles/fancy/');
        expect(tile[0].naturalWidth).to.be.greaterThan(0);
      });
      cy.get('.hand img[src$="/fancy/Back.svg"]').should('have.length', 2);
      cy.get('.hand').then((hand) => {
        expect(hand[0].scrollWidth).to.be.at.most(hand[0].clientWidth + 1);
      });
    });
  });

  describe('Tile names in the help', () => {
    it('should name the tiles in the help when the option is on', () => {
      visitHand(RON_HAND);
      openHelp('Yaku');
      cy.get('.help-content .tile').should('have.length.at.least', 100);
      cy.get('.help-content .tile-label').should('not.exist');
      cy.contains('button', 'Close').click();

      turnOnOptions('Names on tiles');
      openHelp('Yaku');
      cy.get('.help-content .tile').then((tiles) => {
        cy.get('.help-content .tile-label').should('have.length', tiles.length);
      });
      cy.get('.help-content .tile-label').each((label) => {
        cy.wrap(label).should('have.attr', 'aria-hidden', 'true');
      });
      cy.get('.help-content.names-on-tiles').should('exist');
    });
  });

  describe('Fancy tiles in the help', () => {
    it('should use the fancy tiles in the help page too', () => {
      visitHand(RON_HAND);
      turnOnOptions('Fancy tiles');
      openHelp('Yaku');

      cy.get('.help-content.fancy-tiles').should('exist');
      cy.get('.help-content .tile img').should('have.length.at.least', 100);
      cy.get('.help-content .tile img').each((tile) => {
        cy.wrap(tile).should((img) => {
          expect(img.attr('src')).to.contain('/assets/tiles/fancy/');
          expect(img[0].naturalWidth).to.be.greaterThan(0);
        });
      });
    });
  });

  describe('Help tabs', () => {
    const JAPANESE_SCRIPT = /[\u3040-\u30ff\u3400-\u9fff]/;

    it('should open on the steps, a card for each', () => {
      visitHand(RON_HAND);
      openHelp();

      cy.get('.help-tabs [role="tab"]').then((tabs) => {
        expect([...tabs].map((tab) => tab.textContent)).to.deep.equal([
          'Steps',
          'Yaku',
          'Table',
          'Site',
        ]);
      });
      cy.contains('[role="tab"]', 'Steps').should(
        'have.attr',
        'aria-selected',
        'true',
      );
      cy.get('[role="tabpanel"]:not([hidden])').should('have.length', 1);
      cy.get('.help-steps .step').should('have.length', 7);
      cy.get('.help-steps .step > h2').then((headings) => {
        expect(headings[0].textContent).to.equal('1. Han');
        expect(headings[5].textContent).to.equal('6. Honba');
      });
      cy.get('.help-steps .step').first().should('contain', 'red five');
      cy.get('.help-steps .step.sums li').should('have.length', 7);
    });

    it('should show one tab at a time, from its top', () => {
      cy.viewport(412, 800);
      visitHand(RON_HAND);
      openHelp();

      cy.get('.help-steps .step.sums').scrollIntoView();
      cy.get('.help-dialog').should((dialog) => {
        expect(dialog[0].getBoundingClientRect().top).to.be.lessThan(0);
      });
      cy.contains('[role="tab"]', 'Yaku').click();
      cy.get('.help-steps').should('not.exist');
      cy.get('.help-yaku .yaku-list').should('exist');
      cy.get('.help-dialog').should((dialog) => {
        expect(dialog[0].getBoundingClientRect().top).to.be.at.least(0);
      });

      cy.contains('[role="tab"]', 'Table').click();
      cy.get('.help-yaku').should('not.exist');
      cy.get('.help-table .scoring-table').should('exist');
    });

    it('should open again on the tab it was left on', () => {
      visitHand(RON_HAND);
      openHelp('Table');
      cy.contains('button', 'Close').click();
      cy.get('[role="dialog"]').should('not.exist');

      openHelp();
      cy.contains('[role="tab"]', 'Table').should(
        'have.attr',
        'aria-selected',
        'true',
      );
      cy.get('.help-table .scoring-table').should('exist');
    });

    it('should move between the tabs with the arrow keys', () => {
      visitHand(RON_HAND);
      openHelp();

      cy.contains('[role="tab"]', 'Steps').focus();
      cy.focused().type('{rightarrow}');
      cy.focused().should('have.text', 'Yaku');
      cy.get('.help-yaku').should('exist');
    });

    it('should call each yaku what the answer key calls it', () => {
      visitHand(RON_HAND);
      openHelp('Yaku');

      cy.get('.yaku-family').should('have.length', 6);
      cy.get('.yaku-column').should('have.length', 2);
      cy.get('.yaku-column').then((columns) => {
        const getTitles = (column) =>
          [...column.querySelectorAll('.yaku-family > h2')].map(
            (title) => title.textContent,
          );

        expect(getTitles(columns[0])).to.deep.equal([
          'Closed hand required',
          'Value tiles',
          'Flushes',
        ]);
        expect(getTitles(columns[1])).to.deep.equal([
          'Simples and runs',
          'Triplets and kans',
          'Dora, which are not yaku',
        ]);
      });
      cy.get('.yaku').should('have.length', 20);
      [en.yaku[9], en.yaku[24], en.yaku[25], en.yaku[53]].forEach((name) => {
        cy.contains('.yaku-name', name).should('exist');
      });
      cy.contains('.yaku-name', 'Iipeikou')
        .find('.yaku-gloss')
        .should('have.text', 'Pure double sequence');
    });

    it('should say what a yaku is worth on its badge', () => {
      visitHand(RON_HAND);
      openHelp('Yaku');

      const getBadge = (name) =>
        cy.contains('.yaku-name', name).parents('.yaku').find('.han-badge');

      getBadge('Tanyao').should('have.text', '11 han');
      getBadge('Tanyao').should('not.have.class', 'closed');
      getBadge('Pinfu').should('have.text', '11 han, closed hand required');
      getBadge('Pinfu').should('have.class', 'closed');
      getBadge('Chinitsu').should(
        'have.text',
        '5+5 han, and 1 more when closed',
      );
      getBadge('Chinitsu')
        .find('[aria-hidden="true"]')
        .should('have.text', '5+');

      cy.get('.yaku-legend').should('have.text', '++1 han when closed');
      cy.get('.yaku-legend .han-badge')
        .should('have.length', 1)
        .and('have.text', '+');
    });

    it('should put what the + means beside the notes where there is room', () => {
      const getBoxes = () =>
        cy.get('.help-top').then((top) => ({
          legend: top[0].querySelector('.yaku-legend').getBoundingClientRect(),
          notes: top[0].querySelector('.help-notes').getBoundingClientRect(),
        }));

      cy.viewport(1280, 800);
      visitHand(RON_HAND);
      openHelp('Yaku');
      cy.get('.help-top + .help-yaku').should('exist');
      getBoxes().then(({ legend, notes }) => {
        expect(legend.right).to.be.lessThan(notes.left);
        expect(legend.top).to.be.lessThan(notes.bottom);
        expect(legend.bottom).to.be.greaterThan(notes.top);
      });

      cy.viewport(360, 800);
      getBoxes().should(({ legend, notes }) => {
        expect(legend.top).to.be.at.least(notes.bottom);
      });
    });

    it('should link each yaku to its page on the wiki', () => {
      visitHand(RON_HAND);
      openHelp('Yaku');

      const getLink = (name) => cy.contains('.yaku-name .wiki-link', name);

      cy.get('.yaku-name .wiki-link').should('have.length', 20);
      cy.get('.yaku-name .wiki-link').each((link) => {
        cy.wrap(link).should('have.attr', 'target', '_blank');
        cy.wrap(link).should('have.attr', 'rel', 'noopener noreferrer');
        cy.wrap(link).should('contain.text', '(opens the wiki in a new tab)');
      });
      getLink('Iipeikou').should(
        'have.attr',
        'href',
        `https://riichi.wiki/${YAKU_PAGES[9]}`,
      );
      getLink('Tsumo').should(
        'have.attr',
        'href',
        `https://riichi.wiki/${YAKU_PAGES[0]}`,
      );
      getLink('Yakuhai').should(
        'have.attr',
        'href',
        'https://riichi.wiki/Yakuhai',
      );
      getLink('Akadora').should(
        'have.attr',
        'href',
        'https://riichi.wiki/Dora#Akadora',
      );
    });

    it('should draw the order the dora go in, with arrows', () => {
      visitHand(RON_HAND);
      openHelp();

      const checkOrder = (container) => {
        cy.get(`${container} .tile-arrow`).should('have.length', 8);
        cy.get(`${container} .tile-arrow`)
          .first()
          .parent()
          .find('img')
          .then((tiles) => {
            expect([...tiles].map((tile) => tile.alt)).to.deep.equal([
              '9 man',
              '1 man',
            ]);
          });
        cy.get(`${container} .tile-arrow`)
          .last()
          .parent()
          .find('img')
          .then((tiles) => {
            expect([...tiles].map((tile) => tile.alt)).to.deep.equal([
              'White Dragon',
              'Green Dragon',
              'Red Dragon',
              'White Dragon',
            ]);
          });
      };

      cy.get('.help-steps .step').first().as('han');
      cy.get('@han').should('contain', 'Dora order:');
      checkOrder('.help-steps .step:first-child');

      cy.contains('[role="tab"]', 'Yaku').click();
      cy.contains('.yaku-name', 'Dora').parents('.yaku').as('dora');
      cy.get('@dora').find('.tile-arrow').should('have.length', 8);
      cy.get('@dora')
        .find('.yaku-tile-lines > .yaku-tiles')
        .should('have.length', 3)
        .then((lines) => {
          const tops = [...lines].map(
            (line) => line.getBoundingClientRect().top,
          );
          expect(tops[1]).to.be.greaterThan(tops[0]);
          expect(tops[2]).to.be.greaterThan(tops[1]);
          expect(lines[1].querySelectorAll('img')).to.have.length(5);
        });
      cy.get('.yaku-list .tile-arrow').should('have.length', 8);
      checkOrder('.yaku-list');
    });

    it('should say that links open in a new tab, on the tabs that have any', () => {
      visitHand(RON_HAND);
      openHelp();

      cy.get('.help-notes').should('not.exist');
      cy.contains('[role="tab"]', 'Yaku').click();
      cy.get('.help-top + .help-yaku').should('exist');
      cy.get('.help-notes').should('have.css', 'text-align', 'right');
      cy.get('.help-notes p')
        .first()
        .should('have.text', 'Links open in a new tab');
      cy.contains('[role="tab"]', 'Table').click();
      cy.get('.help-table').should('exist');
      cy.get('.help-notes').should('not.exist');
      cy.contains('[role="tab"]', 'Site').click();
      cy.get('.help-top + .help-site').should('exist');
    });

    it('should link nothing to the wiki in another language', () => {
      cy.visit(`/?hand=${RON_HAND}`, {
        onBeforeLoad: (win) => {
          win.localStorage.setItem('mahjong-language', 'ja');
        },
      });
      cy.get('.icon-button').last().click();
      cy.get('.help-tabs [role="tab"]').eq(1).click();
      cy.get('.yaku-name').should('have.length', 20);
      cy.get('.yaku-name .wiki-link').should('not.exist');
      cy.get('.help-notes p').should('have.length', 1);
    });

    it('should leave out the yaku that are never dealt, and say so', () => {
      visitHand(RON_HAND);
      openHelp('Yaku');

      ['Ryanpeikou', 'Sankantsu', 'Sanshoku Doukou', 'Ippatsu'].forEach(
        (name) => {
          cy.contains('.yaku-name', name).should('not.exist');
        },
      );
      cy.get('.help-notes p').then((notes) => {
        expect([...notes].map((note) => note.textContent)).to.deep.equal([
          'Links open in a new tab',
          'Unused yaku are not listed',
        ]);
      });
      cy.get('.help-yaku > p').should('not.exist');
      cy.contains('[role="tab"]', 'Site').click();
      cy.get('.help-notes p').should('have.length', 1);
    });

    it('should have no kanji or kana in English', () => {
      visitHand(RON_HAND);
      openHelp();

      ['Steps', 'Yaku', 'Table', 'Site'].forEach((tab) => {
        cy.contains('[role="tab"]', tab).click();
        cy.get(`.help-${tab.toLowerCase()}`).should('exist');
        cy.get('.help-dialog').should((dialog) => {
          expect(dialog.text()).not.to.match(JAPANESE_SCRIPT);
          [...dialog[0].querySelectorAll('img')].forEach((image) => {
            expect(image.alt).not.to.match(JAPANESE_SCRIPT);
          });
        });
      });
    });

    it('should link to everything it credits', () => {
      visitHand(RON_HAND);
      openHelp('Site');

      [
        'https://github.com/Varantha/Mahjong-ScoringTrainer',
        'https://commons.wikimedia.org/wiki/User:Cangjie6',
        'https://commons.wikimedia.org/wiki/Category:SVG_Oblique_illustrations_of_Mahjong_tiles',
        'https://creativecommons.org/licenses/by-sa/4.0/',
        'https://creativecommons.org/licenses/by-nc/4.0/',
      ].forEach((address) => {
        cy.get(`.help-site a[href="${address}"]`)
          .should('have.attr', 'target', '_blank')
          .and('have.attr', 'rel', 'noopener noreferrer');
      });
    });

    it('should describe every option that changes the quiz', () => {
      visitHand(RON_HAND);
      openHelp('Site');

      [
        en.options.testHan,
        en.options.testFu,
        en.options.testPoints,
        en.options.exactFu,
        en.options.ignoreFuOnLimit,
        en.options.kiriageMangan,
        en.options.testHonba,
      ].forEach((name) => {
        cy.contains('.help-site h2', name).should('exist');
      });
    });
  });

  describe('Scoring table in the help', () => {
    const getCell = (side, fu, han) =>
      cy.get(
        `.score-table.full td[headers="st-${side} st-${side}-${fu} st-h${han}"]`,
      );

    it('should work its figures out, with no picture', () => {
      cy.viewport(1280, 800);
      visitHand(RON_HAND);
      openHelp('Table');

      cy.get('.help-content img[src*="riichi-scoring"]').should('not.exist');
      cy.get('.score-table.full').should('have.css', 'display', 'table');
      cy.get('.score-lists').should('have.css', 'display', 'none');

      getCell('d', 30, 1).find('.ron').should('contain', '1500');
      getCell('d', 30, 1).find('.tsumo').should('contain', '(500');
      getCell('n', 30, 4).find('.ron').should('contain', '7700');
      getCell('n', 30, 4)
        .find('.tsumo')
        .should('contain', '(2000')
        .and('contain', '3900');
      cy.get('.score-table.full td[headers="st-d st-haneman"]').should(
        'contain',
        '18000',
      );
      getCell('n', 20, 2).find('.ron').should('contain', 'tsumo only');
      getCell('n', 25, 2)
        .find('.tsumo')
        .should('contain', 'ron only')
        .and('not.contain', '(');
      getCell('n', 20, 1).should('have.text', 'pinfu tsumo only');
      getCell('d', 25, 1).should('have.text', 'seven pairs only');
    });

    it('should say which figure is which without the layout', () => {
      cy.viewport(1280, 800);
      visitHand(RON_HAND);
      openHelp('Table');

      getCell('d', 30, 1).should((cell) => {
        expect(cell.text()).to.equal('Ron 1500Tsumo (500 from each player)');
      });
      getCell('n', 30, 1).should((cell) => {
        expect(cell.text()).to.equal(
          'Ron 1000Tsumo (300 from each non-dealer, /500 from the dealer)',
        );
      });
      getCell('d', 30, 1).find('.visually-hidden').should('have.length', 3);
      getCell('d', 40, 4).should('have.class', 'mangan');
      getCell('d', 40, 4).find('.in-block').should('contain', 'Ron 12000');
      getCell('d', 40, 4)
        .find('.in-block')
        .invoke('outerWidth')
        .should('be.lte', 1);
    });

    it('should turn into a list for each side where it does not fit', () => {
      cy.viewport(412, 900);
      visitHand(RON_HAND);
      openHelp('Table');

      cy.get('.score-table.full').should('have.css', 'display', 'none');
      cy.get('.score-lists').should('have.css', 'display', 'grid');
      cy.get('.score-table.listed').should('have.length', 2);
      cy.get('td[headers="sl-d-ron sl-d-h1 sl-d-h1-f30"]').should(
        'have.text',
        '1500',
      );
      cy.get('td[headers="sl-n-tsumo sl-n-h4 sl-n-h4-f30"]')
        .should('contain', '2000')
        .and('contain', '3900');
      cy.get('#sl-d-h4-cap').should('have.text', '40 to 70 fu');
      cy.get('td[headers="sl-d-h4 sl-d-h4-cap"]').should('have.text', 'Mangan');
      cy.get('td[headers="sl-n-h1 sl-n-h1-f20"]')
        .should('have.text', 'pinfu tsumo only')
        .and('have.attr', 'colspan', '2');
      cy.get('td[headers="sl-n-ron sl-n-h2 sl-n-h2-f20"]').should(
        'have.text',
        'tsumo only',
      );
      cy.get('.help-content').then((help) => {
        expect(help[0].scrollWidth).to.equal(help[0].clientWidth);
      });
    });

    it('should show one list at a time where they are stacked', () => {
      cy.viewport(412, 900);
      visitHand(RON_HAND);
      openHelp('Table');

      cy.get('.seat-choice').should('have.css', 'display', 'grid');
      cy.get('.seat-choice [type="radio"]').should('have.length', 2);
      cy.get('.seat-choice [value="non-dealer"]').should('be.checked');
      cy.get('.listed.for-non-dealer').should('have.css', 'display', 'table');
      cy.get('.listed.for-dealer').should('have.css', 'display', 'none');

      cy.contains('.seat-choice label', /^Dealer$/).click();
      cy.get('.listed.for-dealer').should('have.css', 'display', 'table');
      cy.get('.listed.for-non-dealer').should('have.css', 'display', 'none');

      cy.viewport(800, 900);
      cy.get('.seat-choice').should('have.css', 'display', 'none');
      cy.get('.listed.for-dealer').should('have.css', 'display', 'table');
      cy.get('.listed.for-non-dealer').should('have.css', 'display', 'table');
    });

    it('should scroll the lists sideways when even they do not fit', () => {
      cy.viewport(320, 900);
      visitHand(RON_HAND);
      openHelp('Table');
      dropScrollbarRoom();

      cy.get('.score-lists').should((lists) => {
        expect(lists[0].scrollWidth).to.equal(lists[0].clientWidth);
      });

      cy.get('.score-table.listed').invoke('css', 'font-size', '26px');
      cy.get('.score-lists').should((lists) => {
        expect(lists[0].scrollWidth).to.be.greaterThan(lists[0].clientWidth);
      });
      cy.get('.help-content').should((help) => {
        expect(help[0].scrollWidth).to.equal(help[0].clientWidth);
      });
      cy.get('.score-lists')
        .should('have.attr', 'tabindex', '0')
        .and('have.attr', 'role', 'region')
        .and('have.attr', 'aria-label', 'Scoring table');
    });

    it('should follow Kiriage mangan, and say so', () => {
      cy.viewport(1280, 800);
      visitHand(RON_HAND);
      openHelp('Table');
      cy.get('.score-note').should('not.exist');
      getCell('d', 30, 4).should('not.have.class', 'mangan');
      getCell('n', 60, 3).should('not.have.class', 'mangan');
      cy.contains('button', 'Close').click();

      turnOnOptions('Kiriage mangan');
      openHelp('Table');
      cy.get('.score-note').should('contain', 'Kiriage mangan is on');
      cy.get('.score-table.full').should(
        'have.attr',
        'aria-describedby',
        'st-note',
      );
      getCell('d', 30, 4).should('have.class', 'mangan');
      getCell('n', 60, 3).should('have.class', 'mangan');
      getCell('d', 25, 4).should('not.have.class', 'mangan');
      getCell('n', 50, 3).should('not.have.class', 'mangan');
    });
  });

  describe('Theme', () => {
    const themeRadio = (name) =>
      cy.contains('.theme-segment', name).find('input');

    it('should switch to dark mode and stay there after a reload', () => {
      visitHand(RON_HAND);
      switchToDarkMode();

      cy.reload();
      cy.get('html').should('have.class', 'dark');
      cy.get('button[aria-label="Options"]').click();
      cy.get('[role="radiogroup"][aria-labelledby="theme-label"]').should(
        'exist',
      );
      cy.get('#theme-label').should('have.text', 'Theme');
      themeRadio('Dark').should('be.checked');
    });

    it('should go back to following the device', () => {
      visitHand(RON_HAND);
      cy.get('button[aria-label="Options"]').click();
      themeRadio('Device').should('be.checked');

      cy.contains('.theme-segment', 'Dark').click();
      cy.get('html').should('have.class', 'dark');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('mahjong-appearance')).to.eq('dark');
      });

      cy.contains('.theme-segment', 'Device').click();
      cy.get('html').should('not.have.class', 'dark');
      themeRadio('Device').should('be.checked');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('mahjong-appearance')).to.eq(null);
      });
    });
  });

  describe('High contrast', () => {
    it('should switch on from the options and stay on after a reload', () => {
      visitHand(RON_HAND);
      cy.get('html').should('not.have.class', 'high-contrast');
      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'High contrast').click();
      cy.get('html').should('have.class', 'high-contrast');

      cy.reload();
      cy.get('html').should('have.class', 'high-contrast');
      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'High contrast')
        .find('[role="checkbox"]')
        .should('have.attr', 'aria-checked', 'true');
    });

    it('should follow a device that asks for more contrast', () => {
      cy.visit(`/?hand=${RON_HAND}`, {
        onBeforeLoad: (win) => {
          const matchMedia = win.matchMedia.bind(win);
          win.matchMedia = (query) =>
            query.includes('prefers-contrast')
              ? matchMedia('all')
              : matchMedia(query);
        },
      });
      cy.get('html').should('have.class', 'high-contrast');

      cy.get('button[aria-label="Options"]').click();
      cy.contains('label', 'High contrast').click();
      cy.get('html').should('not.have.class', 'high-contrast');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('mahjong-contrast')).to.eq('normal');
      });
    });
  });

  describe('Focus and announcements', () => {
    it('should move focus to New Hand on a check, then up to the hand', () => {
      visitHand(RON_HAND);
      pick('han', '1');
      pick('fu', '60');
      cy.get('#points').type('2000');
      cy.contains('button', 'Check Answer').click();
      cy.focused().should('have.text', 'New Hand');

      cy.focused().click();
      cy.focused().should('have.class', 'hand-card');
      cy.focused().should('have.attr', 'tabindex', '-1');
      cy.focused().blur();
      cy.get('.hand-card').should('not.have.attr', 'tabindex');
    });

    it('should say the result out loud, and clear it for the next hand', () => {
      visitHand(RON_HAND);
      cy.get('[role="status"]').should('have.text', '');
      pick('han', '2');
      pick('fu', '60');
      cy.get('#points').type('2000');
      cy.contains('button', 'Check Answer').click();
      cy.get('[role="status"]').should(
        'have.text',
        'Wrong. Han: 1, You picked 2. Fu: 60, Correct. Points: 2000, Correct',
      );

      cy.contains('button', 'New Hand').click();
      cy.get('[role="status"]').should('have.text', '');
    });

    it('should skip from the top of the page to the main content', () => {
      visitHand(RON_HAND);
      cy.get('a, button, input, [tabindex]')
        .first()
        .should('have.class', 'skip-link')
        .and('have.attr', 'href', '#main');

      cy.get('.skip-link').should((link) => {
        expect(link[0].getBoundingClientRect().bottom).to.be.at.most(0);
      });
      cy.get('.skip-link').focus();
      cy.get('.skip-link').should((link) => {
        expect(link[0].getBoundingClientRect().top).to.be.at.least(0);
      });

      cy.get('.skip-link').click();
      cy.focused().should('have.id', 'main');
    });
  });

  describe('Language', () => {
    it('should switch language, and keep it after a reload', () => {
      visitHand(RON_HAND);
      cy.get('button[aria-label="Options"]').click();
      cy.get('#language-select').click();
      cy.contains('[role="option"]', '日本語').click();
      cy.get('html').should('have.attr', 'lang', 'ja');
      cy.contains('button', '閉じる').click();
      cy.get('button[type="submit"]').should('have.text', '答えを見る');

      cy.reload();
      cy.get('html').should('have.attr', 'lang', 'ja');
      cy.get('button[type="submit"]').should('have.text', '答えを見る');
    });
  });

  describe('Stored settings', () => {
    it('should follow a device set to dark when nothing is saved', () => {
      cy.visit(`/?hand=${RON_HAND}`, {
        onBeforeLoad: (win) => {
          const matchMedia = win.matchMedia.bind(win);
          win.matchMedia = (query) =>
            query.includes('prefers-color-scheme: dark')
              ? matchMedia('all')
              : matchMedia(query);
        },
      });
      cy.get('html').should('have.class', 'dark');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('mahjong-appearance')).to.equal(null);
      });
      cy.get('button[aria-label="Options"]').click();
      cy.contains('.theme-segment', 'Device')
        .find('input')
        .should('be.checked');
    });

    it('should get past options that are mangled', () => {
      visitHand(RON_HAND);

      cy.window().then((win) => {
        win.localStorage.setItem('mahjong-options', '{"testFu": fal');
      });
      cy.reload();
      cy.get('#han-label').should('exist');
      cy.get('#fu-label').should('exist');
      cy.get('#points').should('exist');

      cy.window().then((win) => {
        win.localStorage.setItem(
          'mahjong-options',
          JSON.stringify({ notAnOption: true, testFu: false, testHan: 0 }),
        );
      });
      cy.reload();
      cy.get('#han-label').should('exist');
      cy.get('#fu-label').should('not.exist');
    });
  });

  describe('Hand links', () => {
    it('should copy a link to the hand on screen', () => {
      visitHand(RON_HAND);
      cy.window().then((win) => {
        cy.stub(win.navigator.clipboard, 'writeText').as('copy').resolves();
      });
      cy.get('button[aria-label="Copy a link to this hand"]').click();

      cy.get('@copy').should((copy) => {
        const url = new URL(copy.firstCall.args[0]);
        expect(url.searchParams.get('hand')).to.equal(RON_HAND);
      });
      cy.get('[role="status"]').should('have.text', 'Link copied');

      cy.contains('button', 'New Hand').click();
      cy.location('search').should('eq', '');
      cy.get('button[aria-label="Copy a link to this hand"]').click();
      cy.get('@copy').should((copy) => {
        const url = new URL(copy.secondCall.args[0]);
        expect(url.searchParams.get('hand')).to.match(/^\d{10}gm-/);
        expect(url.searchParams.get('hand')).not.to.equal(RON_HAND);
      });
    });

    it('should copy without the clipboard API, on a page that is not secure', () => {
      visitHand(RON_HAND);
      cy.window().then((win) => {
        cy.stub(win.navigator.clipboard, 'writeText').rejects(new Error());
        cy.stub(win.document, 'execCommand').as('execCommand').returns(true);
      });
      cy.get('button[aria-label="Copy a link to this hand"]').click();

      cy.get('@execCommand').should('have.been.calledWith', 'copy');
      cy.get('[role="status"]').should('have.text', 'Link copied');
      cy.focused().should(
        'have.attr',
        'aria-label',
        'Copy a link to this hand',
      );
    });

    it('should say so when the link could not be copied', () => {
      visitHand(RON_HAND);
      cy.window().then((win) => {
        cy.stub(win.navigator.clipboard, 'writeText').rejects(new Error());
        cy.stub(win.document, 'execCommand').returns(false);
      });
      cy.get('button[aria-label="Copy a link to this hand"]').click();
      cy.get('[role="status"]').should('have.text', "Couldn't copy the link");
    });

    it('should open a hand from a link with .json on the end', () => {
      visitHand(`${RON_HAND}.json`);
      cy.get('button[aria-label="Options"]').click();
      cy.contains('a', 'Report a problem with this hand')
        .should('have.attr', 'href')
        .and('match', new RegExp(`title=Hand\\+${RON_HAND}&`));
    });

    it('should drop the hand from the URL on a new hand', () => {
      visitHand(RON_HAND);
      cy.location('search').should('contain', RON_HAND);
      cy.contains('button', 'New Hand').click();
      cy.location('search').should('eq', '');
    });

    it('should deal a random hand for an ID it does not know', () => {
      visitHand('not-a-hand');
      cy.get('.hand .tile').should('have.length.at.least', 14);
    });
  });
});
