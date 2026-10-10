import en from '../../src/i18n/translations/en.json';
import { RON_HAND, openHelp, turnOnOptions, visitHand } from '../support/app';
import { switchToDarkMode } from '../support/options';
import { dropScrollbarRoom } from '../support/page';

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

describe('Yaku in the help on a narrow phone', () => {
  const layOutHelpAsOnAPhone = () => {
    dropScrollbarRoom();
    cy.document().then((doc) => {
      const style = doc.createElement('style');
      style.textContent = '.rt-BaseDialogScroll { scrollbar-width: none; }';
      doc.head.append(style);
    });
  };

  const shouldKeepItsMargins = () => {
    cy.get('.help-dialog').should((dialog) => {
      const scroller = dialog[0].closest('.rt-BaseDialogScroll');
      const box = dialog[0].getBoundingClientRect();

      expect(scroller.clientWidth).to.equal(320);
      expect(scroller.scrollWidth).to.equal(scroller.clientWidth);
      expect(scroller.clientWidth - box.right).to.be.closeTo(box.left, 0.5);
    });
  };

  it('should fit the yaku on the narrowest phone', () => {
    cy.viewport(320, 740);
    visitHand(RON_HAND);
    openHelp('Yaku');
    cy.get('.help-yaku .tile-arrow').should('have.length.at.least', 8);

    layOutHelpAsOnAPhone();
    shouldKeepItsMargins();
  });

  it('should fit them with fancy tiles and their names too', () => {
    cy.viewport(320, 740);
    visitHand(RON_HAND);
    turnOnOptions('Fancy tiles', 'Names on tiles');
    openHelp('Yaku');
    cy.get('.help-yaku.fancy-tiles .tile-arrow').should(
      'have.length.at.least',
      8,
    );

    layOutHelpAsOnAPhone();
    shouldKeepItsMargins();
  });

  it('should keep the names on the tiles under the header', () => {
    visitHand(RON_HAND);
    turnOnOptions('Names on tiles');
    openHelp('Yaku');
    cy.get('.help-content.names-on-tiles').should('exist');

    cy.get('.help-header').then((header) => {
      cy.get('.help-content .tile-label')
        .first()
        .should((label) => {
          expect(Number(getComputedStyle(header[0]).zIndex)).to.be.above(
            Number(getComputedStyle(label[0]).zIndex),
          );
        });
    });
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

  it('should open with the focus on the dialog, and not on Close', () => {
    visitHand(RON_HAND);
    openHelp();
    cy.get('.help-dialog').should('be.focused');
  });

  it('should keep what has focus out from under the header', () => {
    visitHand(RON_HAND);
    openHelp('Yaku');

    cy.get('.help-content .wiki-link').last().focus();
    cy.get('.help-content .wiki-link').eq(5).focus();
    cy.focused().then((link) => {
      const header = Cypress.$('.help-header')[0].getBoundingClientRect();

      expect(link[0].getBoundingClientRect().top).to.be.at.least(header.bottom);
    });
  });

  it('should open on the steps, a card for each', () => {
    visitHand(RON_HAND);
    openHelp();

    cy.get('.help-dialog .dialog-title').should('have.text', 'Help');
    cy.get('.help-tabs [role="tab"]').then((tabs) => {
      expect([...tabs].map((tab) => tab.innerText)).to.deep.equal([
        'Steps',
        'Yaku',
        'Points Table',
        'About',
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
    cy.get('.help-steps .step.sums li').should('have.length', 8);
  });

  it('should shorten a name where the tabs have no room for it', () => {
    const getNames = () =>
      cy
        .get('.help-tabs [role="tab"]')
        .then((tabs) => [...tabs].map((tab) => tab.innerText));

    cy.viewport(320, 660);
    visitHand(RON_HAND);
    openHelp();
    getNames().should('deep.equal', ['Steps', 'Yaku', 'Table', 'About']);

    cy.viewport(412, 660);
    getNames().should('deep.equal', ['Steps', 'Yaku', 'Points Table', 'About']);

    cy.get('.help-tabs').then(([tabs]) => {
      expect(tabs.scrollWidth).to.equal(tabs.clientWidth);
      expect(tabs.offsetHeight).to.equal(
        tabs.firstElementChild.offsetHeight + 4,
      );
    });
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

  it('should show a tab from its top while the help is still opening', () => {
    cy.viewport(412, 800);
    visitHand(RON_HAND);

    cy.document().then((doc) => {
      doc.addEventListener(
        'animationstart',
        ({ target }) => {
          if (target.matches('.help-dialog')) {
            target.getAnimations().forEach((animation) => {
              animation.pause();
              animation.currentTime = 1;
            });
          }
        },
        true,
      );
    });
    openHelp();
    cy.get('.help-dialog').should(([dialog]) => {
      expect(dialog.getAnimations()[0].playState).to.equal('paused');
    });

    cy.contains('[role="tab"]', 'Yaku').click();
    cy.get('.help-yaku .yaku-list').should('exist');
    cy.get('.help-dialog').then(([dialog]) => {
      dialog.getAnimations().forEach((animation) => animation.finish());
    });

    cy.get('.help-dialog').should(([dialog]) => {
      expect(dialog.getBoundingClientRect().top).to.equal(
        parseFloat(getComputedStyle(dialog.parentElement).paddingTop),
      );
    });
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
    cy.get('.yaku-gloss').should('have.length', 18);
    cy.get('.yaku-gloss[lang]').should('not.exist');
  });

  it('should mark the glosses as Japanese where the page is Korean', () => {
    cy.visit(`/?hand=${RON_HAND}`, {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('mahjong-language', 'ko');
      },
    });
    cy.get('.icon-button').last().click();
    cy.get('.help-tabs [role="tab"]').eq(1).click();
    cy.get('.yaku-gloss').should('have.length', 18);
    cy.get('.yaku-gloss').each((gloss) => {
      expect(gloss).to.have.attr('lang', 'ja');
      expect(gloss.text()).to.match(JAPANESE_SCRIPT);
    });
  });

  it('should give every yaku the han it is worth', () => {
    visitHand(RON_HAND);
    openHelp('Yaku');

    cy.get('.yaku .han-badge').should((badges) => {
      expect([...badges].map((badge) => badge.textContent)).to.eql(
        [
          ['1', '1', '1', '1', '2'],
          ['1', '2'],
          ['2+', '5+'],
          ['1', '1+', '1+', '1+', '2+'],
          ['2', '2', '2'],
          ['1', '1', '1'],
        ].flat(),
      );
    });
  });

  it('should say what a yaku is worth on its badge', () => {
    visitHand(RON_HAND);
    openHelp('Yaku');

    const getYaku = (name) => cy.contains('.yaku-name', name).parents('.yaku');
    const getBadge = (name) => getYaku(name).find('.han-badge');
    const getWorth = (name) => getYaku(name).find('.yaku-worth');

    getBadge('Tanyao').should('have.text', '1');
    getBadge('Tanyao').should('not.have.class', 'closed');
    getBadge('Tanyao').should('have.attr', 'aria-hidden', 'true');
    getWorth('Tanyao').should('have.text', '1 han');
    getBadge('Pinfu').should('have.text', '1');
    getBadge('Pinfu').should('have.class', 'closed');
    getWorth('Pinfu').should('have.text', '1 han, closed hand required');
    getBadge('Chinitsu').should('have.text', '5+');
    getWorth('Chinitsu').should('have.text', '5 han, and 1 more when closed');

    cy.contains('.yaku-name', 'Pinfu')
      .next()
      .should('have.class', 'yaku-worth');

    cy.get('.yaku-legend').should('have.text', '++1 han when closed');
    cy.get('.yaku-legend .han-badge')
      .should('have.length', 1)
      .and('have.text', '+');
  });

  it('should keep the gray family readable on a dark page', () => {
    const getLuminance = (color) => {
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
    };

    visitHand(RON_HAND);
    switchToDarkMode();
    openHelp('Yaku');
    cy.contains('.yaku-name', 'Akadora')
      .parents('.yaku')
      .then((yaku) => {
        const fill = getComputedStyle(yaku[0]).backgroundColor;
        expect(fill).to.match(/^rgb\(/);

        yaku.find('.wiki-link, .yaku-gloss').each((_index, words) => {
          const [lighter, darker] = [
            getLuminance(getComputedStyle(words).color),
            getLuminance(fill),
          ].sort((first, second) => second - first);
          expect((lighter + 0.05) / (darker + 0.05)).to.be.at.least(4.5);
        });
      });
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
      'https://riichi.wiki/Iipeikou',
    );
    getLink('Tsumo').should(
      'have.attr',
      'href',
      'https://riichi.wiki/Menzenchin_tsumohou',
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
      cy.get(`${container} .tile-arrow svg`).should('have.length', 8);
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
        const tops = [...lines].map((line) => line.getBoundingClientRect().top);
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
    cy.contains('[role="tab"]', 'About').click();
    cy.get('.help-top + .help-site').should('exist');
    cy.get('.help-site')
      .should('contain', `© ${new Date().getFullYear()}`)
      .and('not.contain', '%%');
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
    cy.contains('[role="tab"]', 'About').click();
    cy.get('.help-notes p').should('have.length', 1);
  });

  it('should have no kanji or kana in English', () => {
    visitHand(RON_HAND);
    openHelp();

    [
      ['Steps', 'steps'],
      ['Yaku', 'yaku'],
      ['Table', 'table'],
      ['About', 'site'],
    ].forEach(([tab, id]) => {
      cy.contains('[role="tab"]', tab).click();
      cy.get(`.help-${id}`).should('exist');
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
    openHelp('About');

    [
      'https://github.com/Varantha/Mahjong-ScoringTrainer',
      'https://commons.wikimedia.org/wiki/User:Cangjie6',
      'https://commons.wikimedia.org/wiki/Category:SVG_Oblique_illustrations_of_Mahjong_tiles',
      'https://creativecommons.org/licenses/by-sa/4.0/',
      'https://www.reddit.com/r/Mahjong/comments/l5b221/riichi_mahjong_cheat_sheet_1_page_pdf_or_images/',
      'https://creativecommons.org/licenses/by-nc/4.0/',
    ].forEach((address) => {
      cy.get(`.help-site a[href="${address}"]`)
        .should('have.attr', 'target', '_blank')
        .and('have.attr', 'rel', 'noopener noreferrer');
    });
  });

  it('should describe every option that changes the quiz', () => {
    visitHand(RON_HAND);
    openHelp('About');

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
