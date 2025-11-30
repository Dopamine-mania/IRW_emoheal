
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useStore, ElementType } from '../store';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { TheCore } from './TheCore'; // Reuse the core as the "Aura Orb"

const ELEMENT_COLORS: Record<ElementType, string> = {
  wood: '#22d3ee',
  fire: '#f43f5e',
  earth: '#fbbf24',
  metal: '#e2e8f0',
  water: '#3b82f6'
};

// --- Volumetric Point Cloud Shader ---
// Inspiration: Penderecki's Garden (Memory/Drift/Particles)

const pointCloudVertexShader = `
  uniform float uTime;
  uniform float uAudio;
  uniform vec3 uColor;
  uniform float uType; // 0: Wood, 1: Fire, 2: Earth, 3: Metal, 4: Water
  
  attribute float aRandom; // Random attribute for drift
  
  varying vec3 vColor;
  varying float vDepth;

  // Simplex Noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // FBM for detailed terrain
  float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 5; i++) {
          value += amplitude * snoise(st);
          st *= 2.0;
          amplitude *= 0.5;
      }
      return value;
  }

  void main() {
    vec3 pos = position;
    
    // --- Topography Logic ---
    float elevation = 0.0;
    
    if (uType < 0.5) { 
        // WOOD: Forest/Bamboo Sea - Vertical noise + gentle sway
        float n = snoise(pos.xy * 0.2);
        elevation = n * 2.0;
        // Wind sway
        pos.x += sin(uTime + pos.z) * 0.5 * (elevation + 1.0);
    } else if (uType < 1.5) {
        // FIRE: Danxia/Canyon - Sharp strata
        float n = fbm(pos.xy * 0.1 + vec2(uTime * 0.05, 0.0));
        elevation = abs(n) * 15.0; // Sharp peaks
    } else if (uType < 2.5) {
        // EARTH: Great Wall/Mountains - Ridge line
        float ridge = abs(snoise(pos.xy * 0.05));
        elevation = ridge * 12.0;
        // Detail
        elevation += fbm(pos.xy * 0.5) * 2.0;
    } else if (uType < 3.5) {
        // METAL: Snow Peak - Sharp, high peaks
        float n = fbm(pos.xy * 0.08);
        elevation = pow(abs(n), 2.0) * 20.0;
    } else {
        // WATER: West Lake - Ripples
        float dist = distance(pos.xy, vec2(0.0));
        elevation = sin(dist * 0.5 - uTime) * 2.0;
        elevation += snoise(pos.xy * 0.2 + uTime * 0.5) * 1.0;
    }

    // Apply elevation
    pos.z += elevation;

    // --- Audio Reactivity (Ripple) ---
    // Pulse moves from center outwards
    float dist = length(pos.xy);
    float ripple = sin(dist * 0.5 - uTime * 5.0) * uAudio * 3.0;
    pos.z += ripple;

    // --- Memory Drift (Penderecki Style) ---
    // Subtle floating of individual points
    pos.x += sin(uTime + aRandom * 100.0) * 0.2;
    pos.y += cos(uTime * 0.8 + aRandom * 50.0) * 0.2;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // --- Point Size Attenuation ---
    // Close points are large, far points are tiny dust
    gl_PointSize = (8.0 + uAudio * 20.0) * (15.0 / -mvPosition.z);

    // --- Color Mix ---
    // Mix between Element Color and White based on height/audio
    float mixFactor = smoothstep(-5.0, 10.0, pos.z + uAudio * 10.0);
    vColor = mix(uColor * 0.5, vec3(1.0), mixFactor * 0.8);
    
    // Fade into distance
    vDepth = -mvPosition.z;
  }
`;

const pointCloudFragmentShader = `
  varying vec3 vColor;
  varying float vDepth;
  uniform vec3 uColor;

  void main() {
    // Circular Particle
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;

    // Soft Edge
    float alpha = 1.0 - smoothstep(0.5, 1.0, r);
    
    // Distance Fog (Ghostly Fade)
    float fog = smoothstep(50.0, 10.0, vDepth);
    alpha *= fog;

    // Bloom Boost
    // We multiply color > 1.0 to trigger bloom
    gl_FragColor = vec4(vColor * 2.0, alpha);
  }
`;

const PointCloudLandscape: React.FC<{ color: string; typeId: ElementType }> = ({ color, typeId }) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { getAudioData } = useAudioAnalyzer();

  const typeIndex = useMemo(() => {
    const map: Record<ElementType, number> = { wood: 0, fire: 1, earth: 2, metal: 3, water: 4 };
    return map[typeId];
  }, [typeId]);

  // Create High-Density Geometry (Pre-baked "LiDAR Scan" simulation)
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 100, 200, 200); // 40k+ points
    const count = geo.attributes.position.count;
    const randoms = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        randoms[i] = Math.random();
    }
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    return geo;
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAudio: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uType: { value: typeIndex }
  }), [color, typeIndex]);

  useFrame((state) => {
    if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        materialRef.current.uniforms.uType.value = typeIndex;
        materialRef.current.uniforms.uColor.value.set(color);
        
        const { volume } = getAudioData();
        materialRef.current.uniforms.uAudio.value = THREE.MathUtils.lerp(
            materialRef.current.uniforms.uAudio.value, 
            volume, 
            0.1
        );
    }
    
    if (meshRef.current) {
        // Slow rotation for "Flyover" feel
        meshRef.current.rotation.z += 0.0005;
    }
  });

  return (
    <points 
        ref={meshRef} 
        geometry={geometry} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -15, -20]}
    >
        <shaderMaterial 
            ref={materialRef}
            vertexShader={pointCloudVertexShader}
            fragmentShader={pointCloudFragmentShader}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
        />
    </points>
  );
};

export const SceneWorld: React.FC = () => {
  const currentElement = useStore(state => state.currentElement) || 'wood'; 
  const color = ELEMENT_COLORS[currentElement];

  return (
    <>
      <color attach="background" args={['#000000']} />
      
      {/* Deep Fog for "Ghostly" atmosphere */}
      <fog attach="fog" args={['#000000', 5, 60]} />
      
      <ambientLight intensity={0.1} />
      
      {/* The Penderecki-style Point Cloud Landscape */}
      <PointCloudLandscape color={color} typeId={currentElement} />

      {/* Floating Particles / Dust */}
      <Stars radius={60} depth={20} count={3000} factor={3} saturation={0} fade speed={1} />
      
      {/* The Aura Orb (Energy Source) - Floating high */}
      <group position={[0, 15, -30]}>
         <TheCore />
         {/* Subtle glow from the source */}
         <pointLight color={color} intensity={1} distance={80} decay={2} />
      </group>
    </>
  );
};
