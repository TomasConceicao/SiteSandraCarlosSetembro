import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initImageProtection } from './utils/imageProtection';
import { initAnalytics } from './utils/analytics';

// Inicializa a proteção de imagens
initImageProtection();

// Inicializa condicionalmente Google Analytics 4, Tag Manager e Search Console
initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
