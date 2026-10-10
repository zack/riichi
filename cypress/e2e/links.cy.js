import {
  ADDED_KAN_HAND,
  RED_FIVE_HAND,
  RON_HAND,
  TSUMO_HAND,
  dealTheFirstHandNext,
  layOutAsOnAPhone,
  pick,
  turnOnOptions,
  typeInBox,
  visitHand,
} from '../support/app';

describe('Hand links', () => {
  it('should leave the skip link out of a copied link', () => {
    visitHand(RON_HAND);
    cy.get('.skip-link').focus();
    cy.focused().click();
    cy.location('hash').should('equal', '#main');

    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').as('copy').resolves();
    });
    cy.get('button[aria-label="Copy a link to this hand"]').click();
    cy.get('@copy').should((copy) => {
      const url = new URL(copy.firstCall.args[0]);
      expect(url.hash).to.equal('');
      expect(url.searchParams.get('hand')).to.equal(RON_HAND);
    });
  });

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

    dealTheFirstHandNext();
    cy.contains('button', 'New Hand').click();
    cy.location('search').should('contain', RED_FIVE_HAND);
    cy.get('button[aria-label="Copy a link to this hand"]').click();
    cy.get('@copy').should((copy) => {
      const url = new URL(copy.secondCall.args[0]);
      expect(url.searchParams.get('hand')).to.equal(RED_FIVE_HAND);
    });
    cy.get('@copy').then((copy) => {
      cy.location('href').should('eq', copy.secondCall.args[0]);
    });
  });

  it('should say that the link was copied every time it is', () => {
    visitHand(RON_HAND);
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').resolves();
    });
    cy.get('button[aria-label="Copy a link to this hand"]').click();
    cy.get('[role="status"]').should('have.text', 'Link copied');

    cy.get('[role="status"]').should('have.text', '');
    cy.get('button[aria-label="Copy a link to this hand"]').click();
    cy.get('[role="status"]').should('have.text', 'Link copied');
  });

  it('should leave the result of a check alone when the tick goes', () => {
    visitHand(RON_HAND);
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').resolves();
    });
    cy.get('button[aria-label="Copy a link to this hand"]').click();
    cy.get('[role="status"]').should('have.text', 'Link copied');
    cy.get('button[type="submit"]').click();
    cy.get('[role="status"]').should('contain', 'Han: 1');
    cy.get('.hand-link polyline').should('not.exist');
    cy.get('[role="status"]').should('contain', 'Han: 1');
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
    cy.focused().should('have.attr', 'aria-label', 'Copy a link to this hand');
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

  describe('A link that could not be copied', () => {
    const getCopyButton = () =>
      cy.get('button[aria-label="Copy a link to this hand"]');
    const getLinkBox = () => cy.get('[role="dialog"].hand-link-box');

    const failToCopy = () => {
      cy.window().then((win) => {
        cy.stub(win.navigator.clipboard, 'writeText').rejects(new Error());
        cy.stub(win.document, 'execCommand').returns(false);
      });
      getCopyButton().click();
    };

    it('should show the link, selected, for the player to copy by hand', () => {
      visitHand(RON_HAND);
      getLinkBox().should('not.exist');
      failToCopy();

      getLinkBox()
        .should('be.visible')
        .invoke('attr', 'aria-labelledby')
        .then((headingId) => {
          cy.get(`#${headingId}`)
            .should('be.visible')
            .and('have.text', "Couldn't copy the link");
        });
      cy.get('[role="status"]').should('have.text', "Couldn't copy the link");

      cy.contains('.hand-link-box label', 'Link to this hand')
        .should('be.visible')
        .invoke('attr', 'for')
        .then((boxId) => {
          cy.get(`textarea#${boxId}`)
            .should('be.visible')
            .and('be.focused')
            .and('have.attr', 'readonly');
          cy.get(`textarea#${boxId}`).should((boxes) => {
            const [box] = boxes;
            const url = new URL(box.value);

            expect(url.searchParams.get('hand')).to.equal(RON_HAND);
            expect(box.selectionStart).to.equal(0);
            expect(box.selectionEnd).to.equal(box.value.length);
            expect(box.scrollHeight).to.be.at.most(box.clientHeight);
            expect(box.scrollWidth).to.be.at.most(box.clientWidth);
          });
        });

      cy.get('.hand-link polyline').should('not.exist');
    });

    it('should keep the box after the status message has gone', () => {
      visitHand(RON_HAND);
      failToCopy();
      cy.get('[role="status"]').should('have.text', "Couldn't copy the link");
      cy.get('[role="status"]').should('have.text', '');
      getLinkBox().should('be.visible');
    });

    it('should close from its own button and give focus back', () => {
      visitHand(RON_HAND);
      failToCopy();
      cy.contains('.hand-link-box button', 'Close').click();
      getLinkBox().should('not.exist');
      getCopyButton().should('be.focused');
    });

    it('should close on Escape and give focus back', () => {
      visitHand(RON_HAND);
      failToCopy();
      cy.get('.hand-link-box textarea').should('be.focused');
      cy.get('body').type('{esc}');
      getLinkBox().should('not.exist');
      getCopyButton().should('be.focused');
    });

    it('should close on a press anywhere else on the page', () => {
      visitHand(RON_HAND);
      failToCopy();
      getLinkBox().should('be.visible');
      cy.get('.app-title').click();
      getLinkBox().should('not.exist');
    });

    it('should go away on the next hand', () => {
      visitHand(RON_HAND);
      failToCopy();
      getLinkBox().should('be.visible');
      cy.contains('button', 'New Hand').click();
      cy.get('.badge.hand-count').should('contain', '#2');
      getLinkBox().should('not.exist');
      cy.focused().should('have.class', 'hand-card');
    });

    it('should close when focus moves out of it', () => {
      visitHand(RON_HAND);
      failToCopy();
      getLinkBox().should('be.visible');
      cy.contains('button', 'New Hand').focus();
      getLinkBox().should('not.exist');
      cy.contains('button', 'New Hand').should('be.focused');
    });

    it('should go away when a later copy works', () => {
      visitHand(RON_HAND);
      failToCopy();
      getLinkBox().should('be.visible');
      cy.document().then((doc) => {
        doc.execCommand.returns(true);
      });
      getCopyButton().click();
      getLinkBox().should('not.exist');
      cy.get('.hand-link polyline').should('exist');
    });

    [320, 360, 1280].forEach((width) => {
      it(`should fit on a page ${width}px wide without moving the counters`, () => {
        // Rounded because Firefox's numbers are little off
        const getBoxes = (doc) =>
          [...doc.querySelectorAll('.badge, .hand-card')].map((element) => {
            const box = element.getBoundingClientRect();
            return [
              box.left + doc.defaultView.scrollX,
              box.top + doc.defaultView.scrollY,
              box.width,
              box.height,
            ]
              .map((length) => length.toFixed(1))
              .join(' ');
          });

        cy.viewport(width, 800);
        visitHand(RON_HAND);
        cy.get('.hand .tile').should('exist');
        cy.document().then((doc) => doc.fonts.ready);
        cy.document().then((doc) => {
          const boxesBefore = getBoxes(doc);

          failToCopy();
          getLinkBox().should((boxes) => {
            const { left, right } = boxes[0].getBoundingClientRect();
            const page = doc.documentElement;

            expect(left).to.be.at.least(0);
            expect(right).to.be.at.most(page.clientWidth);
            expect(page.scrollWidth).to.be.at.most(page.clientWidth);
            expect(getBoxes(doc)).to.deep.equal(boxesBefore);
          });
        });
      });
    });
  });

  it('should open a hand from a link with .json on the end', () => {
    visitHand(`${RON_HAND}.json`);
    cy.get('button[aria-label="Options"]').click();
    cy.contains('a', 'Report a problem with this hand')
      .should('have.attr', 'href')
      .and('match', new RegExp(`title=Hand\\+${RON_HAND}&`));
  });

  it('should keep the hand on screen in the URL', () => {
    const getHandParam = () =>
      cy
        .location('search')
        .then((search) => new URLSearchParams(search).get('hand'));

    cy.visit('/');
    cy.location('search').should('match', /^\?hand=\d{10}gm-[\w-]+$/);
    getHandParam().then((firstHand) => {
      cy.contains('button', 'New Hand').click();
      cy.get('.hand-count > span').first().should('contain.text', '#2');
      getHandParam().should('match', /^\d{10}gm-[\w-]+$/);

      getHandParam().then((secondHand) => {
        cy.get('button[aria-label="Options"]').click();
        cy.contains('a', 'Report a problem with this hand')
          .should('have.attr', 'href')
          .and('match', new RegExp(`title=Hand\\+${secondHand}&`));
        expect(firstHand).to.match(/^\d{10}gm-[\w-]+$/);
      });
    });
  });

  it('should go back to the earlier hand on Back, and on to the later one', () => {
    visitHand(RON_HAND);
    pick('han', '1');
    dealTheFirstHandNext();
    cy.contains('button', 'New Hand').click();
    cy.get('.hand-count > span').first().should('contain.text', '#2');
    cy.location('search').should('eq', `?hand=${RED_FIVE_HAND}`);

    cy.location('search').then((laterSearch) => {
      cy.go('back');
      cy.location('search').should('eq', `?hand=${RON_HAND}`);
      cy.get('.hand-count > span').first().should('contain.text', '#1');
      cy.get('.hand .tile').should('have.length', 15);
      cy.get('.win-type').should('contain', 'Ron!');
      cy.get('[role="radio"][aria-checked="true"]').should('not.exist');
      cy.focused().should('have.class', 'hand-card');

      cy.go('forward');
      cy.location('search').should('eq', laterSearch);
      cy.get('.hand-count > span').first().should('contain.text', '#2');
    });
  });

  it('should go back to a checked hand with nothing checked', () => {
    visitHand(RON_HAND);
    cy.get('button[type="submit"]').click();
    cy.contains('.verdict', 'Shown');
    cy.contains('button', 'New Hand').click();
    cy.get('.hand-count > span').first().should('contain.text', '#2');

    cy.go('back');
    cy.get('.verdict').should('not.exist');
    cy.get('button[type="submit"]').should('have.text', 'Just tell me');
    cy.get('[role="status"]').should('have.text', '');
  });

  it('should keep the answers when the skip link is used, and on Back from it', () => {
    visitHand(RON_HAND);
    pick('han', '1');
    cy.get('.skip-link').focus();
    cy.get('.skip-link').click();
    cy.location('hash').should('eq', '#main');
    cy.contains('[role="radio"]', /^1$/).should(
      'have.attr',
      'aria-checked',
      'true',
    );

    cy.go('back');
    cy.location('hash').should('eq', '');
    cy.contains('[role="radio"]', /^1$/).should(
      'have.attr',
      'aria-checked',
      'true',
    );
    cy.get('.hand-count > span').first().should('contain.text', '#1');
  });

  it('should say so when the link is to a hand it does not have', () => {
    const NOT_FOUND = "That link's hand isn't here. This is a random one.";

    visitHand('not-a-hand');
    cy.get('.hand .tile').should('have.length.at.least', 14);
    cy.get('.link-note').should('have.text', NOT_FOUND);
    cy.get('[role="status"]').should('have.text', NOT_FOUND);
    cy.get('.link-note').should((note) => {
      const hand = note[0].ownerDocument.querySelector('.hand-card');
      expect(note[0].getBoundingClientRect().bottom).to.be.at.most(
        hand.getBoundingClientRect().top,
      );
    });

    cy.location('search').should('match', /^\?hand=\d{10}gm-[\w-]+$/);
    cy.reload();
    cy.get('.hand .tile').should('have.length.at.least', 14);
    cy.get('.link-note').should('not.exist');
    cy.get('[role="status"]').should('have.text', '');
  });

  it('should say that the link was wrong until the next hand', () => {
    visitHand('not-a-hand');
    cy.get('.link-note').should('exist');
    cy.contains('button', 'New Hand').click();
    cy.get('.link-note').should('not.exist');
    cy.get('[role="status"]').should('have.text', '');
  });

  it('should say nothing about a link with no hand in it', () => {
    cy.visit('/?hand=');
    cy.get('.hand .tile').should('have.length.at.least', 14);
    cy.location('search').should('match', /^\?hand=\d{10}gm-[\w-]+$/);
    cy.get('.link-note').should('not.exist');
    cy.get('[role="status"]').should('have.text', '');
  });

  it('should fit the line about a wrong link on the narrowest phones', () => {
    cy.viewport(320, 1400);
    ['en', 'ja', 'ko', 'zh_cn'].forEach((language) => {
      cy.visit('/?hand=not-a-hand', {
        onBeforeLoad: (win) => {
          win.localStorage.setItem('mahjong-language', language);
        },
      });
      cy.document().its('fonts.status').should('equal', 'loaded');
      layOutAsOnAPhone(320);
      cy.get('.link-note').should((note) => {
        const box = note[0].getBoundingClientRect();
        const card = note[0].ownerDocument
          .querySelector('.hand-card')
          .getBoundingClientRect();
        expect(box.left).to.be.at.least(card.left);
        expect(box.right).to.be.at.most(card.right);
      });
    });
  });

  it('should open the right hand from a link in capitals or with spaces', () => {
    const showsRonHand = () => {
      cy.get('.hand .tile').should('have.length', 15);
      cy.get('button[aria-label="Options"]').click();
      cy.contains('a', 'Report a problem with this hand')
        .should('have.attr', 'href')
        .and('match', new RegExp(`title=Hand\\+${RON_HAND}&`));
      cy.get('.link-note').should('not.exist');
      cy.location('search').should('eq', `?hand=${RON_HAND}`);
    };

    visitHand(RON_HAND.toUpperCase());
    showsRonHand();
    visitHand(`%20${RON_HAND}%20`);
    showsRonHand();
    visitHand(`${RON_HAND.toUpperCase()}.JSON`);
    showsRonHand();
  });
});

