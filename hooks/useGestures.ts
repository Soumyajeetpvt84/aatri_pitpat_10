
import { useState, useEffect, useRef, useCallback } from 'react';

// Declare shake to prevent TypeScript errors since it's loaded from a CDN
declare var Shake: { new(options: any): any; };

export const useGestures = (
    { onShake, onLongPress, onTapThrice }: 
    { onShake?: () => void; onLongPress?: () => void, onTapThrice?: () => void }
) => {
  // Long Press
  const longPressTimer = useRef<number | null>(null);

  const handleMouseDown = useCallback(() => {
    longPressTimer.current = window.setTimeout(() => {
      onLongPress?.();
    }, 700);
  }, [onLongPress]);

  const handleMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  // Tap Thrice
  const tapCount = useRef(0);
  const tapTimer = useRef<number | null>(null);

  const handleTap = useCallback(() => {
    tapCount.current += 1;
    
    if (tapTimer.current) clearTimeout(tapTimer.current);

    if (tapCount.current === 3) {
      onTapThrice?.();
      tapCount.current = 0;
    } else {
      tapTimer.current = window.setTimeout(() => {
        tapCount.current = 0;
      }, 500); // Reset after 500ms
    }
  }, [onTapThrice]);


  // Shake
  useEffect(() => {
    if (!onShake) return;

    const shakeEvent = new Shake({ threshold: 15, timeout: 1000 });
    shakeEvent.start();
    
    const handleShakeEvent = () => onShake();
    window.addEventListener('shake', handleShakeEvent, false);

    return () => {
      window.removeEventListener('shake', handleShakeEvent, false);
      shakeEvent.stop();
    };
  }, [onShake]);

  return { 
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onTouchStart: handleMouseDown,
      onTouchEnd: handleMouseUp,
      onClick: handleTap
  };
};
