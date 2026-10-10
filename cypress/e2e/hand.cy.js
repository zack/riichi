import {
  ADDED_KAN_HAND,
  CROWDED_INFO_HAND,
  EIGHT_HONBA_HAND,
  FOUR_CALLS_HAND,
  KAN_BY_WIN_HAND,
  LONG_SUIT_HAND,
  NO_CALLS_HAND,
  RED_FIVE_HAND,
  RON_HAND,
  RON_HAND_TILE_COUNT,
  THREE_HONBA_HAND,
  TSUMO_HAND,
  TWO_HONBA_HAND,
  TWO_URADORA_HAND,
  getInfoLabels,
  layOutAsOnAPhone,
  openHelp,
  turnOnOptions,
  visitHand,
} from '../support/app';
import { switchToDarkMode } from '../support/options';
import { getPageWidth } from '../support/page';

describe('Riichi', () => {
  it('should render the app correctly', () => {
    visitHand(RON_HAND);
    cy.get('h1').contains('Riichi Scoring Trainer');
    cy.get('.hand .tile').should('have.length', 15);
    cy.get('.win-type').should('contain', 'Ron!');
  });

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

  it('should give the sticks the edge that the tiles have in high contrast', () => {
    visitHand(TWO_HONBA_HAND);
    turnOnOptions('Honba sticks', 'High contrast');
    cy.get('html').should('have.class', 'high-contrast');
    cy.get('.info .tile').then((tiles) => {
      const edge = getComputedStyle(tiles[0]).borderTopColor;

      cy.get('.honba-sticks rect').should('have.css', 'stroke', edge);
      cy.get('.riichi-stick rect').should('have.css', 'stroke', edge);
    });
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

  it('should leave three sticks to be counted, as it does two', () => {
    visitHand(THREE_HONBA_HAND);
    turnOnOptions('Honba sticks');
    cy.get('.honba-sticks rect').should('have.length', 3);
    cy.get('.honba .tile-label').should('not.exist');

    turnOnOptions('Names on tiles');
    cy.get('.honba .tile-label').should('have.text', '');
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
        expect(child.getBoundingClientRect().right).to.be.at.most(right + 0.5);
      });
    });
    cy.document().should((doc) => {
      expect(doc.documentElement.scrollWidth).to.be.at.most(getPageWidth(doc));
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

  [
    ['ja', ['ドラ 表示牌', '裏ドラ 表示牌']],
    ['zh_cn', ['宝牌 指示牌', '里宝牌 指示牌']],
  ].forEach(([language, labels]) => {
    it(`should break the ${language} labels between their words`, () => {
      cy.viewport(360, 740);
      cy.visit(`/?hand=${TWO_URADORA_HAND}`, {
        onBeforeLoad: (win) => {
          win.localStorage.setItem('mahjong-language', language);
        },
      });

      labels.forEach((label) => {
        getInfoLabels().should('include', label);
      });
      cy.get('.info-group-end .info-label-line').should((lines) => {
        expect(lines).to.have.length(4);
        for (const line of lines) {
          const lineHeight = parseFloat(getComputedStyle(line).lineHeight);
          expect(line.getBoundingClientRect().height).to.be.below(
            lineHeight * 1.5,
          );
        }
      });

      cy.get('.bigger-hand-button').click();
      cy.get('.bigger-hand-info dt').should((terms) => {
        for (const term of terms) {
          const lineHeight = parseFloat(getComputedStyle(term).lineHeight);
          expect(term.getBoundingClientRect().height).to.be.below(
            lineHeight * 1.5,
          );
        }
      });
    });
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

      [NO_CALLS_HAND, FOUR_CALLS_HAND, ADDED_KAN_HAND, KAN_BY_WIN_HAND].forEach(
        (handId) => {
          visitHand(handId);
          cy.get('.hand .tile img').should('be.visible');
          cy.document().its('fonts.status').should('equal', 'loaded');
          layOutAsOnAPhone(width);
          cy.get('.hand-card').then((card) => {
            heights.push(card[0].getBoundingClientRect().height);
          });
        },
      );

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
    // These are far down a scrolling dialog, where Cypress' idea of visible is
    // flaky. Just check that each one loaded and isn't hidden.
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
    cy.contains('button', 'See the tiles bigger').click();

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

  it('should head one meld as one', () => {
    visitHand(THREE_HONBA_HAND);
    cy.contains('button', 'See the tiles bigger').click();
    cy.get('[role="dialog"] h2').then((headings) => {
      expect([...headings].map((heading) => heading.textContent)).to.include(
        'Meld',
      );
    });
  });

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

  it('should show the riichi stick and the honba sticks of a hand that has them', () => {
    visitHand(TWO_HONBA_HAND);
    turnOnOptions('Honba sticks');
    cy.get('.bigger-hand-button').click();

    cy.get('.bigger-hand-info').within(() => {
      cy.contains('dt', 'Honba sticks');
      cy.get('.honba-sticks').should('have.attr', 'aria-label', '2');
      cy.contains('.bigger-hand-riichi', 'Riichi!');
      cy.get('.riichi-stick').should('be.visible');
    });
  });

  it('should leave the sticks out when there are none to show', () => {
    visitHand(TWO_HONBA_HAND);
    cy.get('.bigger-hand-button').click();
    cy.get('.bigger-hand-info .riichi-stick').should('exist');
    cy.get('.bigger-hand-info .honba-sticks').should('not.exist');
    cy.get('body').type('{esc}');

    visitHand(RON_HAND);
    cy.get('.bigger-hand-button').click();
    cy.get('.bigger-hand-info').should('exist');
    cy.get('.bigger-hand-info .riichi-stick').should('not.exist');
  });

  it('should keep the sticks on one row and the indicators on another', () => {
    cy.viewport(360, 900);
    visitHand(TWO_HONBA_HAND);
    turnOnOptions('Honba sticks');
    cy.get('.bigger-hand-button').click();

    const getTop = (item) => Math.round(item.getBoundingClientRect().top);
    cy.get('.bigger-hand-info-group').should((groups) => {
      const [winds, sticks, indicators] = [...groups].map((group) =>
        [...group.querySelectorAll('.bigger-hand-info-item')].map(getTop),
      );

      expect(winds).to.have.length(2);
      expect(sticks).to.have.length(2);
      expect(sticks[0]).to.equal(sticks[1]);
      expect(indicators).to.have.length(2);
      expect(indicators[0]).to.equal(indicators[1]);
      expect(indicators[0]).to.be.above(sticks[0]);
    });
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

  it('should name a red five as a 5', () => {
    visitHand(RED_FIVE_HAND);
    turnOnOptions('Names on tiles');
    cy.get('.hand .tile-cell:has(img[alt="red 5 man"]) .tile-label').should(
      'have.text',
      '5',
    );
  });

  it('should put the names on the tiles when there is room', () => {
    cy.viewport(360, 740);
    visitHand(RON_HAND);
    cy.get('button[aria-label="Options"]').click();
    cy.contains('label', 'Names on tiles').click();
    cy.contains('button', 'Close').click();

    cy.get('.hand-card.names-on-tiles').should('exist');
    cy.get('.hand .tile-cell:has(.tile-label:not(:empty))').should((cells) => {
      expect(cells).to.have.length.greaterThan(0);
      [...cells].forEach((cell) => {
        const tile = cell.querySelector('.tile').getBoundingClientRect();
        const tab = cell.querySelector('.tile-label').getBoundingClientRect();
        expect(tab.top).to.be.at.least(tile.top);
        expect(tab.bottom).to.be.at.most(tile.bottom);
        expect(tab.right).to.be.at.most(tile.right);
      });
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
