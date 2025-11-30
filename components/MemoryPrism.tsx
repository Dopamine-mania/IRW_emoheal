
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Float, MeshDistortMaterial, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';

export const MemoryPrism: React.FC = () => {
  const outerRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  
  const [hovered, setHover] = useState(false);
  const enterTimeTravel = useStore((state) => state.enterTimeTravel);
  const phase = useStore((state) => state.phase);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (outerRef.current) {
        // Complex floating rotation
        outerRef.current.rotation.x = Math.sin(t * 0.1) * 0.2;
        outerRef.current.rotation.y += 0.002;
        outerRef.current.rotation.z = Math.cos(t * 0.15) * 0.1;
    }
    
    if (coreRef.current) {
        // Heartbeat pulse
        const pulse = 1 + Math.sin(t * 3) * 0.02;
        coreRef.current.scale.setScalar(pulse);
    }

    if (ringsRef.current) {
        // Gyroscopic rotation - slow and majestic
        ringsRef.current.rotation.x = t * 0.1;
        ringsRef.current.rotation.y = t * 0.15;
        // Inner ring spins opposite
        ringsRef.current.children[0].rotation.z = t * 0.2; 
        ringsRef.current.children[1].rotation.x = -t * 0.2; 
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    enterTimeTravel();
  };
  
  // Only visible in the emitter phase
  if (phase !== 'emitter') return null;

  return (
    // Position: Top Right (7.5, 3.5)
    <group position={[7.5, 3.5, 0]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.2, 0.2]}>
        <group 
            onClick={handleClick} 
            onPointerOver={() => setHover(true)} 
            onPointerOut={() => setHover(false)}
            onPointerMissed={() => setHover(false)}
            scale={0.5} // Kept small as requested
        >
            {/* --- The Artifact Core --- */}
            
            {/* 1. Outer Crystalline Shell (Icosahedron for more facets) */}
            <mesh ref={outerRef} scale={1.2}>
              <icosahedronGeometry args={[1, 0]} />
              <MeshTransmissionMaterial 
                backside
                samples={8} // Lower samples for performance, sufficient for small object
                resolution={512}
                transmission={0.98}
                roughness={0.05}
                thickness={0.8}
                ior={1.6}
                chromaticAberration={0.8} // High chromatic aberration for "Spiritual/Prism" look
                anisotropy={0.5}
                distortion={0.4}
                distortionScale={0.6}
                temporalDistortion={0.2}
                color={hovered ? "#cffafe" : "#ffffff"}
                toneMapped={false}
              />
            </mesh>
            
            {/* 2. Inner Energy Essence (Distorted Sphere) */}
            <mesh ref={coreRef} scale={0.45}>
                <dodecahedronGeometry args={[1, 0]} />
                <MeshDistortMaterial 
                  color={hovered ? "#ffffff" : "#22d3ee"}
                  emissive={hovered ? "#ffffff" : "#0ea5e9"}
                  emissiveIntensity={3}
                  speed={2}
                  distort={0.6} // High distortion like trapped smoke
                  radius={1}
                  toneMapped={false}
                />
            </mesh>
            
            {/* 3. Orbiting Energy Rings (Gyroscopic) */}
            <group ref={ringsRef}>
                {/* Ring 1 - Vertical */}
                <mesh>
                    <torusGeometry args={[1.5, 0.015, 16, 64]} />
                    <meshBasicMaterial color="#67e8f9" transparent opacity={0.4} toneMapped={false} />
                </mesh>
                {/* Ring 2 - Horizontal */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[1.7, 0.01, 16, 64]} />
                    <meshBasicMaterial color="#a5f3fc" transparent opacity={0.2} toneMapped={false} />
                </mesh>
            </group>
            
            {/* --- Holographic UI Callout --- */}
            {/* Removed 'transform' and 'occlude' to prevent black plane artifacts */}
            <Html 
                position={[-1.5, 0, 0]} // Adjusted anchor
                className="pointer-events-none"
                zIndexRange={[100, 0]}
                center // Centers the div on the position
            >
                {/* 
                   We use absolute positioning within this container to push the text to the Left 
                   of the 3D point.
                */}
                <div 
                    className={`flex items-center justify-end flex-row w-[400px] absolute right-0 top-1/2 -translate-y-1/2 gap-0 transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-60'}`}
                >
                    {/* Label Content */}
                    <div className="text-right pr-4 bg-transparent">
                        <h3 className="text-xl font-bold tracking-[0.2em] text-white uppercase font-mono drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] whitespace-nowrap">
                            Time<span className="text-cyan-300">.Corridor</span>
                        </h3>
                    </div>

                    {/* Connector Line */}
                    <div className={`h-[1px] bg-gradient-to-l from-cyan-400 to-transparent transition-all duration-500 ${hovered ? 'w-16' : 'w-8'}`} />
                </div>
            </Html>
        </group>
      </Float>
    </group>
  );
};
