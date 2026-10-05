import { addCompareSnapshotCommand } from 'cypress-visual-regression/dist/command';

addCompareSnapshotCommand();

Cypress.on('window:before:load', (win) => {
  win.addEventListener(
    'beforeinstallprompt',
    (event) => {
      if (!event.fromTest) {
        event.stopImmediatePropagation();
      }
    },
    true,
  );
});

// Once the service worker is installed it serves the page from its own cache,
// and that page never passes through Cypress, so onBeforeLoad runs too late.
// Tests that fake a device setting then fail some of the time. So no page in a
// test gets to register a worker, and any left over from an earlier run gets
// unregistered.
Cypress.on('window:before:load', (win) => {
  if (win.navigator.serviceWorker) {
    win.navigator.serviceWorker.register = () => new Promise(() => {});
  }
});

before(() => {
  cy.visit('/');
  cy.window().then(async (win) => {
    const registrations = await win.navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => registration.unregister()),
    );
  });
});
