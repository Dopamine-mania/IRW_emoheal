import React, { useEffect } from 'react';
import { useStore } from '../store';
import { PhotoFrame } from './PhotoFrame';
import * as THREE from 'three';

// 配置常量
const SPACING = 8; // 照片间距
const FOCUS_RANGE = 16; // 焦点范围
const DEPTH_MIN = -8; // 离焦照片最远深度
const DEPTH_MAX = 3; // 焦点照片最近深度

// smoothstep 工具函数 - 平滑过渡
function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

/**
 * PhotoCorridor - 照片走廊核心组件
 * 实现一维到三维的映射算法
 * 包含 CORRIDOR 模式和 INSPECT 模式的渲染逻辑
 */
export const PhotoCorridor: React.FC = () => {
  const photoMemories = useStore(state => state.photoMemories);
  const corridorMode = useStore(state => state.corridorMode);
  const corridorFocusIndex = useStore(state => state.corridorFocusIndex);
  const corridorCameraX = useStore(state => state.corridorCameraX);
  const corridorInspectRotation = useStore(state => state.corridorInspectRotation);
  const setCorridorMode = useStore(state => state.setCorridorMode);
  const setCorridorFocus = useStore(state => state.setCorridorFocus);

  // 根据相机位置实时更新聚焦照片索引（仅在实际变化时更新，防止闪烁）
  useEffect(() => {
    if (corridorMode === 'CORRIDOR' && photoMemories.length > 0) {
      const nearestIndex = Math.round(corridorCameraX / SPACING);
      const clampedIndex = Math.max(0, Math.min(photoMemories.length - 1, nearestIndex));

      // 只有焦点真正变化时才更新，避免在动画期间重复设置
      if (clampedIndex !== corridorFocusIndex) {
        setCorridorFocus(clampedIndex);
      }
    }
  }, [corridorCameraX, corridorMode, photoMemories.length, setCorridorFocus, corridorFocusIndex]);

  // 处理照片点击
  const handlePhotoClick = (index: number) => {
    if (corridorMode === 'CORRIDOR') {
      // 使用逻辑焦点索引而不是位置距离
      // 这样更可靠，不受相机延迟影响
      const isCenterPhoto = index === corridorFocusIndex;

      if (isCenterPhoto) {
        console.log('[PhotoCorridor] Entering INSPECT mode for photo:', index);
        setCorridorMode('INSPECT');
        setCorridorFocus(index);
        // 重置旋转通过 store
        useStore.getState().setCorridorInspectRotation({ x: 0, y: 0 });
      } else {
        console.log('[PhotoCorridor] Not focused. Current focus:', corridorFocusIndex, 'Clicked:', index);
      }
    }
  };

  // 如果没有照片，不渲染任何内容
  if (photoMemories.length === 0) {
    return null;
  }

  return (
    <group>
      {photoMemories.map((photo, i) => {
        // === INSPECT 模式渲染 ===
        if (corridorMode === 'INSPECT') {
          const isFocused = i === corridorFocusIndex;

          // 只显示被选中的照片
          if (!isFocused) return null;

          // INSPECT 模式：照片位置在被选中照片的原始 X 位置
          const inspectX = corridorFocusIndex * SPACING;

          return (
            <PhotoFrame
              key={photo.id}
              imageUrl={photo.photoUrl}
              position={[inspectX, 0, 0]}
              scale={1.0}
              rotation={[corridorInspectRotation.x, corridorInspectRotation.y, 0]}
              opacity={1}
              element={photo.element}
              landmark={photo.landmark}
            />
          );
        }

        // === CORRIDOR 模式渲染 ===

        // 基础X位置
        const baseX = i * SPACING;

        // 相对相机的距离
        const distanceFromCamera = Math.abs(baseX - corridorCameraX);

        // 焦点权重（0=离焦，1=聚焦）
        const focusWeight = smoothstep(FOCUS_RANGE, 0, distanceFromCamera);

        // Z轴深度（焦点前移，离焦后退）
        const depth = THREE.MathUtils.lerp(DEPTH_MIN, DEPTH_MAX, focusWeight);

        // 缩放（焦点1.2倍，离焦0.7倍）
        const scale = THREE.MathUtils.lerp(0.7, 1.2, focusWeight);

        // Y轴旋转（侧面照片朝向中心）
        let rotationY = 0;
        const relativeX = baseX - corridorCameraX;
        if (relativeX > 2) rotationY = -0.4; // 右侧照片向左看
        if (relativeX < -2) rotationY = 0.4; // 左侧照片向右看

        // 透明度渐变（边缘照片半透明）
        const opacity = Math.max(0.3, 1 - distanceFromCamera / (SPACING * 6));

        return (
          <PhotoFrame
            key={photo.id}
            imageUrl={photo.photoUrl}
            position={[baseX, 0, depth]}
            scale={scale}
            rotation={[0, rotationY, 0]}
            opacity={opacity}
            element={photo.element}
            landmark={photo.landmark}
            onClick={() => handlePhotoClick(i)}
          />
        );
      })}
    </group>
  );
};
