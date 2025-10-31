
import { useState, useEffect } from 'react';

export const useTilt = (active: boolean) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!active) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // beta is front-to-back, gamma is left-to-right
      const { beta, gamma } = event;
      if (beta !== null && gamma !== null) {
        setTilt({ x: gamma, y: beta });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [active]);

  return tilt;
};
