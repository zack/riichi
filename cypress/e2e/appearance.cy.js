import { RON_HAND, openHelp, pick, typeInBox, visitHand } from '../support/app';
import { switchToDarkMode } from '../support/options';

describe('A page that says it is taller than the screen', () => {
  const HIDDEN = 275;

  it('should end a dialog where the screen ends', () => {
    cy.viewport(414, 968);
    cy.visit(`/?hand=${RON_HAND}`, {
      onBeforeLoad(win) {
        Object.defineProperty(win.visualViewport, 'height', {
          get: () => win.innerHeight - HIDDEN,
        });
      },
    });
    openHelp();

    cy.get('.rt-BaseDialogScroll').then(([scroller]) => {
      const visibleHeight =
        scroller.ownerDocument.defaultView.innerHeight - HIDDEN;
      scroller.scrollTop = scroller.scrollHeight;

      expect(scroller.getBoundingClientRect().bottom).to.equal(visibleHeight);
      expect(
        scroller.querySelector('.help-dialog').getBoundingClientRect().bottom,
      ).to.be.lessThan(visibleHeight);
    });
  });

  it('should leave a dialog alone where the page and the screen agree', () => {
    visitHand(RON_HAND);
    openHelp();

    cy.document().then((doc) => {
      expect(doc.documentElement.style.cssText).to.not.contain('--visible');
    });
  });
});

describe('Theme', () => {
  const themeRadio = (name) =>
    cy.contains('.theme-segment', name).find('input');

  it('should follow the device when it goes dark with the page open', () => {
    const listeners = [];

    cy.visit(`/?hand=${RON_HAND}`, {
      onBeforeLoad: (win) => {
        const matchMedia = win.matchMedia.bind(win);
        win.matchMedia = (query) =>
          query.includes('prefers-color-scheme: dark')
            ? {
                addEventListener: (_type, listener) => listeners.push(listener),
                matches: false,
                media: query,
                removeEventListener: () => {},
              }
            : matchMedia(query);
      },
    });
    cy.get('html').should('not.have.class', 'dark');
    cy.wrap(listeners).should('have.length.at.least', 1);

    cy.then(() => {
      listeners.forEach((listener) => listener({ matches: true }));
    });
    cy.get('html').should('have.class', 'dark');
  });

  it('should switch to dark mode and stay there after a reload', () => {
    visitHand(RON_HAND);
    cy.get('meta[name="theme-color"]').should(
      'have.attr',
      'content',
      '#ffffff',
    );
    switchToDarkMode();
    cy.get('meta[name="theme-color"]').should(
      'have.attr',
      'content',
      '#272a2d',
    );

    cy.reload();
    cy.get('html').should('have.class', 'dark');
    cy.get('button[aria-label="Options"]').click();
    cy.get('[role="radiogroup"][aria-labelledby="theme-label"]').should(
      'exist',
    );
    cy.get('#theme-label').should('have.text', 'Theme');
    themeRadio('Dark').should('be.checked');
  });

  it('should take a tap anywhere in the height of the control', () => {
    visitHand(RON_HAND);
    cy.get('button[aria-label="Options"]').click();
    cy.get('.theme-segments')
      .scrollIntoView()
      .then((track) => {
        const trackBox = track[0].getBoundingClientRect();
        const dark = Cypress.$('.theme-segment:contains("Dark")')[0];
        const darkBox = dark.getBoundingClientRect();
        const middle = darkBox.left + darkBox.width / 2;

        [trackBox.top + 0.5, trackBox.bottom - 0.5].forEach((edge) => {
          expect(track[0].ownerDocument.elementFromPoint(middle, edge)).to.eq(
            dark,
          );
        });
      });
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
  it('should give every kind of control the same focus ring', () => {
    const getRing = (element) => {
      const style = getComputedStyle(element[0]);
      return `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`;
    };

    visitHand(RON_HAND);
    cy.get('button[aria-label="Options"]').focus();
    cy.focused().then((button) => {
      const ring = getRing(button);
      const hasRing = (control) => {
        expect(getRing(control)).to.equal(ring);
      };

      expect(ring).to.match(/^solid 2px /);
      cy.get('.skip-link').focus();
      cy.focused().should(hasRing);
      cy.get('.bigger-hand-button').focus();
      cy.focused().should(hasRing);
      openHelp('About');
      cy.get('.help-content a').first().focus();
      cy.focused().should(hasRing);
    });
  });

  it('should move focus to New Hand on a check, then up to the hand', () => {
    visitHand(RON_HAND);
    pick('han', '1');
    pick('fu', '60');
    typeInBox('points', '2000');
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
    typeInBox('points', '2000');
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
    cy.window().then((win) => {
      expect(win.localStorage.getItem('mahjong-language')).to.equal('ja');
    });

    cy.reload();
    cy.get('html').should('have.attr', 'lang', 'ja');
    cy.get('button[type="submit"]').should('have.text', '答えを見る');
  });
});
