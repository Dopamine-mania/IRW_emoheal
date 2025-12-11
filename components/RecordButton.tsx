import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { trackEvent } from '../utils/analytics';

export const RecordButton: React.FC = () => {
  const meshRef = useRef<THREE.Group>(null);
  const openPaywall = useStore(state => state.openPaywall);
  const currentElement = useStore(state => state.currentElement);
  const phase = useStore(state => state.phase);

  useFrame((state) => {
    if (meshRef.current) {
      // 呼吸缩放
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.setScalar(scale);

      // 缓慢旋转
      meshRef.current.rotation.y += 0.005;
    }
  });

  const handleClick = () => {
    // 追踪点击事件
    trackEvent('record_button_clicked', {
      source: phase,
      user_element: currentElement || undefined
    });

    // 打开 paywall
    openPaywall('tier1_record');
  };

  return (
    <group position={[0, 0, 0]} ref={meshRef}>
      {/* 外圈光晕 */}
      <mesh scale={2}>
        <ringGeometry args={[0.9, 1, 64]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 主按钮 */}
      <mesh onClick={handleClick}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* 中央麦克风图标 */}
      <Html center distanceFactor={8}>
        <div
          onClick={handleClick}
          style={{
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '36px',
            userSelect: 'none',
            pointerEvents: 'auto'
          }}
        >
          🎙️
        </div>
      </Html>

      {/* 提示文字 */}
      <Html center position={[0, -1.5, 0]} distanceFactor={8}>
        <div style={{
          color: 'white',
          fontSize: '12px',
          textAlign: 'center',
          pointerEvents: 'none',
          letterSpacing: '2px',
          textShadow: '0 0 10px rgba(34, 211, 238, 0.8)'
        }}>
          AI VOICE DIAGNOSIS
        </div>
      </Html>

      {/* 点光源 */}
      <pointLight color="#22d3ee" intensity={2} distance={10} />
    </group>
  );
};
