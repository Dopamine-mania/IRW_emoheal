import React, { useState } from 'react';
import { useStore, ElementType } from '../store';
import { compressImageIfNeeded } from '../utils/storage';

/**
 * PhotoChoicePanel - 能量转化终端选择界面
 * 在地标选择页点击地标后弹出，让用户选择使用官方频率或注入个人记忆
 */

interface PhotoChoicePanelProps {
  isOpen: boolean;
  selectedLandmark: { id: string; name: string } | null;
  onClose: () => void;
}

const ELEMENT_INFO: Record<ElementType, { name: string; color: string }> = {
  wood: { name: '竹海', color: '#22d3ee' },
  fire: { name: '丹霞', color: '#f43f5e' },
  earth: { name: '长城', color: '#fbbf24' },
  metal: { name: '雪山', color: '#e2e8f0' },
  water: { name: '西湖', color: '#3b82f6' }
};

// 默认图片占位符（使用Unsplash的高质量风景图）
const DEFAULT_IMAGES: Record<ElementType, string> = {
  wood: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=512&h=512&fit=crop', // 竹林
  fire: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop', // 红色山脉/火山
  earth: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=512&h=512&fit=crop', // 长城/岩石
  metal: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop', // 雪山
  water: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=512&h=512&fit=crop'  // 湖泊/海洋
};

export const PhotoChoicePanel: React.FC<PhotoChoicePanelProps> = ({
  isOpen,
  selectedLandmark,
  onClose
}) => {
  const currentElement = useStore(state => state.currentElement) || 'water';
  const startTuning = useStore(state => state.startTuning);
  const uploadPhoto = useStore(state => state.uploadPhoto);
  const addPhotoMemory = useStore(state => state.addPhotoMemory);

  const [isUploading, setIsUploading] = useState(false);

  const elementInfo = ELEMENT_INFO[currentElement];
  const defaultImage = DEFAULT_IMAGES[currentElement];

  // 选择官方频率
  const handleUseDefault = () => {
    uploadPhoto(defaultImage);

    // 保存到历史记录
    addPhotoMemory({
      photoUrl: defaultImage,
      element: currentElement,
      landmark: selectedLandmark,
      metadata: { isDefault: true }
    });

    if (selectedLandmark) {
      startTuning(selectedLandmark);
    }
    onClose();
  };

  // 上传个人记忆
  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const photoUrl = event.target?.result as string;

        // 压缩照片以节省存储空间
        const compressedUrl = await compressImageIfNeeded(photoUrl, 512);

        uploadPhoto(compressedUrl);

        // 保存到历史记录
        addPhotoMemory({
          photoUrl: compressedUrl,
          element: currentElement,
          landmark: selectedLandmark,
          metadata: {
            fileSize: file.size,
            isDefault: false
          }
        });

        if (selectedLandmark) {
          startTuning(selectedLandmark);
        }
        setIsUploading(false);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen || !selectedLandmark) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      {/* HUD Panel */}
      <div
        style={{
          background: 'rgba(5, 17, 37, 0.85)',
          border: `1px solid ${elementInfo.color}`,
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '600px',
          width: '90%',
          boxShadow: `0 0 40px ${elementInfo.color}33, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              fontSize: '10px',
              letterSpacing: '3px',
              color: elementInfo.color,
              textTransform: 'uppercase',
              marginBottom: '12px',
              opacity: 0.8
            }}
          >
            Energy Transformation Terminal
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '300',
              color: 'white',
              letterSpacing: '2px',
              margin: 0
            }}
          >
            {selectedLandmark.name} · {elementInfo.name}
          </h2>
        </div>

        {/* 选项容器 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 选项 1: 官方频率 */}
          <button
            onClick={handleUseDefault}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${elementInfo.color}15`;
              e.currentTarget.style.borderColor = elementInfo.color;
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            {/* 缩略图 */}
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                border: `1px solid ${elementInfo.color}33`
              }}
            >
              <img
                src={defaultImage}
                alt="Default"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* 文字 */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: 'white',
                  marginBottom: '8px',
                  letterSpacing: '1px'
                }}
              >
                Access Standard Frequency
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  lineHeight: '1.6',
                  letterSpacing: '0.5px'
                }}
              >
                使用官方频率 · 基于 {elementInfo.name} 地标能量场
              </div>
            </div>

            {/* 箭头 */}
            <div style={{ color: elementInfo.color, fontSize: '20px' }}>→</div>
          </button>

          {/* 选项 2: 个人记忆 */}
          <div style={{ position: 'relative' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadPhoto}
              disabled={isUploading}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: isUploading ? 'not-allowed' : 'pointer',
                zIndex: 10
              }}
            />
            <button
              disabled={isUploading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
                opacity: isUploading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.background = `${elementInfo.color}15`;
                  e.currentTarget.style.borderColor = elementInfo.color;
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isUploading) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              {/* 图标 */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px dashed rgba(255, 255, 255, 0.2)',
                  fontSize: '32px'
                }}
              >
                {isUploading ? '⏳' : '📷'}
              </div>

              {/* 文字 */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: 'white',
                    marginBottom: '8px',
                    letterSpacing: '1px'
                  }}
                >
                  Inject Personal Memory
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    lineHeight: '1.6',
                    letterSpacing: '0.5px'
                  }}
                >
                  {isUploading ? '正在处理...' : '注入个人记忆 · 此记忆将被永久封存至时光回廊'}
                </div>
              </div>

              {/* 箭头 */}
              <div style={{ color: elementInfo.color, fontSize: '20px' }}>→</div>
            </button>
          </div>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.3)',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
            e.currentTarget.style.transform = 'rotate(0deg)';
          }}
        >
          ×
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};
