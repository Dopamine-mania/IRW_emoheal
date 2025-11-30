import { useEffect, useRef } from 'react';
import { useStore } from '../store';

export const useAudioAnalyzer = () => {
  const isMicReady = useStore((state) => state.isMicReady);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!isMicReady) return;

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        
        analyser.fftSize = 256; // Smaller FFT size for performance
        source.connect(analyser);
        
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      } catch (err) {
        console.error("Audio init failed", err);
      }
    };

    initAudio();

    return () => {
      // Cleanup if needed (though audio context usually persists)
    };
  }, [isMicReady]);

  const getAudioData = () => {
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Calculate average volume (0-255)
      let sum = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        sum += dataArrayRef.current[i];
      }
      const average = sum / dataArrayRef.current.length;

      // Extract Bass (Low Frequencies: 0-10% of spectrum)
      const bassEnd = Math.floor(dataArrayRef.current.length * 0.1);
      let bassSum = 0;
      for (let i = 0; i < bassEnd; i++) {
        bassSum += dataArrayRef.current[i];
      }
      const bass = bassSum / bassEnd;

      // Extract Treble (High Frequencies: 70-100% of spectrum)
      const trebleStart = Math.floor(dataArrayRef.current.length * 0.7);
      let trebleSum = 0;
      for (let i = trebleStart; i < dataArrayRef.current.length; i++) {
        trebleSum += dataArrayRef.current[i];
      }
      const treble = trebleSum / (dataArrayRef.current.length - trebleStart);

      return {
        volume: average / 255.0, // Normalized 0-1
        frequency: dataArrayRef.current[10] / 255.0, // Arbitrary mid-low freq for color/pulse
        bass: bass / 255.0, // Low frequencies (0-1)
        treble: treble / 255.0 // High frequencies (0-1)
      };
    }
    // Fallback for idle animation
    return { volume: 0, frequency: 0, bass: 0, treble: 0 };
  };

  return { getAudioData };
};