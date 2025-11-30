
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { useStore, ElementType } from '../store';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { BodyParticlesMaterial } from '../shaders/BodyParticlesMaterial';

// Extend R3F to recognize our custom material
extend({ BodyParticlesMaterial });

// 定义五行对应的脉轮位置 (打坐姿势)
const CHAKRA_POSITIONS: Record<ElementType, [number, number, number]> = {
  wood: [0, 0.1, 0.35],    // Root Chakra (海底轮) - 脊椎底端 / 腿部
  water: [0, 0.45, 0],     // Sacral Chakra (生殖轮) - 下腹部 / 肾区
  earth: [0, 0.7, 0],      // Solar Plexus (太阳轮) - 胃部 / 肚脐
  fire: [0, 1.0, 0],       // Heart Chakra (心轮) - 胸腔中心
  metal: [0, 1.25, 0]      // Throat Chakra (喉轮) - 喉咙 / 肺部
};

// 定义五行颜色
const ELEMENT_COLORS: Record<ElementType, string> = {
  wood: '#22d3ee',
  water: '#3b82f6',
  earth: '#fbbf24',
  fire: '#f43f5e',
  metal: '#e2e8f0'
};

// 程序化生成人形点云几何体 - 打坐姿势 (Meditation Pose)
const createHumanoidGeometry = () => {
  const points: THREE.Vector3[] = [];
  const normals: THREE.Vector3[] = [];

  // 辅助函数：在一个球体内生成点云
  const addSphere = (centerX: number, centerY: number, centerZ: number, radius: number, density: number) => {
    const count = Math.floor(density);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random());

      const x = centerX + r * Math.sin(phi) * Math.cos(theta);
      const y = centerY + r * Math.sin(phi) * Math.sin(theta);
      const z = centerZ + r * Math.cos(phi);

      points.push(new THREE.Vector3(x, y, z));

      const normal = new THREE.Vector3(x - centerX, y - centerY, z - centerZ).normalize();
      normals.push(normal);
    }
  };

  // 辅助函数：在一个圆柱体内生成点云
  const addCylinder = (centerX: number, centerY: number, centerZ: number, radius: number, height: number, density: number) => {
    const count = Math.floor(density);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = radius * Math.sqrt(Math.random());
      const h = (Math.random() - 0.5) * height;

      const x = centerX + r * Math.cos(theta);
      const y = centerY + h;
      const z = centerZ + r * Math.sin(theta);

      points.push(new THREE.Vector3(x, y, z));

      const normal = new THREE.Vector3(x - centerX, 0, z - centerZ).normalize();
      normals.push(normal);
    }
  };

  // === MEDITATION POSE BODY ===
  // 减少粒子密度（原来 ~30000 粒子，现在 ~12000 粒子）

  // 头部 (Head)
  addSphere(0, 1.45, 0, 0.15, 1000);

  // 脖子 (Neck)
  addCylinder(0, 1.25, 0, 0.08, 0.15, 250);

  // 上躯干 (Upper Torso - Chest)
  addCylinder(0, 1.0, 0, 0.2, 0.35, 1600);

  // 中躯干 (Middle Torso - Solar Plexus)
  addCylinder(0, 0.7, 0, 0.19, 0.25, 1200);

  // 下躯干 (Lower Torso - Sacral)
  addCylinder(0, 0.45, 0, 0.18, 0.2, 1000);

  // 骨盆 (Pelvis - Root)
  addSphere(0, 0.35, 0, 0.2, 1000);

  // === ARMS (手臂放在膝盖上) ===

  // 左上臂 (Left Upper Arm - 向下斜伸)
  addCylinder(-0.28, 0.9, 0.05, 0.06, 0.35, 600);

  // 左下臂 (Left Forearm - 向前向下到膝盖)
  addCylinder(-0.35, 0.5, 0.15, 0.05, 0.3, 500);

  // 左手 (Left Hand on Knee)
  addSphere(-0.4, 0.3, 0.25, 0.06, 250);

  // 右上臂 (Right Upper Arm)
  addCylinder(0.28, 0.9, 0.05, 0.06, 0.35, 600);

  // 右下臂 (Right Forearm)
  addCylinder(0.35, 0.5, 0.15, 0.05, 0.3, 500);

  // 右手 (Right Hand on Knee)
  addSphere(0.4, 0.3, 0.25, 0.06, 250);

  // === LEGS (盘腿坐姿 - Lotus Position) ===

  // 左大腿 (Left Thigh - 水平向前)
  addCylinder(-0.15, 0.25, 0.15, 0.08, 0.35, 1000);

  // 左小腿 (Left Calf - 向内盘)
  addCylinder(-0.25, 0.15, 0.3, 0.06, 0.3, 700);

  // 左脚 (Left Foot - 盘在右腿下)
  addSphere(-0.15, 0.1, 0.35, 0.08, 300);

  // 右大腿 (Right Thigh - 水平向前)
  addCylinder(0.15, 0.25, 0.15, 0.08, 0.35, 1000);

  // 右小腿 (Right Calf - 向内盘)
  addCylinder(0.25, 0.15, 0.3, 0.06, 0.3, 700);

  // 右脚 (Right Foot - 盘在左腿下)
  addSphere(0.15, 0.1, 0.35, 0.08, 300);

  // 创建 BufferGeometry
  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(points.length * 3);
  const normalArray = new Float32Array(normals.length * 3);

  points.forEach((point, i) => {
    positions[i * 3] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;
  });

  normals.forEach((normal, i) => {
    normalArray[i * 3] = normal.x;
    normalArray[i * 3 + 1] = normal.y;
    normalArray[i * 3 + 2] = normal.z;
  });

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normalArray, 3));

  return geometry;
};

export const EnergyBody: React.FC = () => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<any>(null);
  const { getAudioData } = useAudioAnalyzer();
  const currentElement = useStore(state => state.currentElement) || 'water';

  // 生成人形几何体
  const geometry = useMemo(() => createHumanoidGeometry(), []);

  // 每一帧更新 Uniforms
  useFrame((state) => {
    if (materialRef.current) {
      // 1. 更新时间
      materialRef.current.uTime = state.clock.elapsedTime;
      materialRef.current.uPixelRatio = Math.min(window.devicePixelRatio, 2);

      // 2. 音频数据驱动
      const audioData = getAudioData();
      materialRef.current.uAudioHigh = THREE.MathUtils.lerp(
        materialRef.current.uAudioHigh || 0,
        audioData.treble,
        0.1
      );

      // 3. 更新脉轮位置 (平滑插值 Lerp)
      const targetPos = new THREE.Vector3(...CHAKRA_POSITIONS[currentElement]);
      if (!materialRef.current.uChakraPos) {
        materialRef.current.uChakraPos = targetPos.clone();
      }
      materialRef.current.uChakraPos.lerp(targetPos, 0.05);

      // 4. 更新五行颜色 (平滑插值)
      const targetColor = new THREE.Color(ELEMENT_COLORS[currentElement]);
      if (!materialRef.current.uElementColor) {
        materialRef.current.uElementColor = targetColor.clone();
      }
      materialRef.current.uElementColor.lerp(targetColor, 0.05);

      // 5. 辉光半径（可以根据音频动态调整）
      materialRef.current.uGlowRadius = 1.2 + audioData.treble * 0.3;
    }

    // 整体缓慢旋转
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <points ref={meshRef} geometry={geometry} position={[0, 0, 0]}>
      <bodyParticlesMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
