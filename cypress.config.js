import { defineConfig } from 'cypress';
import { configureVisualRegression } from 'cypress-visual-regression';

const WINDOW_SIZE = '1280,1600';

export default defineConfig({
  allowCypressEnv: false,
  retries: { openMode: 0, runMode: 1 },
  e2e: {
    baseUrl: 'http://localhost:5173',
    expose: {
      visualRegressionType: 'regression',
    },
    screenshotsFolder: './cypress/snapshots/actual',
    setupNodeEvents(on, _config) {
      configureVisualRegression(on);

      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium') {
          launchOptions.args.push(`--window-size=${WINDOW_SIZE}`);
        }

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
