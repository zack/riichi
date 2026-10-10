import {
  CELEBRATION_INTERVAL,
  DEALER_TSUMO_HAND,
  DORA_HAND,
  LIMIT_HAND,
  NO_URADORA_HAND,
  RON_HAND,
  TSUMO_HAND,
  TWO_HONBA_HAND,
  cardBorderMatchesTotals,
  isGreen,
  isRed,
  layOutAsOnAPhone,
  pick,
  showYourAnswer,
  typeInBox,
  visitHand,
} from '../support/app';
import { switchToDarkMode } from '../support/options';
import { getPageWidth } from '../support/page';
import { waitForScrollToStop } from '../support/wait';

describe('Wiki links', () => {
  const reveal = () => cy.contains('button', 'Just tell me').click();

  it('should link each han and fu line to its page on the wiki', () => {
    visitHand(RON_HAND);
    reveal();

    cy.get('.answer-panel .wiki-link').should((links) => {
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
    cy.get('.answer-panel .wiki-link').each((link) => {
      cy.wrap(link).should('have.attr', 'target', '_blank');
      cy.wrap(link).should('have.attr', 'rel', 'noopener noreferrer');
      cy.wrap(link).should('contain.text', '(opens the wiki in a new tab)');
    });
    cy.get('.answer-panel > p').should('have.text', 'Links open in a new tab');
    cy.get('.answer-panel .breakdown-label')
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
    cy.get('.answer-panel .breakdown.linked')
      .first()
      .find('.wiki-link')
      .should((links) => {
        const tops = [...links].map((link) => link.getBoundingClientRect().top);
        expect(tops).to.have.length.greaterThan(3);
        tops.slice(1).forEach((top, index) => {
          expect(top - tops[index]).to.be.at.least(24);
        });
      });
  });

  it('should not warn about links when no line has one', () => {
    visitHand(RON_HAND);
    cy.get('button[aria-label="Options"]').click();
    cy.contains('label', /^Han$/).click();
    cy.contains('label', /^Fu$/).click();
    cy.contains('button', 'Close').click();
    reveal();
    cy.get('.answer-panel .breakdown').should('exist');
    cy.get('.wiki-link').should('not.exist');
    cy.get('.answer-panel > p').should('not.exist');
  });

  it('should leave the names as plain text in another language', () => {
    cy.visit(`/?hand=${RON_HAND}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem('mahjong-language', 'ja');
      },
    });
    cy.get('html').should('have.attr', 'lang', 'ja');
    cy.get('button[type="submit"]').click();
    cy.get('.answer-panel .breakdown-label').should(
      'have.length.greaterThan',
      3,
    );
    cy.get('.wiki-link').should('not.exist');
    cy.get('.breakdown.linked').should('not.exist');
    cy.get('.answer-panel > p').should('not.exist');
  });
});

describe('Answer', () => {
  const reveal = () => cy.contains('button', 'Just tell me').click();

  it('should put han and fu side by side on a phone', () => {
    cy.viewport(360, 1400);
    visitHand(RON_HAND);
    cy.document().its('fonts.status').should('equal', 'loaded');
    layOutAsOnAPhone(360);
    reveal();
    cy.get('.answer-key > *').should((sections) => {
      const [han, fu] = [...sections].map((section) =>
        section.getBoundingClientRect(),
      );
      expect(fu.top).to.equal(han.top);
      expect(fu.left - han.right).to.be.at.least(8);
    });
  });

  it('should work out the points once when the dealer pays more', () => {
    visitHand(TSUMO_HAND);
    reveal();
    cy.contains('.answer-key h3', 'Points (from non-dealer): 2000');
    cy.contains('.answer-key h3', 'Points (from dealer): 3900');

    cy.get('.answer-key .breakdown:not(.linked)').should((breakdowns) => {
      expect(breakdowns).to.have.length(1);
      const labels = [
        ...breakdowns[0].querySelectorAll('.breakdown-label'),
      ].map((label) => label.textContent);
      expect(labels).to.deep.equal([
        '',
        '',
        'Basic points:',
        '',
        'Basic points:',
        'Tsumo (non-dealer):',
        'Round up:',
        'Tsumo (dealer):',
        'Round up:',
      ]);
    });
  });

  it('should leave out a yaku that is worth no han', () => {
    visitHand(NO_URADORA_HAND);
    reveal();
    cy.get('.answer-key .breakdown-label').should((labels) => {
      const names = [...labels].map((label) => label.textContent);
      expect(names.some((name) => name.includes('Akadora'))).to.equal(true);
      expect(names.some((name) => name.includes('Uradora'))).to.equal(false);
    });
  });

  it('should work out the points once for everyone else', () => {
    visitHand(DEALER_TSUMO_HAND);
    reveal();
    cy.get('.answer-key h3').should('have.length', 3);
    cy.contains('.answer-key h3', 'Points (from each): 500');
    cy.get('.answer-key .breakdown:not(.linked)').should('have.length', 1);
  });
});

describe('Checking answers', () => {
  it('should mark a right answer as correct', () => {
    visitHand(RON_HAND);
    pick('han', '1');
    pick('fu', '60');
    typeInBox('points', '2000');
    cy.contains('button', 'Check Answer').click();

    cy.get('.color-card.green').should('exist');
    cy.get('.answer-total.correct').should((totals) => {
      expect([...totals].map((total) => total.textContent)).to.deep.equal([
        'Han: 1 ',
        'Fu: 60 ',
        'Points: 2000 ',
      ]);
    });
    cy.get('.answer-total.correct').each((total) => {
      cy.wrap(total).find('.mark').should('have.length', 1);
      cy.wrap(total).find('.correct-mark').should('be.visible');
    });
    cy.get('.answer-total.wrong, .answer-picked').should('not.exist');
    cy.get('.verdict.correct .verdict-label').should('have.text', 'Correct!');
    cy.contains('button', 'Check Answer').should('not.exist');
    cy.contains('.badge', 'Correct: 1');
    cy.contains('.badge', 'Wrong: 0');
    cy.contains('.badge', 'Rate: 100%');
    cy.get('[role="tab"][data-state="active"]').should('have.text', 'Answer');
    cardBorderMatchesTotals('.color-card.green', '.answer-total.correct');
  });

  it('should work the rate out from every hand graded', () => {
    const check = () => cy.contains('button', 'Check Answer').click();

    visitHand(RON_HAND);
    pick('han', '1');
    pick('fu', '60');
    typeInBox('points', '2000');
    check();
    cy.contains('.badge', 'Correct: 1');

    cy.visit(`/?hand=${TSUMO_HAND}`);
    pick('han', '4');
    pick('fu', '30');
    typeInBox('points', '2000');
    typeInBox('pointsDealer', '3900');
    check();
    cy.contains('.badge', 'Correct: 2');

    cy.visit(`/?hand=${LIMIT_HAND}`);
    pick('han', '6');
    typeInBox('points', '1');
    check();
    cy.contains('.badge', 'Wrong: 1');
    cy.contains('.badge', 'Rate: 67%');
  });

  it('should show no rate until a hand has been graded', () => {
    visitHand(RON_HAND);
    cy.get('.badge.rate .no-rate-sizer').should('not.be.visible');
    cy.get('.badge.rate .no-rate > [aria-hidden]:not(.no-rate-sizer)')
      .should('have.text', '–')
      .and('be.visible');
    cy.get('.badge.rate .visually-hidden').should('have.text', 'none yet');

    cy.document().its('fonts.status').should('equal', 'loaded');
    cy.get('.badge.rate').then((badge) => {
      const widthWithNoRate = badge[0].getBoundingClientRect().width;

      cy.contains('button', 'Just tell me').click();
      cy.get('.verdict.revealed').should('exist');
      cy.get('.badge.rate .no-rate').should('exist');

      visitHand(RON_HAND);
      pick('han', '2');
      pick('fu', '60');
      typeInBox('points', '2000');
      cy.contains('button', 'Check Answer').click();
      cy.document().its('fonts.status').should('equal', 'loaded');
      cy.get('.badge.rate')
        .should('have.text', 'Rate: 0%')
        .and((graded) => {
          expect(graded[0].getBoundingClientRect().width).to.equal(
            widthWithNoRate,
          );
        });
    });
  });

  it('should mark a wrong answer as wrong and show the right one', () => {
    visitHand(RON_HAND);
    pick('han', '2');
    pick('fu', '60');
    typeInBox('points', '2000');
    cy.contains('button', 'Check Answer').click();

    cy.get('.color-card.red').should('exist');
    cy.contains('button', 'Check Answer').should('not.exist');
    cy.contains('.badge', 'Correct: 0');
    cy.contains('.badge', 'Wrong: 1');
    cy.get('.verdict.wrong .verdict-label').should('have.text', 'Wrong');
    cy.contains('.answer-total', 'Han: 1')
      .should('have.text', 'Han: 1')
      .and('not.have.class', 'wrong')
      .and('not.have.class', 'correct')
      .and((total) => {
        const section = total[0].parentElement;
        expect(getComputedStyle(total[0]).color).to.equal(
          getComputedStyle(section).color,
        );
      });
    cy.contains('.answer-total', 'Han: 1').find('.mark').should('not.exist');
    cy.contains('.answer-total', 'Han: 1')
      .next()
      .should('have.class', 'answer-picked')
      .and('have.text', 'You picked 2 ')
      .and((picked) => {
        expect(isRed(getComputedStyle(picked[0]).color)).to.equal(true);
      });
    cy.get('.answer-picked .mark').should('have.length', 1);
    cy.get('.answer-picked .wrong-mark[role="img"]')
      .should('be.visible')
      .and('have.attr', 'aria-label', 'Wrong');
    cy.get('.answer-key .wrong-mark').should('have.length', 1);
    cy.get('.answer-total.correct').should('have.length', 2);
    cardBorderMatchesTotals('.color-card.red', '.answer-picked');

    showYourAnswer();
    cy.get('[role="radio"].wrong').should('have.length', 1);
    cy.get('[role="radio"].wrong').should('contain', '2');
    cy.get('[role="radio"].wrong .visually-hidden').should(
      'have.text',
      'You picked',
    );
    cy.get('[role="radio"] .visually-hidden').should('have.length', 1);
    cy.get('[role="radio"].correct').should('have.length', 2);
  });

  it('should mark a right choice in green and a wrong one in red', () => {
    const COLORED = ['background-color', 'border-top-color', 'color'];

    const choicesHaveTheirColors = () => {
      cy.get('[role="radio"].correct').should((choices) => {
        const style = getComputedStyle(choices[0]);
        COLORED.forEach((property) => {
          expect(isGreen(style.getPropertyValue(property)), property).to.equal(
            true,
          );
        });
      });
      cy.get('[role="radio"].wrong').should((choices) => {
        const style = getComputedStyle(choices[0]);
        COLORED.forEach((property) => {
          expect(isRed(style.getPropertyValue(property)), property).to.equal(
            true,
          );
        });
      });
    };

    visitHand(RON_HAND);
    pick('han', '2');
    pick('fu', '60');
    typeInBox('points', '2000');
    cy.contains('button', 'Check Answer').click();
    showYourAnswer();

    choicesHaveTheirColors();
    switchToDarkMode();
    choicesHaveTheirColors();
  });

  it('should mark wrong points as wrong', () => {
    visitHand(RON_HAND);
    pick('han', '1');
    pick('fu', '60');
    typeInBox('points', '1000');
    cy.contains('button', 'Check Answer').click();
    showYourAnswer();

    cy.contains('.badge', 'Wrong: 1');
    cy.get('.number-input-cell.wrong #points').should('have.value', '1000');
    cy.get('.number-input-cell.wrong .box-mark .mark').should('have.length', 1);
    cy.get('.number-input-cell.wrong .box-mark .wrong-mark').should(
      'be.visible',
    );
    cy.get('#points-verdict').should('have.text', 'Wrong.');
    cy.get('#points-answer').should('have.text', 'Answer: 2000 ');
    cy.get('#points-answer .mark').should('have.length', 1);
    cy.get('#points-answer .correct-mark').should('be.visible');
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
    typeInBox('points', '2000');
    cy.contains('button', 'Check Answer').click();
    showYourAnswer();

    cy.contains('.badge', 'Wrong: 1');
    cy.get('.number-input-cell.correct #points').should('exist');
    cy.get('.number-input-cell.correct .box-mark .mark').should(
      'have.length',
      1,
    );
    cy.get('.number-input-cell.correct .box-mark .correct-mark').should(
      'be.visible',
    );
    cy.get('#points-verdict').should('have.text', 'Correct.');
    cy.get('#points-answer').should('be.empty');
    cy.get('#points').should('have.attr', 'aria-describedby', 'points-verdict');
  });

  it("should mark each of a tsumo's two payments on its own", () => {
    visitHand(TSUMO_HAND);
    pick('han', '4');
    pick('fu', '30');
    typeInBox('points', '2000');
    typeInBox('pointsDealer', '2000');
    cy.contains('button', 'Check Answer').click();
    showYourAnswer();

    cy.get('.number-input-cell.correct #points').should('exist');
    cy.get('.number-input-cell.wrong #pointsDealer').should('exist');
    cy.get('#points-answer').should('be.empty');
    cy.get('#pointsDealer-answer').should('have.text', 'Answer: 3900 ');
    cy.get('#pointsDealer-answer .mark').should('have.length', 1);
    cy.get('#pointsDealer-answer .correct-mark').should('be.visible');
  });

  it('should not move anything when the boxes are marked', () => {
    visitHand(TSUMO_HAND);
    pick('han', '4');
    pick('fu', '30');
    typeInBox('points', '2000');
    typeInBox('pointsDealer', '2000');
    cy.get('.quiz-fields').then((fields) => {
      const before = fields[0].getBoundingClientRect().height;
      cy.contains('button', 'Check Answer').click();
      showYourAnswer();
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
    typeInBox('points', '2000');
    typeInBox('pointsDealer', '3900');
    cy.contains('button', 'Check Answer').click();

    cy.contains('.badge', 'Correct: 1');
  });

  it('should ask a dealer tsumo for what each player pays', () => {
    visitHand(DEALER_TSUMO_HAND);
    cy.get('label[for="points"]').should('have.text', 'Points (from each)');
    cy.get('#pointsDealer').should('not.exist');
    pick('han', '1');
    pick('fu', '30');
    typeInBox('points', '500');
    cy.contains('button', 'Check Answer').click();

    cy.contains('.badge', 'Correct: 1');
  });

  it('should lock the answers once they are checked', () => {
    visitHand(RON_HAND);
    pick('han', '1');
    pick('fu', '60');
    typeInBox('points', '2000');
    cy.get('#answers-locked').should('not.exist');
    cy.get('[role="radiogroup"]')
      .should('have.length', 2)
      .and('not.have.attr', 'aria-describedby');
    cy.contains('button', 'Check Answer').click();
    showYourAnswer();

    cy.get('[role="radio"]').should('not.be.disabled');
    cy.get('[role="radiogroup"]').should('have.attr', 'aria-readonly', 'true');
    cy.get('[role="radiogroup"]')
      .should('have.length', 2)
      .and('have.attr', 'aria-describedby', 'answers-locked');
    cy.get('#answers-locked')
      .should('have.length', 1)
      .and('have.class', 'visually-hidden')
      .and('have.text', "This hand is checked. Answers can't be changed.");
    pick('han', '2');
    cy.get('[aria-labelledby="han-label"] [data-state="checked"]').should(
      'have.text',
      '1',
    );
    cy.get('[aria-labelledby="han-label"] [data-state="checked"] .mark').should(
      'have.length',
      1,
    );
    cy.get(
      '[aria-labelledby="han-label"] [data-state="checked"] .correct-mark',
    ).should('be.visible');
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
    typeInBox('points', '2000{enter}');
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

  it('should not deal the next hand on a key that is held down', () => {
    visitHand(RON_HAND);
    cy.get('button[type="submit"]').click();
    cy.focused().should('have.text', 'New Hand');

    cy.window().then((win) => {
      const button = win.document.querySelector('.new-hand-button');
      const keyIsLeftAlone = (key, repeat) =>
        button.dispatchEvent(
          new win.KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key,
            repeat,
          }),
        );

      expect(keyIsLeftAlone('Enter', true)).to.equal(false);
      expect(keyIsLeftAlone(' ', true)).to.equal(false);
      expect(keyIsLeftAlone('Enter', false)).to.equal(true);
      expect(keyIsLeftAlone(' ', false)).to.equal(true);
      expect(keyIsLeftAlone('Tab', true)).to.equal(true);
    });
  });
});

describe('Hand and answer together', () => {
  const SHORT_ANSWER_HAND = '2011010102gm-00a9-0000-b7230caf6';

  const getPlaces = () =>
    cy.window().then((win) => {
      const doc = win.document;
      const card = doc.querySelector('.quiz-form').closest('section');
      const button = doc.querySelector('.new-hand-button');

      return {
        cardBottom: card.getBoundingClientRect().bottom,
        cardHeight: card.getBoundingClientRect().height,
        handTop: doc.querySelector('.hand-card').getBoundingClientRect().top,
        newHandTop:
          button.getBoundingClientRect().top - card.getBoundingClientRect().top,
        screenHeight: win.innerHeight,
      };
    });

  const check = () => {
    cy.scrollTo('top', { ensureScrollable: false });
    cy.get('button[type="submit"]').then((button) => {
      button[0].click();
    });
    cy.get('.answer-key').should('exist');
    waitForScrollToStop();
  };

  it('should get there in one go for someone who asked for less motion', () => {
    cy.viewport(360, 740);
    cy.visit(`/?hand=${SHORT_ANSWER_HAND}`, {
      onBeforeLoad(win) {
        const matchMedia = win.matchMedia.bind(win);
        win.sessionStorage.removeItem('mahjong-session');
        win.matchMedia = (query) =>
          query.includes('prefers-reduced-motion')
            ? matchMedia('all')
            : matchMedia(query);
      },
    });
    pick('han', '2');
    pick('fu', '30');
    typeInBox('points', '2900');
    cy.scrollTo('top', { ensureScrollable: false });
    cy.window().then((win) => {
      cy.spy(win, 'scrollTo').as('scrollTo');
    });
    cy.get('button[type="submit"]').then((button) => {
      button[0].click();
    });
    cy.get('.answer-key').should('exist');
    waitForScrollToStop();

    cy.window().its('scrollY').should('be.greaterThan', 0);
    cy.get('@scrollTo').should('have.been.calledOnce');
  });

  it('should put the hand and the whole answer on the screen', () => {
    cy.viewport(360, 740);
    visitHand(SHORT_ANSWER_HAND);
    pick('han', '2');
    pick('fu', '30');
    typeInBox('points', '2900');
    check();
    getPlaces().should((places) => {
      expect(places.handTop).to.be.at.least(0);
      expect(places.cardBottom).to.be.at.most(places.screenHeight);
    });
  });

  it('should leave the new hand button where it was under a short answer', () => {
    cy.viewport(360, 740);
    visitHand(SHORT_ANSWER_HAND);
    pick('han', '2');
    pick('fu', '30');
    typeInBox('points', '2900');
    getPlaces().then((before) => {
      check();
      getPlaces().should((after) => {
        expect(after.cardHeight).to.be.closeTo(before.cardHeight, 0.5);
        expect(after.newHandTop).to.be.closeTo(before.newHandTop, 0.5);
      });
    });
  });

  it('should not hold the card open when that would push the hand off', () => {
    cy.viewport(360, 740);
    visitHand(TWO_HONBA_HAND);
    pick('han', '6');
    typeInBox('points', '3000');
    typeInBox('pointsDealer', '6000');
    getPlaces().then((before) => {
      check();
      getPlaces().should((after) => {
        expect(after.cardHeight).to.be.below(before.cardHeight);
        expect(after.handTop).to.be.at.least(0);
        expect(after.cardBottom).to.be.at.most(after.screenHeight);
      });
    });
  });

  it('should open on the answer, with the questions a tab away', () => {
    visitHand(RON_HAND);
    pick('han', '2');
    pick('fu', '60');
    typeInBox('points', '2000');
    cy.contains('button', 'Check Answer').click();

    cy.get('[role="tab"]').should((tabs) => {
      expect([...tabs].map((tab) => tab.textContent)).to.deep.equal([
        'Answer',
        'Your Answer',
      ]);
    });
    cy.get('[role="tab"][data-state="active"]').should('have.text', 'Answer');
    cy.get('.answer-key').should('be.visible');
    cy.get('.quiz-fields').should('not.exist');
    cy.focused().should('have.text', 'New Hand');

    showYourAnswer();
    cy.get('.quiz-fields').should('be.visible');
    cy.get('.answer-key').should('not.exist');
    cy.focused().type('{leftArrow}');
    cy.focused().should('have.text', 'Answer');
    cy.get('.answer-key').should('be.visible');
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
        cy.get('#fu-missing').should('exist');
        look();
        pick('fu', '60');
        typeInBox('points', '2000');
        cy.get('button[type="submit"]').click();
        cy.get('.color-card.red').should('exist');
        look();

        visitIn(language, width);
        pick('han', '1');
        pick('fu', '60');
        typeInBox('points', '2000');
        cy.get('button[type="submit"]').click();
        cy.get('.color-card.green').should('exist');
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

  [320, 360, 1280].forEach((width) => {
    it(`should show New Hand alone, in its own place, with nothing to ask at ${width}px`, () => {
      cy.viewport(width, 2400);
      const getBox = (button) => {
        const box = button.getBoundingClientRect();
        return `${box.left} ${box.width} ${box.height}`;
      };

      cy.visit(`/?hand=${RON_HAND}`, {
        onBeforeLoad(win) {
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
      cy.document().its('fonts.status').should('equal', 'loaded');
      layOutAsOnAPhone(width);

      cy.get('.quiz-form p').should(
        'have.text',
        'Nothing to ask. Turn on Han, Fu or Points in Options.',
      );
      cy.get('.quiz-form p svg').should('be.visible');
      cy.get('.quiz-fields').should('not.exist');
      cy.get('.quiz-form button').should('have.length', 1);
      cy.document().should((doc) => {
        expect(doc.documentElement.scrollWidth).to.equal(width);
      });

      const switchPoints = () => {
        cy.get('button[aria-label="Options"]').click();
        cy.get('[role="dialog"]').contains('h1', /^Options$/);
        ['Han', 'Fu', 'Points'].forEach((name) => {
          cy.get('[role="dialog"]').contains('label', new RegExp(`^${name}$`));
        });
        cy.get('[role="dialog"]')
          .contains('label', /^Points$/)
          .click();
        cy.contains('button', 'Close').click();
      };

      switchPoints();
      cy.get('button[type="submit"]').should('have.text', 'Just tell me');
      cy.get('.new-hand-button').then((newHand) => {
        const boxBesideCheck = getBox(newHand[0]);
        expect(
          newHand[0].previousElementSibling.getBoundingClientRect().right,
        ).to.be.below(newHand[0].getBoundingClientRect().left);

        switchPoints();
        cy.get('.quiz-form button').should('have.length', 1);
        cy.get('.new-hand-button').should((button) => {
          expect(getBox(button[0])).to.equal(boxBesideCheck);
        });
      });
    });
  });

  it('should fill the button that is the next thing to press', () => {
    const isFilled = (button) =>
      !/^rgba\(|\/ 0/.test(getComputedStyle(button[0]).backgroundColor);

    visitHand(RON_HAND);
    cy.contains('button', 'Just tell me').should((button) => {
      expect(isFilled(button)).to.equal(true);
    });
    cy.contains('button', 'New Hand').should((button) => {
      expect(isFilled(button)).to.equal(false);
    });
    pick('han', '2');
    cy.contains('button', 'Check Answer').should((button) => {
      expect(isFilled(button)).to.equal(true);
    });
    cy.contains('button', 'New Hand').should((button) => {
      expect(isFilled(button)).to.equal(false);
    });

    pick('fu', '60');
    typeInBox('points', '2000');
    cy.contains('button', 'Check Answer').click();
    cy.get('.color-card.red').should('exist');
    cy.contains('button', 'New Hand').should((button) => {
      expect(isFilled(button)).to.equal(true);
    });
  });

  it('should not move sideways when the page starts to scroll', () => {
    cy.viewport(1280, 2400);
    visitHand(RON_HAND);
    cy.document().its('fonts.status').should('equal', 'loaded');
    cy.get('.app').then((app) => {
      cy.viewport(1280, Math.ceil(app[0].getBoundingClientRect().height));
    });
    cy.document().should((doc) => {
      expect(doc.documentElement.scrollHeight).to.equal(
        doc.documentElement.clientHeight,
      );
    });
    getActionBoxes().then((before) => {
      pick('han', '1');
      pick('fu', '60');
      typeInBox('points', '2000');
      cy.get('button[type="submit"]').click();
      showYourAnswer();
      cy.document().should((doc) => {
        expect(doc.documentElement.scrollHeight).to.be.above(
          doc.documentElement.clientHeight,
        );
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
      typeInBox('points', '500');
      typeInBox('pointsDealer', '1000');
      cy.get('button[type="submit"]').click();
      cy.get('.color-card.green').should('exist');
    };

    visitHand(FIRST_HAND);
    rigTheWindow();

    for (let count = 1; count < CELEBRATION_INTERVAL; count++) {
      answerCorrectly();
      cy.contains('.badge', `Correct: ${count}`).then((badge) => {
        expect(badge).not.to.have.class('celebrating');
      });
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

    cy.contains('.badge', 'Correct: 0');
    cy.contains('.badge', 'Wrong: 0');
    cy.get('.verdict.revealed .verdict-label').should('have.text', 'Shown');
    cy.contains('.color-card.orange h2', 'Answer').should('be.visible');
    cy.get('[role="tab"]').should('not.exist');
    cy.get('.quiz-fields').should('not.exist');
    cy.get('.answer-total').should('have.length', 3);
    cy.get('.answer-total.correct, .answer-total.wrong').should('not.exist');
  });

  it('should not reveal anything once a question is answered', () => {
    visitHand(RON_HAND);
    pick('han', '1');
    cy.get('button[type="submit"]').should('have.text', 'Check Answer');
    cy.get('button[type="submit"]').click();

    cy.get('#fu-missing').should('exist');
    cy.get('.quiz-form.checked').should('not.exist');
    cy.get('[role="radio"].correct').should('not.exist');
    cy.get('.real-answer').should('have.text', '');
    cy.get('.answer-key').should('not.exist');
    cy.contains('.badge', 'Correct: 0');
    cy.contains('.badge', 'Wrong: 0');
  });
});

describe('Skipping fu on limit hands', () => {
  const fuChoices = () => cy.get('[aria-labelledby="fu-label"] [role="radio"]');
  const fuShouldBePicked = (fu) =>
    cy
      .contains(
        '[aria-labelledby="fu-label"] [role="radio"]',
        new RegExp(`^${fu}$`),
      )
      .should('have.attr', 'aria-checked', 'true');
  const fuShouldNotBePicked = (fu) =>
    cy
      .contains(
        '[aria-labelledby="fu-label"] [role="radio"]',
        new RegExp(`^${fu}$`),
      )
      .should('have.attr', 'aria-checked', 'false');
  const toggleOption = (name) => {
    cy.get('button[aria-label="Options"]').click();
    cy.get('[role="dialog"]')
      .contains('label', new RegExp(`^${name}$`))
      .click();
    cy.contains('button', 'Close').click();
    cy.get('[role="dialog"]').should('not.exist');
  };

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

    pick('han', '4');
    fuChoices().should('be.enabled');
    cy.get('#fu-note').should('not.exist');
    cy.contains('[role="radio"]', /^40$/).should(
      'have.attr',
      'aria-checked',
      'true',
    );
  });

  it('should hide a typed exact fu while a limit hand is picked', () => {
    visitHand(RON_HAND);
    cy.get('button[aria-label="Options"]').click();
    cy.get('[role="dialog"]').contains('label', 'Exact fu').click();
    cy.contains('button', 'Close').click();
    typeInBox('fu', '40');
    pick('han', '5');
    cy.get('#fu').should('be.disabled').and('have.value', '');

    pick('han', '4');
    cy.get('#fu').should('be.enabled').and('have.value', '40');
  });

  it('should leave a fu that was hidden by a limit han out of the check', () => {
    visitHand(RON_HAND);
    pick('fu', '40');
    pick('han', '5');
    typeInBox('points', '2000');
    cy.contains('button', 'Check Answer').click();

    cy.get('[role="status"]').should(
      'have.text',
      'Wrong. Han: 1, You picked 5. Fu: 60, You picked a limit hand. Points: 2000, Correct',
    );
    cy.contains('[role="tab"]', 'Your Answer').click();
    cy.contains('[role="radio"]', /^40$/)
      .should('have.attr', 'aria-checked', 'false')
      .and('not.have.class', 'wrong');
  });

  it('should hide fu when the option switches it off, and bring it back after', () => {
    visitHand(RON_HAND);
    toggleOption('Skip fu on limit hands');
    pick('han', '6');
    pick('fu', '40');
    fuShouldBePicked('40');

    toggleOption('Skip fu on limit hands');
    fuChoices().should('be.disabled');
    fuShouldNotBePicked('40');

    toggleOption('Skip fu on limit hands');
    fuChoices().should('be.enabled');
    fuShouldBePicked('40');
  });

  it('should leave a fu that was hidden by the option out of the check', () => {
    visitHand(LIMIT_HAND);
    toggleOption('Skip fu on limit hands');
    pick('han', '6');
    pick('fu', '70');
    toggleOption('Skip fu on limit hands');
    typeInBox('points', '18000');
    cy.contains('button', 'Check Answer').click();

    cy.contains('.badge', 'Correct: 1');
    showYourAnswer();
    cy.get('[role="radio"].wrong').should('not.exist');
    fuShouldNotBePicked('70');
  });

  it('should bring the fu back when the fu question is switched off and on again', () => {
    visitHand(RON_HAND);
    pick('fu', '40');
    toggleOption('Fu');
    cy.get('[aria-labelledby="fu-label"]').should('not.exist');

    toggleOption('Fu');
    fuShouldBePicked('40');
  });

  it('should leave a fu out of the check while the fu question is switched off', () => {
    visitHand(RON_HAND);
    pick('fu', '40');
    toggleOption('Fu');
    pick('han', '1');
    typeInBox('points', '2000');
    cy.contains('button', 'Check Answer').click();

    cy.contains('.badge', 'Correct: 1');
    cy.get('[role="status"]').should(
      'have.text',
      'Correct. Han: 1, Points: 2000',
    );
  });

  it('should leave fu out of the result while it is switched off', () => {
    visitHand(LIMIT_HAND);
    pick('fu', '70');
    pick('han', '6');
    typeInBox('points', '18000');
    cy.contains('button', 'Check Answer').click();
    showYourAnswer();

    cy.contains('.badge', 'Correct: 1');
    cy.get('[role="radio"].wrong').should('not.exist');
    cy.get('.field-note')
      .filter(':contains("limit hands")')
      .should('have.length', 1);
  });

  it('should keep asking for fu after it was switched off and left blank', () => {
    visitHand(LIMIT_HAND);
    pick('han', '6');
    typeInBox('points', '18000');
    cy.contains('button', 'Check Answer').click();
    cy.contains('.badge', 'Correct: 1');

    cy.contains('button', 'New Hand').click();
    cy.get('[aria-labelledby="fu-label"]').should('exist');
  });

  it('should name both han and fu while neither is asked', () => {
    visitHand(LIMIT_HAND);
    cy.get('button[aria-label="Options"]').click();
    cy.contains('label', /^Han$/).click();
    cy.contains('label', /^Fu$/).click();
    cy.get('#ignoreFuOnLimit-note').should(
      'have.text',
      'Unavailable while Han and Fu are off.',
    );
    cy.get('#exactFu-note').should('have.text', 'Unavailable while Fu is off.');

    cy.contains('label', /^Han$/).click();
    cy.get('#ignoreFuOnLimit-note').should(
      'have.text',
      'Unavailable while Fu is off.',
    );
  });

  it('should be switched off, and keep its tick, while han is not asked', () => {
    const ignoreFu = () =>
      cy.contains('label', 'Skip fu on limit hands').find('[role="checkbox"]');

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
    ignoreFu().should('have.attr', 'aria-describedby', 'ignoreFuOnLimit-note');

    ignoreFu().click();
    ignoreFu().should('have.attr', 'aria-checked', 'true');
    cy.contains('button', 'Close').click();

    fuChoices().should('be.enabled');
    cy.get('#fu-note').should('not.exist');
    pick('fu', '70');
    typeInBox('points', '18000');
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
    typeInBox('points', '18000');
    cy.contains('button', 'Check Answer').click();

    cy.contains('.badge', 'Wrong: 1');
    cy.get('[role="status"]').should('contain', 'Fu: No fu on limit hands');
    cy.get('.answer-key').should('not.contain', 'Fu:');
    cy.get('.answer-picked').should('have.text', 'You picked 4 han 70 fu ');
    showYourAnswer();
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
      'fu-no-answer answers-locked',
    );
  });

  it('should put no mark on an exact fu box that a limit han switched off', () => {
    visitHand(LIMIT_HAND);
    toggleOption('Exact fu');
    pick('han', '6');
    typeInBox('points', '18000');
    cy.contains('button', 'Check Answer').click();

    cy.contains('.badge', 'Correct: 1');
    showYourAnswer();
    cy.get('#fu')
      .parents('.number-input-cell')
      .should('not.have.class', 'correct')
      .and('not.have.class', 'wrong');
    cy.get('.number-input-cell.wrong').should('not.exist');
    cy.get('.number-input-cell.correct #points').should('exist');
  });

  it('should mark a typed exact fu wrong on a limit hand', () => {
    visitHand(LIMIT_HAND);
    cy.get('button[aria-label="Options"]').click();
    cy.get('[role="dialog"]').contains('label', 'Exact fu').click();
    cy.contains('button', 'Close').click();
    pick('han', '4');
    typeInBox('fu', '40');
    typeInBox('points', '18000');
    cy.contains('button', 'Check Answer').click();

    cy.contains('.badge', 'Wrong: 1');
    cy.get('.answer-key').should('not.contain', 'Exact fu');
    cy.get('.answer-picked').should('have.text', 'You picked 4 han 40 fu ');
    showYourAnswer();
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
  });

  it('should keep the note about a typed exact fu inside a narrow phone', () => {
    cy.viewport(320, 640);
    visitHand(LIMIT_HAND);
    cy.get('button[aria-label="Options"]').click();
    cy.get('[role="dialog"]').contains('label', 'Exact fu').click();
    cy.contains('button', 'Close').click();
    pick('han', '4');
    typeInBox('fu', '40');
    typeInBox('points', '18000');
    cy.contains('button', 'Check Answer').click();
    showYourAnswer();

    cy.get('#fu-no-answer').should('be.visible');
    cy.document().then((doc) => {
      expect(doc.documentElement.scrollWidth).to.equal(getPageWidth(doc));
    });
  });

  it('should not select a fu or show its breakdown when fu is left blank', () => {
    visitHand(LIMIT_HAND);
    pick('han', '6');
    typeInBox('points', '18000');
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
    typeInBox('points', '2000');
    cy.contains('button', 'Check Answer').click();
    showYourAnswer();

    cy.contains('.badge', 'Wrong: 1');
    cy.get('[role="radio"].wrong').should('contain', '40');
  });

  it('should mark fu wrong when a limit hand was picked for a hand under the limit', () => {
    visitHand(RON_HAND);
    pick('han', '5');
    typeInBox('points', '2000');
    cy.contains('button', 'Check Answer').click();

    cy.contains('.badge', 'Wrong: 1');
    cy.contains('.answer-total', 'Fu: 60')
      .should('not.have.class', 'correct')
      .next('.answer-picked')
      .should('have.text', 'You picked a limit hand ')
      .find('.wrong-mark')
      .should('be.visible');
    cy.get('[role="status"]').should(
      'contain',
      'Fu: 60, You picked a limit hand',
    );
  });
});