describe('A hand that cannot be shown', () => {
  const NOT_SHOWN = "This hand couldn't be shown.";

  const breakQuiz = (win) => {
    const normalize = win.String.prototype.normalize;

    win.failHand = true;
    win.String.prototype.normalize = function (...args) {
      if (win.failHand && String(this) !== '') {
        throw new Error('planted in the quiz');
      }
      return normalize.apply(this, args);
    };
  };
  const breakHandCard = (win) => {
    const replace = win.String.prototype.replace;

    win.failHand = true;
    win.String.prototype.replace = function (...args) {
      if (win.failHand && args[0] === '{}' && typeof args[1] === 'number') {
        throw new Error('planted in the hand card');
      }
      return replace.apply(this, args);
    };
  };
  const mendHand = () => {
    cy.window().then((win) => {
      win.failHand = false;
    });
  };

  const showsFallback = (handId) => {
    cy.get('.hand-error [role="alert"]').should(
      'have.text',
      `Hand #1${NOT_SHOWN}`,
    );
    cy.get('.hand-error h2').should('have.text', 'Hand #1');
    cy.get('.hand-error')
      .contains('a', 'Report a problem with this hand')
      .should('have.attr', 'href')
      .and('match', new RegExp(`title=Hand\\+${handId}&`));
    cy.get('.hand-card').should('not.exist');
    cy.get('.quiz-form').should('not.exist');
    cy.get('.app-title').should('be.visible');
    cy.get('button[aria-label="Options"]').should('be.visible');
    cy.get('.hand-count > span').first().should('contain.text', '#1');
  };

  const showsWorkingHand = () => {
    cy.get('.hand-error').should('not.exist');
    cy.get('.hand .tile').should('have.length.at.least', 14);
    cy.get('.hand-count > span').first().should('contain.text', '#2');
    cy.focused().should('have.class', 'hand-card');
    cy.contains('button', 'Just tell me').click();
    cy.get('.answer-key').should('exist');
    cy.focused().should('have.text', 'New Hand');
  };

  it('should say so when the quiz throws, and not empty the page', () => {
    visitHand(RON_HAND);
    cy.window().then(breakQuiz);
    typeInBox('points', '2');
    showsFallback(RON_HAND);
    cy.focused().should('have.text', 'New Hand');
  });

  it('should show a working hand on New Hand after the quiz threw', () => {
    visitHand(RON_HAND);
    cy.window().then(breakQuiz);
    typeInBox('points', '2');
    cy.get('.hand-error').should('exist');
    mendHand();
    cy.focused().click();
    showsWorkingHand();
    cy.go('back');
    cy.get('.hand .tile').should('have.length', 15);
    cy.location('search').should('eq', `?hand=${RON_HAND}`);
  });

  it('should say so when the hand card throws as the page loads', () => {
    cy.visit(`/?hand=${ADDED_KAN_HAND}`, {
      onBeforeLoad(win) {
        win.sessionStorage.removeItem('mahjong-session');
        breakHandCard(win);
      },
    });
    showsFallback(ADDED_KAN_HAND);
    cy.focused().should('not.exist');

    mendHand();
    cy.contains('.hand-error button', 'New Hand').click();
    showsWorkingHand();
  });

  it('should leave focus in the options when an option makes it throw', () => {
    visitHand(ADDED_KAN_HAND);
    cy.get('.hand .tile').should('have.length.at.least', 14);
    cy.window().then(breakHandCard);
    cy.get('button[aria-label="Options"]').click();
    cy.get('[role="dialog"]').contains('label', 'Fancy tiles').click();
    cy.get('.hand-error').should('exist');
    cy.focused().parents('[role="dialog"]').should('exist');
  });

  it('should stay the same hand until there is a new one', () => {
    visitHand(RON_HAND);
    cy.window().then(breakQuiz);
    typeInBox('points', '2');
    cy.get('.hand-error').should('exist');
    mendHand();
    turnOnOptions('Fancy tiles');
    cy.get('.hand-error').should('exist');
  });

  it('should fit a phone in every language', () => {
    cy.viewport(320, 740);
    ['en', 'ja', 'ko', 'zh_cn'].forEach((language) => {
      cy.visit(`/?hand=${ADDED_KAN_HAND}`, {
        onBeforeLoad(win) {
          win.localStorage.setItem('mahjong-language', language);
          breakHandCard(win);
        },
      });
      cy.get('.hand-error').should('be.visible');
      cy.get('.hand-error > *').should((parts) => {
        const card = parts[0].parentElement.getBoundingClientRect();

        parts.each((_index, part) => {
          const box = part.getBoundingClientRect();
          expect(box.left).to.be.at.least(card.left);
          expect(box.right).to.be.at.most(card.right);
        });
      });
      cy.document().should((doc) => {
        expect(doc.documentElement.scrollWidth).to.be.at.most(320);
      });
    });
  });
});

