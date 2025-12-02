
import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useStore } from './store';
import { SceneEntry } from './components/SceneEntry';
import { SceneEmitter } from './components/SceneEmitter';
import { SceneSelection } from './components/SceneSelection';
import { SceneShards } from './components/SceneShards';
import { SceneWorld } from './components/SceneWorld';
import { SceneTimeCorridor } from './components/SceneTimeCorridor';
import { Effects } from './components/Effects';
import { Overlay } from './components/Overlay';
import { CameraRig } from './components/CameraRig';

const App: React.FC = () => {
  const phase = useStore((state) => state.phase);
  const loadMemoriesFromStorage = useStore((state) => state.loadMemoriesFromStorage);

  // 初始化：从localStorage加载照片历史
  useEffect(() => {
    loadMemoriesFromStorage();
  }, [loadMemoriesFromStorage]);

  return (
    <div className="relative w-full h-full bg-black">
      {/* 3D Canvas */}
      <Canvas
        dpr={[1, 2]} // Handle high DPI screens
        camera={{ position: [0, 0, 15], fov: 50 }} // Initial camera position
        gl={{ antialias: false, toneMappingExposure: 1.2 }} // Optimization for post-processing
      >
        <Suspense fallback={null}>
          <CameraRig />
          
          {/* Phase 1: Portal Entry */}
          {(phase === 'entry' || phase === 'transition') && <SceneEntry />}
          
          {/* Phase 2: The Emitter / Earth */}
          {phase === 'emitter' && <SceneEmitter />}

          {/* Phase 2.5: Time Corridor (Photo Gallery) */}
          {phase === 'timeCorridor' && <SceneTimeCorridor />}
          
          {/* Phase 3: Selection Ring */}
          {phase === 'selection' && <SceneSelection />}

          {/* Phase 3.5: Inside the Geometry (Shards) */}
          {phase === 'shards' && <SceneShards />}
          
          {/* Phase 3.9: Tuning (Black Void - No Scene Rendered) */}
          {/* We intentionally render nothing in the canvas to save resources and allow Overlay to dominate */}
          
          {/* Phase 4: Resonance World (Landscape) */}
          {phase === 'resonance' && <SceneWorld />}
          
          {/* Post Processing */}
          <Effects />
        </Suspense>
      </Canvas>

      {/* HTML Overlay for Flash/Fade effects and UI */}
      <Overlay />
    </div>
  );
};

export default App;
