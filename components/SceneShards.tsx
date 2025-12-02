
import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore, ElementType } from '../store';
import gsap from 'gsap';

// --- Interfaces ---
interface LandmarkData {
  id: string;
  name: string;
  status: 'active' | 'locked';
}

interface ElementConfig {
  color: string;
  frequency: string;
  nodes: LandmarkData[];
}

// --- Configuration ---
const ELEMENT_CONFIG: Record<ElementType, ElementConfig> = {
  fire: {
    color: '#f43f5e', 
    frequency: '528Hz',
    nodes: [
      { id: 'danxia', name: 'Danxia Landform', status: 'active' }, 
      { id: 'flaming_mt', name: 'Flaming Mts', status: 'locked' },
      { id: 'red_beach', name: 'Red Beach', status: 'locked' }
    ]
  },
  earth: {
    color: '#fbbf24', 
    frequency: '174Hz',
    nodes: [
      { id: 'great_wall', name: 'The Great Wall', status: 'active' }, 
      { id: 'terracotta', name: 'Terracotta Army', status: 'locked' },
      { id: 'mt_tai', name: 'Mount Tai', status: 'locked' }
    ]
  },
  wood: {
    color: '#22d3ee', 
    frequency: '396Hz',
    nodes: [
      { id: 'bamboo', name: 'Bamboo Sea', status: 'active' }, 
      { id: 'mt_huang', name: 'Yellow Mts', status: 'locked' },
      { id: 'forest', name: 'Xishuangbanna', status: 'locked' }
    ]
  },
  metal: {
    color: '#e2e8f0', 
    frequency: '741Hz',
    nodes: [
      { id: 'snow_peak', name: 'Meili Snow Mt', status: 'active' }, 
      { id: 'shanghai', name: 'Shanghai Tower', status: 'locked' }, 
      { id: 'bird_nest', name: 'Bird\'s Nest', status: 'locked' }
    ]
  },
  water: {
    color: '#3b82f6', 
    frequency: '417Hz',
    nodes: [
      { id: 'west_lake', name: 'West Lake', status: 'active' }, 
      { id: 'yangtze', name: 'Three Gorges', status: 'locked' }, 
      { id: 'guilin', name: 'Li River', status: 'locked' }
    ]
  }
};

// --- Procedural Mist Shader (Reused for Active Shards) ---
const mistVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const mistFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;

  float random (in vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
  float fbm (in vec2 st) {
      float v = 0.0;
      float a = 0.5;
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
      for (int i = 0; i < 5; i++) {
          float n = random(floor(st));
          // Simple noise placeholder for performance, ideally proper noise
          v += a * n; 
          st = rot * st * 2.0 + vec2(100.0);
          a *= 0.5;
      }
      return v;
  }

  void main() {
    vec2 st = vUv * 3.0;
    // Simulate flowing mist using time
    float fog = sin(st.x * 10.0 + uTime) * 0.5 + 0.5; 
    float fog2 = cos(st.y * 5.0 - uTime * 0.5) * 0.5 + 0.5;
    
    vec3 col = mix(uColor * 0.2, uColor, fog * fog2);
    
    // Soft circular mask
    float d = distance(vUv, vec2(0.5));
    float alpha = 1.0 - smoothstep(0.3, 0.5, d);
    
    gl_FragColor = vec4(col, alpha * uOpacity);
  }
`;

const LandmarkNode: React.FC<{ 
    index: number; 
    data: LandmarkData;
    color: string; 
    onClick: (pos: THREE.Vector3, landmark: LandmarkData) => void 
}> = ({ index, data, color, onClick }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const [hovered, setHover] = useState(false);
    
    const isActive = data.status === 'active';

    // Generate random irregular shape
    const shape = useMemo(() => {
        const s = new THREE.Shape();
        const numPts = isActive ? 7 : 5; 
        for(let i=0; i<numPts; i++) {
            const angle = (i/numPts) * Math.PI * 2;
            const r = 1.0 + Math.random() * (isActive ? 0.6 : 0.3);
            s.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
        }
        return s;
    }, [isActive]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: isActive ? 1.0 : 0.3 }
    }), [color, isActive]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
        if (meshRef.current) {
            meshRef.current.rotation.z += (isActive ? 0.005 : 0.001) * (index % 2 === 0 ? 1 : -1);
            const targetScale = hovered && isActive ? 1.2 : 1;
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        }
    });

    const handleClick = (e: any) => {
        e.stopPropagation();
        if (!isActive) return;
        if (meshRef.current) {
            const vec = new THREE.Vector3();
            meshRef.current.getWorldPosition(vec);
            onClick(vec, data);
        }
    };

    // Layout
    const angle = (index / 3) * Math.PI * 2;
    const radius = 3.5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.5; 

    return (
        <group position={[x, y, 0]}>
            <Float speed={isActive ? 2 : 1} rotationIntensity={0.2} floatIntensity={1}>
                <mesh 
                    ref={meshRef}
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                    onClick={handleClick}
                >
                    <shapeGeometry args={[shape]} />
                    {isActive ? (
                        <shaderMaterial 
                            ref={materialRef}
                            vertexShader={mistVertexShader}
                            fragmentShader={mistFragmentShader}
                            uniforms={uniforms}
                            transparent
                            side={THREE.DoubleSide}
                            blending={THREE.AdditiveBlending}
                        />
                    ) : (
                        <meshBasicMaterial color="#555" wireframe transparent opacity={0.2} />
                    )}
                </mesh>
                
                <Html position={[0, -1.8, 0]} center className="pointer-events-none" zIndexRange={[100, 0]}>
                    <div className={`flex flex-col items-center transition-opacity duration-300 ${isActive || hovered ? 'opacity-100' : 'opacity-40'}`}>
                        {isActive ? (
                            <>
                                <div className={`text-xs text-${hovered ? 'white' : 'white/60'} tracking-widest uppercase mb-1`}>
                                    Target Node
                                </div>
                                <div 
                                    className="text-white font-bold text-lg uppercase tracking-wider whitespace-nowrap drop-shadow-md"
                                    style={{ textShadow: hovered ? `0 0 10px ${color}` : 'none' }}
                                >
                                    {data.name}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="text-[10px] text-gray-500 tracking-widest uppercase mb-1">Signal Weak</div>
                                <div className="text-gray-600 text-sm font-mono uppercase tracking-widest">Locked</div>
                            </div>
                        )}
                    </div>
                </Html>
            </Float>
        </group>
    );
};

export const SceneShards: React.FC = () => {
    const { camera } = useThree();
    const openPhotoChoicePanel = useStore(state => state.openPhotoChoicePanel);
    const currentElement = useStore(state => state.currentElement) || 'fire';

    // Explicitly typed access
    const config = ELEMENT_CONFIG[currentElement];

    useLayoutEffect(() => {
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
    }, [camera]);

    const handleNodeClick = (pos: THREE.Vector3, landmark: LandmarkData) => {
        // Open photo choice panel instead of going directly to tuning
        openPhotoChoicePanel(landmark);
    };

    return (
        <>
            <color attach="background" args={['#050510']} />
            <fog attach="fog" args={['#050510', 5, 25]} />
            <Environment preset="city" />
            <ambientLight intensity={0.5} />

            <group position={[0, 0, 0]}>
                {config.nodes.map((node, i) => (
                    <LandmarkNode 
                        key={node.id} 
                        index={i} 
                        data={node} 
                        color={config.color} 
                        onClick={handleNodeClick} 
                    />
                ))}
            </group>
        </>
    );
};
