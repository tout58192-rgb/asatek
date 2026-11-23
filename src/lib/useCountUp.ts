import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, duration = 650): number {
  const [display, setDisplay] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (
      prefersReduced ||
      typeof window === 'undefined' ||
      !window.requestAnimationFrame
    ) {
      currentRef.current = target;
      setDisplay(target);
      return;
    }

    const fromVal = currentRef.current;
    if (fromVal === target) {
      setDisplay(target);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextVal = Math.round(fromVal + (target - fromVal) * eased);
      currentRef.current = nextVal;
      setDisplay(nextVal);
      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [target, duration]);

  return display;
}
