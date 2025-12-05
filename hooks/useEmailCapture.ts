import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { trackEvent } from '../utils/analytics';

export const useEmailCapture = () => {
  const openEmailCapture = useStore(state => state.openEmailCapture);
  const hasSubmittedEmail = useStore(state => state.hasSubmittedEmail);
  const phase = useStore(state => state.phase);
  const trackCompleted = useStore(state => state.trackCompleted);
  const trackProgress = useStore(state => state.trackProgress);
  const isPlaying = useStore(state => state.isPlaying);
  const timeInResonance = useStore(state => state.timeInResonance);
  const incrementTimeInResonance = useStore(state => state.incrementTimeInResonance);

  const [previousPhase, setPreviousPhase] = useState<string>('');
  const hasTriggered = useRef(false);
  const pauseTimer = useRef<NodeJS.Timeout | null>(null);
  const resonanceStartTime = useRef<number | null>(null);

  // Track time in resonance phase
  useEffect(() => {
    if (phase === 'resonance') {
      if (!resonanceStartTime.current) {
        resonanceStartTime.current = Date.now();
      }

      const interval = setInterval(() => {
        incrementTimeInResonance(1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      resonanceStartTime.current = null;
    }
  }, [phase, incrementTimeInResonance]);

  // Trigger 1A: Track Completion (Primary)
  useEffect(() => {
    const emailSubmitted = localStorage.getItem('irw_email_submitted');
    if (emailSubmitted === 'true' || hasSubmittedEmail || hasTriggered.current) {
      return;
    }

    if (trackCompleted && phase === 'resonance') {
      hasTriggered.current = true;
      trackEvent('email_modal_shown', {
        trigger: 'track_ended',
        time_in_resonance: timeInResonance,
        track_progress: 100
      });
      openEmailCapture();
      console.log('[EmailCapture] Triggered by track completion');
    }
  }, [trackCompleted, phase, hasSubmittedEmail, timeInResonance, openEmailCapture]);

  // Trigger 1B: Pause Timeout (30 seconds after pause)
  useEffect(() => {
    const emailSubmitted = localStorage.getItem('irw_email_submitted');
    if (emailSubmitted === 'true' || hasSubmittedEmail || hasTriggered.current) {
      return;
    }

    if (phase === 'resonance') {
      if (!isPlaying && trackProgress > 10) {
        // User paused - start 30 second timer
        pauseTimer.current = setTimeout(() => {
          if (!hasTriggered.current) {
            hasTriggered.current = true;
            trackEvent('email_modal_shown', {
              trigger: 'pause_timeout',
              time_in_resonance: timeInResonance,
              track_progress: Math.round(trackProgress)
            });
            openEmailCapture();
            console.log('[EmailCapture] Triggered by pause timeout');
          }
        }, 30000);
      } else if (isPlaying && pauseTimer.current) {
        // User resumed - cancel timer
        clearTimeout(pauseTimer.current);
        pauseTimer.current = null;
      }

      return () => {
        if (pauseTimer.current) {
          clearTimeout(pauseTimer.current);
          pauseTimer.current = null;
        }
      };
    }
  }, [isPlaying, phase, trackProgress, hasSubmittedEmail, timeInResonance, openEmailCapture]);

  // Trigger 1C: Phase Exit (User leaving resonance)
  useEffect(() => {
    const emailSubmitted = localStorage.getItem('irw_email_submitted');
    if (emailSubmitted === 'true' || hasSubmittedEmail || hasTriggered.current) {
      setPreviousPhase(phase);
      return;
    }

    // Detect phase transition FROM resonance TO another phase
    if (previousPhase === 'resonance' && phase !== 'resonance') {
      // Only trigger if user listened to at least 50% of track
      if (trackProgress >= 50) {
        hasTriggered.current = true;
        trackEvent('email_modal_shown', {
          trigger: 'phase_exit',
          time_in_resonance: timeInResonance,
          track_progress: Math.round(trackProgress)
        });
        openEmailCapture();
        console.log('[EmailCapture] Triggered by phase exit');
      }
    }

    setPreviousPhase(phase);
  }, [phase, previousPhase, trackProgress, hasSubmittedEmail, timeInResonance, openEmailCapture]);

  // Trigger 2: 2-minute site-wide timer (Fallback)
  useEffect(() => {
    const emailSubmitted = localStorage.getItem('irw_email_submitted');
    if (emailSubmitted === 'true' || hasSubmittedEmail) {
      return;
    }

    const inactivityTimer = setTimeout(() => {
      const emailSubmittedCheck = localStorage.getItem('irw_email_submitted');
      if (emailSubmittedCheck !== 'true' && !hasSubmittedEmail && !hasTriggered.current) {
        hasTriggered.current = true;
        trackEvent('email_modal_shown', {
          trigger: 'time_2min',
          time_in_resonance: timeInResonance,
          track_progress: Math.round(trackProgress)
        });
        openEmailCapture();
        console.log('[EmailCapture] Triggered by 2-minute timer');
      }
    }, 120000); // 2 minutes

    return () => clearTimeout(inactivityTimer);
  }, [hasSubmittedEmail, timeInResonance, trackProgress, openEmailCapture]);

  // Trigger 3: Exit Intent (Beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const emailSubmitted = localStorage.getItem('irw_email_submitted');
      if (emailSubmitted !== 'true' && !hasSubmittedEmail && !hasTriggered.current) {
        hasTriggered.current = true;
        trackEvent('email_modal_shown', {
          trigger: 'exit_intent',
          time_in_resonance: timeInResonance,
          track_progress: Math.round(trackProgress)
        });
        openEmailCapture();

        // Prevent page leave to give user chance to see modal
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasSubmittedEmail, timeInResonance, trackProgress, openEmailCapture]);
};
