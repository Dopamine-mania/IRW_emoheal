
import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { useStore } from '../store';
import { TheCore } from './TheCore';
import { Planets } from './Planets';
import { CyberEarth } from './CyberEarth';
import { MemoryPrism } from './MemoryPrism';

export const SceneEmitter: React.FC = () => {
  const { camera } = useThree();
  const phase = useStore((state) => state.phase);

  // Initial setup for the Emitter scene
  useEffect(() => {
    // Only reset if we are JUST entering the emitter phase from transition
    if (phase === 'emitter') {
      camera.position.set(0, 0, 12);
      camera.lookAt(0, 0, 0);
    }
  }, [phase, camera]);

  return (
    <>
      <color attach="background" args={['#020205']} />
      <fog attach="fog" args={['#020205', 5, 40]} />

      {/* Environment map ensures PBR materials (like Metal) reflect light properly */}
      <Environment preset="city" />

      {/* The Quantum Microphone Core */}
      <TheCore />

      {/* The 5 Elemental Planets */}
      <Planets />

      {/* The Cyber Earth Anchor (Background/Below) */}
      <CyberEarth />

      {/* The Time Corridor Prism (UI Anchor) */}
      <MemoryPrism />

      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="blue" />
    </>
  );
};
