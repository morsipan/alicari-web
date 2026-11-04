import React from 'react';
import ReactDOM from 'react-dom/client';
import { RifaApp } from './components/RifaApp';
import './index.css';

const rootElement = document.getElementById('rifa-root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RifaApp />
    </React.StrictMode>
  );
}
