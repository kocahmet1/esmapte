import React from 'react';

interface WordCounterProps {
  wordCount: number;
  charCount: number;
  minWords?: number;
  maxWords?: number;
}

const WordCounter: React.FC<WordCounterProps> = ({ 
  wordCount, 
  charCount, 
  minWords = 0, 
  maxWords = Infinity 
}) => {
  const isUnderMinimum = wordCount < minWords;
  const isOverMaximum = maxWords !== Infinity && wordCount > maxWords;
  
  return (
    <div className="flex flex-col text-sm">
      <div className="flex items-center space-x-4">
        <span>
          Words: <span className={`font-medium ${isUnderMinimum || isOverMaximum ? 'text-red-500' : 'text-green-500'}`}>
            {wordCount}
          </span>
        </span>
        <span>
          Characters: <span className="font-medium">{charCount}</span>
        </span>
      </div>
      
      {(minWords > 0 || maxWords < Infinity) && (
        <div className="mt-1 text-xs text-gray-600">
          {minWords > 0 && maxWords < Infinity ? (
            <>Required: {minWords}-{maxWords} words</>
          ) : minWords > 0 ? (
            <>Minimum: {minWords} words</>
          ) : (
            <>Maximum: {maxWords} words</>
          )}
        </div>
      )}
    </div>
  );
};

export default WordCounter;