describe('Session', () => {
  it('should keep the hand, the answers and the counts after a reload', () => {
    visitHand(RON_HAND);
    pick('han', '2');
    pick('fu', '60');
    typeInBox('points', '2000');
    cy.contains('button', 'Check Answer').click();
    cy.get('.badge.wrong').should('contain.text', '1');
    cy.contains('button', 'New Hand').click();
    cy.get('.hand-count > span').first().should('contain.text', '#2');
    pick('han', '3');
    pick('fu', '40');

    cy.location('search').then((search) => {
      cy.reload();
      cy.location('search').should('eq', search);
    });
    cy.get('.hand-count > span').first().should('contain.text', '#2');
    cy.get('.badge.correct').should('contain.text', '0');
    cy.get('.badge.wrong').should('contain.text', '1');
    cy.contains('[aria-labelledby="han-label"] [role="radio"]', /^3$/).should(
      'have.attr',
      'aria-checked',
      'true',
    );
    cy.contains('[aria-labelledby="fu-label"] [role="radio"]', /^40$/).should(
      'have.attr',
      'aria-checked',
      'true',
    );
    cy.focused().should('not.exist');
  });

  it('should keep what was typed after a reload', () => {
    visitHand(TSUMO_HAND);
    typeInBox('points', '2000');
    typeInBox('pointsDealer', '39');
    cy.reload();
    cy.get('#points').should('have.value', '2000');
    cy.get('#pointsDealer').should('have.value', '39');
  });

  it('should start a checked hand over after a reload, with its count kept', () => {
    visitHand(RON_HAND);
    pick('han', '1');
    pick('fu', '60');
    typeInBox('points', '2000');
    cy.contains('button', 'Check Answer').click();
    cy.get('.badge.correct').should('contain.text', '1');

    cy.reload();
    cy.get('.badge.correct').should('contain.text', '1');
    cy.get('.verdict').should('not.exist');
    cy.get('[role="radio"][aria-checked="true"]').should('not.exist');
    cy.get('#points').should('have.value', '');
  });

  it('should keep the counts and drop the answers for a link to another hand', () => {
    visitHand(RON_HAND);
    pick('han', '2');
    pick('fu', '60');
    typeInBox('points', '2000');
    cy.contains('button', 'Check Answer').click();
    cy.contains('button', 'New Hand').click();
    cy.get('.hand-count > span').first().should('contain.text', '#2');
    cy.get('#points, #pointsDealer').first().type('12');

    cy.visit(`/?hand=${TSUMO_HAND}`);
    cy.get('.badge.wrong').should('contain.text', '1');
    cy.get('.hand-count > span').first().should('contain.text', '#1');
    cy.get('#points').should('have.value', '');
  });

  it('should get past a session that is mangled', () => {
    const storeSession = (value) => {
      cy.window().then((win) => {
        win.sessionStorage.setItem('mahjong-session', value);
      });
    };
    const startsEmpty = () => {
      cy.get('.hand .tile').should('have.length', 15);
      cy.get('.hand-count > span').first().should('contain.text', '#1');
      cy.get('.badge.correct').should('contain.text', '0');
      cy.get('.badge.wrong').should('contain.text', '0');
      cy.get('[role="radio"][aria-checked="true"]').should('not.exist');
      cy.get('#points').should('have.value', '');
    };

    visitHand(RON_HAND);

    storeSession('{"handFile": "20110');
    visitHand(RON_HAND);
    startsEmpty();

    storeSession(
      JSON.stringify({
        answers: { han: 3, points: ['2000'] },
        correctAnswers: -4,
        handFile: `${RON_HAND}.json`,
        handNumber: 1.5,
        wrongAnswers: '7',
      }),
    );
    visitHand(RON_HAND);
    startsEmpty();

    storeSession('"a string"');
    visitHand(RON_HAND);
    startsEmpty();
    storeSession('null');
    visitHand(RON_HAND);
    startsEmpty();

    storeSession(
      JSON.stringify({
        answers: { han: '3' },
        correctAnswers: 2,
        handFile: 'not-a-hand.json',
        handNumber: 6,
        wrongAnswers: 1,
      }),
    );
    cy.visit('/');
    cy.get('.hand .tile').should('have.length.at.least', 14);
    cy.get('.hand-count > span').first().should('contain.text', '#1');
    cy.get('.badge.correct').should('contain.text', '2');
    cy.get('.badge.wrong').should('contain.text', '1');
    cy.get('[role="radio"][aria-checked="true"]').should('not.exist');
  });

  it('should work with session storage blocked', () => {
    cy.visit(`/?hand=${RON_HAND}`, {
      onBeforeLoad: (win) => {
        Object.defineProperty(win, 'sessionStorage', {
          get: () => {
            throw new Error('blocked');
          },
        });
      },
    });
    cy.get('.hand .tile').should('have.length', 15);
    pick('han', '1');
    cy.contains('button', 'New Hand').click();
    cy.get('.hand-count > span').first().should('contain.text', '#2');
  });
});
