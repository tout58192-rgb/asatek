import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getHeadingAnimationMode,
  getStepDelayMs,
  splitHeadingHighlight,
  splitUrduWords,
} from '../../lib/heroAnimation';
import type { Lang } from '../../lib/i18n';

interface AnimatedHeroHeadingProps {
  text: string;
  lang: Lang;
  introComplete: boolean;
  isFirstSessionVisit: boolean;
  reducedMotion: boolean;
  onComplete?: () => void;
}

const HIGHLIGHT_EN_CLASS =
  'bg-gradient-to-r from-[#FF5C77] via-[#FF2E51] to-[#FFA6B6] bg-clip-text text-transparent';
const HIGHLIGHT_UR_CLASS =
  'inline-block py-1 -my-1 bg-gradient-to-l from-[#FF5C77] via-[#FF7A90] to-[#FFC2CC] bg-clip-text text-transparent';

export function AnimatedHeroHeading({
  text,
  lang,
  introComplete,
  isFirstSessionVisit,
  reducedMotion,
  onComplete,
}: AnimatedHeroHeadingProps) {
  const prevLangRef = useRef<Lang>(lang);
  const [isLanguageSwitch, setIsLanguageSwitch] = useState(false);

  useEffect(() => {
    if (prevLangRef.current !== lang) {
      prevLangRef.current = lang;
      setIsLanguageSwitch(true);
    }
  }, [lang]);

  const mode = getHeadingAnimationMode({
    reducedMotion,
    isFirstVisit: isFirstSessionVisit,
    isLanguageSwitch,
    lang,
  });

  const { leading, highlight } = useMemo(
    () => splitHeadingHighlight(text),
    [text],
  );
  const urWords = useMemo(() => splitUrduWords(text), [text]);

  const [charCount, setCharCount] = useState<number>(() =>
    mode === 'typewriter-en' ? 0 : text.length,
  );
  const [wordCount, setWordCount] = useState<number>(() =>
    mode === 'words-ur' ? 0 : urWords.length,
  );
  const [caretHidden, setCaretHidden] = useState<boolean>(
    () => mode !== 'typewriter-en',
  );

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (reducedMotion || mode === 'none') {
      setCharCount(text.length);
      setWordCount(urWords.length);
      setCaretHidden(true);
      onCompleteRef.current?.();
      return;
    }

    if (!introComplete) {
      setCharCount(0);
      setWordCount(0);
      setCaretHidden(mode !== 'typewriter-en');
      return;
    }

    if (mode === 'fade-up') {
      setCharCount(text.length);
      setWordCount(urWords.length);
      setCaretHidden(true);
      onCompleteRef.current?.();
      return;
    }

    if (mode === 'typewriter-en') {
      const total = text.length;
      if (total === 0) {
        setCharCount(0);
        setCaretHidden(true);
        onCompleteRef.current?.();
        return;
      }

      setCharCount(0);
      setCaretHidden(false);
      const stepMs = getStepDelayMs('en', total, isLanguageSwitch);
      let current = 0;
      let fadeTimer: number | undefined;

      const intervalId = window.setInterval(() => {
        current += 1;
        setCharCount(current);
        if (current >= total) {
          window.clearInterval(intervalId);
          onCompleteRef.current?.();
          fadeTimer = window.setTimeout(() => {
            setCaretHidden(true);
          }, 420);
        }
      }, stepMs);

      return () => {
        window.clearInterval(intervalId);
        if (fadeTimer !== undefined) window.clearTimeout(fadeTimer);
      };
    }

    // mode === 'words-ur' (word-by-word fade + rise, preserving joined Urdu script)
    const totalWords = urWords.length;
    if (totalWords === 0) {
      setWordCount(0);
      onCompleteRef.current?.();
      return;
    }

    setWordCount(0);
    setCaretHidden(true);
    const stepMs = getStepDelayMs('ur', totalWords, isLanguageSwitch);
    let current = 0;

    // Reveal first word immediately after a single animation frame for snappy start
    const startTimer = window.setTimeout(() => {
      current = 1;
      setWordCount(1);
      if (totalWords === 1) {
        onCompleteRef.current?.();
      }
    }, 40);

    const intervalId = window.setInterval(() => {
      if (current === 0) return;
      if (current >= totalWords) {
        window.clearInterval(intervalId);
        return;
      }
      current += 1;
      setWordCount(current);
      if (current >= totalWords) {
        window.clearInterval(intervalId);
        onCompleteRef.current?.();
      }
    }, stepMs);

    return () => {
      window.clearTimeout(startTimer);
      window.clearInterval(intervalId);
    };
  }, [introComplete, mode, text, urWords.length, isLanguageSwitch, reducedMotion]);

  const leadingLen = leading.length;
  const typedText = text.slice(0, charCount);
  const typedLeading = typedText.slice(0, leadingLen);
  const typedHighlight =
    typedText.length > leadingLen ? typedText.slice(leadingLen) : '';

  return (
    <h1
      aria-label={text}
      data-testid="hero-heading"
      data-animation-mode={mode}
      className={`relative text-3xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-white ${
        lang === 'ur' ? 'leading-[1.65]' : 'leading-[1.12]'
      }`}
      style={{ textWrap: 'balance' }}
    >
      {/* Full text preserved in DOM for accessibility and SEO */}
      <span className="sr-only">{text}</span>

      {/* Invisible sizer reserves exact wrapped height across mobile & desktop (zero CLS) */}
      <span aria-hidden="true" className="invisible select-none block">
        {lang === 'ur' ? (
          urWords.map((word, idx) => (
            <span key={`sz-${idx}`}>
              <span
                className={`inline-block ${
                  idx === urWords.length - 1 ? 'py-1 -my-1' : ''
                }`}
              >
                {word}
              </span>
              {idx < urWords.length - 1 ? ' ' : ''}
            </span>
          ))
        ) : (
          <>
            {leading}
            <span>{highlight}</span>
          </>
        )}
      </span>

      {/* Animated visual presentation layer */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 block ${
          !introComplete && !reducedMotion
            ? 'opacity-0'
            : mode === 'fade-up'
              ? 'asatek-hero-in'
              : 'opacity-100'
        }`}
      >
        {mode === 'typewriter-en' ? (
          <>
            <span>{typedLeading}</span>
            {typedHighlight && (
              <span className={HIGHLIGHT_EN_CLASS}>{typedHighlight}</span>
            )}
            <span
              className={`inline-block align-middle ms-0.5 w-[3px] h-[0.9em] rounded-full bg-[var(--brand-red)] transition-opacity duration-300 ${
                caretHidden ? 'opacity-0' : 'asatek-caret-blink opacity-100'
              }`}
            />
          </>
        ) : mode === 'words-ur' ? (
          urWords.map((word, idx) => {
            const visible = idx < wordCount;
            const isLast = idx === urWords.length - 1;
            return (
              <span key={`ur-${idx}-${word}`}>
                <span
                  className={`inline-block transition-[transform,opacity] duration-300 ease-out ${
                    visible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-2.5'
                  } ${isLast ? HIGHLIGHT_UR_CLASS : ''}`}
                >
                  {word}
                </span>
                {idx < urWords.length - 1 ? ' ' : ''}
              </span>
            );
          })
        ) : lang === 'ur' ? (
          urWords.map((word, idx) => {
            const isLast = idx === urWords.length - 1;
            return (
              <span key={`static-ur-${idx}`}>
                <span className={isLast ? HIGHLIGHT_UR_CLASS : ''}>{word}</span>
                {idx < urWords.length - 1 ? ' ' : ''}
              </span>
            );
          })
        ) : (
          <>
            <span>{leading}</span>
            {highlight && <span className={HIGHLIGHT_EN_CLASS}>{highlight}</span>}
          </>
        )}
      </span>
    </h1>
  );
}
