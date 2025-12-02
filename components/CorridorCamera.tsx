import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useStore } from '../store';
import gsap from 'gsap';

const SPACING = 8;

/**
 * CorridorCamera - 相机控制组件
 * 处理拖拽浏览、磁吸对齐、模式切换的相机动画
 */
export const CorridorCamera: React.FC = () => {
  const { camera } = useThree();
  const corridorMode = useStore(state => state.corridorMode);
  const corridorCameraX = useStore(state => state.corridorCameraX);
  const corridorIsDragging = useStore(state => state.corridorIsDragging);
  const corridorFocusIndex = useStore(state => state.corridorFocusIndex);
  const corridorInspectRotation = useStore(state => state.corridorInspectRotation);
  const photoMemories = useStore(state => state.photoMemories);
  const updateCorridorCamera = useStore(state => state.updateCorridorCamera);
  const setCorridorInspectRotation = useStore(state => state.setCorridorInspectRotation);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startCameraXRef = useRef(0);
  const startRotationRef = useRef({ x: 0, y: 0 });

  // 监听拖拽状态同步
  useEffect(() => {
    isDraggingRef.current = corridorIsDragging;
  }, [corridorIsDragging]);

  // 鼠标/触摸事件处理
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      startCameraXRef.current = corridorCameraX;
      startRotationRef.current = { ...corridorInspectRotation };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;

      if (corridorMode === 'CORRIDOR') {
        // 走廊模式：拖拽改变相机X轴
        const deltaX = e.clientX - startXRef.current;
        // 拖拽灵敏度：鼠标移动 100px = 相机移动 2 单位
        const newX = startCameraXRef.current - deltaX * 0.02;

        // 限制边界
        const minX = 0;
        const maxX = Math.max(0, (photoMemories.length - 1) * SPACING);
        const clampedX = Math.max(minX, Math.min(maxX, newX));

        updateCorridorCamera(clampedX);
      } else if (corridorMode === 'INSPECT') {
        // 鉴赏模式：拖拽旋转照片
        const deltaX = e.clientX - startXRef.current;
        const deltaY = e.clientY - startYRef.current;

        setCorridorInspectRotation({
          x: startRotationRef.current.x - deltaY * 0.005,
          y: startRotationRef.current.y + deltaX * 0.01
        });
      }
    };

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      if (corridorMode === 'CORRIDOR' && photoMemories.length > 0) {
        // 磁吸对齐到最近照片
        snapToNearestPhoto();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [corridorMode, corridorCameraX, corridorInspectRotation, photoMemories.length, updateCorridorCamera, setCorridorInspectRotation]);

  // 磁吸对齐函数
  const snapToNearestPhoto = () => {
    const nearestIndex = Math.round(corridorCameraX / SPACING);
    const clampedIndex = Math.max(0, Math.min(photoMemories.length - 1, nearestIndex));
    const targetX = clampedIndex * SPACING;

    // GSAP 平滑过渡
    gsap.to({ x: corridorCameraX }, {
      x: targetX,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: function() {
        updateCorridorCamera(this.targets()[0].x);
      }
    });
  };

  // ESC 键退出 INSPECT 模式
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && corridorMode === 'INSPECT') {
        useStore.getState().setCorridorMode('CORRIDOR');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [corridorMode]);

  // 每帧更新相机位置和模式切换动画
  useFrame(() => {
    // 相机X轴位置平滑跟随
    camera.position.x += (corridorCameraX - camera.position.x) * 0.1;

    // 根据模式调整相机Z轴（拉近/拉远）
    const targetZ = corridorMode === 'INSPECT' ? 8 : 15;
    camera.position.z += (targetZ - camera.position.z) * 0.05;

    // 相机Y轴保持在0
    camera.position.y += (0 - camera.position.y) * 0.1;

    // 相机始终看向原点
    camera.lookAt(corridorCameraX, 0, 0);
  });

  return null;
};
