import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import Timer from '../../components/Timer';
import WordCounter from '../../components/WordCounter';
import useTimer from '../../hooks/useTimer';
import useWordCounter from '../../hooks/useWordCounter';
import { useScores } from '../../context/ScoreContext';
import { Summarize as SummarizeType } from '../../types/exercise';
import summarizeData from '../../data/writing/summarize.json';

const Summarize: React.FC = () => {
  // Load the first exercise from the data
  const exercise = summarizeData[0] as SummarizeType;
  
  // Set up state for the exercise
  const [answer, setAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Set up timer
  const { secondsLeft, start, isFinished } = useTimer(exercise.timeLimitSec);
  
  // Set up word counter
  const { wordCount, charCount, isWithinLimit, countWords } = useWordCounter(
    5, // Min words
    75 // Max words
  );
  
  // Get score context
  const { updateScore } = useScores();

  // Start the timer when component mounts
  useEffect(() => {
    start();
    
    // Focus the textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [start]);

  // Update word count when answer changes
  useEffect(() => {
    countWords(answer);
  }, [answer, countWords]);

  // Handle text input
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isSubmitted || isFinished) return;
    
    const newText = e.target.value;
    setAnswer(newText);
  };

  // Handle key down to prevent multiple sentences (Enter key)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      toast.info('This exercise requires a single sentence summary. Press submit when done.');
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (isSubmitted) return;
    
    // Check if answer is within word limit
    if (!isWithinLimit) {
      if (wordCount < 5) {
        toast.warning('Your summary must be at least 5 words.');
      } else {
        toast.warning('Your summary must be at most 75 words.');
      }
      return;
    }
    
    // Check if answer contains a period (to enforce one sentence)
    if (answer.trim().split('.').filter(s => s.trim()).length > 1) {
      toast.warning('Your summary must be a single sentence.');
      return;
    }

    setIsSubmitted(true);
    
    // For writing exercises, we store the answer rather than calculating a score
    localStorage.setItem(`pteWritingAnswer_${exercise.id}`, answer);
    
    // Update the score in context (use 100 as a placeholder for completion)
    updateScore(exercise.id, 100);
    
    // Show completion toast
    toast.success('Your summary has been submitted successfully!');
  };

  return (
    <Layout 
      title="Writing: Summarize Written Text" 
      subtitle="Summarize the text in a single sentence"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="text-gray-700">{exercise.prompt}</div>
          <div className="flex items-center justify-between md:justify-end gap-6">
            <WordCounter 
              wordCount={wordCount} 
              charCount={charCount} 
              minWords={5} 
              maxWords={75} 
            />
            <Timer seconds={secondsLeft} isRunning={!isFinished && !isSubmitted} />
          </div>
        </div>

        {/* Reading passage */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-lg leading-relaxed">
          <p>{(exercise as any).text}</p>
        </div>

        {/* Writing area */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Your Summary:</h3>
          <div className="bg-white border rounded-lg shadow-sm">
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              disabled={isSubmitted || isFinished}
              className="w-full h-40 p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your summary here in one sentence..."
            ></textarea>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitted || isFinished || !isWithinLimit}
            className={`px-6 py-2 rounded-lg font-medium 
              ${
                isSubmitted || isFinished || !isWithinLimit
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            Submit
          </button>
        </div>

        {/* Submission message */}
        {isSubmitted && (
          <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
            <h3 className="font-bold text-lg text-green-700 mb-2">Submission Complete!</h3>
            <p>
              Your summary has been saved. In a real PTE exam, this would be scored by the system.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Note: Your answer has been saved to localStorage for reference.
            </p>
          </div>
        )}

        {/* Time's up message */}
        {isFinished && !isSubmitted && (
          <div className="mt-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-center">
            <h3 className="font-bold text-lg text-yellow-700">Time's Up!</h3>
            <p className="mt-2">
              Your time has expired. Please submit your answer now.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Summarize;
