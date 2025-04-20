import { useState, useEffect, useCallback } from 'react';

interface UseTimerReturn {
  secondsLeft: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  isFinished: boolean;
  isRunning: boolean;
}

export const useTimer = (totalSeconds: number = 0): UseTimerReturn => {
  const [secondsLeft, setSecondsLeft] = useState<number>(totalSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const start = useCallback(() => {
    if (secondsLeft > 0 && !isFinished) {
      setIsRunning(true);
    }
  }, [secondsLeft, isFinished]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setSecondsLeft(totalSeconds);
    setIsRunning(false);
    setIsFinished(false);
  }, [totalSeconds]);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout> | undefined;

    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft]);

  return {
    secondsLeft,
    start,
    pause,
    reset,
    isFinished,
    isRunning,
  };
};

export default useTimer;
