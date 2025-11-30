import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// StarRiver: Infinite particle field wrapping the entire space
// Positioned as the background layer of the three-layer depth architecture

const starRiverVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;

  attribute float aSpeed;
  attribute float aSize;

  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Slow drift/rotation effect
    float angle = uTime * aSpeed * 0.1;
    float cosA = cos(angle);
    float sinA = sin(angle);

    // Rotate around Y axis
    pos.x = position.x * cosA - position.z * sinA;
    pos.z = position.x * sinA + position.z * cosA;

    // Subtle floating
    pos.y += sin(uTime * aSpeed + position.x * 0.5) * 0.3;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation (distant stars are smaller)
    gl_PointSize = (aSize * 3.0 * uPixelRatio) * (50.0 / -mvPosition.z);

    // Fade based on distance
    vAlpha = smoothstep(100.0, 10.0, -mvPosition.z);
  }
`;

const starRiverFragmentShader = /* glsl */ `
  varying float vAlpha;

  void main() {
    // Circular star with soft edge
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    if (dist > 0.5) discard;

    // Soft glow
    float alpha = (1.0 - smoothstep(0.2, 0.5, dist)) * vAlpha;

    // Subtle color variation (cool white to warm white)
    vec3 color = mix(vec3(0.8, 0.9, 1.0), vec3(1.0, 0.95, 0.9), dist);

    gl_FragColor = vec4(color, alpha * 0.6);
  }
`;

export const StarRiver: React.FC = () => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Generate star field geometry wrapping entire space
  const geometry = useMemo(() => {
    const count = 8000; // Dense star field
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Distribute stars in a large sphere around the scene
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 20 + Math.random() * 80; // Stars between radius 20-100

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      speeds[i] = 0.5 + Math.random() * 1.5;
      sizes[i] = 1.0 + Math.random() * 2.0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    return geo;
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={meshRef} geometry={geometry} position={[0, -2, -5]}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={starRiverVertexShader}
        fragmentShader={starRiverFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
