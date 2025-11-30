
import React, { useRef, useMemo, useState, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import gsap from 'gsap';

const vertexShader = `
  uniform float uTime;
  uniform float uScale; // Controls the reveal level
  varying vec2 vUv;
  varying float vIsChina;
  varying float vGlow;

  // Function to calculate distance to an ellipse
  float sdEllipse(vec2 p, vec2 c, vec2 r) {
    vec2 d = p - c;
    return (length(d/r) - 1.0);
  }

  void main() {
    vUv = uv;
    
    // --- China Shape Approximation (The Rooster) - Scaled for Radius 48 ---
    // Coordinates tweaked for the large sphere surface
    
    // 1. Main Body
    float dBody = sdEllipse(uv, vec2(0.78, 0.62), vec2(0.0035, 0.003)); 
    
    // 2. Head (North-East)
    float dHead = sdEllipse(uv, vec2(0.7835, 0.624), vec2(0.0015, 0.002));
    
    // 3. Tail (West)
    float dTail = sdEllipse(uv, vec2(0.775, 0.621), vec2(0.004, 0.002));
    
    // 4. Belly/South
    float dSouth = sdEllipse(uv, vec2(0.781, 0.616), vec2(0.0025, 0.0015));
    
    // 5. Taiwan
    float dTaiwan = length((uv - vec2(0.786, 0.615)) / vec2(1.0, 1.0)) - 0.0004;
    
    // 6. Hainan
    float dHainan = length((uv - vec2(0.779, 0.613)) / vec2(1.0, 1.0)) - 0.0003;

    // Combine shapes
    float dShape = min(min(min(dBody, dHead), dTail), min(dSouth, min(dTaiwan, dHainan)));
    
    // --- The Reveal Logic ---
    float dGeneral = length((uv - vec2(0.78, 0.62))) - 0.01; 
    
    float mixFactor = clamp((uScale - 1.0) / 1.5, 0.0, 1.0);
    
    float effectiveD = mix(dGeneral, dShape, mixFactor);
    float edgeBlur = mix(0.01, 0.001, mixFactor);
    
    float mask = smoothstep(edgeBlur, -edgeBlur, effectiveD);
    vIsChina = mask;
    vGlow = smoothstep(0.03, 0.0, dGeneral); 

    vec3 pos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    
    // --- Size Attenuation ---
    float baseSize = 4.0; 
    float blobSizeBonus = (1.0 - mixFactor) * 20.0 * mask; 
    float sizeBonus = mask * 5.0 + blobSizeBonus; 
    
    float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
    sizeBonus += mask * pulse * 5.0; 

    gl_PointSize = (baseSize + sizeBonus) * (30.0 / -vec4(modelViewMatrix * vec4(pos, 1.0)).z);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uScale;
  varying vec2 vUv;
  varying float vIsChina;
  varying float vGlow;

  void main() {
    // Pole Masking
    float poleMask = smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.95, vUv.y);
    if (poleMask < 0.01) discard;

    // Grid Systems
    float gridX = step(0.99, fract(vUv.x * 160.0)); 
    float gridY = step(0.99, fract(vUv.y * 80.0));
    float mainGrid = max(gridX, gridY);
    
    float mixFactor = clamp((uScale - 1.0) / 1.5, 0.0, 1.0);

    vec3 colorBg = vec3(0.01, 0.02, 0.05); 
    vec3 colorGrid = vec3(0.1, 0.3, 0.4); 
    
    vec3 colorGold = vec3(1.0, 0.8, 0.1) * 3.0; 
    vec3 colorCyan = vec3(0.0, 1.0, 1.0) * 2.0;
    
    vec3 activeColor = mix(colorGold, colorCyan, mixFactor * 0.7); 
    
    vec3 finalColor = colorBg;
    finalColor += colorGrid * mainGrid * 0.4;

    if (vIsChina > 0.01) {
        float coreIntensity = vIsChina;
        float sparkles = step(0.95, fract(sin(dot(gl_PointCoord.xy + vUv * 50.0, vec2(12.9, 78.2))) * 43758.5));
        sparkles *= (sin(uTime * 10.0) * 0.5 + 0.5);
        
        finalColor += activeColor * coreIntensity * (2.0 - mixFactor); 
        finalColor += vec3(1.0) * sparkles * coreIntensity;
    } 
    else {
        finalColor += colorGold * vGlow * 0.3 * (1.0 - mixFactor);
    }

    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    
    float alpha = 1.0 - smoothstep(0.3, 0.5, d);
    alpha *= (vIsChina > 0.01 || vGlow > 0.1) ? 1.0 : 0.3; 
    alpha *= poleMask;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

const ChinaMarker: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const [hovered, setHover] = useState(false);
    const meshRef = useRef<THREE.Mesh>(null);
    const scaleRef = useRef(0);
    
    // Placed at the North Pole (Local Top) of the sphere geometry.
    const markerPosition: [number, number, number] = [0, 48, 0];

    useFrame((state, delta) => {
        // Entrance animation
        scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 1, delta * 2);
        
        if (meshRef.current) {
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.3; 
            meshRef.current.scale.setScalar(scaleRef.current * pulse);
        }
    });

    return (
        <group 
            position={markerPosition} 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            {/* Bright Cyan Glowing Point */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshBasicMaterial 
                    color="#00ffff" 
                    toneMapped={false}
                />
            </mesh>
            
            {/* Hover Label */}
            <Html 
                position={[1.5, 0, 0]} 
                className={`pointer-events-none transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}
                zIndexRange={[100, 0]}
                style={{ transform: 'translate3d(0, -50%, 0)' }}
            >
                <div className="flex items-center">
                    <span className="text-white text-sm font-thin tracking-widest uppercase drop-shadow-md" style={{ fontFamily: 'sans-serif' }}>
                        China
                    </span>
                </div>
            </Html>
        </group>
    );
};

