import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import Timer from '../../components/Timer';
import WordCounter from '../../components/WordCounter';
import useTimer from '../../hooks/useTimer';
import useWordCounter from '../../hooks/useWordCounter';
import { useScores } from '../../context/ScoreContext';
import { Essay as EssayType } from '../../types/exercise';
import essayData from '../../data/writing/essay.json';

const Essay: React.FC = () => {
  // Load the first exercise from the data
  const exercise = essayData[0] as EssayType;
  
  // Set up state for the exercise
  const [answer, setAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Set up timer
  const { secondsLeft, start, isFinished } = useTimer(exercise.timeLimitSec);
  
  // Set up word counter
  const { wordCount, charCount, isWithinLimit, countWords } = useWordCounter(
    exercise.wordLimit.min,
    exercise.wordLimit.max
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

  // Handle submit
  const handleSubmit = () => {
    if (isSubmitted) return;
    
    // Check if answer is within word limit
    if (!isWithinLimit) {
      if (wordCount < exercise.wordLimit.min) {
        toast.warning(`Your essay must be at least ${exercise.wordLimit.min} words.`);
      } else {
        toast.warning(`Your essay must be at most ${exercise.wordLimit.max} words.`);
      }
      return;
    }

    setIsSubmitted(true);
    
    // For writing exercises, we store the answer rather than calculating a score
    localStorage.setItem(`pteWritingAnswer_${exercise.id}`, answer);
    
    // Update the score in context (use 100 as a placeholder for completion)
    updateScore(exercise.id, 100);
    
    // Show completion toast
    toast.success('Your essay has been submitted successfully!');
  };

  return (
    <Layout 
      title="Writing: Write Essay" 
      subtitle="Plan, write and revise an essay on the given topic"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="text-gray-700">{exercise.prompt}</div>
          <div className="flex items-center justify-between md:justify-end gap-6">
            <WordCounter 
              wordCount={wordCount} 
              charCount={charCount} 
              minWords={exercise.wordLimit.min} 
              maxWords={exercise.wordLimit.max} 
            />
            <Timer seconds={secondsLeft} isRunning={!isFinished && !isSubmitted} />
          </div>
        </div>

        {/* Essay topic */}
        <div className="bg-blue-50 p-5 rounded-lg mb-6 border border-blue-200">
          <h3 className="font-bold text-lg text-blue-800 mb-2">Topic</h3>
          <p className="text-lg">{exercise.text}</p>
        </div>

        {/* Writing area */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Your Essay:</h3>
          <div className="bg-white border rounded-lg shadow-sm">
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={handleTextChange}
              disabled={isSubmitted || isFinished}
              className="w-full h-80 p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your essay here..."
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
              Your essay has been saved. In a real PTE exam, this would be scored by the system.
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

export default Essay;
