
import { create } from 'zustand';
import { PhotoMemory, loadPhotoMemories, savePhotoMemory, deletePhotoMemory as deletePhotoFromStorage } from './utils/storage';

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

  // Photo Particles state
  uploadedPhoto: string | null;
  isPhotoMode: boolean;

  // Photo Choice Panel state
  isPhotoChoicePanelOpen: boolean;
  pendingLandmark: { id: string; name: string } | null;

  // Time Corridor - Photo History state
  photoMemories: PhotoMemory[];
  corridorMode: 'CORRIDOR' | 'INSPECT';
  corridorFocusIndex: number;
  corridorCameraX: number;
  corridorIsDragging: boolean;
  corridorInspectRotation: { x: number; y: number };

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

  // Photo Actions
  uploadPhoto: (photoUrl: string) => void;
  togglePhotoMode: () => void;
  clearPhoto: () => void;

  // Photo Choice Panel Actions
  openPhotoChoicePanel: (landmark: { id: string; name: string }) => void;
  closePhotoChoicePanel: () => void;

  // Time Corridor - Photo History Actions
  addPhotoMemory: (photo: Omit<PhotoMemory, 'id' | 'timestamp'>) => void;
  deletePhotoMemory: (id: string) => void;
  loadMemoriesFromStorage: () => void;
  setCorridorMode: (mode: 'CORRIDOR' | 'INSPECT') => void;
  setCorridorFocus: (index: number) => void;
  updateCorridorCamera: (x: number) => void;
  setCorridorDragging: (isDragging: boolean) => void;
  setCorridorInspectRotation: (rotation: { x: number; y: number }) => void;

  reset: () => void;
};

export const useStore = create<AppState>((set) => ({
  phase: 'entry',
  currentElement: null,
  currentLandmark: null,
  isMicReady: false,
  isInjecting: false,
  uploadedPhoto: null,
  isPhotoMode: false,
  isPhotoChoicePanelOpen: false,
  pendingLandmark: null,
  photoMemories: [],
  corridorMode: 'CORRIDOR',
  corridorFocusIndex: 0,
  corridorCameraX: 0,
  corridorIsDragging: false,
  corridorInspectRotation: { x: 0, y: 0 },

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

  // Photo Actions Implementation
  uploadPhoto: (photoUrl) => set({ uploadedPhoto: photoUrl, isPhotoMode: true }),
  togglePhotoMode: () => set((state) => ({ isPhotoMode: !state.isPhotoMode })),
  clearPhoto: () => set({ uploadedPhoto: null, isPhotoMode: false }),

  // Photo Choice Panel Actions Implementation
  openPhotoChoicePanel: (landmark) => set({ isPhotoChoicePanelOpen: true, pendingLandmark: landmark }),
  closePhotoChoicePanel: () => set({ isPhotoChoicePanelOpen: false, pendingLandmark: null }),

  // Time Corridor - Photo History Actions Implementation
  addPhotoMemory: (photo) => {
    try {
      const newMemory = savePhotoMemory(photo);
      console.log('[Time Corridor] Photo saved to memory:', newMemory.id, newMemory.landmark.name);
      set((state) => ({
        photoMemories: [newMemory, ...state.photoMemories].slice(0, 50)
      }));
    } catch (error) {
      console.error('Failed to add photo memory:', error);
    }
  },
  deletePhotoMemory: (id) => {
    try {
      deletePhotoFromStorage(id);
      console.log('[Time Corridor] Photo deleted from memory:', id);
      set((state) => {
        const newMemories = state.photoMemories.filter(m => m.id !== id);
        // 如果删除的是当前聚焦的照片，调整聚焦索引
        const newFocusIndex = Math.min(state.corridorFocusIndex, newMemories.length - 1);
        // 如果删除后没有照片了，退出 INSPECT 模式
        const newMode = newMemories.length === 0 ? 'CORRIDOR' : state.corridorMode;
        return {
          photoMemories: newMemories,
          corridorFocusIndex: Math.max(0, newFocusIndex),
          corridorMode: newMode
        };
      });
    } catch (error) {
      console.error('Failed to delete photo memory:', error);
    }
  },
  loadMemoriesFromStorage: () => {
    try {
      const memories = loadPhotoMemories();
      console.log('[Time Corridor] Loading memories from storage:', memories.length, 'photos');
      set({ photoMemories: memories });
    } catch (error) {
      console.error('Failed to load memories:', error);
    }
  },
  setCorridorMode: (mode) => set({ corridorMode: mode }),
  setCorridorFocus: (index) => set({ corridorFocusIndex: index }),
  updateCorridorCamera: (x) => set({ corridorCameraX: x }),
  setCorridorDragging: (isDragging) => set({ corridorIsDragging: isDragging }),
  setCorridorInspectRotation: (rotation) => set({ corridorInspectRotation: rotation }),

  reset: () => set({ phase: 'entry', currentElement: null, currentLandmark: null, isMicReady: false, isInjecting: false, uploadedPhoto: null, isPhotoMode: false, isPhotoChoicePanelOpen: false, pendingLandmark: null, corridorMode: 'CORRIDOR', corridorFocusIndex: 0, corridorCameraX: 0, corridorIsDragging: false, corridorInspectRotation: { x: 0, y: 0 } }),
}));
