
import React, { useRef, useState, useLayoutEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore, ElementType } from '../store';
import gsap from 'gsap';

// Extended Element Data with Western Spiritual Concepts
const ELEMENTS: { 
    id: ElementType; 
    color: string; 
    geometry: React.ReactNode; 
    label: string;
    hz: string;
    chakra: string;
    benefit: string;
}[] = [
  { 
    id: 'wood', 
    color: '#22d3ee', 
    geometry: <icosahedronGeometry args={[1.2, 0]} />, 
    label: 'WOOD',
    hz: '396 Hz',
    chakra: 'Root Chakra',
    benefit: 'Releasing Fear'
  },
  { 
    id: 'fire', 
    color: '#f43f5e', 
    geometry: <tetrahedronGeometry args={[1.4, 0]} />, 
    label: 'FIRE',
    hz: '528 Hz',
    chakra: 'Heart Chakra',
    benefit: 'Love & Miracles'
  },
  { 
    id: 'earth', 
    color: '#fbbf24', 
    geometry: <boxGeometry args={[1.1, 1.1, 1.1]} />, 
    label: 'EARTH',
    hz: '174 Hz',
    chakra: 'Solar Plexus',
    benefit: 'Pain Relief & Grounding'
  },
  { 
    id: 'metal', 
    color: '#e2e8f0', 
    geometry: <octahedronGeometry args={[1.3, 0]} />, 
    label: 'METAL',
    hz: '741 Hz',
    chakra: 'Throat Chakra',
    benefit: 'Detox & Intuition'
  },
  { 
    id: 'water', 
    color: '#3b82f6', 
    geometry: <sphereGeometry args={[1.1, 32, 32]} />, 
    label: 'WATER',
    hz: '417 Hz',
    chakra: 'Sacral Chakra',
    benefit: 'Clearing Trauma'
  },
];

// --- Holographic Terrain Shader ---
const terrainVertexShader = `
  uniform float uTime;
  uniform float uType; // 0: Wood, 1: Fire, 2: Earth, 3: Metal, 4: Water
  varying vec2 vUv;
  varying float vElevation;

  // Simple pseudo-random
  float random (vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // 2D Noise
  float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    
    float elevation = 0.0;
    
    if (uType < 0.5) { 
        // WOOD: Forest/Organic - Rolling hills
        elevation = sin(pos.x * 3.0 + uTime * 0.2) * cos(pos.y * 3.0) * 0.3;
        elevation += noise(pos.xy * 5.0) * 0.1;
    } else if (uType < 1.5) {
        // FIRE: Spiky/Chaotic
        elevation = noise(pos.xy * 4.0 + vec2(0.0, uTime)) * 0.6;
        elevation = abs(elevation); // Sharp peaks
    } else if (uType < 2.5) {
        // EARTH: Mountainous/Grand Canyon
        elevation = noise(pos.xy * 2.0) * 0.8;
        elevation = pow(elevation * 1.5, 2.0) * 0.5; // Steep valleys
    } else if (uType < 3.5) {
        // METAL: City Grid/Digital
        vec2 grid = floor(pos.xy * 4.0);
        elevation = step(0.5, random(grid)) * 0.4; // Binary height map
    } else {
        // WATER: Waves/Ocean
        elevation = sin(pos.x * 5.0 + uTime) * 0.2 + cos(pos.y * 3.0 + uTime * 0.8) * 0.2;
    }
    
    pos.z += elevation;
    vElevation = elevation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const terrainFragmentShader = `
  uniform vec3 uColor;
  varying float vElevation;
  varying vec2 vUv;

  void main() {
    // Fade edges to create "Slice" look
    float d = distance(vUv, vec2(0.5));
    float alpha = 1.0 - smoothstep(0.3, 0.5, d);
    
    // Highlight peaks
    float peak = smoothstep(0.2, 0.5, vElevation);
    vec3 finalColor = mix(uColor, vec3(1.0), peak * 0.5);

    gl_FragColor = vec4(finalColor, alpha * 0.8);
  }
