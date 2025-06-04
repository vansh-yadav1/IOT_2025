import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/purple-theme.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import global styles and fonts
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Measure performance
reportWebVitals(); 