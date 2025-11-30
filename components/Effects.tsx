
import React from 'react';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export const Effects: React.FC = () => {
  return (
    <EffectComposer disableNormalPass>
      {/* 
        Bloom: Adjusted for Point Clouds.
        High intensity helps small points pop against black background.
      */}
      <Bloom 
        luminanceThreshold={0.2} // Lower threshold to catch colored points
        mipmapBlur 
        intensity={1.5} 
        radius={0.6}
      />
      
      {/* Noise: Adds film grain/digital sensor noise */}
      <Noise 
        opacity={0.08} 
        premultiply 
      />
      
      {/* Vignette: Focus attention */}
      <Vignette 
        eskil={false} 
        offset={0.1} 
        darkness={1.0} 
      />
    </EffectComposer>
  );
};
