import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { TIER_CONFIG } from '../utils/permissions';
import { trackEvent } from '../utils/analytics';

export const PaywallModal: React.FC = () => {
  const paywallVisible = useStore(state => state.paywallVisible);
  const paywallTrigger = useStore(state => state.paywallTrigger);
  const closePaywall = useStore(state => state.closePaywall);
  const userTier = useStore(state => state.userTier);
  const currentElement = useStore(state => state.currentElement);

  // 追踪 modal 打开时间
  const [openTime, setOpenTime] = useState<number | null>(null);

  // 追踪 paywall 打开事件
  useEffect(() => {
    if (paywallVisible && paywallTrigger) {
      const now = Date.now();
      setOpenTime(now);

      trackEvent('paywall_opened', {
        trigger: paywallTrigger,
        source: getSourceFromTrigger(paywallTrigger),
        element: currentElement || undefined,
        user_tier: userTier
      });
    }
  }, [paywallVisible, paywallTrigger, currentElement, userTier]);

  // 辅助函数：从 trigger 推断 source
  const getSourceFromTrigger = (trigger: string): string => {
    const sourceMap: Record<string, string> = {
      tier1_record: 'record_button',
      tier2_music: 'music_playlist',
      tier2_wisdom: 'wisdom_card',
      tier2_trend: 'trend_chart'
    };
    return sourceMap[trigger] || 'unknown';
  };

  if (!paywallVisible) return null;

  const handleClose = (method: 'button' | 'background' = 'button') => {
    const duration = openTime ? Date.now() - openTime : 0;

    trackEvent('paywall_closed', {
      trigger_type: paywallTrigger || 'unknown',
      close_method: method,
      duration_ms: duration
    });

    closePaywall();
    setOpenTime(null);
  };

  const getTriggerTitle = () => {
    const titles: Record<string, string> = {
      tier1_record: 'AI Voice Diagnosis - Resonance Tier',
      tier2_music: 'Unlock Deep Immersion Library - Flow Tier',
      tier2_wisdom: 'Ancient Wisdom Interpretations - Flow Tier',
      tier2_trend: 'Energy Trend Analysis - Flow Tier'
    };
    return titles[paywallTrigger || ''] || 'Upgrade Your Experience';
  };

  // 处理 tier 选择
  const handleCTAClick = (tier: string) => {
    trackEvent('tier_cta_clicked', {
      tier,
      trigger_type: paywallTrigger || 'unknown',
      source: getSourceFromTrigger(paywallTrigger || '')
    });

    // 正向反馈，将受挫感转为尊贵感
    alert(
      `🌟 You are on the Priority List!\n\n` +
      `We are hand-crafting the ${TIER_CONFIG[tier as keyof typeof TIER_CONFIG].name} tier. ` +
      `You'll be the first to know when it drops.`
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={() => handleClose('background')}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(10, 20, 40, 0.95), rgba(5, 10, 25, 0.95))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '48px 32px',
          maxWidth: '900px',
          width: '95%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontSize: '12px',
            color: '#22d3ee',
            letterSpacing: '3px',
            marginBottom: '12px'
          }}>
            UNLOCK PREMIUM FEATURE
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '300',
            color: 'white',
            letterSpacing: '2px',
            margin: 0
          }}>
            {getTriggerTitle()}
          </h2>
        </div>

        {/* 三档对比 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {Object.entries(TIER_CONFIG).map(([key, tier]) => (
            <div
              key={key}
              style={{
                background: key === 'flow' ? 'rgba(34, 211, 238, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                border: key === 'flow' ? '2px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '24px',
                position: 'relative',
                transform: key === 'flow' ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            >
              {key === 'flow' && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#22d3ee',
                  color: '#000',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  RECOMMENDED
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{
                  fontSize: '20px',
                  color: 'white',
                  marginBottom: '8px',
                  letterSpacing: '2px'
                }}>
                  {tier.name}
                </h3>
                <div style={{
                  fontSize: '24px',
                  color: '#22d3ee',
                  fontWeight: 'bold'
                }}>
                  {tier.price}
                </div>
              </div>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '2'
              }}>
                {tier.features.map((feature, idx) => (
                  <li key={idx} style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#22d3ee', marginRight: '8px' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCTAClick(key)}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '12px',
                  background: key === 'flow' ? '#22d3ee' : 'rgba(255, 255, 255, 0.1)',
                  color: key === 'flow' ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 211, 238, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Choose {tier.name}
              </button>
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div style={{
          textAlign: 'center',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          💡 This is a preview. Payment will be enabled after launch.
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={() => handleClose('button')}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};
