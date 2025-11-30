import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const BodyParticlesMaterial = shaderMaterial(
  {
    uTime: 0,
    uBaseColor: new THREE.Color('#051125'), // 极淡的深蓝底色，不要纯黑
    uElementColor: new THREE.Color('#3b82f6'), // 五行主色
    uChakraPos: new THREE.Vector3(0, 0, 0), // 脉轮中心点坐标
    uGlowRadius: 1.2, // 发光范围
    uPixelRatio: 2, // 屏幕像素比
    uAudioHigh: 0, // 高频数据 (0-1) 用于闪烁
  },
  // Vertex Shader (顶点着色器)
  /* glsl */ `
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uAudioHigh;
    uniform vec3 uChakraPos;
    varying vec3 vPosition;
    varying float vDistanceToChakra;

    // 随机噪声函数
    float random(vec3 pos) {
      return fract(sin(dot(pos, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
    }

    void main() {
      vPosition = position;

      // 1. 简单的呼吸浮动 (基于时间 + 随机)
      vec3 pos = position;
      pos.x += sin(uTime * 1.5 + position.y * 5.0) * 0.01;
      pos.z += cos(uTime * 1.2 + position.x * 5.0) * 0.01;

      // 2. 音频驱动：高频时粒子稍微向外膨胀
      vec3 finalPos = pos + normal * (uAudioHigh * 0.05);

      vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // 3. 核心：粒子大小随距离衰减 (Size Attenuation)
      // 这会让近处的粒子大，远处的粒子小，产生体积感
      gl_PointSize = (45.0 * uPixelRatio) * (1.0 / -mvPosition.z);

      // 传递给 Fragment: 计算当前顶点到脉轮中心的距离
      vDistanceToChakra = distance(position, uChakraPos);
    }
  `,
  // Fragment Shader (片元着色器)
  /* glsl */ `
    uniform vec3 uBaseColor;
    uniform vec3 uElementColor;
    uniform float uGlowRadius;
    uniform float uAudioHigh;
    varying float vDistanceToChakra;

    void main() {
      // 1. 画圆 (软边缘粒子)
      float distToCenter = length(gl_PointCoord - vec2(0.5));
      if (distToCenter > 0.5) discard;

      // 粒子边缘柔化
      float alphaShape = 1.0 - smoothstep(0.3, 0.5, distToCenter);

      // 2. 计算脉轮辉光 (核心逻辑)
      // 距离脉轮越近，glowStrength 越强 (0.0 - 1.0)
      float glowStrength = 1.0 - smoothstep(0.0, uGlowRadius, vDistanceToChakra);

      // 3. 颜色混合
      // 底色 + (五行色 * 辉光强度)
      vec3 finalColor = mix(uBaseColor, uElementColor, glowStrength * 1.5);

      // 4. 音频闪烁增强
      finalColor += uElementColor * uAudioHigh * glowStrength;

      // 5. 透明度逻辑
      // 基础透明度 0.15 (很透)，辉光区域不透明度增加
      float alpha = (0.15 + glowStrength * 0.8) * alphaShape;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);
