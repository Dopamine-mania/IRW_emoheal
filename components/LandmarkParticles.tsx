import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore, ElementType } from '../store';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';

// Landmark Particles with Curvature and Particle Flow
// Mid-ground Far layer - curved backdrop behind the energy body

const landmarkVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAudio;
  uniform vec3 uColor;
  uniform float uType; // 0: Wood, 1: Fire, 2: Earth, 3: Metal, 4: Water
  uniform float uCurvature; // Curvature amount
  uniform vec3 uFlowTarget; // Target position for particle flow (human body)

  attribute float aRandom; // Random attribute for drift
  attribute float aFlowStrength; // How much this particle flows toward target

  varying vec3 vColor;
  varying float vDepth;
  varying float vAlpha;

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

    // --- Apply Curvature (Wrap around the human body) ---
    // Create a cylindrical curvature effect
    float dist = length(pos.xy);
    pos.z += dist * dist * uCurvature * 0.1;

    // --- Topography Logic (Element-Specific Landscapes) ---
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
        float dist2 = distance(pos.xy, vec2(0.0));
        elevation = sin(dist2 * 0.5 - uTime) * 2.0;
        elevation += snoise(pos.xy * 0.2 + uTime * 0.5) * 1.0;
    }

    // Apply elevation
    pos.z += elevation;

    // --- Audio Reactivity (Ripple) ---
    float distFromCenter = length(pos.xy);
    float ripple = sin(distFromCenter * 0.5 - uTime * 5.0) * uAudio * 3.0;
    pos.z += ripple;

    // --- Particle Flow (Toward Human Body) ---
    // Some particles drift toward the human body position
    float flowPhase = sin(uTime * 0.8 + aRandom * 100.0) * 0.5 + 0.5;
    vec3 toTarget = uFlowTarget - pos;
    pos += normalize(toTarget) * aFlowStrength * flowPhase * 0.5;

    // --- Memory Drift (Subtle floating) ---
    pos.x += sin(uTime + aRandom * 100.0) * 0.2;
    pos.y += cos(uTime * 0.8 + aRandom * 50.0) * 0.2;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // --- Point Size Attenuation ---
    gl_PointSize = (8.0 + uAudio * 20.0) * (15.0 / -mvPosition.z);

    // --- Color Mix ---
    float mixFactor = smoothstep(-5.0, 10.0, pos.z + uAudio * 10.0);
    vColor = mix(uColor * 0.5, vec3(1.0), mixFactor * 0.8);

    // Fade particles that are flowing
    vAlpha = 1.0 - aFlowStrength * flowPhase * 0.5;

    // Fade into distance
    vDepth = -mvPosition.z;
  }
`;

const landmarkFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vDepth;
  varying float vAlpha;
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
    alpha *= fog * vAlpha;

    // Bloom Boost
    gl_FragColor = vec4(vColor * 2.0, alpha);
  }
`;

interface LandmarkParticlesProps {
  color: string;
  typeId: ElementType;
  curvature?: number;
  flowTarget?: THREE.Vector3;
}

export const LandmarkParticles: React.FC<LandmarkParticlesProps> = ({
  color,
  typeId,
  curvature = 0.5,
  flowTarget = new THREE.Vector3(0, 0.5, -3) // Default to energy body position
}) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { getAudioData } = useAudioAnalyzer();

  const typeIndex = useMemo(() => {
    const map: Record<ElementType, number> = { wood: 0, fire: 1, earth: 2, metal: 3, water: 4 };
    return map[typeId];
  }, [typeId]);

  // Create High-Density Geometry with flow attributes
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(80, 80, 180, 180); // Slightly smaller, denser
    const count = geo.attributes.position.count;
    const randoms = new Float32Array(count);
    const flowStrengths = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      randoms[i] = Math.random();
      // Random particles have varying flow strength (0.0 - 0.3)
      flowStrengths[i] = Math.random() * 0.3;
    }

    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    geo.setAttribute('aFlowStrength', new THREE.BufferAttribute(flowStrengths, 1));
    return geo;
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAudio: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uType: { value: typeIndex },
    uCurvature: { value: curvature },
    uFlowTarget: { value: flowTarget }
  }), [color, typeIndex, curvature, flowTarget]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uType.value = typeIndex;
      materialRef.current.uniforms.uColor.value.set(color);
      materialRef.current.uniforms.uCurvature.value = curvature;

      const { volume } = getAudioData();
      materialRef.current.uniforms.uAudio.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uAudio.value,
        volume,
        0.1
      );
    }

    if (meshRef.current) {
      // Slow rotation for environmental feel
      meshRef.current.rotation.z += 0.0005;
    }
  });

  return (
    <points
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, -3]}
      scale={[4, 4, 1]}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={landmarkVertexShader}
        fragmentShader={landmarkFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
