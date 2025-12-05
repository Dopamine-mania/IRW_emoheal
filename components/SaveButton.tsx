import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { trackEvent } from '../utils/analytics';

export const SaveButton: React.FC = () => {
  const phase = useStore(state => state.phase);
  const openEmailCapture = useStore(state => state.openEmailCapture);
  const hasSubmittedEmail = useStore(state => state.hasSubmittedEmail);
  const timeInResonance = useStore(state => state.timeInResonance);

  const [visible, setVisible] = useState(false);
  const [showTime, setShowTime] = useState<number | null>(null);

  useEffect(() => {
    // Check if email already submitted
    const emailSubmitted = localStorage.getItem('irw_email_submitted');
    if (emailSubmitted === 'true' || hasSubmittedEmail) {
      setVisible(false);
      return;
    }

    // Only show in resonance phase after 60 seconds
    if (phase === 'resonance') {
      if (timeInResonance >= 60 && !visible) {
        setVisible(true);
        setShowTime(Date.now());
      }
    } else {
      setVisible(false);
    }
  }, [phase, hasSubmittedEmail, timeInResonance, visible]);

  const handleClick = () => {
    const timeSinceVisible = showTime ? Math.round((Date.now() - showTime) / 1000) : 0;

    trackEvent('save_button_clicked', {
      time_since_visible: timeSinceVisible,
      time_in_resonance: timeInResonance
    });

    openEmailCapture();
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      right: '20px',
      zIndex: 90,
      animation: 'fadeInSlide 0.5s ease-out'
    }}>
      <style>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .save-button {
          animation: heartbeat 2s ease-in-out infinite;
        }

        .save-button:hover {
          animation: none;
        }
      `}</style>

      <button
        className="save-button"
        onClick={handleClick}
        style={{
          width: '56px',
          height: '56px',
          background: 'rgba(5, 17, 37, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(34, 211, 238, 0.5)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 20px rgba(34, 211, 238, 0.3), 0 0 40px rgba(34, 211, 238, 0.2)',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 6px 30px rgba(34, 211, 238, 0.5), 0 0 50px rgba(34, 211, 238, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(34, 211, 238, 0.3), 0 0 40px rgba(34, 211, 238, 0.2)';
        }}
        aria-label="Save this moment"
      >
        <span style={{
          filter: 'drop-shadow(0 0 8px rgba(255, 105, 180, 0.6))'
        }}>
          💾
        </span>

        {/* Tooltip */}
        <div style={{
          position: 'absolute',
          right: '70px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(5, 17, 37, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(34, 211, 238, 0.3)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px',
          color: 'white',
          whiteSpace: 'nowrap',
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}
        className="save-tooltip"
      >
        Save this moment
      </div>

      <style>{`
        .save-button:hover + .save-tooltip,
        .save-button:hover .save-tooltip {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
