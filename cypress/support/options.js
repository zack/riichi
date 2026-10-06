const chooseTheme = (name) => {
  cy.get('button[aria-label="Options"]').click();
  cy.contains('.theme-segment', name).click();
  cy.contains('button', 'Close').click();
  cy.get('[role="dialog"]').should('not.exist');
};

const switchToDarkMode = () => {
  chooseTheme('Dark');
  cy.get('html').should('have.class', 'dark');
};

export { chooseTheme, switchToDarkMode };
