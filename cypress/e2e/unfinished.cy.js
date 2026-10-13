import {
  LIMIT_HAND,
  RON_HAND,
  TSUMO_HAND,
  layOutAsOnAPhone,
  pick,
  turnOnOptions,
  typeInBox,
  visitHand,
} from '../support/app';

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
    typeInBox('points', '2000{enter}');

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
    cy.contains('[role="radio"]', /^5$/)
      .should('have.attr', 'aria-describedby', 'han-missing')
      .and('have.attr', 'aria-labelledby', 'han-5 han-mangan');
    cy.get('#points').should('not.have.attr', 'aria-invalid');
    cy.get('[aria-required="true"]').should('not.exist');
    cy.get('[aria-live="polite"]').should('have.text', '');
  });

  it('should take the player to a box when a box is first', () => {
    visitHand(TSUMO_HAND);
    pick('han', '4');
    pick('fu', '30');
    typeInBox('points', '2000');
    check();

    cy.focused().should('have.id', 'pointsDealer');
    cy.get('#pointsDealer')
      .should('have.attr', 'aria-invalid', 'true')
      .and('have.attr', 'aria-describedby', 'pointsDealer-missing');
    noteIsGone('points');
    cy.get('.quiz-form.checked').should('not.exist');
    cy.contains('.badge', 'Wrong: 0');
    cy.get('[aria-live="polite"]').should('have.text', '');
  });

  it('should say the note when the focus is already on an empty box', () => {
    visitHand(RON_HAND);
    pick('han', '2');
    pick('fu', '60');
    cy.get('#points').focus();
    typeInBox('points', '{enter}');

    cy.focused().should('have.id', 'points');
    cy.get('#points-missing').should('have.text', 'Error: Enter the points.');
    cy.get('[aria-live="polite"]').should(
      'have.text',
      'Error: Enter the points.',
    );

    typeInBox('points', '2');
    noteIsGone('points');
    cy.get('[aria-live="polite"]').should('have.text', '');
  });

  it('should say the note when the box in focus is not a number', () => {
    visitHand(RON_HAND);
    pick('han', '1');
    pick('fu', '60');
    typeInBox('points', '2k');
    cy.get('[aria-live="polite"]').should('have.text', '');
    typeInBox('points', '{enter}');

    cy.focused().should('have.id', 'points');
    cy.get('[aria-live="polite"]').should(
      'have.text',
      'Error: Enter a number.',
    );
    typeInBox('points', '{backspace}');
    cy.get('#points-error').should('not.exist');
    cy.get('[aria-live="polite"]').should('have.text', '');

    typeInBox('points', '000{enter}');
    cy.get('[aria-live="polite"]').should(
      'have.text',
      'Correct. Han: 1, Fu: 60, Points: 2000',
    );
  });

  it('should stop saying a note once the focus moves to another', () => {
    visitHand(TSUMO_HAND);
    pick('han', '4');
    typeInBox('pointsDealer', '3900');
    cy.get('#points').focus();
    typeInBox('points', '{enter}');
    cy.focused().should('have.attr', 'role', 'radio');
    cy.get('[aria-live="polite"]').should('have.text', '');

    pick('fu', '30');
    cy.get('#points').focus();
    typeInBox('points', '{enter}');
    cy.get('[aria-live="polite"]').should(
      'have.text',
      'Error: Enter the points.',
    );

    check();
    cy.focused().should('have.id', 'points');
    cy.get('[aria-live="polite"]').should('have.text', '');
  });

  it('should go on to the next box on enter, with nothing marked', () => {
    visitHand(TSUMO_HAND);
    pick('han', '4');
    pick('fu', '30');
    cy.get('#points')
      .should('have.attr', 'autocomplete', 'off')
      .and('have.attr', 'enterkeyhint', 'next');
    cy.get('#pointsDealer')
      .should('have.attr', 'autocomplete', 'off')
      .and('have.attr', 'enterkeyhint', 'done');

    typeInBox('points', '2000{enter}');
    cy.focused().should('have.id', 'pointsDealer');
    cy.get('.field-error').should('not.exist');
    cy.get('[aria-invalid]').should('not.exist');
    cy.get('.quiz-form.checked').should('not.exist');
    cy.contains('.badge', 'Wrong: 0');

    cy.focused().type('3900');
    cy.get('#points').should('have.attr', 'enterkeyhint', 'done');
    typeInBox('points', '{enter}');
    cy.get('.color-card.green').should('exist');
    cy.contains('.badge', 'Correct: 1');
  });

  it('should turn enter away when more than the next box is left', () => {
    visitHand(TSUMO_HAND);
    pick('han', '4');
    typeInBox('points', '2000{enter}');
    cy.focused()
      .parents('[role="radiogroup"]')
      .should('have.attr', 'aria-labelledby', 'fu-label');
    cy.get('.missing-note').should('have.length', 2);

    visitHand(TSUMO_HAND);
    pick('han', '4');
    pick('fu', '30');
    typeInBox('pointsDealer', '3900{enter}');
    cy.focused().should('have.id', 'points');
    cy.get('#points-missing').should('exist');

    visitHand(TSUMO_HAND);
    pick('han', '4');
    pick('fu', '30');
    typeInBox('pointsDealer', '3k');
    cy.get('#points').should('have.attr', 'enterkeyhint', 'done');
    typeInBox('points', '2000{enter}');
    cy.focused().should('have.id', 'pointsDealer');
    cy.get('#pointsDealer-error').should('exist');
    cy.get('.quiz-form.checked').should('not.exist');
  });

  it('should go on from a typed fu to the points on enter', () => {
    visitHand(RON_HAND);
    turnOnOptions('Exact fu');
    pick('han', '1');
    cy.get('#fu').should('have.attr', 'enterkeyhint', 'next');
    typeInBox('fu', '58{enter}');

    cy.focused().should('have.id', 'points');
    cy.get('.field-error').should('not.exist');
    cy.get('.quiz-form.checked').should('not.exist');
  });

  it('should turn away one tsumo payment without the other, whichever it is', () => {
    visitHand(TSUMO_HAND);
    pick('han', '4');
    pick('fu', '30');
    typeInBox('pointsDealer', '3900');
    check();

    cy.focused().should('have.id', 'points');
    cy.get('#points-missing').should('exist');
    noteIsGone('pointsDealer');
    cy.get('.quiz-form.checked').should('not.exist');
    cy.contains('.badge', 'Wrong: 0');
  });

  it('should ask for a typed exact fu in its own words', () => {
    visitHand(RON_HAND);
    turnOnOptions('Exact fu');
    pick('han', '1');
    typeInBox('points', '2000');
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
    typeInBox('points', '2000');
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
    cy.get('[aria-labelledby="fu-label"] [role="radio"]').should('be.enabled');
    noteIsGone('fu');

    typeInBox('points', '18000');
    check();
    cy.get('#fu-missing').should('exist');
    cy.get('.quiz-form.checked').should('not.exist');
  });

  it('should ask for fu on a limit hand while the han picked is under the limit', () => {
    visitHand(LIMIT_HAND);
    pick('han', '4');
    typeInBox('points', '18000');
    check();

    cy.get('#fu-missing').should('exist');
    cy.get('.quiz-form.checked').should('not.exist');
    cy.contains('.field-note', 'No fu on limit hands').should('not.exist');
  });

  it('should show a blank question and a box that is not a number together', () => {
    visitHand(RON_HAND);
    pick('han', '1');
    typeInBox('points', '2k');
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

    typeInBox('points', '2');
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
    typeInBox('points', '2000');
    check();
    cy.get('.color-card.green').should('exist');
    cy.contains('.badge', 'Correct: 1');
    cy.contains('.badge', 'Wrong: 0');
  });

  it('should start the next hand with no notes', () => {
    visitHand(RON_HAND);
    pick('han', '1');
    check();
    cy.get('#fu-missing').should('exist');

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
              win.sessionStorage.removeItem('mahjong-session');
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
