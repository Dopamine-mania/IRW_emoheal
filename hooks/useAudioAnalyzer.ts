import { useEffect, useRef } from 'react';

export const useAudioAnalyzer = (audioElement: HTMLAudioElement | null) => {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!audioElement) return;

    const initAudio = () => {
      try {
        // 避免重复创建 source（createMediaElementSource 只能调用一次）
        if (sourceRef.current) return;

        // 创建 AudioContext
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        // 创建分析器
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        // 连接音频元素到分析器
        const source = audioContext.createMediaElementSource(audioElement);
        sourceRef.current = source;
        source.connect(analyser);
        analyser.connect(audioContext.destination); // 重要：连接到输出，否则听不到声音

        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      } catch (err) {
        console.error('Audio analyzer init failed:', err);
      }
    };

    initAudio();

    return () => {
      // 清理时关闭 AudioContext
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [audioElement]);

  const getAudioData = () => {
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // 计算平均音量 (0-255)
      let sum = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        sum += dataArrayRef.current[i];
      }
      const average = sum / dataArrayRef.current.length;

      // 提取低频 (Bass: 0-10% of spectrum)
      const bassEnd = Math.floor(dataArrayRef.current.length * 0.1);
      let bassSum = 0;
      for (let i = 0; i < bassEnd; i++) {
        bassSum += dataArrayRef.current[i];
      }
      const bass = bassSum / bassEnd;

      // 提取高频 (Treble: 70-100% of spectrum)
      const trebleStart = Math.floor(dataArrayRef.current.length * 0.7);
      let trebleSum = 0;
      for (let i = trebleStart; i < dataArrayRef.current.length; i++) {
        trebleSum += dataArrayRef.current[i];
      }
      const treble = trebleSum / (dataArrayRef.current.length - trebleStart);

      return {
        volume: average / 255.0, // Normalized 0-1
        frequency: dataArrayRef.current[10] / 255.0, // Arbitrary mid-low freq
        bass: bass / 255.0, // Low frequencies (0-1)
        treble: treble / 255.0 // High frequencies (0-1)
      };
    }

    // Fallback for idle animation
    return { volume: 0, frequency: 0, bass: 0, treble: 0 };
  };

  return { getAudioData };
};
