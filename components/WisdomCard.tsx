import React from 'react';
import { useStore, ElementType } from '../store';
import { getWisdomForElement } from '../utils/wisdomContent';

const ELEMENT_COLORS: Record<ElementType, string> = {
  wood: '#22d3ee',
  fire: '#f43f5e',
  earth: '#fbbf24',
  metal: '#e2e8f0',
  water: '#3b82f6'
};

export const WisdomCard: React.FC = () => {
  const currentElement = useStore(state => state.currentElement) || 'water';
  const openPaywall = useStore(state => state.openPaywall);

  const wisdom = getWisdomForElement(currentElement);
  const color = ELEMENT_COLORS[currentElement];

  const handleClick = () => {
    // Note: trackEvent will be added when analytics.ts is created
    openPaywall('tier2_wisdom');
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        left: '20px',
        bottom: '20px',
        width: '320px',
        background: 'rgba(5, 17, 37, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${color}`,
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: `0 0 30px ${color}33`,
        zIndex: 100,
        pointerEvents: 'auto'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 8px 40px ${color}66`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 0 30px ${color}33`;
      }}
    >
      {/* 标题区域 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}33, ${color}66)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: `0 0 20px ${color}44`,
          border: `1px solid ${color}88`
        }}>
          📖
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            color: 'white',
            fontSize: '16px',
            margin: 0,
            letterSpacing: '1px',
            fontWeight: '600'
          }}>
            {wisdom.title}
          </h3>
          <div style={{
            fontSize: '10px',
            color: color,
            letterSpacing: '2px',
            marginTop: '2px',
            textTransform: 'uppercase'
          }}>
            {wisdom.subtitle}
          </div>
        </div>
      </div>

      {/* 预览内容 */}
      <p style={{
        fontSize: '13px',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: '1.6',
        margin: 0,
        marginBottom: '16px'
      }}>
        {wisdom.preview}
      </p>

      {/* CTA 按钮 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: `${color}22`,
        borderRadius: '8px',
        border: `1px solid ${color}44`
      }}>
        <span style={{
          fontSize: '12px',
          color: color,
          fontWeight: '500',
          letterSpacing: '1px'
        }}>
          🔒 UNLOCK FULL WISDOM
        </span>
        <span style={{
          fontSize: '18px',
          color: color
        }}>
          →
        </span>
      </div>

      {/* 底部提示 */}
      <div style={{
        marginTop: '12px',
        fontSize: '10px',
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        letterSpacing: '1px'
      }}>
        Ancient wisdom interpretations • Flow Tier
      </div>
    </div>
  );
};
