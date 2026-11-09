import React from 'react';
import ReactDOM from 'react-dom/client';
import { LabsApp } from './components/labs/LabsApp';
import './index.css';

const labsRoot = document.getElementById('labs-root');
if (labsRoot) {
  ReactDOM.createRoot(labsRoot).render(
    <React.StrictMode>
      <LabsApp />
    </React.StrictMode>
  );
}

