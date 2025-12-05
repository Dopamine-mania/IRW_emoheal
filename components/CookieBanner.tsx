import React, { useState, useEffect } from 'react';
import { trackEvent } from '../utils/analytics';

// This function will be called from index.tsx
export const initializePostHog = async () => {
  const posthog = (await import('posthog-js')).default;

  const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
  const posthogHost = import.meta.env.VITE_POSTHOG_HOST;

  if (posthogKey && posthogHost && !posthog.__loaded) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: {
        dom_event_allowlist: ['click', 'submit', 'change'],
        url_allowlist: [window.location.origin]
      }
    });
  }
};

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('irw_cookie_consent');

    if (!consent) {
      // No consent decision yet - show banner
      setVisible(true);
    } else if (consent === 'accepted') {
      // User previously accepted - initialize PostHog
      initializePostHog();
    }
    // If consent === 'declined', do nothing (PostHog stays disabled)
  }, []);

  const handleAccept = () => {
    localStorage.setItem('irw_cookie_consent', 'accepted');
    setVisible(false);

    // Initialize PostHog after consent
    initializePostHog();

    // Track consent (PostHog is now initialized)
    setTimeout(() => {
      trackEvent('cookie_consent_given');
    }, 100);
  };

  const handleDecline = () => {
    localStorage.setItem('irw_cookie_consent', 'declined');
    setVisible(false);

    // PostHog remains disabled - no tracking
    console.log('Analytics disabled by user preference');
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      padding: '20px',
      background: 'rgba(10, 10, 26, 0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(34, 211, 238, 0.2)',
      boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.4)',
      animation: 'slideUp 0.4s ease-out'
    }}>
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap'
      }}>
        {/* Cookie Icon */}
        <div style={{
          fontSize: '32px',
          flexShrink: 0
        }}>
          🍪
        </div>

        {/* Text Content */}
        <div style={{
          flex: 1,
          minWidth: '280px',
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <p style={{ marginBottom: '8px' }}>
            We use cookies to improve your experience and analyze site usage. Analytics cookies help us understand how you interact with IRW EmoHeal.
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
            By accepting, you consent to our use of cookies as described in our{' '}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#22d3ee',
                textDecoration: 'underline'
              }}
            >
              Privacy Policy
            </a>.
          </p>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexShrink: 0
        }}>
          <button
            onClick={handleDecline}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            Decline
          </button>

          <button
            onClick={handleAccept}
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
              border: 'none',
              borderRadius: '6px',
              color: '#000000',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 12px rgba(34, 211, 238, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(34, 211, 238, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 211, 238, 0.3)';
            }}
          >
            Accept All
          </button>
        </div>
      </div>

      {/* Mobile-responsive adjustments */}
      <style>{`
        @media (max-width: 768px) {
          .cookie-banner-content {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};
