import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n/config';
import { RTLProvider } from './providers/rtl-provider';
import { ThemeProvider } from './providers/theme-provider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RTLProvider>
          <App />
        </RTLProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
