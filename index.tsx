import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// PostHog initialization is now handled by CookieBanner component
// Only initialize if user has previously consented
const consent = localStorage.getItem('irw_cookie_consent');
if (consent === 'accepted') {
  // Import and initialize PostHog dynamically
  import('./components/CookieBanner').then(({ initializePostHog }) => {
    initializePostHog();
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);