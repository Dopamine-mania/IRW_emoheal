import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore, ElementType } from '../store';

/**
 * PhotoBackgroundParticles - 照片粒子背景
 * 替换StarRiver，使用用户上传照片的粒子作为背景
 */

const ELEMENT_COLORS: Record<ElementType, string> = {
  wood: '#22d3ee',
  fire: '#f43f5e',
  earth: '#fbbf24',
  metal: '#e2e8f0',
  water: '#3b82f6'
};

const photoParticleVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;

  attribute float aSpeed;
  attribute float aSize;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // 缓慢漂浮
    float angle = uTime * aSpeed * 0.05;
    float cosA = cos(angle);
    float sinA = sin(angle);

    // Y轴旋转
    pos.x = position.x * cosA - position.z * sinA;
    pos.z = position.x * sinA + position.z * cosA;

    // 上下浮动
    pos.y += sin(uTime * aSpeed * 0.5 + position.x * 0.5) * 0.5;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // 大小衰减
    gl_PointSize = (aSize * 2.0 * uPixelRatio) * (30.0 / -mvPosition.z);

    // 颜色传递
    vColor = aColor;

    // 基于距离的透明度
    vAlpha = smoothstep(100.0, 10.0, -mvPosition.z);
  }
`;

const photoParticleFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // 圆形粒子
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    if (dist > 0.5) discard;

    // 柔和光晕
    float alpha = (1.0 - smoothstep(0.2, 0.5, dist)) * vAlpha;

    gl_FragColor = vec4(vColor, alpha * 0.8);
  }
`;

interface PhotoBackgroundParticlesProps {
  imageUrl: string;
}

export const PhotoBackgroundParticles: React.FC<PhotoBackgroundParticlesProps> = ({ imageUrl }) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [particleData, setParticleData] = useState<{
    positions: Float32Array;
    colors: Float32Array;
    speeds: Float32Array;
    sizes: Float32Array;
  } | null>(null);

  const currentElement = useStore(state => state.currentElement) || 'water';
  const elementColor = new THREE.Color(ELEMENT_COLORS[currentElement]);

  // 从图片生成粒子数据
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 采样分辨率
      const sampleWidth = 128; // 降低分辨率以减少粒子数
      const aspect = img.height / img.width;
      const sampleHeight = Math.floor(sampleWidth * aspect);

      canvas.width = sampleWidth;
      canvas.height = sampleHeight;
      ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);

      const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;
      const particles: Array<{pos: [number, number, number]; color: [number, number, number]; brightness: number}> = [];

      // 采样像素
      for (let y = 0; y < sampleHeight; y += 2) {
        for (let x = 0; x < sampleWidth; x += 2) {
          const index = (y * sampleWidth + x) * 4;
          const r = imageData[index];
          const g = imageData[index + 1];
          const b = imageData[index + 2];
          const alpha = imageData[index + 3];

          if (alpha > 20) {
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

            // 粒子分布在球体空间中
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 30 + Math.random() * 70;

            const px = radius * Math.sin(phi) * Math.cos(theta);
            const py = radius * Math.sin(phi) * Math.sin(theta);
            const pz = radius * Math.cos(phi);

            // 颜色混合：原图颜色 + 元素色调
            const mixAmount = 0.3;
            const finalR = (r / 255) * (1 - mixAmount) + elementColor.r * mixAmount;
            const finalG = (g / 255) * (1 - mixAmount) + elementColor.g * mixAmount;
            const finalB = (b / 255) * (1 - mixAmount) + elementColor.b * mixAmount;

            particles.push({
              pos: [px, py, pz],
              color: [finalR, finalG, finalB],
              brightness
            });
          }
        }
      }

      // 生成buffer数据
      const count = particles.length;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const speeds = new Float32Array(count);
      const sizes = new Float32Array(count);

      particles.forEach((p, i) => {
        positions[i * 3] = p.pos[0];
        positions[i * 3 + 1] = p.pos[1];
        positions[i * 3 + 2] = p.pos[2];

        colors[i * 3] = p.color[0];
        colors[i * 3 + 1] = p.color[1];
        colors[i * 3 + 2] = p.color[2];

        speeds[i] = 0.5 + Math.random() * 1.5;
        sizes[i] = 1.0 + Math.random() * 2.0 + p.brightness * 3.0;
      });

      setParticleData({ positions, colors, speeds, sizes });
    };
  }, [imageUrl, elementColor]);

  const geometry = useMemo(() => {
    if (!particleData) return null;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(particleData.positions, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(particleData.colors, 3));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(particleData.speeds, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(particleData.sizes, 1));

    return geo;
  }, [particleData]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  if (!geometry) return null;

  return (
    <points ref={meshRef} geometry={geometry} position={[0, -2, -5]}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={photoParticleVertexShader}
        fragmentShader={photoParticleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
