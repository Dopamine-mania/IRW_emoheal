import { useEffect, useState, RefObject } from 'react';

/**
 * Custom hook for touch-friendly button interactions
 * Provides hover states for both mouse and touch devices
 */
export const useButtonHover = (ref: RefObject<HTMLElement>) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Mouse event handlers
    const onMouseEnter = () => setIsHovered(true);
    const onMouseLeave = () => setIsHovered(false);

    // Touch event handlers (simulate hover effect on tap)
    const onTouchStart = () => {
      setIsPressed(true);
    };

    const onTouchEnd = () => {
      setIsPressed(false);
      // Brief hover effect after touch
      setIsHovered(true);
      setTimeout(() => setIsHovered(false), 300);
    };

    const onTouchCancel = () => {
      setIsPressed(false);
      setIsHovered(false);
    };

    // Add event listeners
    element.addEventListener('mouseenter', onMouseEnter);
    element.addEventListener('mouseleave', onMouseLeave);
    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchend', onTouchEnd);
    element.addEventListener('touchcancel', onTouchCancel);

    return () => {
      element.removeEventListener('mouseenter', onMouseEnter);
      element.removeEventListener('mouseleave', onMouseLeave);
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchend', onTouchEnd);
      element.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [ref]);

  return {
    isHovered,
    isPressed,
    isActive: isHovered || isPressed
  };
};
