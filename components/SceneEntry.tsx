import React, { useRef } from 'react';
import * as THREE from 'three';
import { MeshReflectorMaterial } from '@react-three/drei';
import { useStore } from '../store';

export const SceneEntry: React.FC = () => {
  const startJourney = useStore((state) => state.startJourney);
  const phase = useStore((state) => state.phase);

  // Handle click on the monolith
  const handleClick = () => {
    if (phase === 'entry') {
      startJourney();
    }
  };

  return (
    <>
      <fog attach="fog" args={['#050505', 5, 25]} />
      
      {/* The Monolith (Screen) */}
      <group position={[0, 2, 0]}>
        {/* Main White Screen */}
        <mesh onClick={handleClick} position={[0, 0, 0]}>
          {/* 16:9 Aspect Ratio Giant Screen */}
          <planeGeometry args={[16, 9]} /> 
          <meshBasicMaterial 
            color={0xffffff} 
            toneMapped={false} // Crucial for Bloom to pick this up as "very bright"
          />
        </mesh>

        {/* The Red "Scan Line" / Portal Slit */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[0.1, 9, 0.1]} />
          <meshBasicMaterial color={0xff0000} toneMapped={false} />
        </mesh>
        
        {/* Backing for the screen (to block fog from behind if needed, or add depth) */}
        <mesh position={[0, 0, -0.1]}>
           <planeGeometry args={[16.2, 9.2]} />
           <meshBasicMaterial color="black" />
        </mesh>
      </group>

      {/* Structural Pillars (To give parallax depth) */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[(i % 2 === 0 ? -1 : 1) * (10 + Math.random() * 5), 5, -5 - i * 5]}>
          <boxGeometry args={[1, 20, 1]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}

      {/* Ground with Reflections */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[100, 100]} />
        {/* 
          Using MeshReflectorMaterial for "Blurry Reflections".
          This creates the "wet floor" or polished concrete look common in liminal spaces.
        */}
        <MeshReflectorMaterial
          mirror={1}
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40} // Strength of the reflection
          roughness={0.8} // High roughness as requested
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#101010"
          metalness={0.5}
        />
      </mesh>
      
      {/* Ambient light for the faint surroundings */}
      <ambientLight intensity={0.1} />
      
      {/* Light coming "from" the screen to light up the pillars */}
      <rectAreaLight 
        width={16} 
        height={9} 
        color="#ffffff" 
        intensity={2} 
        position={[0, 2, 0.1]} 
        lookAt={() => new THREE.Vector3(0, 0, 10)} 
      />
    </>
  );
};