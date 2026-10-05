import { waitForAnimations, waitForScrollToStop } from '../support/wait';

const RON_HAND_PAGE = '/?hand=2011010101gm-00a9-0000-370cfc0a2';

const VIEWPORT_WIDTH = 412;
const VIEWPORT_HEIGHT = 600;

const ERROR_THRESHOLD = 0.01;

const FULL_PAGE = { capture: 'fullPage', errorThreshold: ERROR_THRESHOLD };

const visit = (appearance) => {
  cy.viewport(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
  cy.visit(RON_HAND_PAGE);
  if (appearance === 'dark') {
    cy.get('button[aria-label="Dark mode"]').click();
    cy.get('html').should('have.class', 'dark');
    cy.get('button[aria-label="Dark mode"]').blur();
  }
  cy.document().its('fonts.status').should('equal', 'loaded');
  cy.get('.hand .tile img').should('be.visible');
};

const checkStates = (appearance) => {
  beforeEach(() => {
    visit(appearance);
  });

  it('should match the starting screen', () => {
    cy.compareSnapshot(`${appearance}-start`, FULL_PAGE);
  });

  it('should match the answers once picked', () => {
    cy.contains('[role="radio"]', /^6$/).click();
    cy.contains('[role="radio"]', /^60$/).click();
    cy.get('#points').type('2000').blur();
    cy.compareSnapshot(`${appearance}-picked`, FULL_PAGE);
  });

  it('should match a checked answer', () => {
    cy.contains('[role="radio"]', /^6$/).click();
    cy.contains('[role="radio"]', /^60$/).click();
    cy.get('#points').type('1000');
    cy.contains('button', 'Check Answer').click();
    cy.get('.color-card.purple').should('exist');
    waitForScrollToStop();
    cy.compareSnapshot(`${appearance}-checked`, FULL_PAGE);
  });

  it('should match the options dialog', () => {
    cy.get('button[aria-label="Test Options"]').click();
    cy.get('[role="dialog"]').should('be.visible');
    waitForAnimations();
    cy.get('[role="dialog"]').compareSnapshot(
      `${appearance}-options`,
      ERROR_THRESHOLD,
    );
  });
};

describe('Visual Tests', () => {
  describe('Light mode', () => {
    checkStates('light');
  });

  describe('Dark mode', () => {
    checkStates('dark');
  });
});
