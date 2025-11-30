import React, { useState, useEffect } from 'react';
import { useStore, ElementType } from '../store';

// Element metadata for display
const ELEMENT_INFO: Record<ElementType, { name: string; icon: string; color: string }> = {
  wood: { name: '木', icon: '🌲', color: '#22d3ee' },
  fire: { name: '火', icon: '🔥', color: '#f43f5e' },
  earth: { name: '土', icon: '⛰️', color: '#fbbf24' },
  metal: { name: '金', icon: '⚡', color: '#e2e8f0' },
  water: { name: '水', icon: '💧', color: '#3b82f6' }
};

const ELEMENT_TRACKS: Record<ElementType, string> = {
  wood: 'Forest Meditation - Bamboo Whispers',
  fire: 'Fire Resonance - Heart Awakening',
  earth: 'Earth Grounding - Mountain Echoes',
  metal: 'Metal Clarity - Crystal Breath',
  water: 'Water Flow - Ocean Depths'
};

export const PlayerHUD: React.FC = () => {
  const currentElement = useStore(state => state.currentElement) || 'water';
  const isMicReady = useStore(state => state.isMicReady);
  const setMicReady = useStore(state => state.setMicReady);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const elementInfo = ELEMENT_INFO[currentElement];
  const trackName = ELEMENT_TRACKS[currentElement];

  // Simulate progress for now (since we're using mic input)
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 0.5));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (!isMicReady && !isPlaying) {
      // Request microphone access on first play
      setMicReady(true);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '5%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        maxWidth: '90vw',
        zIndex: 1000,
        pointerEvents: 'auto'
      }}
    >
      {/* Song Title */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '12px',
          color: 'white',
          fontSize: '14px',
          fontWeight: '300',
          textShadow: '0 0 8px rgba(0,0,0,0.5)',
          letterSpacing: '1px'
        }}
      >
        {trackName}
      </div>

      {/* Glassmorphism Player Container */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '50px',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Element Icon (Left) */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${elementInfo.color}33, ${elementInfo.color}66)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0,
            boxShadow: `0 0 20px ${elementInfo.color}44`,
            border: `1px solid ${elementInfo.color}88`
          }}
        >
          {elementInfo.icon}
        </div>

        {/* Play/Pause Button (Center) */}
        <button
          onClick={handlePlayPause}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${elementInfo.color}88, ${elementInfo.color}cc)`,
            border: `2px solid ${elementInfo.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: `0 4px 16px ${elementInfo.color}66, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
            flexShrink: 0,
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = `0 6px 24px ${elementInfo.color}88, inset 0 1px 0 rgba(255, 255, 255, 0.3)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = `0 4px 16px ${elementInfo.color}66, inset 0 1px 0 rgba(255, 255, 255, 0.2)`;
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Progress Bar Container (Right) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Element Name */}
          <div
            style={{
              color: elementInfo.color,
              fontSize: '12px',
              fontWeight: '500',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}
          >
            {elementInfo.name} Element
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Progress Fill */}
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${elementInfo.color}, ${elementInfo.color}cc)`,
                borderRadius: '3px',
                transition: 'width 0.2s linear',
                boxShadow: `0 0 8px ${elementInfo.color}88`
              }}
            />

            {/* Glow Effect */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '20%',
                background: `linear-gradient(90deg, transparent, ${elementInfo.color}22)`,
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* Time Display */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontWeight: '300'
            }}
          >
            <span>{Math.floor(progress / 100 * 180 / 60)}:{String(Math.floor(progress / 100 * 180 % 60)).padStart(2, '0')}</span>
            <span>3:00</span>
          </div>
        </div>
      </div>
    </div>
  );
};
