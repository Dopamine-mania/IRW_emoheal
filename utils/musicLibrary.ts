import { ElementType } from '../store';

export interface MusicTrack {
  id: string;
  title: string;
  element: ElementType;
  fileUrl: string;
  duration: number; // 秒
}

const SUPABASE_STORAGE_URL = import.meta.env.VITE_SUPABASE_STORAGE_URL;

export const MUSIC_LIBRARY: Record<ElementType, MusicTrack[]> = {
  wood: [
    {
      id: 'wood_01',
      title: 'Bamboo Whispers - Forest Meditation',
      element: 'wood',
      fileUrl: `${SUPABASE_STORAGE_URL}/wood_01.mp3`,
      duration: 180 // 需要替换为真实时长
    },
    {
      id: 'wood_02',
      title: 'Green Growth - Nature\'s Breath',
      element: 'wood',
      fileUrl: `${SUPABASE_STORAGE_URL}/wood_02.mp3`,
      duration: 200 // 需要替换为真实时长
    }
  ],
  fire: [
    {
      id: 'fire_01',
      title: 'Heart Awakening - 528Hz',
      element: 'fire',
      fileUrl: `${SUPABASE_STORAGE_URL}/fire_01.mp3`,
      duration: 195 // 需要替换为真实时长
    },
    {
      id: 'fire_02',
      title: 'Passion Ignited',
      element: 'fire',
      fileUrl: `${SUPABASE_STORAGE_URL}/fire_02.mp3`,
      duration: 210 // 需要替换为真实时长
    }
  ],
  earth: [
    {
      id: 'earth_01',
      title: 'Mountain Echoes - Grounding',
      element: 'earth',
      fileUrl: `${SUPABASE_STORAGE_URL}/earth_01.mp3`,
      duration: 220 // 需要替换为真实时长
    },
    {
      id: 'earth_02',
      title: 'Ancient Stones',
      element: 'earth',
      fileUrl: `${SUPABASE_STORAGE_URL}/earth_02.mp3`,
      duration: 190 // 需要替换为真实时长
    }
  ],
  metal: [
    {
      id: 'metal_01',
      title: 'Crystal Breath - 741Hz Detox',
      element: 'metal',
      fileUrl: `${SUPABASE_STORAGE_URL}/metal_01.mp3`,
      duration: 185 // 需要替换为真实时长
    },
    {
      id: 'metal_02',
      title: 'Silver Clarity',
      element: 'metal',
      fileUrl: `${SUPABASE_STORAGE_URL}/metal_02.mp3`,
      duration: 205 // 需要替换为真实时长
    }
  ],
  water: [
    {
      id: 'water_01',
      title: 'Ocean Depths - Trauma Release',
      element: 'water',
      fileUrl: `${SUPABASE_STORAGE_URL}/water_01.mp3`,
      duration: 175 // 需要替换为真实时长
    },
    {
      id: 'water_02',
      title: 'River Flow',
      element: 'water',
      fileUrl: `${SUPABASE_STORAGE_URL}/water_02.mp3`,
      duration: 215 // 需要替换为真实时长
    }
  ]
};

// 随机选歌函数
export function getRandomTrack(element: ElementType): MusicTrack {
  const tracks = MUSIC_LIBRARY[element];
  const randomIndex = Math.floor(Math.random() * tracks.length);
  return tracks[randomIndex];
}

// 获取下一首歌（当前元素的另一首歌）
export function getNextTrack(element: ElementType, currentTrackId: string): MusicTrack {
  const tracks = MUSIC_LIBRARY[element];
  const currentIndex = tracks.findIndex(t => t.id === currentTrackId);
  const nextIndex = (currentIndex + 1) % tracks.length;
  return tracks[nextIndex];
}

// 获取上一首歌
export function getPreviousTrack(element: ElementType, currentTrackId: string): MusicTrack {
  const tracks = MUSIC_LIBRARY[element];
  const currentIndex = tracks.findIndex(t => t.id === currentTrackId);
  const previousIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  return tracks[previousIndex];
}
