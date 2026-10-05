import { defineConfig } from 'cypress';
import { configureVisualRegression } from 'cypress-visual-regression';

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: 'http://localhost:5173',
    expose: {
      visualRegressionType: 'regression',
    },
    screenshotsFolder: './cypress/snapshots/actual',
    setupNodeEvents(on, _config) {
      configureVisualRegression(on);

      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'firefox') {
          launchOptions.preferences[
            'layout.css.prefers-color-scheme.content-override'
          ] = 1;
        }
        return launchOptions;
      });
    },
  },
});
