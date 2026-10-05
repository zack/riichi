const RON_HAND = '2011010101gm-00a9-0000-370cfc0a2';

const RON_HAND_TILE_COUNT = 19;

// Same as CELEBRATION_INTERVAL in src/App.jsx
const CELEBRATION_INTERVAL = 10;

const TSUMO_HAND = '2011010100gm-00a9-0000-73f384767';

const DEALER_TSUMO_HAND = '2011010100gm-00a9-0000-58aad5ff4';

const TWO_URADORA_HAND = '2011010102gm-00a9-0000-1f9e90501';

const ADDED_KAN_HAND = '2011010101gm-00a9-0000-be1e94c96';

const CROWDED_INFO_HAND = '2011010102gm-00a9-0000-4c03f0d02';

const TWO_HONBA_HAND = '2011010107gm-00a9-0000-49ee978a2';
const EIGHT_HONBA_HAND = '2011010100gm-00a9-0000-73f3847613';

const visitHand = (handId) => cy.visit(`/?hand=${handId}`);

const turnOnOptions = (...names) => {
  cy.get('button[aria-label="Test Options"]').click();
  names.forEach((name) => {
    cy.contains('label', name).click();
  });
  cy.contains('button', 'Close').click();
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

      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'Include Honba Sticks').click();
      cy.contains('button', 'Close').click();

      cy.get('.honba-sticks').should('have.attr', 'aria-label', '2');
      cy.get('.honba-sticks rect').should('have.length', 2);
      cy.get('.honba .tile-label').should('not.exist');
    });

    it('should write the count under a pile of more than three', () => {
      visitHand(EIGHT_HONBA_HAND);
      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'Include Honba Sticks').click();
      cy.contains('button', 'Close').click();

      cy.get('.honba-sticks rect').should('have.length', 8);
      cy.get('.honba .tile-label').should('have.text', '(8)');
    });

    it('should write the count where a name goes when names are on', () => {
      visitHand(EIGHT_HONBA_HAND);
      turnOnOptions('Include Honba Sticks', 'Show Tile Names');

      cy.get('.honba .tile-label').should('have.text', '(8)');
      cy.get('.honba .tile-label').should('not.have.class', 'floating');

      visitHand(TWO_HONBA_HAND);
      cy.get('.honba .tile-label').should('have.text', '');
      cy.get('.honba .tile-label').should('not.have.class', 'floating');
    });

    it('should move the hand down when the count lands on Tsumo', () => {
      cy.viewport(360, 740);
      visitHand('2011010120gm-00a9-0000-a64bc7d46');
      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'Include Honba Sticks').click();
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
      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'Include Honba Sticks').click();
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
          doc.documentElement.clientWidth,
        );
      });
    };

    it('should shrink its tiles to fit a crowded row on a phone', () => {
      cy.viewport(360, 740);
      visitHand(CROWDED_INFO_HAND);
      turnOnOptions('Include Honba Sticks');

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
      turnOnOptions('Include Honba Sticks');

      shouldStayInTheCard();
      cy.get('.info').should('have.attr', 'data-wrapped');
    });

    it('should give the tiles their full size back when there is room again', () => {
      cy.viewport(360, 740);
      visitHand(CROWDED_INFO_HAND);
      turnOnOptions('Include Honba Sticks');
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
      cy.get('button[aria-label="Dark mode"]').click();
      cy.get('html').should('have.class', 'dark');
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

      turnOnOptions('Show Tile Names');
      cy.get(`${kan} .tile-label`).should('have.length', 3);
    });

    it('should show the tiles in the help page', () => {
      visitHand(RON_HAND);
      cy.get('button[aria-label="Scoring Help"]').click();
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
      cy.get('.real-answer .wrong').should('contain', '2000');
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

    it('should count one tsumo payment without the other as wrong', () => {
      visitHand(TSUMO_HAND);
      pick('han', '4');
      pick('fu', '30');
      cy.get('#points').type('2000');
      cy.contains('button', 'Check Answer').click();

      cy.contains('.badge', 'Wrong: 1');
      cy.get('.real-answer .correct').should('contain', '2000');
      cy.get('.real-answer .wrong').should('contain', '3900');
    });

    it('should lock the answers once they are checked', () => {
      visitHand(RON_HAND);
      pick('han', '1');
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
      cy.get('.color-card.purple').should('exist');
    });

    it('should grade only what was answered and hide the rest', () => {
      visitHand(RON_HAND);
      pick('han', '1');
      cy.get('#hide-note').should('have.text', 'And hide fu, points');
      cy.contains('button', 'Check Answer').click();

      cy.contains('.badge', 'Correct: 1');
      cy.get('[role="radiogroup"]').should('have.length', 1);
      cy.get('#points').should('not.exist');

      cy.contains('button', 'New Hand').click();
      cy.get('[role="radiogroup"]').should('have.length', 1);
      cy.get('#points').should('not.exist');
    });
  });

  describe('Options', () => {
    it('should remember the options after a reload', () => {
      visitHand(RON_HAND);
      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'Exact Fu (No Rounding)').click();
      cy.contains('button', 'Close').click();
      cy.get('#fu').should('exist');

      cy.reload();
      cy.get('#fu').should('exist');
    });

    it('should take the fu before rounding when exact fu is on', () => {
      visitHand(RON_HAND);
      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'Exact Fu (No Rounding)').click();
      cy.contains('button', 'Close').click();

      // 20 base + 32 for the kan + 4 + 2 for the pons, before rounding
      cy.get('#fu').type('58');
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
      cy.get('#points').type('2k');
      cy.get('#points').should('have.attr', 'aria-invalid', 'true');
      cy.get('#points').should('have.attr', 'aria-describedby', 'points-error');
      cy.get('#points-error').should(
        'have.text',
        'Error: Enter the points as a number, like 2000.',
      );

      cy.get('button[type="submit"]').click();
      cy.get('.verdict').should('not.exist');
      cy.focused().should('have.id', 'points');

      cy.get('#points').type('{backspace}');
      cy.get('#points-error').should('not.exist');
    });

    it('should start the fu answer over when exact fu is switched', () => {
      visitHand(RON_HAND);
      pick('fu', '30');
      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'Exact Fu (No Rounding)').click();
      cy.contains('button', 'Close').click();
      cy.get('#fu').should('have.value', '');

      cy.get('#fu').type('58');
      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'Exact Fu (No Rounding)').click();
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

      cy.get('button[aria-label="Test Options"]').click();
      cy.get('[role="dialog"]').should(
        'have.attr',
        'aria-describedby',
        'next-hand-note',
      );
      cy.get('#next-hand-note').should(
        'have.text',
        'Changes to the quiz start with the next hand.',
      );
      cy.contains('label', 'Exact Fu (No Rounding)').click();
      cy.contains('button', 'Close').click();

      cy.get('#fu').should('not.exist');
      cy.get('.verdict.correct').should('exist');
      cy.get('form .wrong').should('not.exist');

      cy.contains('button', 'New Hand').click();
      cy.get('#fu').should('exist');
      cy.get('button[aria-label="Test Options"]').click();
      cy.get('#next-hand-note').should('not.exist');
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
      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('Home screen icon').should('not.exist');
    });

    it('should point the install links at the color picked', () => {
      visitHand(RON_HAND);
      offerToInstall();
      cy.get('button[aria-label="Test Options"]').click();
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
      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('To install app, tap the menu, then "Install".');
      cy.contains('button', 'Install app').should('not.exist');
    });

    it('should install from its own button', () => {
      visitHand(RON_HAND);
      offerToInstall();
      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('button', 'Install app').click();
      cy.get('@prompt').should('have.been.calledOnce');
    });
  });

  describe('Ignoring fu on limit hands', () => {
    const turnOnIgnoreFu = () => {
      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'Ignore Fu on Limit Hands').click();
      cy.contains('button', 'Close').click();
    };

    const fuChoices = () =>
      cy.get('[aria-labelledby="fu-label"] [role="radio"]');

    it('should switch fu off when a limit hand is picked, and back on after', () => {
      visitHand(RON_HAND);
      turnOnIgnoreFu();
      pick('fu', '40');
      fuChoices().should('be.enabled');
      cy.get('#fu-note').should('not.exist');

      pick('han', '5');
      fuChoices().should('be.disabled');
      cy.get('#fu-note').should('have.text', 'Disabled on limit hands');
      cy.contains('[role="radio"]', /^40$/).should(
        'have.attr',
        'aria-checked',
        'true',
      );

      pick('han', '1');
      fuChoices().should('be.enabled');
      cy.get('#fu-note').should('not.exist');
      cy.contains('[role="radio"]', /^40$/).should(
        'have.attr',
        'aria-checked',
        'true',
      );
    });

    it('should leave fu out of the result while it is switched off', () => {
      visitHand(LIMIT_HAND);
      turnOnIgnoreFu();
      pick('fu', '70');
      pick('han', '6');
      cy.get('#points').type('18000');
      cy.get('#hide-note').should('not.exist');
      cy.contains('button', 'Check Answer').click();

      cy.contains('.badge', 'Correct: 1');
      cy.get('[role="radio"].wrong').should('not.exist');
    });

    it('should keep asking for fu after it was switched off and left blank', () => {
      visitHand(LIMIT_HAND);
      turnOnIgnoreFu();
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
          .contains('label', 'Ignore Fu on Limit Hands')
          .find('[role="checkbox"]');

      visitHand(LIMIT_HAND);
      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'Ignore Fu on Limit Hands').click();
      ignoreFu().should('be.enabled');
      ignoreFu().should('have.attr', 'aria-checked', 'true');

      cy.contains('label', 'Test Han').click();
      ignoreFu().should('have.attr', 'aria-disabled', 'true');
      ignoreFu().should('have.attr', 'aria-checked', 'true');
      cy.get('#ignoreFuOnLimit-note').should(
        'have.text',
        'Unavailable while Test Han is off.',
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

      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'Test Han').click();
      ignoreFu().should('be.enabled');
      ignoreFu().should('have.attr', 'aria-checked', 'true');
    });

    it('should still grade fu when a non-limit hand is picked', () => {
      visitHand(RON_HAND);
      turnOnIgnoreFu();
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

      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'Show Tile Names').click();
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
      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'Show Tile Names').click();
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
      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'Show Tile Names').click();
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

      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'Use Fancy Tiles').click();
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
      cy.get('button[aria-label="Scoring Help"]').click();
      cy.get('.help-content .tile').should('have.length.at.least', 100);
      cy.get('.help-content .tile-label').should('not.exist');
      cy.contains('button', 'Close').click();

      turnOnOptions('Show Tile Names');
      cy.get('button[aria-label="Scoring Help"]').click();
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
      turnOnOptions('Use Fancy Tiles');
      cy.get('button[aria-label="Scoring Help"]').click();

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

  describe('Dark mode', () => {
    it('should switch to dark mode and stay there after a reload', () => {
      visitHand(RON_HAND);
      cy.get('button[aria-label="Dark mode"]').click();
      cy.get('html').should('have.class', 'dark');

      cy.reload();
      cy.get('html').should('have.class', 'dark');
      cy.get('button[aria-label="Dark mode"]').should(
        'have.attr',
        'aria-pressed',
        'true',
      );
    });
  });

  describe('High contrast', () => {
    it('should switch on from the options and stay on after a reload', () => {
      visitHand(RON_HAND);
      cy.get('html').should('not.have.class', 'high-contrast');
      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'High Contrast').click();
      cy.get('html').should('have.class', 'high-contrast');

      cy.reload();
      cy.get('html').should('have.class', 'high-contrast');
      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'High Contrast')
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

      cy.get('button[aria-label="Test Options"]').click();
      cy.contains('label', 'High Contrast').click();
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
        'Wrong. Han: 1, Fu: 60, Points: 2000',
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
      cy.get('button[aria-label="Test Options"]').click();
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
      cy.get('button[aria-label="Dark mode"]').should(
        'have.attr',
        'aria-pressed',
        'true',
      );
      cy.window().then((win) => {
        expect(win.localStorage.getItem('mahjong-appearance')).to.equal(null);
      });
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
      cy.get('button[aria-label="Test Options"]').click();
      cy.get('.hand-id a').should('have.text', RON_HAND);
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
