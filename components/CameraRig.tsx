
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

    // Disable parallax for timeCorridor - it has its own camera control
    if (phase === 'timeCorridor') return;

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

    // Phase 3: Selection (Ring of Elements)
    if (phase === 'selection') {
        state.camera.position.lerp(
            vec.set(state.pointer.x * 0.3, state.pointer.y * 0.3, 15),
            0.05
        );
        state.camera.lookAt(0, 0, 0);
    }

    // Phase 3.5: Shards (Inside Geometry)
    if (phase === 'shards') {
        state.camera.position.lerp(
            vec.set(state.pointer.x * 0.2, state.pointer.y * 0.2, 12),
            0.05
        );
        state.camera.lookAt(0, 0, 0);
    }

    // Phase 4: Resonance (Energy Body & Landscape)
    if (phase === 'resonance') {
        // Position camera for optimal three-layer depth viewing
        state.camera.position.lerp(
            vec.set(state.pointer.x * 0.3, state.pointer.y * 0.3, 5),
            0.03
        );
        state.camera.lookAt(0, 0, 0); // Look at center (energy body)
    }

    // Phase 4.5: Tuning (Typewriter transition)
    if (phase === 'tuning') {
        state.camera.position.lerp(
            vec.set(state.pointer.x * 0.2, state.pointer.y * 0.2, 6),
            0.03
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

  // Camera Intro Animation: Tuning -> Resonance
  // Macro view of landmark -> Dolly in through particle mist -> Focus on human body
  const hasPlayedResonanceIntro = useRef(false);

  useEffect(() => {
    if (phase === 'resonance' && !hasPlayedResonanceIntro.current) {
        hasPlayedResonanceIntro.current = true;
        isTransitioning.current = true;

        const tl = gsap.timeline();

        // Start: Macro view of the landmark (far back, looking at backdrop)
        camera.position.set(0, 2, 15);
        camera.lookAt(0, 0, -3);

        // Step 1: Dolly in toward the scene (through particle mist)
        tl.to(camera.position, {
            x: 0,
            y: 1,
            z: 8,
            duration: 3.0,
            ease: "power2.inOut"
        });

        // Step 2: Continue dollying in to final position, focus on human body
        tl.to(camera.position, {
            x: 0,
            y: 0,
            z: 5,
            duration: 2.0,
            ease: "power1.out",
            onComplete: () => {
                isTransitioning.current = false;
            }
        });

        // Animate camera lookAt smoothly
        const lookAtTarget = { x: 0, y: 0, z: -3 };
        tl.to(lookAtTarget, {
            x: 0,
            y: 0,
            z: 0,
            duration: 5.0,
            ease: "power2.inOut",
            onUpdate: () => {
                camera.lookAt(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z);
            }
        }, "<");
    }

    // Reset the flag when leaving resonance phase
    if (phase !== 'resonance' && hasPlayedResonanceIntro.current) {
        hasPlayedResonanceIntro.current = false;
    }
  }, [phase, camera]);

  return null;
};
