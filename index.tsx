import React from 'react';
import ReactDOM from 'react-dom/client';
import posthog from 'posthog-js';
import App from './App';

// Initialize PostHog
const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST;

if (posthogKey && posthogHost) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    person_profiles: 'identified_only', // Only create profiles for identified users
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: {
      dom_event_allowlist: ['click', 'submit', 'change'], // Only capture meaningful interactions
      url_allowlist: [window.location.origin] // Only capture events from this domain
    }
  });
} else {
  console.warn('PostHog analytics disabled: Missing environment variables');
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