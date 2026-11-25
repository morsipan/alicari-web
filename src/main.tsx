import React from 'react'
import ReactDOM from 'react-dom/client'
import DemoOne from './components/demo'
import { PortfolioGallery } from './components/portfolio-gallery'
import { LabsHomeSection } from './components/labs/LabsHomeSection'
import { BackgroundGradientAnimationDemo } from './components/cta-demo'
import './index.css'

const heroRoot = document.getElementById('hero-root');
if (heroRoot) {
  ReactDOM.createRoot(heroRoot).render(
    <React.StrictMode>
      <DemoOne />
    </React.StrictMode>,
  );
}

const portfolioRoot = document.getElementById('portfolio-root');
if (portfolioRoot) {
  ReactDOM.createRoot(portfolioRoot).render(
    <React.StrictMode>
      <PortfolioGallery />
    </React.StrictMode>,
  );
}

const labsHomeRoot = document.getElementById('labs-home-root');
if (labsHomeRoot) {
  ReactDOM.createRoot(labsHomeRoot).render(
    <React.StrictMode>
      <LabsHomeSection />
    </React.StrictMode>,
  );
}

const ctaRoot = document.getElementById('cta-root');
if (ctaRoot) {
  ReactDOM.createRoot(ctaRoot).render(
    <React.StrictMode>
      <BackgroundGradientAnimationDemo />
    </React.StrictMode>,
  );
}
