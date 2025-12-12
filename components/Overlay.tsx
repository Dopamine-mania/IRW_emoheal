
import React, { useEffect, useState, useRef } from 'react';
import { useStore, ElementType } from '../store';
import { PlayerHUD } from './PlayerHUD';
import { PhotoChoicePanel } from './PhotoChoicePanel';
import { PhotoDeconstruction } from './PhotoDeconstruction';
import { PaywallModal } from './PaywallModal';
import { MusicPlaylistPanel } from './MusicPlaylistPanel';
import { WisdomCard } from './WisdomCard';
import { TrendChart } from './TrendChart';
import { EmailCaptureModal } from './EmailCaptureModal';
import { useEmailCapture } from '../hooks/useEmailCapture';

const ELEMENT_COLORS: Record<ElementType, string> = {
  wood: '#22d3ee',
  fire: '#f43f5e',
  earth: '#fbbf24',
  metal: '#e2e8f0',
  water: '#3b82f6'
};

const ELEMENT_FREQUENCIES: Record<ElementType, string> = {
  wood: '639Hz',
  fire: '396Hz',
  earth: '528Hz',
  metal: '741Hz',
  water: '417Hz'
};

export const Overlay: React.FC = () => {
  const phase = useStore((state) => state.phase);
  const isMicReady = useStore((state) => state.isMicReady);
  const currentElement = useStore((state) => state.currentElement);
  const currentLandmark = useStore((state) => state.currentLandmark);
  const enterWorld = useStore((state) => state.enterWorld);
  const uploadedPhoto = useStore((state) => state.uploadedPhoto);
  const isPhotoChoicePanelOpen = useStore((state) => state.isPhotoChoicePanelOpen);
  const pendingLandmark = useStore((state) => state.pendingLandmark);
  const closePhotoChoicePanel = useStore((state) => state.closePhotoChoicePanel);

  // Navigation Actions
  const backToEntry = useStore((state) => state.backToEntry);
  const backToEmitter = useStore((state) => state.backToEmitter);
  const backToSelection = useStore((state) => state.backToSelection);
  const backToShards = useStore((state) => state.backToShards);

  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [overlayColor, setOverlayColor] = useState('white');
  const [message, setMessage] = useState<string | null>(null);
  const [transitionDuration, setTransitionDuration] = useState('1500ms');

  // Tuning Typewriter State
  const [tuningLines, setTuningLines] = useState<string[]>([]);

  // Feature Preview Modal State
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<'audio' | 'energy' | 'meditation' | null>(null);

  // V2: Initialize Email Capture Hook
  useEmailCapture();
  
  useEffect(() => {
    // --- Phase Transitions ---
    
    if (phase === 'transition') {
      setTransitionDuration('1500ms');
      setOverlayColor('white');
      const timer = setTimeout(() => { setOverlayOpacity(1); }, 1200);
      return () => clearTimeout(timer);
    } 
    
    if (phase === 'emitter') {
      setTransitionDuration('1000ms');
      const timer = setTimeout(() => { setOverlayOpacity(0); }, 500);
      return () => clearTimeout(timer);
    }
    
    if (phase === 'selection') {
        setTransitionDuration('50ms'); // Instant whiteout
        setOverlayColor('white');
        setOverlayOpacity(1);
        const fadeOutTimer = setTimeout(() => {
            setTransitionDuration('1500ms');
            setOverlayOpacity(0);
        }, 500);
        return () => clearTimeout(fadeOutTimer);
    }

    if (phase === 'shards') {
        setTransitionDuration('500ms');
        setOverlayColor(currentElement ? ELEMENT_COLORS[currentElement] : 'white');
        setOverlayOpacity(1); // Flash color
        const fadeOutTimer = setTimeout(() => {
             setTransitionDuration('1500ms');
             setOverlayOpacity(0);
        }, 500);
        return () => clearTimeout(fadeOutTimer);
    }

    // --- TUNING SEQUENCE LOGIC ---
    if (phase === 'tuning' && currentElement && currentLandmark) {
        setTransitionDuration('500ms');
        setOverlayColor('#000000');
        setOverlayOpacity(1); // Go to Black

        const freq = ELEMENT_FREQUENCIES[currentElement];

        // Sequence Timers - 一次显示一行，每行2秒（总时长8s）
        const steps = [
            { text: `> Target Located: ${currentLandmark.name}...`, delay: 200 },      // 第1行 (0-2s)
            { text: `> Analyzing Energy Field...`, delay: 2200 },                      // 第2行 (2-4s)
            { text: `> Calibrating to ${freq}...`, delay: 4200 },                      // 第3行 (4-6s)
            { text: `> Connection Established.`, delay: 6200 }                         // 第4行 (6-8s)
        ];

        setTuningLines([]); // Reset

        steps.forEach(({ text, delay }) => {
            setTimeout(() => {
                setTuningLines([text]); // 只显示当前行（替换模式）
            }, delay);
        });

        // Note: enterWorld() 现在由 PhotoDeconstruction 组件在动画结束后调用

        return;
    }

    if (phase === 'resonance' && currentElement) {
        // Fade out black from Tuning
        setTransitionDuration('2000ms');
        setOverlayColor('black');
        setOverlayOpacity(1); // Ensure we start black
        
        const fadeOutTimer = setTimeout(() => {
             setOverlayOpacity(0); // Reveal World
        }, 500);
        
        return () => clearTimeout(fadeOutTimer);
    }
    
    if (phase === 'timeCorridor') {
        setTransitionDuration('800ms');
        setOverlayColor('#000000');
        setOverlayOpacity(1);

        // 淡出显示场景
        const fadeOutTimer = setTimeout(() => {
            setOverlayOpacity(0);
        }, 300);

        return () => clearTimeout(fadeOutTimer);
    }

  }, [phase, currentElement, currentLandmark, enterWorld]);

  const handleBack = () => {
      if (phase === 'emitter') backToEntry();
      if (phase === 'selection') backToEmitter();
      if (phase === 'shards') backToSelection();
      if (phase === 'resonance') backToShards();
      if (phase === 'timeCorridor') backToEmitter();
  };

  // timeCorridor 有自己的返回按钮在 CorridorHUD 中，这里不显示
  const showBackButton = ['emitter', 'selection', 'shards', 'resonance'].includes(phase);

  return (
    <>
      {/* Instructions Overlay */}
      <div className={`absolute bottom-20 left-0 w-full text-center pointer-events-none transition-opacity duration-1000 ${phase === 'entry' ? 'opacity-100' : 'opacity-0'}`}>
        {/* Main Guidance */}
        <p className="text-white/80 text-sm tracking-[0.3em] uppercase font-light mb-2">
          Interactive 3D Healing Journey
        </p>
        <p className="text-white/50 text-xs tracking-[0.5em] uppercase font-light">
          Click Portal to Start
        </p>

        {/* Headphone Indicator */}
        <div className="flex items-center justify-center gap-2 mt-4 text-white/40">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
          </svg>
          <span className="text-xs">Headphones Recommended</span>
        </div>
      </div>

      {/* Feature Preview Chips */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto transition-opacity duration-1000 ${phase === 'entry' ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={() => {
            setSelectedFeature('audio');
            setShowFeatureModal(true);
          }}
          className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 text-xs hover:bg-white/20 hover:text-white/90 transition-all duration-300 hover:scale-105"
        >
          🎵 Frequency Audio
        </button>

        <button
          onClick={() => {
            setSelectedFeature('energy');
            setShowFeatureModal(true);
          }}
          className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 text-xs hover:bg-white/20 hover:text-white/90 transition-all duration-300 hover:scale-105"
        >
          🔮 Energy Reading
        </button>

        <button
          onClick={() => {
            setSelectedFeature('meditation');
            setShowFeatureModal(true);
          }}
          className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 text-xs hover:bg-white/20 hover:text-white/90 transition-all duration-300 hover:scale-105"
        >
          🧘‍♀️ Meditation
        </button>
      </div>

       {phase === 'emitter' && overlayOpacity === 0 && (
        <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none transition-opacity duration-1000 opacity-100">
          <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase font-light">
            Explore the Elements / Locate the Prism
          </p>
        </div>
      )}
      
      {/* Back Button */}
      {showBackButton && (
        <button 
            onClick={handleBack}
            className="absolute top-8 left-8 z-50 text-white/40 hover:text-white transition-colors duration-300 flex items-center gap-2 group cursor-pointer"
        >
            <div className="w-2 h-2 border-l border-b border-current rotate-45 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs tracking-[0.2em] uppercase font-light">Return</span>
        </button>
      )}

      {/* PhotoDeconstruction - 照片解构动画 */}
      {phase === 'tuning' && uploadedPhoto && (
        <PhotoDeconstruction />
      )}

      {/* The Overlay Curtain - 黑色背景 */}
      <div
        className="absolute inset-0 pointer-events-none ease-out z-20"
        style={{
            opacity: overlayOpacity,
            backgroundColor: overlayColor,
            transitionDuration: transitionDuration,
            transitionProperty: 'opacity'
        }}
      />

      {/* TUNING TYPEWRITER UI - 底部HUD终端 */}
      {phase === 'tuning' && currentElement && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-30 w-full max-w-2xl px-8">
          <div
            className="text-left font-mono p-6 rounded-lg border"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              borderColor: `${ELEMENT_COLORS[currentElement]}33`,
              boxShadow: `0 0 20px ${ELEMENT_COLORS[currentElement]}22`
            }}
          >
            {tuningLines.map((line, i) => (
              <div
                key={i}
                className="text-base md:text-lg mb-2 tracking-widest animate-pulse"
                style={{ color: ELEMENT_COLORS[currentElement] }}
              >
                {line}
              </div>
            ))}
            <div className="w-2 h-5 bg-white animate-bounce inline-block ml-1" />
          </div>
        </div>
      )}
      
      {/* Resonance Title */}
      {phase === 'resonance' && overlayOpacity < 0.8 && currentLandmark && (
        <div className="absolute top-10 w-full flex flex-col items-center justify-center pointer-events-none z-30">
           <h1 className="text-white text-3xl font-thin tracking-[0.5em] uppercase drop-shadow-lg">
             {currentLandmark.name}
           </h1>
           <p className="text-white/50 text-xs tracking-[0.3em] mt-2">
             {currentElement} RESONANCE FIELD
           </p>
        </div>
      )}
      
      {phase === 'timeCorridor' && overlayOpacity > 0.8 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30 gap-4">
           <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white/50 via-white to-white/50 text-2xl font-light tracking-[1em] uppercase blur-[0.5px] animate-pulse">
             {message}
           </h1>
        </div>
      )}

      {/* PlayerHUD - Glassmorphism Audio Player (Layer 4: Foreground) */}
      {phase === 'resonance' && overlayOpacity < 0.5 && currentElement && (
        <PlayerHUD />
      )}

      {/* PhotoChoicePanel - Energy Transformation Terminal */}
      <PhotoChoicePanel
        isOpen={isPhotoChoicePanelOpen}
        selectedLandmark={pendingLandmark}
        onClose={closePhotoChoicePanel}
      />

      {/* V2: Paywall Modal - Three-tier membership fake door */}
      <PaywallModal />

      {/* V2: Music Playlist Panel - Shows extended playlist with locked songs */}
      <MusicPlaylistPanel />

      {/* V2: Wisdom Card - Ancient wisdom interpretations (Tier 2 fake door) */}
      {phase === 'resonance' && overlayOpacity < 0.5 && currentElement && (
        <WisdomCard />
      )}

      {/* V2: Trend Chart - Energy balance analysis (Tier 2 fake door) */}
      {phase === 'resonance' && overlayOpacity < 0.5 && currentElement && (
        <TrendChart />
      )}

      {/* V2: Email Capture Modal - Lead generation with PostHog identity linking */}
      <EmailCaptureModal />

      {/* Feature Preview Modal */}
      {showFeatureModal && selectedFeature && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '24px',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowFeatureModal(false);
            }
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)',
            border: '2px solid rgba(139, 92, 246, 0.4)'
          }}>
            {selectedFeature === 'audio' && (
              <>
                <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>🎵</div>
                <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '300', marginBottom: '16px', textAlign: 'center' }}>
                  Frequency Audio
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '15px', lineHeight: '1.8', marginBottom: '12px' }}>
                  Experience personalized binaural frequencies (396-741Hz) matched to your elemental energy signature.
                </p>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', lineHeight: '1.7' }}>
                  Each frequency resonates with specific meridians in Traditional Chinese Medicine, designed to restore energetic balance.
                </p>
              </>
            )}

            {selectedFeature === 'energy' && (
              <>
                <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>🔮</div>
                <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '300', marginBottom: '16px', textAlign: 'center' }}>
                  Energy Reading
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '15px', lineHeight: '1.8', marginBottom: '12px' }}>
                  Discover ancient wisdom interpretations based on your elemental alignment.
                </p>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', lineHeight: '1.7' }}>
                  Receive insights about emotional patterns, physical manifestations, and harmonization practices from Traditional Chinese Medicine's Five Elements system.
                </p>
              </>
            )}

            {selectedFeature === 'meditation' && (
              <>
                <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>🧘‍♀️</div>
                <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '300', marginBottom: '16px', textAlign: 'center' }}>
                  Guided Meditation
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '15px', lineHeight: '1.8', marginBottom: '12px' }}>
                  Immerse yourself in 3D spatial audio meditation within resonance fields.
                </p>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', lineHeight: '1.7' }}>
                  Navigate through sacred landmarks while receiving element-specific guidance for emotional and energetic healing.
                </p>
              </>
            )}

            <button
              onClick={() => setShowFeatureModal(false)}
              style={{
                marginTop: '32px',
                padding: '12px 32px',
                borderRadius: '24px',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                letterSpacing: '1px',
                fontWeight: '500',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
              }}
            >
              Click Portal to Experience →
            </button>
          </div>
        </div>
      )}
    </>
  );
};
