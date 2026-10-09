import '@radix-ui/themes/styles.css';
import './fonts.css';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { AppearanceProvider } from './AppearanceContext';
import { I18nProvider } from './i18n/I18nContext';
import { applyIconColor, getStoredIconColor } from './scripts/HomeScreenIcon';
import './scripts/InstallPrompt';
import './scripts/ScrollbarGutter';
import './scripts/VisibleArea';

applyIconColor(getStoredIconColor());

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <I18nProvider>
      <AppearanceProvider>
        <App />
      </AppearanceProvider>
    </I18nProvider>
  </React.StrictMode>,
);
