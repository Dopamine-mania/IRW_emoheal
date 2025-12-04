import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore, ElementType } from '../store';

// Chakra positions (based on color-chakra mapping)
const CHAKRA_POSITIONS: Record<ElementType, THREE.Vector3> = {
  fire: new THREE.Vector3(0, -1.8, 0),      // Root Chakra (Base of spine)
  water: new THREE.Vector3(0, -1.0, 0.3),   // Sacral Chakra (Lower abdomen)
  earth: new THREE.Vector3(0, 0.2, 0.3),    // Solar Plexus (Navel area)
  wood: new THREE.Vector3(0, 1.5, 0.2),     // Heart Chakra (Chest)
  metal: new THREE.Vector3(0, 3.2, 0)       // Throat Chakra (Throat/Neck)
};

// Element colors
const ELEMENT_COLORS: Record<ElementType, number> = {
  wood: 0x4caf50,   // Green
  fire: 0xff3300,   // Red
  earth: 0xffd700,  // Gold/Yellow
  metal: 0xe0e0ff,  // White/Silver
  water: 0x2196f3   // Blue
};

// Create circle texture for particles
const createCircleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d')!;
  const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 32, 32);
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
};

// Generate lotus pose body geometry
const createMeditationBodyGeometry = () => {
  const vertices: number[] = [];
  const sizes: number[] = [];
  const colors: number[] = [];
  const baseColor = new THREE.Color(0x44aaff);

  const addShape = (
    shapeType: 'sphere' | 'cylinder',
    centerX: number,
    centerY: number,
    centerZ: number,
    width: number,
    height: number,
    depth: number,
    count: number
  ) => {
    for (let i = 0; i < count; i++) {
      let x: number, y: number, z: number;

      if (shapeType === 'sphere') {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = width * Math.cbrt(Math.random());
        x = centerX + r * Math.sin(phi) * Math.cos(theta);
        y = centerY + r * Math.sin(phi) * Math.sin(theta);
        z = centerZ + r * Math.cos(phi);
      } else {
        const theta = 2 * Math.PI * Math.random();
        const r = width * Math.sqrt(Math.random());
        const h = height * (Math.random() - 0.5);
        x = centerX + r * Math.cos(theta);
        y = centerY + h;
        z = centerZ + r * Math.sin(theta);
      }

      x += (Math.random() - 0.5) * 0.05;
      y += (Math.random() - 0.5) * 0.05;
      z += (Math.random() - 0.5) * 0.05;

      vertices.push(x, y, z);
      sizes.push(Math.random() * 0.05 + 0.01);
      colors.push(baseColor.r, baseColor.g, baseColor.b);
    }
  };

  // HEAD
  addShape('sphere', 0, 4.2, 0, 0.9, 0.9, 0.9, 600);

  // NECK
  addShape('cylinder', 0, 3.2, 0, 0.35, 0.6, 0.35, 150);

  // TORSO (Upper)
  addShape('cylinder', 0, 2.0, 0, 1.1, 1.8, 0.8, 1000);

  // TORSO (Lower/Belly)
  addShape('cylinder', 0, 0.5, 0.1, 1.2, 1.5, 0.9, 800);

  // LEFT THIGH
  for (let i = 0; i < 600; i++) {
    const p = Math.random();
    const start = new THREE.Vector3(-0.8, -0.5, 0);
    const end = new THREE.Vector3(-2.2, -1.8, 1.2);
    const pos = new THREE.Vector3().lerpVectors(start, end, p);
    const r = 0.5 * Math.sin(Math.PI * p) + 0.4;
    const theta = Math.random() * Math.PI * 2;
    const radius = Math.random() * r;
    pos.x += radius * Math.cos(theta);
    pos.y += radius * Math.sin(theta);
    pos.z += radius * 0.2;
    vertices.push(pos.x, pos.y, pos.z);
    sizes.push(Math.random() * 0.05);
    colors.push(baseColor.r, baseColor.g, baseColor.b);
  }

  // RIGHT THIGH
  for (let i = 0; i < 600; i++) {
    const p = Math.random();
    const start = new THREE.Vector3(0.8, -0.5, 0);
    const end = new THREE.Vector3(2.2, -1.8, 1.2);
    const pos = new THREE.Vector3().lerpVectors(start, end, p);
    const r = 0.5 * Math.sin(Math.PI * p) + 0.4;
    const theta = Math.random() * Math.PI * 2;
    const radius = Math.random() * r;
    pos.x += radius * Math.cos(theta);
    pos.y += radius * Math.sin(theta);
    pos.z += radius * 0.2;
    vertices.push(pos.x, pos.y, pos.z);
    sizes.push(Math.random() * 0.05);
    colors.push(baseColor.r, baseColor.g, baseColor.b);
  }

  // LEFT SHIN
  for (let i = 0; i < 500; i++) {
    const p = Math.random();
    const start = new THREE.Vector3(-2.2, -1.8, 1.2);
    const end = new THREE.Vector3(0.5, -2.2, 1.8);
    const pos = new THREE.Vector3().lerpVectors(start, end, p);
    const r = 0.4;
    const theta = Math.random() * Math.PI * 2;
    const radius = Math.random() * r;
    pos.x += radius * Math.cos(theta);
    pos.y += radius * Math.sin(theta) * 0.8;
    pos.z += radius * Math.cos(theta) * 0.5;
    vertices.push(pos.x, pos.y, pos.z);
    sizes.push(Math.random() * 0.05);
    colors.push(baseColor.r, baseColor.g, baseColor.b);
  }

  // RIGHT SHIN
  for (let i = 0; i < 500; i++) {
    const p = Math.random();
    const start = new THREE.Vector3(2.2, -1.8, 1.2);
    const end = new THREE.Vector3(-0.5, -2.2, 1.8);
    const pos = new THREE.Vector3().lerpVectors(start, end, p);
    const r = 0.4;
    const theta = Math.random() * Math.PI * 2;
    const radius = Math.random() * r;
    pos.x += radius * Math.cos(theta);
    pos.y += radius * Math.sin(theta) * 0.8;
    pos.z += radius * Math.cos(theta) * 0.5;
    vertices.push(pos.x, pos.y, pos.z);
    sizes.push(Math.random() * 0.05);
    colors.push(baseColor.r, baseColor.g, baseColor.b);
  }

  // LEFT ARM
  for (let i = 0; i < 500; i++) {
    const p = Math.random();
    const shoulder = new THREE.Vector3(-1.4, 2.5, 0);
    const elbow = new THREE.Vector3(-1.8, 0.5, 0.5);
    const hand = new THREE.Vector3(-1.8, -1.2, 1.2);

    let pos: THREE.Vector3;
    if (p < 0.5) {
      pos = new THREE.Vector3().lerpVectors(shoulder, elbow, p * 2);
    } else {
      pos = new THREE.Vector3().lerpVectors(elbow, hand, (p - 0.5) * 2);
    }

    const radius = Math.random() * 0.35;
    const theta = Math.random() * Math.PI * 2;
    pos.x += radius * Math.cos(theta);
    pos.z += radius * Math.sin(theta);

    vertices.push(pos.x, pos.y, pos.z);
    sizes.push(Math.random() * 0.05);
    colors.push(baseColor.r, baseColor.g, baseColor.b);
  }

  // RIGHT ARM
  for (let i = 0; i < 500; i++) {
    const p = Math.random();
    const shoulder = new THREE.Vector3(1.4, 2.5, 0);
    const elbow = new THREE.Vector3(1.8, 0.5, 0.5);
    const hand = new THREE.Vector3(1.8, -1.2, 1.2);

    let pos: THREE.Vector3;
    if (p < 0.5) {
      pos = new THREE.Vector3().lerpVectors(shoulder, elbow, p * 2);
    } else {
      pos = new THREE.Vector3().lerpVectors(elbow, hand, (p - 0.5) * 2);
    }

    const radius = Math.random() * 0.35;
    const theta = Math.random() * Math.PI * 2;
    pos.x += radius * Math.cos(theta);
    pos.z += radius * Math.sin(theta);

    vertices.push(pos.x, pos.y, pos.z);
    sizes.push(Math.random() * 0.05);
    colors.push(baseColor.r, baseColor.g, baseColor.b);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  return geometry;
};

// Chakra light component
interface ChakraLightProps {
  position: THREE.Vector3;
  color: number;
  intensity: number;
}

const ChakraLight: React.FC<ChakraLightProps> = ({ position, color, intensity }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const scale = 1 + Math.sin(time * 3) * 0.3;

    if (meshRef.current) {
      meshRef.current.scale.set(scale * 3, scale * 3, scale * 3);
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.3 + Math.sin(time * 3) * 0.1;
    }

    if (coreRef.current) {
      coreRef.current.scale.set(scale, scale, scale);
    }

    if (lightRef.current) {
      lightRef.current.intensity = intensity + Math.sin(time * 5) * 1;
    }
  });

  return (
    <group position={position}>
      <pointLight ref={lightRef} color={color} intensity={0} distance={10} />

      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={coreRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={0xffffff} />
      </mesh>
    </group>
  );
};

