
import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../store';
import gsap from 'gsap';
import * as THREE from 'three';

export const CameraRig: React.FC = () => {
  const { camera } = useThree();
  const phase = useStore((state) => state.phase);
  const completeTransition = useStore((state) => state.completeTransition);
  
  // Refs to store initial values or animation states
  const vec = new THREE.Vector3();
  const isTransitioning = useRef(false);

  // Parallax Effect
  useFrame((state) => {
    // Disable parallax during major transitions to prevent fighting GSAP
    if (isTransitioning.current) return;

    // Phase 1 Parallax (Portal)
    if (phase === 'entry') {
      state.camera.position.lerp(
        vec.set(state.pointer.x * 2, state.pointer.y * 1, 15),
        0.05
      );
      state.camera.lookAt(0, 2, 0); 
    }
    
    // Phase 2 Parallax (Emitter)
    if (phase === 'emitter') {
        state.camera.position.lerp(
            vec.set(state.pointer.x * 0.5, state.pointer.y * 0.5, 12),
            0.05
        );
        state.camera.lookAt(0, 0, 0);
    }
  });

  // Transition Sequence: Entry -> Emitter
  useEffect(() => {
    if (phase === 'transition') {
      isTransitioning.current = true;
      
      const tl = gsap.timeline();

      // Step 1: Anticipation (Pull back slightly)
      tl.to(camera.position, {
        z: 16,
        duration: 0.5,
        ease: "power2.in"
      });

      // Step 2: The Rush (Fly through the screen)
      tl.to(camera.position, {
        z: -10,
        duration: 1.5,
        ease: "expo.inOut",
        onComplete: () => {
          completeTransition();
          isTransitioning.current = false; // Reset for next phase interactions
        }
      });
    }
  }, [phase, camera, completeTransition]);
  
  // Transition Sequence: Emitter -> Time Corridor
  useEffect(() => {
    if (phase === 'timeCorridor') {
        isTransitioning.current = true;
        
        const tl = gsap.timeline();
        
        // "Side Step" into another dimension
        // Move significantly right and forward (x: 20), while rotating to look right (-90 deg)
        // This simulates moving past the prism and turning into a side tunnel.
        
        tl.to(camera.position, {
            x: 20, 
            y: 0,
            z: 0, 
            duration: 2.5,
            ease: "power2.inOut"
        });
        
        tl.to(camera.rotation, {
            y: -Math.PI / 2, // Rotate 90 degrees right
            duration: 2.5,
            ease: "power2.inOut"
        }, "<");
    }
  }, [phase, camera]);

  return null;
};
