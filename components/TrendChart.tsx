import React from 'react';
import { useStore, ElementType } from '../store';
import { trackEvent } from '../utils/analytics';

const ELEMENT_COLORS: Record<ElementType, string> = {
  wood: '#22d3ee',
  fire: '#f43f5e',
  earth: '#fbbf24',
  metal: '#e2e8f0',
  water: '#3b82f6'
};

const ELEMENT_NAMES: Record<ElementType, string> = {
  wood: 'Wood',
  fire: 'Fire',
  earth: 'Earth',
  metal: 'Metal',
  water: 'Water'
};

export const TrendChart: React.FC = () => {
  const currentElement = useStore(state => state.currentElement) || 'water';
  const openPaywall = useStore(state => state.openPaywall);

  const color = ELEMENT_COLORS[currentElement];
  const elementName = ELEMENT_NAMES[currentElement];

  // 模拟的7天数据（周一到周日）
  const mockData = [
    { day: 'Mon', value: 65 },
    { day: 'Tue', value: 72 },
    { day: 'Wed', value: 68 },
    { day: 'Thu', value: 80 },
    { day: 'Fri', value: 75 },
    { day: 'Sat', value: 85 },
    { day: 'Sun', value: 78 }
  ];

  const handleClick = () => {
    trackEvent('tier2_paywall_opened', { source: 'trend_chart', element: currentElement });
    openPaywall('tier2_trend');
  };

  const maxValue = 100;
  const chartHeight = 120;

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        width: '360px',
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
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div>
          <h3 style={{
            color: 'white',
            fontSize: '16px',
            margin: 0,
            letterSpacing: '1px',
            fontWeight: '600'
          }}>
            {elementName} Energy Trend
          </h3>
          <div style={{
            fontSize: '10px',
            color: color,
            letterSpacing: '2px',
            marginTop: '2px',
            textTransform: 'uppercase'
          }}>
            7-DAY BALANCE ANALYSIS
          </div>
        </div>
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
          📊
        </div>
      </div>

      {/* 模拟图表 */}
      <div style={{
        position: 'relative',
        height: `${chartHeight}px`,
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        padding: '0 10px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {mockData.map((item, index) => {
          const barHeight = (item.value / maxValue) * (chartHeight - 20);
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                flex: 1
              }}
            >
              {/* 数值标签 */}
              <div style={{
                fontSize: '10px',
                color: color,
                fontWeight: '500'
              }}>
                {item.value}%
              </div>

              {/* 柱状条 */}
              <div
                style={{
                  width: '24px',
                  height: `${barHeight}px`,
                  background: `linear-gradient(180deg, ${color}, ${color}66)`,
                  borderRadius: '4px 4px 0 0',
                  boxShadow: `0 0 10px ${color}66`,
                  transition: 'all 0.3s ease'
                }}
              />

              {/* 日期标签 */}
              <div style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontWeight: '400'
              }}>
                {item.day}
              </div>
            </div>
          );
        })}
      </div>

      {/* 统计信息 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '6px'
        }}>
          <div style={{
            fontSize: '18px',
            color: color,
            fontWeight: '600'
          }}>
            73%
          </div>
          <div style={{
            fontSize: '9px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: '2px',
            letterSpacing: '1px'
          }}>
            AVG
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '6px'
        }}>
          <div style={{
            fontSize: '18px',
            color: color,
            fontWeight: '600'
          }}>
            +12%
          </div>
          <div style={{
            fontSize: '9px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: '2px',
            letterSpacing: '1px'
          }}>
            GROWTH
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '6px'
        }}>
          <div style={{
            fontSize: '18px',
            color: color,
            fontWeight: '600'
          }}>
            85%
          </div>
          <div style={{
            fontSize: '9px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: '2px',
            letterSpacing: '1px'
          }}>
            PEAK
          </div>
        </div>
      </div>

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
          🔒 UNLOCK FULL ANALYSIS
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
        30-day trends & insights • Flow Tier
      </div>
    </div>
  );
};