export const EnergyBody: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const currentElement = useStore(state => state.currentElement) || 'water';

  const geometry = useMemo(() => createMeditationBodyGeometry(), []);
  const texture = useMemo(() => createCircleTexture(), []);

  const chakraData = useMemo(() => ({
    position: CHAKRA_POSITIONS[currentElement],
    color: ELEMENT_COLORS[currentElement],
    intensity: currentElement === 'fire' ? 3 : 2
  }), [currentElement]);

  // Update particle colors based on element
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (particlesRef.current) {
      // Smooth continuous rotation (not sway, but full rotation)
      particlesRef.current.rotation.y = time * 0.15; // Steady rotation speed
      // Levitation
      particlesRef.current.position.y = Math.sin(time * 0.5) * 0.1;

      // Update particle colors to match element
      const colors = geometry.attributes.color.array as Float32Array;
      const baseColor = new THREE.Color(0x44aaff);
      const targetColor = new THREE.Color(ELEMENT_COLORS[currentElement]);
      baseColor.lerp(targetColor, 0.3);

      for (let i = 0; i < colors.length; i += 3) {
        colors[i] = baseColor.r;
        colors[i + 1] = baseColor.g;
        colors[i + 2] = baseColor.b;
      }
      geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]} scale={0.25}>
      {/* Particle Body */}
      <points ref={particlesRef} geometry={geometry}>
        <pointsMaterial
          size={0.1}
          vertexColors
          map={texture}
          alphaTest={0.1}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* Spine axis light */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 7, 8]} />
        <meshBasicMaterial
          color={0x44aaff}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Chakra Light */}
      <ChakraLight
        position={chakraData.position}
        color={chakraData.color}
        intensity={chakraData.intensity}
      />
    </group>
  );
};