`;

const HolographicTerrain: React.FC<{ typeId: ElementType; color: string }> = ({ typeId, color }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    
    const typeIndex = useMemo(() => {
        const map: Record<ElementType, number> = { wood: 0, fire: 1, earth: 2, metal: 3, water: 4 };
        return map[typeId];
    }, [typeId]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uType: { value: typeIndex },
        uColor: { value: new THREE.Color(color) }
    }), [typeIndex, color]);

    useFrame((state) => {
        if (meshRef.current) {
            // @ts-ignore
            meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} scale={0.7}>
            <planeGeometry args={[2, 2, 32, 32]} />
            <shaderMaterial 
                vertexShader={terrainVertexShader}
                fragmentShader={terrainFragmentShader}
                uniforms={uniforms}
                transparent
                wireframe
                side={THREE.DoubleSide}
                depthWrite={false} // Prevent z-fighting with transparent shells
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
};

const HolographicLabel: React.FC<{ data: typeof ELEMENTS[0]; visible: boolean }> = ({ data, visible }) => {
    return (
        <Html
            position={[0, -2.5, 0]}
            center
            className={`pointer-events-none transition-all duration-500 ease-out transform ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90'}`}
            zIndexRange={[100, 0]}
        >
            <div className="flex flex-col items-center justify-center text-center w-64 pointer-events-none">
                {/* Main Title - Element Name */}
                <h2 
                    className="text-5xl font-bold text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] font-mono uppercase"
                    style={{ textShadow: `0 0 20px ${data.color}` }}
                >
                    {data.label}
                </h2>
                
                {/* Decorative Line */}
                <div className="w-16 h-[2px] bg-white/80 my-3 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                
                {/* Subtitle - Frequency & Chakra */}
                <p className="text-cyan-300 text-sm font-bold tracking-[0.2em] uppercase mb-1 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
                    {data.chakra} · {data.hz}
                </p>
                
                {/* Micro-copy - Benefit */}
                <div className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded border border-white/10 mt-1">
                    <p className="text-white/90 text-xs font-light tracking-widest uppercase">
                        {data.benefit}
                    </p>
                </div>
            </div>
        </Html>
    );
};

