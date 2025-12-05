import React from 'react';
import { useStore } from '../store';

export const Footer: React.FC = () => {
  const phase = useStore(state => state.phase);

  // Hide footer during immersive phases (resonance and tuning)
  if (phase === 'resonance' || phase === 'tuning') {
    return null;
  }

  return (
    <footer style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '12px 20px',
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '20px',
      fontSize: '11px',
      zIndex: 10,
      color: 'rgba(255, 255, 255, 0.7)',
      transition: 'opacity 0.3s ease'
    }}>
      <a
        href="/privacy-policy"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: 'rgba(255, 255, 255, 0.7)',
          textDecoration: 'none',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#22d3ee'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
      >
        Privacy Policy
      </a>

      <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</span>

      <a
        href="mailto:privacy@irwemoheal.com"
        style={{
          color: 'rgba(255, 255, 255, 0.7)',
          textDecoration: 'none',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#22d3ee'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
      >
        Contact
      </a>

      <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</span>

      <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '10px' }}>
        © 2025 IRW EmoHeal
      </span>
    </footer>
  );
};
