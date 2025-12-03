import React from 'react';
import { useStore, ElementType } from '../store';

// 元素颜色配置
const ELEMENT_COLORS: Record<ElementType, string> = {
  wood: '#84cc16',
  fire: '#f43f5e',
  earth: '#f59e0b',
  metal: '#e5e7eb',
  water: '#3b82f6'
};

// 格式化时间戳
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * CorridorHUD - 时间回廊UI层
 * 显示标题、照片信息卡、操作提示和空状态
 */
export const CorridorHUD: React.FC = () => {
  const photoMemories = useStore(state => state.photoMemories);
  const corridorMode = useStore(state => state.corridorMode);
  const corridorFocusIndex = useStore(state => state.corridorFocusIndex);
  const backToEmitter = useStore(state => state.backToEmitter);
  const deletePhotoMemory = useStore(state => state.deletePhotoMemory);

  const focusedPhoto = photoMemories[corridorFocusIndex];

  const handleDelete = () => {
    if (focusedPhoto && window.confirm(`Delete photo from ${focusedPhoto.landmark.name}?`)) {
      deletePhotoMemory(focusedPhoto.id);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 100
    }}>
        {/* 顶部标题 */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center'
          }}
        >
          <h1
            style={{
              fontSize: '36px',
              fontFamily: 'monospace',
              letterSpacing: '8px',
              color: 'rgba(255, 255, 255, 0.9)',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}
          >
            Time.Corridor
          </h1>
          <p
            style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '2px'
            }}
          >
            {photoMemories.length} MEMORIES ARCHIVED
          </p>
        </div>

        {/* Back 按钮 */}
        <button
          onClick={backToEmitter}
          style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            padding: '12px 24px',
            fontFamily: 'monospace',
            fontSize: '14px',
            letterSpacing: '2px',
            color: 'white',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            pointerEvents: 'auto',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
        >
          ← RETURN
        </button>

        {/* 空状态 */}
        {photoMemories.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📷</div>
            <p
              style={{
                fontSize: '20px',
                fontFamily: 'monospace',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px'
              }}
            >
              No Memories Yet
            </p>
            <p
              style={{
                fontSize: '14px',
                fontFamily: 'monospace',
                color: 'rgba(255, 255, 255, 0.4)',
                letterSpacing: '1px'
              }}
            >
              Upload photos from landmarks to build your corridor
            </p>
          </div>
        )}

        {/* 底部信息卡 - 仅 CORRIDOR 模式显示 */}
        {corridorMode === 'CORRIDOR' && focusedPhoto && photoMemories.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '384px',
              padding: '24px',
              borderRadius: '12px',
              border: `1px solid ${ELEMENT_COLORS[focusedPhoto.element]}33`,
              background: 'rgba(5, 17, 37, 0.85)',
              backdropFilter: 'blur(20px)',
              boxShadow: `0 0 30px ${ELEMENT_COLORS[focusedPhoto.element]}22`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h3
                style={{
                  fontSize: '20px',
                  fontFamily: 'monospace',
                  color: 'white',
                  margin: 0
                }}
              >
                {focusedPhoto.landmark.name}
              </h3>
              <button
                onClick={handleDelete}
                style={{
                  padding: '6px 12px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  color: '#f43f5e',
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)';
                }}
              >
                🗑 DELETE
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: ELEMENT_COLORS[focusedPhoto.element],
                  border: `1px solid ${ELEMENT_COLORS[focusedPhoto.element]}`,
                  background: `${ELEMENT_COLORS[focusedPhoto.element]}11`
                }}
              >
                {focusedPhoto.element.toUpperCase()}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}
              >
                {formatDate(focusedPhoto.timestamp)}
              </span>
            </div>
          </div>
        )}

        {/* 操作提示 */}
        {photoMemories.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '32px',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center'
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                color: 'rgba(255, 255, 255, 0.4)',
                letterSpacing: '3px',
                textTransform: 'uppercase'
              }}
            >
              {corridorMode === 'CORRIDOR'
                ? 'DRAG TO BROWSE · CLICK CENTER TO INSPECT'
                : 'PRESS ESC TO EXIT'}
            </p>
          </div>
        )}
    </div>
  );
};
