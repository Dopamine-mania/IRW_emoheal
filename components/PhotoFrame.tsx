import React, { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { ElementType } from '../store';

// 元素颜色配置
const ELEMENT_COLORS: Record<ElementType, string> = {
  wood: '#84cc16',
  fire: '#f43f5e',
  earth: '#f59e0b',
  metal: '#e5e7eb',
  water: '#3b82f6'
};

interface PhotoFrameProps {
  imageUrl: string;
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
  opacity: number;
  element: ElementType;
  landmark: { id: string; name: string };
  onClick?: () => void;
}

/**
 * PhotoFrame - 单个照片网格组件
 * 显示照片、玻璃态边框和元素色光晕
 */
export const PhotoFrame: React.FC<PhotoFrameProps> = ({
  imageUrl,
  position,
  scale,
  rotation,
  opacity,
  element,
  onClick
}) => {
  // 加载纹理
  const texture = useTexture(imageUrl);

  // 设置纹理编码
  useMemo(() => {
    texture.encoding = THREE.sRGBEncoding;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
  }, [texture]);

  const elementColor = ELEMENT_COLORS[element];

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 主照片 */}
      <mesh onClick={onClick}>
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 玻璃态边框 - 稍微大一点，在背后 */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[4.3, 4.3]} />
        <meshBasicMaterial
          color={elementColor}
          transparent
          opacity={0.2 * opacity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 元素色光晕 - 增加照片的视觉吸引力 */}
      <pointLight
        position={[0, 0, 0.5]}
        color={elementColor}
        intensity={0.5 * opacity}
        distance={3}
      />
    </group>
  );
};
