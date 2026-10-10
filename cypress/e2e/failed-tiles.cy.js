import {
  RED_FIVE_HAND,
  RON_HAND,
  RON_HAND_TILE_COUNT,
  isGreen,
  isRed,
  openHelp,
  turnOnOptions,
  visitHand,
} from '../support/app';
import { switchToDarkMode } from '../support/options';

describe('Tiles whose drawings fail to load', () => {
  const failEveryDrawing = () => {
    cy.intercept('/assets/tiles/**', { statusCode: 404 });
  };

  const textsShouldBe = (selector, expected) => {
    cy.get(selector).should((texts) => {
      expect([...texts].map((text) => text.textContent)).to.eql(expected);
    });
  };

  it("should print each tile's name where its drawing would be", () => {
    failEveryDrawing();
    visitHand(RED_FIVE_HAND);

    textsShouldBe('.hand .tile.failed > .tile-text', [
      '6s',
      '7s',
      '6p',
      '7p',
      '8p',
      '0m',
      '5m',
      '8s',
      '2p',
      '3p',
      '4p',
      'Rd',
      'Rd',
      'Rd',
    ]);
    textsShouldBe('.info .tile.failed > .tile-text', ['E', 'W', '7m']);
    cy.get('.tile-text').each((text) => {
      cy.wrap(text).should('be.visible');
      cy.wrap(text).should('have.attr', 'aria-hidden', 'true');
    });
    cy.get('.tile.failed img').each((image) => {
      cy.wrap(image).should('have.css', 'opacity', '0');
    });
  });

  it('should leave the full name for a screen reader', () => {
    failEveryDrawing();
    visitHand(RED_FIVE_HAND);

    cy.get('.hand .tile.failed').should('have.length', 14);
    cy.get('.hand .tile.failed img[alt="red 5 man"]').should((img) => {
      expect(getComputedStyle(img[0]).display).not.to.equal('none');
      expect(getComputedStyle(img[0]).visibility).to.equal('visible');
    });
    cy.get('.hand .tile.failed img[alt="2 pin (called)"]').should('exist');
  });

  it('should print a red five in red and nothing else', () => {
    failEveryDrawing();
    visitHand(RED_FIVE_HAND);

    cy.contains('.hand .tile-text', '0m').should((text) => {
      expect(isRed(getComputedStyle(text[0]).color)).to.equal(true);
    });
    cy.contains('.hand .tile-text', '5m').then((five) => {
      const ink = getComputedStyle(five[0]).color;
      cy.get('.tile-text:not(.red)').each((text) => {
        cy.wrap(text).should('have.css', 'color', ink);
      });
    });
    cy.get('.tile-text.red').should('have.length', 1);
  });

  it('should turn the name of a called tile with the tile', () => {
    failEveryDrawing();
    visitHand(RED_FIVE_HAND);

    cy.get('.hand .tile.called > .tile-text').should('have.length', 2);
    cy.get('.hand .tile.called > .tile-text').each((text) => {
      cy.wrap(text).should(
        'have.css',
        'transform',
        'matrix(0, 1, -1, 0, 0, 0)',
      );
    });
    cy.get('.hand .tile:not(.called) > .tile-text').each((text) => {
      cy.wrap(text).should('have.css', 'transform', 'none');
    });
  });

  it('should make a face-down tile green with no name', () => {
    failEveryDrawing();
    visitHand(RON_HAND);

    cy.get('.hand .tile.failed > .tile-text:empty').should('have.length', 2);
    cy.get('.hand .tile.failed:has(> .tile-text:empty)').each((tile) => {
      cy.wrap(tile).should((faceDown) => {
        expect(isGreen(getComputedStyle(faceDown[0]).backgroundColor)).to.equal(
          true,
        );
      });
    });
    switchToDarkMode();
    turnOnOptions('High contrast');
    cy.get('.hand .tile.failed:has(> .tile-text:empty)').each((tile) => {
      cy.wrap(tile).should((faceDown) => {
        expect(isGreen(getComputedStyle(faceDown[0]).backgroundColor)).to.equal(
          true,
        );
      });
    });
  });

  it("should use each language's own names for the honors", () => {
    failEveryDrawing();
    cy.visit(`/?hand=${RED_FIVE_HAND}`, {
      onBeforeLoad: (win) => {
        win.localStorage.setItem('mahjong-language', 'ja');
      },
    });

    textsShouldBe('.info .tile.failed > .tile-text', ['東', '西', '7m']);
    cy.get('.hand .tile-group')
      .last()
      .find('.tile-text')
      .first()
      .should('have.text', '中');
  });

  it('should not name a tile twice when the names are on', () => {
    failEveryDrawing();
    visitHand(RED_FIVE_HAND);
    turnOnOptions('Names on tiles');

    cy.get('.hand-card .tile-label').should('have.length', 17);
    cy.get('.hand-card .tile-label').each((label) => {
      cy.wrap(label).should('have.css', 'visibility', 'hidden');
    });
  });

  it('should print the names in the bigger view and the help', () => {
    failEveryDrawing();
    visitHand(RED_FIVE_HAND);

    cy.get('.bigger-hand-button').click();
    cy.get('.bigger-hand .tile.failed > .tile-text').should('have.length', 17);
    cy.contains('.bigger-hand .tile-text', '0m').should('be.visible');
    cy.contains('button', 'Close').click();

    openHelp('Yaku');
    cy.get('.help-content .tile').then((tiles) => {
      cy.get('.help-content .tile.failed').should('have.length', tiles.length);
    });
    cy.get('.help-content .tile.failed > .tile-text')
      .first()
      .should((text) => {
        expect(getComputedStyle(text[0]).display).to.equal('flex');
      });
  });

  it('should leave a tile whose drawing loaded as it is', () => {
    const failedAreAllSou = () => {
      cy.get('.tile img').should((images) => {
        [...images].forEach((image) => {
          expect(image.complete, image.alt).to.equal(true);
          expect(
            image.closest('.tile').classList.contains('failed'),
            image.alt,
          ).to.equal(image.src.includes('/Sou'));
        });
      });
    };

    cy.intercept('/assets/tiles/Sou*', { statusCode: 404 });
    visitHand(RED_FIVE_HAND);
    textsShouldBe('.hand .tile-text', ['6s', '7s', '8s']);
    failedAreAllSou();

    for (let hand = 0; hand < 5; hand++) {
      cy.contains('button', 'New Hand').click();
      failedAreAllSou();
    }
  });

  it('should hide the names in the help until a drawing fails', () => {
    visitHand(RON_HAND);
    openHelp('Yaku');

    cy.get('.help-content .tile-text').should('have.length.at.least', 100);
    cy.get('.help-content .tile-text').each((text) => {
      cy.wrap(text).should('have.css', 'display', 'none');
    });
    cy.get('.hand .tile-text').should('not.exist');
  });
});

