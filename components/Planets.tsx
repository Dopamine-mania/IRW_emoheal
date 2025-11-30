
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore, ElementType } from '../store';
import * as THREE from 'three';
import gsap from 'gsap';

interface ElementData {
  id: ElementType;
  color: string;
  geometry: React.ReactNode;
  position: [number, number, number];
}

const ELEMENTS: ElementData[] = [
  { id: 'wood', color: '#22d3ee', geometry: <icosahedronGeometry args={[0.5, 0]} />, position: [3, 0, 0] },
  { id: 'fire', color: '#f43f5e', geometry: <tetrahedronGeometry args={[0.6, 0]} />, position: [0, 0, 3] },
  { id: 'earth', color: '#fbbf24', geometry: <boxGeometry args={[0.7, 0.7, 0.7]} />, position: [-3, 0, 0] },
  { id: 'metal', color: '#e2e8f0', geometry: <octahedronGeometry args={[0.6, 0]} />, position: [0, 3, -1] },
  { id: 'water', color: '#3b82f6', geometry: <sphereGeometry args={[0.5, 16, 16]} />, position: [0, -3, 1] },
];

type PlanetProps = {
  data: ElementData;
  index: number;
  total: number;
  isDiving: boolean;
  isInjecting: boolean;
};

const Planet: React.FC<PlanetProps> = ({ data, index, total, isDiving, isInjecting }) => {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHover] = useState(false);
  const phase = useStore((state) => state.phase);

  // Orbit logic
  const angle = (index / total) * Math.PI * 2;
  const radius = 3.5;

  useFrame((state) => {
    if (phase !== 'emitter' || !meshRef.current) return;
    // CRITICAL: Stop orbiting if we are injecting, so GSAP can take over positions
    if (isDiving || isInjecting) return; 

    if (!hovered) {
      // Orbit
      const t = state.clock.getElapsedTime() * 0.2;
      meshRef.current.position.x = Math.cos(angle + t) * radius;
      meshRef.current.position.z = Math.sin(angle + t) * radius;
      meshRef.current.position.y = Math.sin((angle + t) * 2) * 1; 
      
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    } else {
        // Spin faster when hovered
        meshRef.current.rotation.x += 0.05;
        meshRef.current.rotation.y += 0.05;
    }
  });

  return (
    <group 
        ref={meshRef} 
        position={data.position} 
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
    >
      <mesh>
        {data.geometry}
        <meshStandardMaterial 
            ref={materialRef}
            color={data.id === 'metal' ? '#ffffff' : data.color} 
            // Metal relies on Environment reflections, others use Emissive for glow
            metalness={data.id === 'metal' ? 1.0 : 0.2}
            roughness={data.id === 'metal' ? 0.05 : 0.2}
            emissive={data.id === 'metal' ? '#000000' : data.color} 
            emissiveIntensity={data.id === 'metal' ? 0 : (hovered ? 4 : 2)} 
            toneMapped={false}
        />
      </mesh>
      
      {/* Outer Glow Shell */}
      <mesh scale={1.2}>
        {data.geometry}
        <meshBasicMaterial 
            color={data.color} 
            transparent 
            opacity={0.2} 
            wireframe 
            toneMapped={false}
        />
      </mesh>
    </group>
  );
};

export const Planets: React.FC = () => {
  const enterSelection = useStore((state) => state.enterSelection);
  const isInjecting = useStore((state) => state.isInjecting);
  const { camera, scene } = useThree();
  const [isDiving, setIsDiving] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  // Injection Sequence Listener
  useEffect(() => {
    if (isInjecting && groupRef.current) {
        setIsDiving(true);
        
        const tl = gsap.timeline({
            onComplete: () => {
                // Switch to Selection Scene (Task 2) instead of Resonance
                enterSelection();
            }
        });

        const children = groupRef.current.children;

        // PHASE 1: EMISSION (0.0s - 0.5s)
        // Flash/Scale up in place to show gathering energy
        children.forEach((child) => {
             tl.to(child.scale, {
                 x: 1.8, y: 1.8, z: 1.8,
                 duration: 0.5,
                 ease: "back.out(1.7)"
             }, 0);
        });

        // PHASE 2: CONVERGENCE (0.5s - 1.3s)
        // Fly rapidly into the marker coordinate
        // Target: Top of Earth [0, -4, -10]
        children.forEach((child) => {
             tl.to(child.position, {
                 x: 0,
                 y: -4, 
                 z: -10,
                 duration: 0.8,
                 ease: "expo.in", // Fast acceleration into the point
             }, 0.5); // Start after emission phase
             
             // Scale down/disappear on impact
             tl.to(child.scale, {
                 x: 0, y: 0, z: 0,
                 duration: 0.1,
             }, 1.3); // At end of movement
        });

        // Camera Dolly In (Task 1 Requirement)
        // "Camera fast dolly in... like crashing into earth surface"
        // Move closer to the impact point
        tl.to(camera.position, {
            x: 0,
            y: -2, 
            z: -5,
            duration: 1.3,
            ease: "expo.in"
        }, 0);
        
    }
  }, [isInjecting, scene, camera, enterSelection]);

  return (
    <group ref={groupRef}>
      {ELEMENTS.map((el, index) => (
        <group key={el.id}>
            <Planet 
                data={el} 
                index={index} 
                total={ELEMENTS.length} 
                isDiving={isDiving}
                isInjecting={isInjecting}
            />
        </group>
      ))}
    </group>
  );
};