const SelectionItem: React.FC<{ 
    data: typeof ELEMENTS[0]; 
    index: number; 
    total: number;
    onSelect: (id: ElementType, position: THREE.Vector3) => void 
}> = ({ data, index, total, onSelect }) => {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);
    
    // Distribute in a circle
    const radius = 4.5;
    const angle = (index / total) * Math.PI * 2; 
    // Adjust angle so Wood (Index 0) is at Top
    const adjustedAngle = angle + Math.PI / 2;
    
    const x = Math.cos(adjustedAngle) * radius;
    const y = Math.sin(adjustedAngle) * radius;

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Self rotation
            meshRef.current.rotation.x += 0.005;
            meshRef.current.rotation.y += 0.01;
            
            // Hover Animation
            const targetScale = hovered ? 1.3 : 1;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
        }
    });

    const handleClick = (e: any) => {
        e.stopPropagation();
        if (meshRef.current) {
            // Pass world position for camera transition
            const vec = new THREE.Vector3();
            meshRef.current.getWorldPosition(vec);
            onSelect(data.id, vec);
        }
    };

    return (
        <group position={[x, y, 0]}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <group 
                    ref={meshRef} 
                    onClick={handleClick}
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                >
                    {/* Visual Logic Matching SceneEmitter/Planets.tsx */}
                    
                    {/* WOOD: Solid Core (Transparent) + Wireframe Shell */}
                    {data.id === 'wood' && (
                        <>
                            <mesh>
                                {data.geometry}
                                {/* Updated: Transparent core to reveal inner terrain */}
                                <meshStandardMaterial 
                                    color={data.color} 
                                    roughness={0.2} 
                                    transparent 
                                    opacity={0.6}
                                />
                            </mesh>
                            <mesh scale={1.2}>
                                {data.geometry}
                                <meshBasicMaterial color={data.color} wireframe transparent opacity={0.3} />
                            </mesh>
                        </>
                    )}
                    
                    {/* FIRE: Emissive Tetrahedron */}
                    {data.id === 'fire' && (
                         <mesh>
                            {data.geometry}
                            <meshStandardMaterial 
                                color={data.color} 
                                emissive={data.color} 
                                emissiveIntensity={hovered ? 3 : 1.5} 
                                roughness={0.4} 
                                transparent
                                opacity={0.8}
                            />
                             <mesh scale={1.2}>
                                {data.geometry}
                                <meshBasicMaterial color={data.color} wireframe transparent opacity={0.3} />
                            </mesh>
                        </mesh>
                    )}
                    
                    {/* EARTH: Solid Box */}
                    {data.id === 'earth' && (
                         <mesh>
                            {data.geometry}
                            <meshStandardMaterial 
                                color={data.color} 
                                roughness={0.8} 
                                metalness={0.2} 
                                transparent 
                                opacity={0.8}
                            />
                            <mesh scale={1.2}>
                                {data.geometry}
                                <meshBasicMaterial color={data.color} wireframe transparent opacity={0.3} />
                            </mesh>
                        </mesh>
                    )}
                    
                    {/* METAL: High Polish + Reflections */}
                    {data.id === 'metal' && (
                         <mesh>
                            {data.geometry}
                            <meshStandardMaterial 
                                color="#ffffff" 
                                roughness={0.05} 
                                metalness={1.0} 
                                envMapIntensity={1.5} 
                                transparent
                                opacity={0.8}
                            />
                            <mesh scale={1.2}>
                                {data.geometry}
                                <meshBasicMaterial color={data.color} wireframe transparent opacity={0.3} />
                            </mesh>
                        </mesh>
                    )}
                    
                    {/* WATER: Blue Sphere with Ripples */}
                    {data.id === 'water' && (
                        <>
                             {/* Core sphere */}
                             <mesh>
                                <sphereGeometry args={[1.0, 32, 32]} />
                                {/* Updated: Transparent Distort Material to reveal inner terrain */}
                                <MeshDistortMaterial 
                                    color={data.color} 
                                    distort={0.3} 
                                    speed={2} 
                                    roughness={0.1} 
                                    metalness={0.5} 
                                    transparent
                                    opacity={0.6}
                                    side={THREE.DoubleSide}
                                />
                            </mesh>
                             <mesh scale={1.2}>
                                <sphereGeometry args={[1.0, 16, 16]} />
                                <meshBasicMaterial color={data.color} wireframe transparent opacity={0.3} />
                            </mesh>
                        </>
                    )}

                    {/* --- Holographic Terrain Slice --- */}
                    <group scale={1.7} position={[0, 0, 0.2]} visible={true}>
                        <HolographicTerrain typeId={data.id} color={data.color} />
                    </group>

                </group>
                
                {/* Hover Glow Light */}
                {hovered && (
                    <pointLight position={[0, 0, 2]} color={data.color} intensity={2} distance={6} />
                )}

                {/* The Holographic Label */}
                <HolographicLabel data={data} visible={hovered} />
            </Float>
        </group>
    );
};

export const SceneSelection: React.FC = () => {
  const { camera } = useThree();
  const selectElement = useStore((state) => state.selectElement);

  // Reset Camera on Mount
  useLayoutEffect(() => {
    camera.position.set(0, 0, 16);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  const handleSelect = (id: ElementType, position: THREE.Vector3) => {
      // Transition: Camera zoom INTO the element
      gsap.to(camera.position, {
          x: position.x,
          y: position.y,
          z: position.z + 2, // Get close
          duration: 1.5,
          ease: "expo.in",
          onComplete: () => {
              selectElement(id); // Switch phase
          }
      });
  };

  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 10, 40]} />
      
      {/* Environment is crucial for Metal material */}
      <Environment preset="city" />
      
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, 10]} intensity={0.5} color="blue" />
      
      <group position={[0, 0, 0]}>
        {ELEMENTS.map((el, index) => (
            <SelectionItem 
                key={el.id} 
                data={el} 
                index={index} 
                total={ELEMENTS.length} 
                onSelect={handleSelect} 
            />
        ))}
      </group>
    </>
  );
};