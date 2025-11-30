
import { create } from 'zustand';

export type ElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

type AppState = {
  // Phase control: 
  // 'entry' (portal) -> 'transition' (moving) -> 'emitter' (the core/choice) -> 'selection' (ring of 5) -> 'shards' (inside geometry) -> 'tuning' (typewriter transition) -> 'resonance' (elemental world) -> 'timeCorridor' (side entrance)
  phase: 'entry' | 'transition' | 'emitter' | 'selection' | 'shards' | 'tuning' | 'resonance' | 'timeCorridor';
  
  // The selected element (Wood, Fire, Earth, Metal, Water)
  currentElement: ElementType | null;
  
  // Selected Landmark (Scene 3 destination)
  currentLandmark: { id: string; name: string } | null;

  // Microphone state
  isMicReady: boolean;
  
  // Injection Animation State (Iteration 03)
  isInjecting: boolean;
  
  // Actions
  startJourney: () => void;
  completeTransition: () => void; 
  enterSelection: () => void; 
  selectElement: (el: ElementType) => void; 
  startTuning: (landmark: { id: string; name: string }) => void; // Transition from Shards -> Tuning
  enterWorld: () => void; 
  enterTimeTravel: () => void; 
  setMicReady: (ready: boolean) => void;
  startInjection: () => void; 
  
  // Navigation Actions
  backToEntry: () => void;
  backToEmitter: () => void;
  backToSelection: () => void;
  backToShards: () => void;
  
  reset: () => void;
};

export const useStore = create<AppState>((set) => ({
  phase: 'entry',
  currentElement: null,
  currentLandmark: null,
  isMicReady: false,
  isInjecting: false,

  startJourney: () => set({ phase: 'transition' }),
  completeTransition: () => set({ phase: 'emitter' }),
  enterSelection: () => set({ phase: 'selection' }),
  selectElement: (el) => set({ phase: 'shards', currentElement: el }),
  
  // Transition from Shards -> Tuning Sequence
  startTuning: (landmark) => set({ phase: 'tuning', currentLandmark: landmark }),

  // Transition from Tuning -> Resonance (Target World)
  enterWorld: () => set({ phase: 'resonance' }),

  enterTimeTravel: () => set({ phase: 'timeCorridor' }),
  setMicReady: (ready) => set({ isMicReady: ready }),
  startInjection: () => set({ isInjecting: true }),
  
  // Navigation Implementation
  backToEntry: () => set({ phase: 'entry', isInjecting: false }),
  backToEmitter: () => set({ phase: 'emitter', isInjecting: false, currentElement: null }),
  backToSelection: () => set({ phase: 'selection', currentLandmark: null }),
  backToShards: () => set({ phase: 'shards', currentLandmark: null }),
  
  reset: () => set({ phase: 'entry', currentElement: null, currentLandmark: null, isMicReady: false, isInjecting: false }),
}));
