import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './contexts/ThemeContext';
import './theme/theme.css';
import './theme/theme.local.css';
import './theme/effects.css';
import './theme/components.css';
import './theme/dropdown.css';
import './theme/site-header.css';
import './theme/site-header.local.css';
import './theme/site-footer.css';
import './theme/site-footer.local.css';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
