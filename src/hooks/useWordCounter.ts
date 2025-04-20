import { useState, useCallback, useEffect } from 'react';

interface UseWordCounterReturn {
  wordCount: number;
  charCount: number;
  isWithinLimit: boolean;
  countWords: (text: string) => void;
}

export const useWordCounter = (
  minWords: number = 0,
  maxWords: number = Infinity
): UseWordCounterReturn => {
  const [wordCount, setWordCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [isWithinLimit, setIsWithinLimit] = useState<boolean>(false);

  const countWords = useCallback((text: string) => {
    const trimmed = text.trim();
    const chars = trimmed.length;
    setCharCount(chars);

    if (!trimmed) {
      setWordCount(0);
      return;
    }

    // Count words by splitting on whitespace
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, []);

  useEffect(() => {
    setIsWithinLimit(wordCount >= minWords && wordCount <= maxWords);
  }, [wordCount, minWords, maxWords]);

  return {
    wordCount,
    charCount,
    isWithinLimit,
    countWords,
  };
};

export default useWordCounter;
