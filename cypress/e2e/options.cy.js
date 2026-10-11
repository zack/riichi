import en from '../../src/i18n/translations/en.json';
import {
  RON_HAND,
  pick,
  showYourAnswer,
  turnOnOptions,
  typeInBox,
  visitHand,
} from '../support/app';
import { waitForAnimations } from '../support/wait';

describe('Options', () => {
  it('should remember the options after a reload', () => {
    visitHand(RON_HAND);
    cy.get('button[aria-label="Options"]').click();
    cy.get('[role="dialog"]').contains('label', 'Exact fu').click();
    cy.contains('button', 'Close').click();
    cy.get('#fu').should('exist');

    cy.reload();
    cy.get('#fu').should('exist');
  });

  it('should take the fu before rounding when exact fu is on', () => {
    visitHand(RON_HAND);
    cy.get('button[aria-label="Options"]').click();
    cy.get('[role="dialog"]').contains('label', 'Exact fu').click();
    cy.contains('button', 'Close').click();

    // 20 base + 32 for the kan + 4 + 2 for the pons, before rounding
    pick('han', '1');
    typeInBox('fu', '58');
    typeInBox('points', '2000');
    cy.contains('button', 'Check Answer').click();
    cy.contains('.badge', 'Correct: 1');
  });

  it('should read the points however the number is written', () => {
    for (const typed of [
      '2,000',
      '２０００',
      '02000',
      ' 2 000 ',
      '2.000',
      "2'000",
      '2000点',
      '２．０００ 点',
    ]) {
      visitHand(RON_HAND);
      pick('han', '1');
      pick('fu', '60');
      typeInBox('points', typed);
      cy.get('.field-error').should('not.exist');
      cy.get('button[type="submit"]').click();
      cy.get('.color-card.green').should('exist');
    }
  });

  it('should stop and say so when the points are not a number', () => {
    visitHand(RON_HAND);
    pick('han', '1');
    pick('fu', '60');
    typeInBox('points', '2k');
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
    cy.get('.quiz-form.checked').should('not.exist');
    cy.focused().should('have.id', 'points');

    typeInBox('points', '{backspace}');
    cy.get('#points-error').should('not.exist');
  });

  it('should not take a decimal, a sign or a stray mark for the points', () => {
    visitHand(RON_HAND);
    pick('han', '1');
    pick('fu', '60');

    for (const typed of [
      '2000.0',
      '-2000',
      '+2000',
      '2.5',
      '2.0000',
      '20.00',
      '.200',
      "'200",
      '点',
      '2000点0',
    ]) {
      cy.get('#points').clear();
      cy.get('#points-error').should('not.exist');
      typeInBox('points', typed);
      cy.get('#points-error').should('have.text', 'Error: Enter a number.');
    }

    cy.get('button[type="submit"]').click();
    cy.get('.quiz-form.checked').should('not.exist');
  });

  it('should cut a pasted number that is far too long, and not refuse it', () => {
    const paste = (text) => {
      cy.get('#points').clear();
      cy.get('#points').focus();
      cy.document().then((doc) => {
        doc.execCommand('insertText', false, text);
      });
    };

    visitHand(RON_HAND);
    pick('han', '1');
    pick('fu', '60');

    paste('1234567890123456789012345');
    cy.get('#points').should('have.value', '12345678');
    cy.get('#points-error').should('not.exist');
    cy.get('#points').should('not.have.attr', 'aria-invalid');
    cy.get('#points').then((box) => {
      expect(box[0].scrollWidth).to.equal(box[0].clientWidth);
    });

    paste('４８，０００');
    cy.get('#points').should('have.value', '４８，０００');
    cy.get('#points-error').should('not.exist');
    paste(' 48,000 ');
    cy.get('#points').should('have.value', ' 48,000 ');
    cy.get('#points-error').should('not.exist');

    paste('2,000');
    cy.get('button[type="submit"]').click();
    cy.get('.color-card.green').should('exist');
  });

  it('should start the fu answer over when exact fu is switched', () => {
    visitHand(RON_HAND);
    pick('fu', '30');
    cy.get('button[aria-label="Options"]').click();
    cy.get('[role="dialog"]').contains('label', 'Exact fu').click();
    cy.contains('button', 'Close').click();
    cy.get('#fu').should('have.value', '');

    typeInBox('fu', '58');
    cy.get('button[aria-label="Options"]').click();
    cy.get('[role="dialog"]').contains('label', 'Exact fu').click();
    cy.contains('button', 'Close').click();
    cy.get('.fu-choices [data-state="checked"]').should('not.exist');
    cy.get('button[type="submit"]').should('have.text', 'Just tell me');
  });

  it('should leave a checked hand alone and change the next one', () => {
    visitHand(RON_HAND);
    pick('han', '1');
    pick('fu', '60');
    typeInBox('points', '2000');
    cy.contains('button', 'Check Answer').click();
    cy.get('.color-card.green').should('exist');

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
    cy.get('[role="dialog"]').contains('label', 'Exact fu').click();
    cy.contains('button', 'Close').click();

    cy.get('.color-card.green').should('exist');
    showYourAnswer();
    cy.get('#fu').should('not.exist');
    cy.get('[aria-labelledby="fu-label"] [role="radio"][aria-checked="true"]')
      .should('have.length', 1)
      .and('contain', '60')
      .and('have.class', 'correct');
    cy.get('.quiz-fields .wrong').should('not.exist');

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
        'Quiz options',
        'Rules',
        'Display',
      ]);
    });
    groupOf(/^Points$/).should('have.text', 'Quiz options');
    groupOf('Skip fu on limit hands').should('have.text', 'Quiz options');
    groupOf('Honba sticks').should('have.text', 'Quiz options');
    groupOf('Kiriage mangan').should('have.text', 'Rules');
    groupOf('High contrast').should('have.text', 'Display');
    groupOf(/^Language$/).should('have.text', 'Display');
  });

  it('should switch the fu options off, and say why, while fu is not asked', () => {
    const exactFu = () =>
      cy
        .get('[role="dialog"]')
        .contains('label', 'Exact fu')
        .find('[role="checkbox"]');

    visitHand(RON_HAND);
    cy.get('button[aria-label="Options"]').click();
    exactFu().should('not.have.attr', 'aria-disabled');
    cy.get('#exactFu-note').should('not.exist');

    cy.contains('label', /^Fu$/).click();
    exactFu().should('have.attr', 'aria-disabled', 'true');
    exactFu().should('have.attr', 'aria-describedby', 'exactFu-note');
    cy.get('#exactFu-note').should('have.text', 'Unavailable while Fu is off.');
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
    cy.get('.options-dialog .dialog-title').should((title) => {
      const { bottom, top } = title[0].getBoundingClientRect();
      expect(top).to.be.at.least(0);
      expect(bottom).to.be.at.most(500);
    });
    cy.contains('[role="dialog"] button', 'Close').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should scroll to the last control when Shift+Tab wraps to it', () => {
    cy.viewport(1280, 720);
    visitHand(RON_HAND);
    cy.get('button[aria-label="Options"]').click();
    cy.get('.options-dialog').should('be.focused');
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.focused().should('have.text', 'Close');
    cy.focused().trigger('keydown', { key: 'Tab', shiftKey: true });
    cy.focused().should('contain', 'Report a problem with this hand');
    cy.focused().should((link) => {
      const { bottom, top } = link[0].getBoundingClientRect();
      expect(Math.round(top)).to.be.at.least(0);
      expect(Math.round(bottom)).to.be.at.most(720);
    });
  });

  const getReportBody = () =>
    cy
      .get('.report-hand a')
      .should('have.attr', 'href')
      .then((href) => new URL(href).searchParams.get('body'));

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
          'https://github.com/zack/riichi-scoring-trainer/issues/new',
        );
        expect(issueUrl.searchParams.get('title')).to.equal(`Hand ${RON_HAND}`);
        expect(issueUrl.searchParams.get('body')).to.contain(
          `https://riichi.youngren.io/?hand=${RON_HAND}`,
        );
      });
  });

  it('should say in the report which options and language it was made under', () => {
    visitHand(RON_HAND);
    cy.get('button[aria-label="Options"]').click();
    getReportBody().should(
      'contain',
      '\n\nOptions: han on, fu on, exact fu off, skip fu on limit hands on, points on, kiriage mangan off, honba off. Language: en.\n',
    );

    cy.visit(`/?hand=${RON_HAND}`, {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('mahjong-language', 'ja');
        win.localStorage.setItem(
          'mahjong-options',
          JSON.stringify({
            exactFu: true,
            ignoreFuOnLimit: false,
            kiriageMangan: true,
            testFu: false,
            testHan: false,
            testHonba: true,
            testPoints: false,
          }),
        );
      },
    });
    cy.get('html').should('have.attr', 'lang', 'ja');
    cy.get('header .icon-button').first().click();
    getReportBody().should(
      'contain',
      'Options: han off, fu off, exact fu on, skip fu on limit hands off, points off, kiriage mangan on, honba on. Language: ja.',
    );
  });

  it('should report the options a checked hand was graded under', () => {
    visitHand(RON_HAND);
    cy.get('button[type="submit"]').click();
    cy.get('.answer-key').should('exist');
    cy.get('button[aria-label="Options"]').click();
    cy.contains('[role="dialog"] label', en.options.testHonba)
      .click()
      .find('[role="checkbox"]')
      .should('have.attr', 'aria-checked', 'true');
    getReportBody().should('contain', 'honba off.');

    cy.contains('[role="dialog"] button', 'Close').click();
    cy.contains('button', 'New Hand').click();
    cy.get('button[aria-label="Options"]').click();
    getReportBody().should('contain', 'honba on.');
  });

  it('should give the report link the same focus ring as a button', () => {
    const getRingColor = (element) => getComputedStyle(element[0]).outlineColor;

    visitHand(RON_HAND);
    cy.get('button[aria-label="Options"]').click();
    cy.contains('button', 'Close').focus();
    cy.focused().then((close) => {
      const ringColor = getRingColor(close);

      cy.contains('a', 'Report a problem with this hand').focus();
      cy.focused().should((link) => {
        expect(getComputedStyle(link[0]).outlineStyle).to.equal('solid');
        expect(getRingColor(link)).to.equal(ringColor);
      });
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
      event.userChoice = Promise.resolve({ outcome: 'dismissed' });
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
    cy.visit(`/?hand=${RON_HAND}`, {
      onBeforeLoad(win) {
        win.sessionStorage.removeItem('mahjong-session');
        Object.defineProperty(win.navigator, 'userAgent', {
          value:
            'Mozilla/5.0 (Android 15; Mobile; rv:143.0) Gecko/143.0 Firefox/143.0',
        });
      },
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

  it('should keep the picker, with its button switched off, after the player says no', () => {
    visitHand(RON_HAND);
    offerToInstall();
    cy.get('button[aria-label="Options"]').click();
    cy.contains('button', 'Install app')
      .should('be.enabled')
      .and('not.have.attr', 'aria-describedby');
    cy.contains(en.options.installAsked).should('not.exist');
    cy.contains('button', 'Install app').click();
    cy.get('@prompt').should('have.been.calledOnce');

    cy.contains('Home screen icon').should('be.visible');
    cy.get('.home-icon-swatch').should('have.length', 12);
    cy.get('input[aria-label="Mat blue"]').click().should('be.checked');
    cy.contains('a', 'Report a problem with this hand').should('be.visible');

    cy.contains('button', 'Install app')
      .should('be.disabled')
      .invoke('attr', 'aria-describedby')
      .then((noteId) => {
        cy.get(`#${noteId}`)
          .should('be.visible')
          .and('have.text', en.options.installAsked);
      });

    cy.contains('[role="dialog"] button', 'Close').click();
    cy.get('[role="dialog"]').should('not.exist');
    cy.get('button[aria-label="Options"]').click();
    cy.contains('button', 'Install app').should('be.disabled');
    cy.get('@prompt').should('have.been.calledOnce');
  });

  it('should let the button ask again when the browser offers again', () => {
    visitHand(RON_HAND);
    offerToInstall();
    cy.get('button[aria-label="Options"]').click();
    cy.contains('button', 'Install app').click();
    cy.contains('button', 'Install app').should('be.disabled');

    offerToInstall();
    cy.contains('button', 'Install app').should('be.enabled');
    cy.contains(en.options.installAsked).should('not.exist');
    cy.contains('button', 'Install app').click();
    cy.get('@prompt').should('have.been.calledOnce');
  });

  it('should name the group of colors after the words above it', () => {
    visitHand(RON_HAND);
    offerToInstall();
    cy.get('button[aria-label="Options"]').click();
    cy.get('.home-icon-swatches')
      .invoke('attr', 'aria-labelledby')
      .then((id) => {
        cy.get(`#${id}`).should('have.text', 'Home screen icon');
      });
  });

  it('should not show the picker inside the installed app', () => {
    cy.visit(`/?hand=${RON_HAND}`, {
      onBeforeLoad: (win) => {
        const matchMedia = win.matchMedia.bind(win);
        win.matchMedia = (query) =>
          query.includes('display-mode: standalone')
            ? matchMedia('all')
            : matchMedia(query);
      },
    });
    offerToInstall();
    cy.get('button[aria-label="Options"]').click();
    cy.get('.options-dialog').should('be.visible');
    cy.contains('Home screen icon').should('not.exist');
  });

  it('should take the picker away once the app is installed', () => {
    visitHand(RON_HAND);
    offerToInstall();
    cy.get('button[aria-label="Options"]').click();
    cy.contains('button', 'Install app').click();
    cy.contains('button', 'Install app').should('be.disabled');

    cy.window().then((win) => {
      win.dispatchEvent(new win.Event('appinstalled'));
    });
    cy.contains('Home screen icon').should('not.exist');
    cy.contains('button', 'Install app').should('not.exist');
  });
});

describe('Back button on a phone', () => {
  const visitWithCloseWatchers = () => {
    const watchers = [];

    cy.visit(`/?hand=${RON_HAND}`, {
      onBeforeLoad: (win) => {
        win.CloseWatcher = class extends win.EventTarget {
          constructor() {
            super();
            this.isDestroyed = false;
            watchers.push(this);
          }

          destroy() {
            this.isDestroyed = true;
          }
        };
      },
    });
    return cy.wrap(watchers);
  };

  const pressBack = (watchers) => {
    cy.window().then((win) => {
      watchers.at(-1).dispatchEvent(new win.Event('close'));
    });
  };

  const DIALOGS = [
    {
      name: 'options',
      opener: 'button[aria-label="Options"]',
      selector: '.options-dialog',
    },
    {
      name: 'help',
      opener: 'button[aria-label="Help"]',
      selector: '.help-dialog',
    },
    {
      name: 'bigger hand',
      opener: '.bigger-hand-button',
      selector: '.bigger-hand-dialog',
    },
  ];

  DIALOGS.forEach(({ name, opener, selector }) => {
    it(`should close the ${name} and nothing else`, () => {
      visitWithCloseWatchers().then((watchers) => {
        cy.get('.hand .tile').should('exist');
        cy.wrap(watchers).should('have.length', 0);

        cy.get(opener).click();
        cy.get(selector).should('exist');
        cy.wrap(watchers).should('have.length', 1);

        pressBack(watchers);
        cy.get('[role="dialog"]').should('not.exist');
        cy.location('search').should('contain', RON_HAND);
        cy.get(opener).should('be.focused');
        cy.wrap(watchers).should((made) => {
          expect(made).to.have.length(1);
          expect(made[0].isDestroyed).to.equal(true);
        });
      });
    });

    it(`should stop watching when the ${name} is closed some other way`, () => {
      visitWithCloseWatchers().then((watchers) => {
        cy.get(opener).click();
        cy.get(selector).should('exist');
        cy.get('body').type('{esc}');
        cy.get('[role="dialog"]').should('not.exist');
        cy.wrap(watchers).should((made) => {
          expect(made).to.have.length(1);
          expect(made[0].isDestroyed).to.equal(true);
        });

        cy.get(opener).click();
        cy.get(selector).should('exist');
        cy.wrap(watchers).should((made) => {
          expect(made).to.have.length(2);
          expect(made[1].isDestroyed).to.equal(false);
        });
      });
    });
  });

  it('should close the bigger hand opened from the tiles', () => {
    visitWithCloseWatchers().then((watchers) => {
      cy.get('.hand').click();
      cy.get('.bigger-hand-dialog').should('be.visible');
      cy.wrap(watchers).should('have.length', 1);
      pressBack(watchers);
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  it('should close one thing for each Escape, with a list open in the options', () => {
    visitWithCloseWatchers().then((watchers) => {
      cy.get('button[aria-label="Options"]').click();
      cy.get('#language-select').click();
      cy.get('[role="listbox"]').should('be.visible');

      cy.focused().type('{esc}');
      cy.get('[role="listbox"]').should('not.exist');
      cy.get('.options-dialog').should('be.visible');
      cy.wrap(watchers).should((made) => {
        expect(made).to.have.length(1);
        expect(made[0].isDestroyed).to.equal(false);
      });

      cy.focused().type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  it('should leave the dialogs working where there is no CloseWatcher', () => {
    cy.visit(`/?hand=${RON_HAND}`, {
      onBeforeLoad: (win) => {
        delete win.CloseWatcher;
      },
    });
    cy.window().should((win) => {
      expect('CloseWatcher' in win).to.equal(false);
    });

    DIALOGS.forEach(({ opener, selector }) => {
      cy.get(opener).click();
      cy.get(selector).should('exist');
      cy.get('body').type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
    });
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
    cy.contains('.theme-segment', 'Device').find('input').should('be.checked');
  });

  it('should start in English when the language saved is not one it has', () => {
    cy.visit(`/?hand=${RON_HAND}`, {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('mahjong-language', 'xx');
      },
    });
    // <html lang> is already en before the app starts, so wait for the app to
    // render first
    cy.get('button[aria-label="Options"]').should('exist');
    cy.contains('button', 'New Hand').should('exist');
    cy.get('html').should('have.attr', 'lang', 'en');
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

  const expectStored = (key, value) =>
    cy.window().should((win) => {
      expect(win.localStorage.getItem(key)).to.equal(value);
    });
  const expectStoredOptions = (options) =>
    cy.window().should((win) => {
      expect(
        JSON.parse(win.localStorage.getItem('mahjong-options')),
      ).to.deep.equal(options);
    });

  it('should store no options and no language on a first visit', () => {
    visitHand(RON_HAND);

    cy.window()
      .its('sessionStorage')
      .invoke('getItem', 'mahjong-session')
      .should('not.equal', null);
    cy.get('html').should('have.attr', 'lang', 'en');
    expectStored('mahjong-options', null);
    expectStored('mahjong-language', null);

    turnOnOptions();
    expectStored('mahjong-options', null);
    expectStored('mahjong-language', null);
  });

  it('should store only the options that are not at their default', () => {
    visitHand(RON_HAND);
    cy.get('button[aria-label="Options"]').click();

    cy.contains('label', 'Honba sticks').click();
    expectStoredOptions({ testHonba: true });

    cy.contains('label', 'Skip fu on limit hands').click();
    expectStoredOptions({
      ignoreFuOnLimit: false,
      testHonba: true,
    });

    cy.contains('label', 'Honba sticks').click();
    expectStoredOptions({ ignoreFuOnLimit: false });
    cy.contains('label', 'Skip fu on limit hands').click();
    expectStored('mahjong-options', null);
    expectStored('mahjong-language', null);
  });

  it('should keep the choices of a browser that has every option stored', () => {
    const everyOption = {
      exactFu: false,
      fancyTiles: false,
      ignoreFuOnLimit: true,
      kiriageMangan: true,
      showTileNames: false,
      testFu: true,
      testHan: true,
      testHonba: false,
      testPoints: false,
    };
    cy.visit(`/?hand=${RON_HAND}`, {
      onBeforeLoad(win) {
        win.sessionStorage.removeItem('mahjong-session');
        win.localStorage.setItem(
          'mahjong-options',
          JSON.stringify(everyOption),
        );
      },
    });

    cy.get('#han-label').should('exist');
    cy.get('#fu-label').should('exist');
    cy.get('#points').should('not.exist');
    cy.get('button[aria-label="Options"]').click();
    cy.contains('label', 'Kiriage mangan')
      .find('[role="checkbox"]')
      .should('have.attr', 'aria-checked', 'true');
    cy.contains('label', 'Points')
      .find('[role="checkbox"]')
      .should('have.attr', 'aria-checked', 'false');

    expectStoredOptions(everyOption);
    cy.contains('label', 'Honba sticks').click();
    expectStoredOptions({
      kiriageMangan: true,
      testHonba: true,
      testPoints: false,
    });

    cy.reload();
    cy.get('#points').should('not.exist');
    cy.get('button[aria-label="Options"]').click();
    cy.contains('label', 'Honba sticks')
      .find('[role="checkbox"]')
      .should('have.attr', 'aria-checked', 'true');
    cy.contains('label', 'Kiriage mangan')
      .find('[role="checkbox"]')
      .should('have.attr', 'aria-checked', 'true');
  });
});

describe('Welcome', () => {
  const SEEN_KEY = 'mahjong-welcome-seen';
  const getWelcome = () => cy.get('.welcome-dialog');
  const getSeen = () =>
    cy.window().then((win) => win.localStorage.getItem(SEEN_KEY));

  it('should say what to do on a first visit, and only then', () => {
    cy.visitAsNewPlayer('/');
    getWelcome().should('have.attr', 'role', 'dialog');
    getWelcome().find('.dialog-title').should('have.text', 'Score this hand');
    getWelcome().should('contain', en.buttons.checkAnswer);
    getWelcome().should('have.focus');
    getWelcome().should('have.attr', 'aria-describedby');
    getSeen().should('equal', null);

    cy.contains('.welcome-dialog button', 'Start').click();
    getWelcome().should('not.exist');
    getSeen().should('equal', 'true');
    cy.focused().should('not.exist');

    cy.reload();
    cy.get('.hand .tile').should('exist');
    getWelcome().should('not.exist');
  });

  it('should not come back after Escape closed it', () => {
    cy.visitAsNewPlayer('/');
    getWelcome().should('have.focus');
    cy.get('body').type('{esc}');
    getWelcome().should('not.exist');
    getSeen().should('equal', 'true');

    cy.reload();
    cy.get('.hand .tile').should('exist');
    getWelcome().should('not.exist');
  });

  it('should open on a first visit that comes by a link to a hand', () => {
    cy.visitAsNewPlayer(`/?hand=${RON_HAND}`);
    getWelcome().should('exist');
    cy.contains('.welcome-dialog button', 'Start').click();
    cy.location('search').should('equal', `?hand=${RON_HAND}`);
  });

  it('should fit the narrowest phone in every language', () => {
    ['en', 'ja', 'ko', 'zh_cn'].forEach((language) => {
      cy.viewport(320, 568);
      cy.visitAsNewPlayer('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('mahjong-language', language);
        },
      });
      cy.get('html').should('have.attr', 'lang', language.replace('_', '-'));
      waitForAnimations();
      getWelcome().should(([dialog]) => {
        const box = dialog.getBoundingClientRect();
        expect(box.left).to.be.at.least(0);
        expect(box.right).to.be.at.most(320);
        expect(box.top).to.be.at.least(0);
        expect(box.bottom).to.be.at.most(568);
        expect(dialog.scrollWidth).to.equal(dialog.clientWidth);
      });
    });
  });

  it('should open again on every load when storage is blocked', () => {
    cy.visitAsNewPlayer('/');
    cy.window().then((win) => {
      cy.stub(win.Storage.prototype, 'setItem').throws();
    });
    cy.contains('.welcome-dialog button', 'Start').click();
    getWelcome().should('not.exist');
    cy.contains('button', 'New Hand').click();
    getWelcome().should('not.exist');

    cy.reload();
    getWelcome().should('exist');
  });
});