describe('Tiles whose drawings are slow to load', () => {
  const DRAWING_COUNT = 76;
  const TILE_SET_SIZE = DRAWING_COUNT / 2;

  const SLOW_DRAWING_DELAY = 3500;

  // Longer than SLOW_AFTER in src/components/Tile.jsx
  const NAME_WAIT = 400;

  // For some reason Firefox requests some drawings twice when it's run through
  // Cypress
  const COUNTS_REQUESTS = { browser: '!firefox' };

  const listDrawingRequests = () => {
    const paths = [];
    cy.intercept('/assets/tiles/**', (request) => {
      paths.push(new URL(request.url).pathname);
    });
    return paths;
  };

  const drawingsShouldAllBeLoaded = () => {
    cy.get('.hand-card .tile img').should((images) => {
      [...images].forEach((image) => {
        expect(image.complete, image.alt).to.equal(true);
        expect(image.naturalWidth, image.alt).to.be.greaterThan(0);
      });
    });
  };

  it("should print each tile's name until its drawing arrives", () => {
    // cy.visit doesn't resolve until the hand's drawings have loaded, so the
    // slow ones are the fancy tiles, which the hand switches to afterwards
    let letGoAt;
    cy.intercept('/assets/tiles/fancy/**', (request) => {
      letGoAt ??= Date.now() + SLOW_DRAWING_DELAY;
      request.on('response', (response) => {
        response.setDelay(Math.max(0, letGoAt - Date.now()));
      });
    });
    visitHand(RED_FIVE_HAND);
    turnOnOptions('Fancy tiles');

    cy.get('.hand .tile.slow > .tile-text').should((texts) => {
      expect([...texts].map((text) => text.textContent)).to.eql([
        '6s',
        '7s',
        '6p',
        '7p',
        '8p',
        '0m',
        '5m',
        '8s',
        '2p',
        '3p',
        '4p',
        'Rd',
        'Rd',
        'Rd',
      ]);
    });
    cy.contains('.hand .tile.slow > .tile-text', '0m').should('be.visible');
    cy.get('.hand .tile.slow img[alt="red 5 man"]').should('exist');
    cy.get('.tile.failed').should('not.exist');

    drawingsShouldAllBeLoaded();
    cy.get('.tile.slow').should('not.exist');
    cy.get('.hand-card .tile-text').should('not.exist');
    cy.get('.hand .tile img[alt="red 5 man"]').should(
      'have.css',
      'opacity',
      '1',
    );
  });

  it('should never give an image on the page another drawing', () => {
    visitHand(RED_FIVE_HAND);
    drawingsShouldAllBeLoaded();

    cy.get('.hand-card .tile img').then((images) => {
      const before = [...images].map((image) => ({
        image,
        src: image.getAttribute('src'),
      }));

      cy.window().then((win) => {
        win.history.pushState({}, '', `/?hand=${RON_HAND}`);
        win.dispatchEvent(new win.PopStateEvent('popstate'));
      });
      cy.get('.hand-card .tile img').should('have.length', RON_HAND_TILE_COUNT);

      cy.get('.hand-card .tile img').should((after) => {
        const kept = before.filter(({ image }) => image.isConnected);
        kept.forEach(({ image, src }) => {
          expect(image.getAttribute('src'), image.alt).to.equal(src);
        });
        expect(kept.length).to.be.lessThan(before.length / 2);
        expect([...after].map((image) => image.alt)).to.include('1 sou');
      });
    });
  });

  it('should not print the name of a tile whose drawing is here', () => {
    const paths = listDrawingRequests();
    visitHand(RED_FIVE_HAND);
    cy.wrap(paths).should('have.length', DRAWING_COUNT);
    drawingsShouldAllBeLoaded();

    cy.get('.hand-card').then((card) => {
      const names = [];
      new MutationObserver((records) => {
        records.forEach((record) => {
          record.addedNodes.forEach((node) => {
            if (node.classList?.contains('tile-text')) {
              names.push(node.textContent);
            }
          });
        });
      }).observe(card[0], { childList: true, subtree: true });

      for (let hand = 0; hand < 10; hand++) {
        cy.contains('button', 'New Hand').click();
        cy.get('.hand-card .tile img').then((images) => {
          [...images].forEach((image) => {
            expect(image.complete, image.alt).to.equal(true);
          });
        });
      }
      cy.wait(NAME_WAIT);
      cy.wrap(names).should('be.empty');
    });
  });

  it('should fetch the other drawings once the hand has its own', () => {
    const paths = [];
    const arrivedBefore = [];
    let arrived = 0;
    cy.intercept('/assets/tiles/**', (request) => {
      paths.push(new URL(request.url).pathname);
      arrivedBefore.push(arrived);
      request.on('response', (response) => {
        response.setDelay(200);
      });
      request.on('after:response', () => {
        arrived += 1;
      });
    });
    visitHand(RED_FIVE_HAND);

    cy.wrap(paths, { timeout: 15000 }).should('have.length', DRAWING_COUNT);
    cy.get('.hand-card .tile img').should((images) => {
      const onScreen = new Set(
        [...images].map((image) => image.getAttribute('src')),
      );

      expect(paths.slice(0, onScreen.size).sort()).to.eql([...onScreen].sort());
      arrivedBefore.slice(onScreen.size).forEach((count) => {
        expect(count).to.be.at.least(onScreen.size);
      });
    });

    cy.wrap(paths).should((asked) => {
      expect(new Set(asked).size).to.equal(DRAWING_COUNT);
      asked.forEach((path, index) => {
        expect(path.includes('/fancy/'), path).to.equal(index >= TILE_SET_SIZE);
      });
    });
  });

  it(
    'should fetch each drawing once however the game goes on',
    COUNTS_REQUESTS,
    () => {
      const paths = listDrawingRequests();
      visitHand(RED_FIVE_HAND);
      cy.wrap(paths).should('have.length', DRAWING_COUNT);

      for (let hand = 0; hand < 5; hand++) {
        cy.contains('button', 'New Hand').click();
      }
      turnOnOptions('Fancy tiles');
      cy.get('.hand-card.fancy-tiles').should('exist');
      for (let hand = 0; hand < 5; hand++) {
        cy.contains('button', 'New Hand').click();
      }
      drawingsShouldAllBeLoaded();
      cy.get('.hand-card .tile img').each((image) => {
        expect(image.attr('src')).to.include('/fancy/');
      });

      cy.wait(NAME_WAIT);
      cy.wrap(paths).should((asked) => {
        const askedTwice = asked.filter(
          (path, index) => asked.indexOf(path) !== index,
        );
        expect(askedTwice).to.eql([]);
        expect(asked.length).to.equal(DRAWING_COUNT);
      });
    },
  );

  it(
    'should fetch the fancy drawings first when they are in use',
    COUNTS_REQUESTS,
    () => {
      const paths = listDrawingRequests();
      cy.visit(`/?hand=${RED_FIVE_HAND}`, {
        onBeforeLoad: (win) => {
          win.localStorage.setItem(
            'mahjong-options',
            JSON.stringify({ fancyTiles: true }),
          );
        },
      });
      cy.get('.hand-card.fancy-tiles').should('exist');

      cy.wrap(paths).should('have.length', DRAWING_COUNT);
      cy.wrap(paths).should((asked) => {
        asked.forEach((path, index) => {
          expect(path.includes('/fancy/'), path).to.equal(
            index < TILE_SET_SIZE,
          );
        });
      });
    },
  );
});
