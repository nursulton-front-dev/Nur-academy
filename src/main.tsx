import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadAnalytics } from './lib/analytics';

// Load GA4 + Yandex Metrica as early as possible.
// Scripts are skipped gracefully when env vars are absent.
loadAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