export const CyberEarth: React.FC = () => {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const startInjection = useStore(state => state.startInjection);
  
  const [targetZoom, setTargetZoom] = useState(1);
  const currentZoom = useRef(1);

  // Animation Refs
  const qStart = useRef(new THREE.Quaternion());
  const qEnd = useRef(new THREE.Quaternion());
  const animProgress = useRef({ value: 0 });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScale: { value: 1.0 },
  }), []);

  // DETERMINISTIC VISIBILITY INITIALIZATION
  // We force the earth to start rotated so the marker (Local 0,48,0)
  // points to the Right Side of the screen relative to the Earth center.
  // Center is [0, -52, -10]. Right/Up/Forward view vector ensures visibility.
  useLayoutEffect(() => {
    if (meshRef.current) {
        const localUp = new THREE.Vector3(0, 1, 0); // Marker Axis (North Pole)
        
        // Target Direction: Right (x=12), Up-ish (y=46), Forward (z=5)
        // This ensures it sits on the surface horizon to the right.
        const targetDirection = new THREE.Vector3(12, 46, 5).normalize(); 
        
        const qInitial = new THREE.Quaternion().setFromUnitVectors(localUp, targetDirection);
        meshRef.current.quaternion.copy(qInitial);
    }
  }, []);

  const handleMarkerClick = () => {
    if (!meshRef.current) return;
    
    // 1. Capture current rotation
    qStart.current.copy(meshRef.current.quaternion);
    
    // 2. Define Target Rotation
    // Reset to Identity, which aligns Local Up (Marker) with World Up (Top Center)
    qEnd.current.identity(); 

    // 3. Animate Rotation -> Then Trigger Injection
    gsap.to(animProgress.current, {
        value: 1,
        duration: 1.5, // Smooth spin to center
        ease: "power2.inOut",
        onUpdate: () => {
            if (meshRef.current) {
                meshRef.current.quaternion.slerpQuaternions(qStart.current, qEnd.current, animProgress.current.value);
            }
        },
        onComplete: () => {
            // STRICT SEQUENCE: Only start injection AFTER rotation aligns marker to top
            startInjection();
        }
    });
  };

  useFrame((state) => {
    if (materialRef.current && meshRef.current) {
        const uniforms = materialRef.current.uniforms;
        if (uniforms) {
            // Defensive checks
            if(uniforms.uTime) uniforms.uTime.value = state.clock.getElapsedTime();
            if(uniforms.uScale && typeof uniforms.uScale.value !== 'undefined') {
                currentZoom.current = THREE.MathUtils.lerp(currentZoom.current, targetZoom, 0.1);
                uniforms.uScale.value = currentZoom.current;
            }
        }
    }
  });

  return (
    <group position={[0, -52, -10]}>
      <group ref={meshRef}>
        <points>
            <sphereGeometry args={[48, 500, 250]} /> 
            <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            />
        </points>
        
        {/* Occlusion Sphere */}
        <mesh scale={0.99}>
            <sphereGeometry args={[48, 64, 64]} />
            <meshBasicMaterial color="#020408" />
        </mesh>
        
        <ChinaMarker onClick={handleMarkerClick} />
      </group>
    </group>
  );
};
