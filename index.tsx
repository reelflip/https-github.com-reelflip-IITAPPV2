import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// IITGEEPrep v20.0 Ultimate Sync Core - Master Production Release
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}