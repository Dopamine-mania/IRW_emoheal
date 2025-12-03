
import React, { useEffect } from 'react';
import * as THREE from 'three';
import { useStore, ElementType } from '../store';
import { TheCore } from './TheCore'; // Reuse the core as the "Aura Orb"
import { EnergyBody } from './EnergyBody'; // Chakra Particle Body
import { StarRiver } from './StarRiver'; // Background Layer (default)
import { PhotoBackgroundParticles } from './PhotoBackgroundParticles'; // Background Layer (photo mode)
import { LandmarkParticles } from './LandmarkParticles'; // Mid-ground Far Layer
import { getRandomTrack } from '../utils/musicLibrary';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';

const ELEMENT_COLORS: Record<ElementType, string> = {
  wood: '#22d3ee',
  fire: '#f43f5e',
  earth: '#fbbf24',
  metal: '#e2e8f0',
  water: '#3b82f6'
};

export const SceneWorld: React.FC = () => {
  const currentElement = useStore(state => state.currentElement) || 'wood';
  const uploadedPhoto = useStore(state => state.uploadedPhoto);
  const setCurrentTrack = useStore(state => state.setCurrentTrack);
  const setIsPlaying = useStore(state => state.setIsPlaying);
  const color = ELEMENT_COLORS[currentElement];
  const energyBodyPosition = new THREE.Vector3(0, -0.5, 0);

  // 初始化音乐播放器和音频分析器
  const { audioElement } = useMusicPlayer();
  const { getAudioData } = useAudioAnalyzer(audioElement);

  // 进入场景时随机选歌并播放
  useEffect(() => {
    const track = getRandomTrack(currentElement);
    setCurrentTrack(track);
    setIsPlaying(true);

    // 离开场景时停止播放
    return () => {
      setIsPlaying(false);
    };
  }, [currentElement, setCurrentTrack, setIsPlaying]);

  return (
    <>
      <color attach="background" args={['#000000']} />

      {/* Deep Fog for "Ghostly" atmosphere */}
      <fog attach="fog" args={['#000000', 5, 60]} />

      <ambientLight intensity={0.1} />

      {/* ===== LAYER 1: Background - Particle Field ===== */}
      {/* 照片粒子 or 星河粒子 */}
      {uploadedPhoto ? (
        <PhotoBackgroundParticles imageUrl={uploadedPhoto} />
      ) : (
        <StarRiver />
      )}

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
      {/* The Chakra Particle Energy Body (脉轮粒子能量体) - Main focal point */}
      {/* Always visible, even when photo particles are present */}
      <group position={[energyBodyPosition.x, energyBodyPosition.y, energyBodyPosition.z]}>
        <EnergyBody />
        {/* Rim lights to enhance visibility */}
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
