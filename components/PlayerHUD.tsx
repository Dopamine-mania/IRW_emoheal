import React, { useState, useRef } from 'react';
import { useStore, ElementType } from '../store';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { getNextTrack, getPreviousTrack } from '../utils/musicLibrary';

// Element metadata for display
const ELEMENT_INFO: Record<ElementType, { name: string; icon: string; color: string }> = {
  wood: { name: '木', icon: '🌲', color: '#22d3ee' },
  fire: { name: '火', icon: '🔥', color: '#f43f5e' },
  earth: { name: '土', icon: '⛰️', color: '#fbbf24' },
  metal: { name: '金', icon: '⚡', color: '#e2e8f0' },
  water: { name: '水', icon: '💧', color: '#3b82f6' }
};

export const PlayerHUD: React.FC = () => {
  const currentElement = useStore(state => state.currentElement) || 'water';
  const currentTrack = useStore(state => state.currentTrack);
  const isPlaying = useStore(state => state.isPlaying);
  const currentTime = useStore(state => state.currentTime);
  const setIsPlaying = useStore(state => state.setIsPlaying);
  const setCurrentTrack = useStore(state => state.setCurrentTrack);
  const toggleMusicPlaylist = useStore(state => state.toggleMusicPlaylist);

  const { seekTo } = useMusicPlayer();

  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const elementInfo = ELEMENT_INFO[currentElement];
  const trackName = currentTrack?.title || 'Loading...';
  const duration = currentTrack?.duration || 180;

  // 修复闪烁：当拖动时使用拖动进度，否则使用实际播放进度
  const displayProgress = isDragging ? dragProgress : (currentTime / duration) * 100;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    if (currentTrack) {
      const nextTrack = getNextTrack(currentElement, currentTrack.id);
      setCurrentTrack(nextTrack);
      setIsPlaying(true);
    }
  };

  const handlePreviousTrack = () => {
    if (currentTrack) {
      const previousTrack = getPreviousTrack(currentElement, currentTrack.id);
      setCurrentTrack(previousTrack);
      setIsPlaying(true);
    }
  };

  const calculateProgress = (clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    return percentage;
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const percentage = calculateProgress(e.clientX);
    setDragProgress(percentage * 100);
  };

  const handleProgressMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const percentage = calculateProgress(e.clientX);
      setDragProgress(percentage * 100);
    }
  };

  const handleProgressMouseUp = (e: MouseEvent) => {
    if (isDragging) {
      const percentage = calculateProgress(e.clientX);
      const newTime = percentage * duration;
      seekTo(newTime);
      setIsDragging(false);
    }
  };

  // 添加全局鼠标事件监听
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleProgressMouseMove);
      window.addEventListener('mouseup', handleProgressMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleProgressMouseMove);
        window.removeEventListener('mouseup', handleProgressMouseUp);
      };
    }
  }, [isDragging, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
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

        {/* Previous Track Button */}
        <button
          onClick={handlePreviousTrack}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            flexShrink: 0,
            color: 'white',
            fontSize: '16px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${elementInfo.color}33`;
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ⏮
        </button>

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

        {/* Next Track Button */}
        <button
          onClick={handleNextTrack}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            flexShrink: 0,
            color: 'white',
            fontSize: '16px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${elementInfo.color}33`;
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ⏭
        </button>

        {/* V2: Music Playlist Button */}
        <button
          onClick={toggleMusicPlaylist}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            flexShrink: 0,
            color: 'white',
            fontSize: '16px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${elementInfo.color}33`;
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="View Full Playlist"
        >
          🎵
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
            ref={progressBarRef}
            onMouseDown={handleProgressMouseDown}
            style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer'
            }}
          >
            {/* Progress Fill */}
            <div
              style={{
                height: '100%',
                width: `${displayProgress}%`,
                background: `linear-gradient(90deg, ${elementInfo.color}, ${elementInfo.color}cc)`,
                borderRadius: '3px',
                transition: isDragging ? 'none' : 'width 0.1s linear',
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
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
