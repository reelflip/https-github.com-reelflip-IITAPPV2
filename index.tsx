import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// IITGEEPrep v12.41 Ultimate Persistence Entry Point - Synchronized Release
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}