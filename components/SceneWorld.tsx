
import React from 'react';
import * as THREE from 'three';
import { useStore, ElementType } from '../store';
import { TheCore } from './TheCore'; // Reuse the core as the "Aura Orb"
import { EnergyBody } from './EnergyBody'; // Chakra Particle Body
import { StarRiver } from './StarRiver'; // Background Layer
import { LandmarkParticles } from './LandmarkParticles'; // Mid-ground Far Layer

const ELEMENT_COLORS: Record<ElementType, string> = {
  wood: '#22d3ee',
  fire: '#f43f5e',
  earth: '#fbbf24',
  metal: '#e2e8f0',
  water: '#3b82f6'
};

export const SceneWorld: React.FC = () => {
  const currentElement = useStore(state => state.currentElement) || 'wood';
  const color = ELEMENT_COLORS[currentElement];
  const energyBodyPosition = new THREE.Vector3(0, -0.5, 0);

  return (
    <>
      <color attach="background" args={['#000000']} />

      {/* Deep Fog for "Ghostly" atmosphere */}
      <fog attach="fog" args={['#000000', 5, 60]} />

      <ambientLight intensity={0.1} />

      {/* ===== LAYER 1: Background - Star River ===== */}
      {/* Infinite particle field wrapping entire space */}
      <StarRiver />

      {/* ===== LAYER 2: Mid-ground Far - Landmark Particles ===== */}
      {/* Curved backdrop (e.g., Great Wall for Earth element) */}
      {/* Positioned behind the human body with particle flow effect */}
      <LandmarkParticles
        color={color}
        typeId={currentElement}
        curvature={0.5}
        flowTarget={energyBodyPosition}
      />

      {/* ===== LAYER 3: Mid-ground Near - Energy Body ===== */}
      {/* The Chakra Particle Energy Body (脉轮粒子能量体) */}
      {/* Main focal point - meditation pose with chakra glow */}
      <group position={[energyBodyPosition.x, energyBodyPosition.y, energyBodyPosition.z]}>
        <EnergyBody />
        {/* Rim light to enhance visibility */}
        <pointLight position={[2, 2, 2]} color={color} intensity={0.5} distance={5} />
        <pointLight position={[-2, 2, 2]} color={color} intensity={0.5} distance={5} />
      </group>

      {/* The Aura Orb (Energy Source) - Floating high in distance */}
      <group position={[0, 15, -30]}>
         <TheCore />
         {/* Subtle glow from the source */}
         <pointLight color={color} intensity={1} distance={80} decay={2} />
      </group>
    </>
  );
};
