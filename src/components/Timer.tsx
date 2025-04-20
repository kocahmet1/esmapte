import React from 'react';

interface TimerProps {
  seconds: number;
  isRunning: boolean;
  onFinish?: () => void;
}

const Timer: React.FC<TimerProps> = ({ seconds, isRunning, onFinish }) => {
  // Format the time as mm:ss
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center space-x-2 ${isRunning ? 'text-green-500' : 'text-gray-500'}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span className="font-mono text-lg">
        {formatTime(seconds)}
      </span>
      {seconds === 0 && (
        <span className="font-semibold text-red-500">Time's up!</span>
      )}
    </div>
  );
};

export default Timer;
