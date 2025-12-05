import { useEffect, useState, useCallback } from 'react';
import { useStore } from '../store';

export const useMusicPlayer = () => {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const currentTrack = useStore(state => state.currentTrack);
  const isPlaying = useStore(state => state.isPlaying);
  const setCurrentTime = useStore(state => state.setCurrentTime);
  const setIsPlaying = useStore(state => state.setIsPlaying);
  const setTrackCompleted = useStore(state => state.setTrackCompleted);
  const setTrackProgress = useStore(state => state.setTrackProgress);

  // 初始化 Audio Element
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous'; // 允许音频分析
    setAudioElement(audio);

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // 加载新曲目
  useEffect(() => {
    if (!audioElement || !currentTrack) return;

    audioElement.src = currentTrack.fileUrl;
    audioElement.load();

    if (isPlaying) {
      audioElement.play().catch(err => {
        console.error('Playback failed:', err);
        setIsPlaying(false);
      });
    }
  }, [currentTrack, audioElement, isPlaying, setIsPlaying]);

  // 播放/暂停控制
  useEffect(() => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.play().catch(err => {
        console.error('Play error:', err);
        setIsPlaying(false);
      });
    } else {
      audioElement.pause();
    }
  }, [isPlaying, audioElement, setIsPlaying]);

  // 进度同步
  useEffect(() => {
    if (!audioElement) return;

    const handleTimeUpdate = () => {
      const currentTime = audioElement.currentTime;
      const duration = audioElement.duration;

      setCurrentTime(currentTime);

      // Calculate progress percentage
      if (duration && duration > 0) {
        const progress = (currentTime / duration) * 100;
        setTrackProgress(progress);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setTrackCompleted(true);
      setTrackProgress(100);
      console.log('[MusicPlayer] Track completed');
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [audioElement, setCurrentTime, setIsPlaying, setTrackCompleted, setTrackProgress]);

  // 进度跳转
  const seekTo = useCallback((time: number) => {
    if (audioElement) {
      audioElement.currentTime = time;
    }
  }, [audioElement]);

  return {
    audioElement,
    seekTo
  };
};
