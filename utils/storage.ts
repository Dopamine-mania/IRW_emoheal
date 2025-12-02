// Time Corridor - Photo Memory Storage Utilities

export interface PhotoMemory {
  id: string;
  photoUrl: string;
  element: 'fire' | 'water' | 'wood' | 'metal' | 'earth';
  landmark: { id: string; name: string };
  timestamp: number;
  metadata?: {
    fileSize?: number;
    isDefault?: boolean;
  };
}

const STORAGE_KEY = 'irw_photo_memories';
const MAX_MEMORIES = 50;

// Generate simple UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Compress image to reduce storage size
export async function compressImageIfNeeded(
  dataUrl: string,
  maxSize: number = 512
): Promise<string> {
  // If it's not a data URL (e.g., Unsplash URL), return as-is
  if (!dataUrl.startsWith('data:')) {
    return dataUrl;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Calculate scale to fit within maxSize
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      canvas.width = Math.floor(img.width * scale);
      canvas.height = Math.floor(img.height * scale);

      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      try {
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressed);
      } catch (error) {
        console.error('Failed to compress image:', error);
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      console.error('Failed to load image for compression');
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

// Load all photo memories from localStorage
export function loadPhotoMemories(): PhotoMemory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const memories: PhotoMemory[] = JSON.parse(stored);

    // Sort by timestamp (newest first)
    return memories.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to load photo memories:', error);
    return [];
  }
}

// Save a new photo memory
export function savePhotoMemory(
  photo: Omit<PhotoMemory, 'id' | 'timestamp'>
): PhotoMemory {
  try {
    const memories = loadPhotoMemories();

    // Create new memory
    const newMemory: PhotoMemory = {
      ...photo,
      id: generateUUID(),
      timestamp: Date.now()
    };

    // Add to beginning (newest first)
    memories.unshift(newMemory);

    // Enforce FIFO queue - keep only MAX_MEMORIES
    if (memories.length > MAX_MEMORIES) {
      memories.splice(MAX_MEMORIES);
    }

    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));

    return newMemory;
  } catch (error) {
    console.error('Failed to save photo memory:', error);
    throw error;
  }
}

// Delete a specific memory
export function deletePhotoMemory(id: string): void {
  try {
    const memories = loadPhotoMemories();
    const filtered = memories.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete photo memory:', error);
  }
}

// Clear all memories
export function clearAllMemories(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear memories:', error);
  }
}

// Get storage usage info
export function getStorageInfo(): { count: number; estimatedSize: string } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { count: 0, estimatedSize: '0 KB' };
    }

    const memories: PhotoMemory[] = JSON.parse(stored);
    const sizeInBytes = new Blob([stored]).size;
    const sizeInKB = Math.round(sizeInBytes / 1024);
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

    return {
      count: memories.length,
      estimatedSize: sizeInKB > 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return { count: 0, estimatedSize: '0 KB' };
  }
}
