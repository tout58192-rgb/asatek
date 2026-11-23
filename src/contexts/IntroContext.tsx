import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { hasSeenIntro, markIntroSeen } from '../lib/heroAnimation';

interface IntroContextValue {
  showIntro: boolean;
  exiting: boolean;
  introComplete: boolean;
  isFirstSessionVisit: boolean;
  skipIntro: () => void;
}

const IntroContext = createContext<IntroContextValue | null>(null);

function prefersReducedMotionNow(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function shouldSuppressIntroOnBoot(): boolean {
  if (typeof window === 'undefined') return true;
  if (prefersReducedMotionNow()) return true;
  if (window.location.pathname.startsWith('/admin')) return true;
  if (new URLSearchParams(window.location.search).get('autostart') === '1') {
    return true;
  }
  return hasSeenIntro();
}

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const initialSuppressedRef = useRef<boolean | null>(null);
  if (initialSuppressedRef.current === null) {
    initialSuppressedRef.current = shouldSuppressIntroOnBoot();
  }

  const initiallySuppressed = initialSuppressedRef.current;

  const [isFirstSessionVisit] = useState<boolean>(() => !initiallySuppressed);
  const [showIntro, setShowIntro] = useState<boolean>(() => !initiallySuppressed);
  const [exiting, setExiting] = useState(false);
  const [introComplete, setIntroComplete] = useState<boolean>(
    () => initiallySuppressed,
  );

  const timersRef = useRef<number[]>([]);

  const clearAllTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  const skipIntro = useCallback(() => {
    clearAllTimers();
    markIntroSeen();
    setIntroComplete(true);
    setExiting(true);
    const hideId = window.setTimeout(() => {
      setShowIntro(false);
    }, 220);
    timersRef.current.push(hideId);
  }, [clearAllTimers]);

  useEffect(() => {
    if (initiallySuppressed) {
      return;
    }

    // Mark session as seen immediately so refresh or navigation won't replay the overlay
    markIntroSeen();

    // Hard ~1.4s timeline independent of API/data loading behind the overlay
    const exitStartTimer = window.setTimeout(() => {
      setExiting(true);
      setIntroComplete(true);
    }, 960);

    const unmountTimer = window.setTimeout(() => {
      setShowIntro(false);
    }, 1380);

    timersRef.current.push(exitStartTimer, unmountTimer);

    return () => {
      clearAllTimers();
    };
  }, [initiallySuppressed, clearAllTimers]);

  // If user enables prefers-reduced-motion while open, dismiss immediately
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        clearAllTimers();
        setIntroComplete(true);
        setShowIntro(false);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [clearAllTimers]);

  return (
    <IntroContext.Provider
      value={{
        showIntro,
        exiting,
        introComplete,
        isFirstSessionVisit,
        skipIntro,
      }}
    >
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro(): IntroContextValue {
  const ctx = useContext(IntroContext);
  if (!ctx) {
    return {
      showIntro: false,
      exiting: false,
      introComplete: true,
      isFirstSessionVisit: false,
      skipIntro: () => {},
    };
  }
  return ctx;
}
