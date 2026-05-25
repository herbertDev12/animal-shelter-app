import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css'; // This keeps your Tailwind import active

const rootElement = document.getElementById('app');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);