import React from 'react';
import { useStore, ElementType } from '../store';
import { getExtendedPlaylist } from '../utils/musicLibrary';

const ELEMENT_COLORS: Record<ElementType, string> = {
  wood: '#22d3ee',
  fire: '#f43f5e',
  earth: '#fbbf24',
  metal: '#e2e8f0',
  water: '#3b82f6'
};

export const MusicPlaylistPanel: React.FC = () => {
  const currentElement = useStore(state => state.currentElement) || 'water';
  const musicPlaylistVisible = useStore(state => state.musicPlaylistVisible);
  const toggleMusicPlaylist = useStore(state => state.toggleMusicPlaylist);
  const openPaywall = useStore(state => state.openPaywall);
  const setCurrentTrack = useStore(state => state.setCurrentTrack);
  const setIsPlaying = useStore(state => state.setIsPlaying);

  const playlist = getExtendedPlaylist(currentElement);
  const color = ELEMENT_COLORS[currentElement];

  if (!musicPlaylistVisible) return null;

  const handleTrackClick = (track: any, index: number) => {
    if (index < 2) {
      // 真实歌曲，可播放
      setCurrentTrack(track);
      setIsPlaying(true);
      // Note: trackEvent will be added when analytics.ts is created
    } else {
      // 锁定歌曲，触发paywall
      // Note: trackEvent will be added when analytics.ts is created
      openPaywall('tier2_music');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '320px',
        maxHeight: '80vh',
        background: 'rgba(5, 17, 37, 0.9)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${color}`,
        borderRadius: '16px',
        padding: '20px',
        zIndex: 150,
        overflowY: 'auto',
        boxShadow: `0 0 30px ${color}33`
      }}
    >
      {/* 标题 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h3 style={{
            color: 'white',
            fontSize: '16px',
            margin: 0,
            letterSpacing: '1px'
          }}>
            {currentElement.toUpperCase()} ELEMENT
          </h3>
          <div style={{
            fontSize: '10px',
            color: color,
            letterSpacing: '2px',
            marginTop: '4px'
          }}>
            HEALING LIBRARY
          </div>
        </div>
        <button
          onClick={toggleMusicPlaylist}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: 0
          }}
        >
          ×
        </button>
      </div>

      {/* 歌曲列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {playlist.map((track, index) => {
          const isLocked = index >= 2;
          return (
            <div
              key={track.id}
              onClick={() => handleTrackClick(track, index)}
              style={{
                padding: '12px',
                background: isLocked ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                opacity: isLocked ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLocked) {
                  e.currentTarget.style.background = `${color}22`;
                  e.currentTarget.style.borderColor = color;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isLocked ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.5)',
                minWidth: '24px'
              }}>
                {String(index + 1).padStart(2, '0')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '13px',
                  color: 'white',
                  marginBottom: '2px'
                }}>
                  {track.title}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.4)'
                }}>
                  {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                </div>
              </div>
              {isLocked && (
                <div style={{ fontSize: '16px' }}>🔒</div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部提示 */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(34, 211, 238, 0.1)',
        borderRadius: '8px',
        fontSize: '11px',
        color: '#22d3ee',
        textAlign: 'center',
        lineHeight: '1.6'
      }}>
        🎵 Unlock 100+ tracks with Flow tier
      </div>
    </div>
  );
};
