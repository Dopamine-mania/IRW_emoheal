import React, { useEffect } from 'react';
import { useStore } from '../store';
import { StarRiver } from './StarRiver';
import { TheCore } from './TheCore';
import { PhotoCorridor } from './PhotoCorridor';
import { CorridorCamera } from './CorridorCamera';
import { CorridorHUD } from './CorridorHUD';

/**
 * SceneTimeCorridor - 时间回廊主场景
 * 用户可以浏览之前上传过的所有照片
 * 采用水平线性走廊布局，支持拖拽浏览和鉴赏模式
 */
export const SceneTimeCorridor: React.FC = () => {
  const loadMemoriesFromStorage = useStore(state => state.loadMemoriesFromStorage);
  const updateCorridorCamera = useStore(state => state.updateCorridorCamera);
  const setCorridorMode = useStore(state => state.setCorridorMode);

  // 每次进入时间回廊时重新从 localStorage 加载照片并重置状态
  useEffect(() => {
    loadMemoriesFromStorage();
    // 重置相机到起始位置
    updateCorridorCamera(0);
    // 确保处于走廊模式
    setCorridorMode('CORRIDOR');
  }, [loadMemoriesFromStorage, updateCorridorCamera, setCorridorMode]);

  return (
    <>
      {/* 背景颜色 */}
      <color attach="background" args={['#000508']} />

      {/* 雾效 - 增加深度感 */}
      <fog attach="fog" args={['#000508', 10, 120]} />

      {/* 环境光 */}
      <ambientLight intensity={0.15} />

      {/* 背景星河 */}
      <StarRiver />

      {/* 照片走廊核心 */}
      <PhotoCorridor />

      {/* 相机控制 */}
      <CorridorCamera />

      {/* 远处能量源 - 作为视觉焦点 */}
      <group position={[0, 8, -50]}>
        <TheCore />
        <pointLight color="#4ecdc4" intensity={2} distance={30} />
      </group>

      {/* UI层 - 直接在3D场景中渲染HTML */}
      <CorridorHUD />
    </>
  );
};
