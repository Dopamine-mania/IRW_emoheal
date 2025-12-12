import React, { useState } from 'react';
import { useStore, ElementType } from '../store';
import { getWisdomForElement } from '../utils/wisdomContent';
import { trackEvent } from '../utils/analytics';

const ELEMENT_COLORS: Record<ElementType, string> = {
  wood: '#22d3ee',
  fire: '#f43f5e',
  earth: '#fbbf24',
  metal: '#e2e8f0',
  water: '#3b82f6'
};

// Get or set the free wisdom element for this session
const getFreeElement = (): ElementType => {
  // Check sessionStorage first
  const stored = sessionStorage.getItem('free_wisdom_element');
  if (stored) {
    return stored as ElementType;
  }

  // If not set, randomly choose one
  const elements: ElementType[] = ['wood', 'fire', 'earth', 'metal', 'water'];
  const randomElement = elements[Math.floor(Math.random() * elements.length)];
  sessionStorage.setItem('free_wisdom_element', randomElement);

  trackEvent('free_wisdom_assigned', {
    element: randomElement
  });

  return randomElement;
};

export const WisdomCard: React.FC = () => {
  const currentElement = useStore(state => state.currentElement) || 'water';
  const openPaywall = useStore(state => state.openPaywall);
  const [showFullWisdom, setShowFullWisdom] = useState(false);

  const wisdom = getWisdomForElement(currentElement);
  const color = ELEMENT_COLORS[currentElement];

  const freeElement = getFreeElement();
  const isCurrentElementFree = currentElement === freeElement;

  const handleClick = () => {
    trackEvent('wisdom_card_clicked', {
      element: currentElement || 'unknown',
      is_free: isCurrentElementFree
    });

    if (isCurrentElementFree) {
      // Show full wisdom content
      setShowFullWisdom(true);
    } else {
      // Show paywall for other elements
      openPaywall('tier2_wisdom');
    }
  };

  return (
    <>
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
        {/* Free Sample Badge */}
        {isCurrentElementFree && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '4px 10px',
            borderRadius: '12px',
            background: 'rgba(34, 197, 94, 0.2)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#22c55e',
            fontSize: '10px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            🎁 Free Sample
          </div>
        )}
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
          {isCurrentElementFree ? '✨ READ FULL WISDOM' : '🔒 UNLOCK FULL WISDOM'}
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

    {/* Full Wisdom Modal */}
    {showFullWisdom && (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '24px',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
        onClick={(e) => {
          // Only close if clicking the backdrop
          if (e.target === e.currentTarget) {
            setShowFullWisdom(false);
          }
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.95) 0%, rgba(30, 58, 138, 0.95) 100%)',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '700px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: `0 20px 60px ${color}44`,
          border: `2px solid ${color}66`
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '28px',
            fontWeight: '300',
            marginBottom: '8px',
            letterSpacing: '2px'
          }}>
            {wisdom.title}
          </h2>
          <p style={{
            color: color,
            fontSize: '14px',
            marginBottom: '32px',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            {wisdom.subtitle}
          </p>

          {wisdom.fullContent.map((line, idx) => (
            <p key={idx} style={{
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '15px',
              lineHeight: '1.8',
              marginBottom: '16px'
            }}>
              {line}
            </p>
          ))}

          <button
            onClick={() => setShowFullWisdom(false)}
            style={{
              marginTop: '32px',
              padding: '12px 32px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: `1px solid rgba(255, 255, 255, 0.2)`,
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              letterSpacing: '1px',
              fontWeight: '500',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            Close
          </button>

          {/* Upsell hint */}
          <p style={{
            marginTop: '24px',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.5)',
            textAlign: 'center',
            lineHeight: '1.6'
          }}>
            Want to unlock all elements? <span
              style={{
                color: '#a78bfa',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowFullWisdom(false);
                openPaywall('tier2_wisdom');
              }}
            >
              View Plans
            </span>
          </p>
        </div>
      </div>
    )}
  </>
  );
};
