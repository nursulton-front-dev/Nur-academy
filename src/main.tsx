import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadAnalytics } from './lib/analytics';
import { inject } from '@vercel/analytics';

loadAnalytics();
inject(); // Vercel Analytics

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
