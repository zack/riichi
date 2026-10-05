const STILL_FRAMES = 5;

// The dialogs fade in. Caught halfway, the text is at half opacity, which axe
// flags as low contrast and a screenshot captures. Infinite animations never
// finish, so skip those.
const waitForAnimations = () => {
  cy.window().then((win) =>
    Promise.all(
      win.document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getComputedTiming().endTime !== Infinity,
        )
        .map((animation) => animation.finished),
    ),
  );
};

// The scroll to the answer is done in JS, so it isn't an animation the browser
// can wait on
const waitForScrollToStop = () => {
  cy.window().then(
    (win) =>
      new Cypress.Promise((resolve) => {
        let lastY = -1;
        let stillFor = 0;

        const check = () => {
          if (win.scrollY === lastY) {
            stillFor += 1;
          } else {
            stillFor = 0;
            lastY = win.scrollY;
          }

          if (stillFor >= STILL_FRAMES) {
            resolve();
          } else {
            win.requestAnimationFrame(check);
          }
        };

        check();
      }),
  );
};

export { waitForAnimations, waitForScrollToStop };
