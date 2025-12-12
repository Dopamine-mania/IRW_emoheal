import React, { useRef, useState } from 'react';
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

  const [isCollecting, setIsCollecting] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Enhanced animation during collecting
      const baseScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      const collectingScale = isCollecting ? 1.2 : 1;
      const scale = baseScale * collectingScale;
      meshRef.current.scale.setScalar(scale);

      // 缓慢旋转
      meshRef.current.rotation.y += 0.005;
    }
  });

  const handleClick = () => {
    if (isCollecting) return; // Prevent double-click

    // 追踪点击事件
    trackEvent('record_button_clicked', {
      source: phase,
      user_element: currentElement || undefined
    });

    // Start animation
    setIsCollecting(true);

    // After 1 second, show message
    setTimeout(() => {
      setShowMessage(true);
      trackEvent('energy_collected_shown');
    }, 1000);

    // After 2.5 seconds total, show paywall
    setTimeout(() => {
      setIsCollecting(false);
      setShowMessage(false);
      openPaywall('tier1_record');
    }, 2500);
  };

  return (
    <group position={[0, 0, 0]} ref={meshRef}>
      {/* 外圈光晕 */}
      <mesh scale={2}>
        <ringGeometry args={[0.9, 1, 64]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={isCollecting ? 0.8 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 主按钮 */}
      <mesh onClick={handleClick}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={isCollecting ? 1.5 : 0.5}
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

      {/* Energy Collected Message */}
      {showMessage && (
        <Html center position={[0, 0, 0]} distanceFactor={8}>
          <div style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: '300',
            letterSpacing: '3px',
            textAlign: 'center',
            pointerEvents: 'none',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            ✨ Energy Collected ✨
          </div>
        </Html>
      )}

      {/* 点光源 */}
      <pointLight color="#22d3ee" intensity={2} distance={10} />
    </group>
  );
};
