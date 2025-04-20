import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import Timer from '../../components/Timer';
import useTimer from '../../hooks/useTimer';
import { useScores } from '../../context/ScoreContext';
import { MCMulti as MCMultiType } from '../../types/exercise';
import mcMultiData from '../../data/reading/mc_multi.json';

const MCMulti: React.FC = () => {
  // Load the first exercise from the data
  const exercise = mcMultiData[0] as MCMultiType;
  
  // Set up state for the exercise
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Set up timer
  const { secondsLeft, start, isFinished } = useTimer(exercise.timeLimitSec);
  
  // Get score context
  const { updateScore } = useScores();

  // Start the timer when component mounts
  useEffect(() => {
    start();
  }, [start]);

  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    if (isSubmitted || isFinished) return;
    
    setSelectedOptions(prevSelected => {
      // If already selected, remove it
      if (prevSelected.includes(optionId)) {
        return prevSelected.filter(id => id !== optionId);
      }
      // Otherwise add it
      return [...prevSelected, optionId];
    });
  };

  // Handle submit
  const handleSubmit = () => {
    if (isSubmitted) return;
    
    // Check if at least one option is selected
    if (selectedOptions.length === 0) {
      toast.warning('Please select at least one option before submitting.');
      return;
    }

    // Calculate score
    const correctOptions = exercise.options.filter(opt => opt.correct);
    
    let points = 0;
    let totalPoints = correctOptions.length; // Total possible points equals number of correct answers
    
    // Add points for correct selections
    selectedOptions.forEach(selectedId => {
      const option = exercise.options.find(opt => opt.id === selectedId);
      if (option?.correct) {
        points += 1;
      } else {
        // Penalty for incorrect selections
        points -= 0.5;
      }
    });
    
    // Add penalty for missing correct options
    correctOptions.forEach(correctOpt => {
      if (!selectedOptions.includes(correctOpt.id)) {
        points -= 0.5;
      }
    });
    
    // Ensure score is not negative
    points = Math.max(0, points);
    
    // Calculate percentage score
    const calculatedScore = (points / totalPoints) * 100;
    setScore(calculatedScore);
    setIsSubmitted(true);
    
    // Update the score in context
    updateScore(exercise.id, calculatedScore);
    
    // Show result toast
    toast.success(`Your score: ${calculatedScore.toFixed(0)}%`);
  };

  // Get correct options for display in the results
  const getCorrectOptions = () => {
    return exercise.options.filter(opt => opt.correct);
  };

  return (
    <Layout title="Reading: Multiple Choice, Choose Multiple Answers" subtitle="Select ALL the correct answers">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <div className="text-gray-700">{exercise.prompt}</div>
          <Timer seconds={secondsLeft} isRunning={!isFinished && !isSubmitted} />
        </div>

        {/* Passage */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <p className="text-lg leading-relaxed">{(exercise as any).text}</p>
        </div>

        {/* Question */}
        <div className="bg-blue-50 p-5 rounded-lg mb-6 border border-blue-200">
          <h3 className="font-bold text-lg text-blue-800 mb-2">Question</h3>
          <p className="text-lg">{(exercise as any).question}</p>
        </div>

        {/* Options */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Select ALL correct answers:</h3>
          <div className="space-y-3">
            {exercise.options.map(option => {
              // Determine styling based on selection and submission status
              const isSelected = selectedOptions.includes(option.id);
              const isCorrect = option.correct;
              
              let optionClass = "p-4 rounded-lg border cursor-pointer transition";
              
              if (isSubmitted) {
                if (isSelected && isCorrect) {
                  // Selected and correct
                  optionClass += " bg-green-100 border-green-500 text-green-800";
                } else if (isSelected && !isCorrect) {
                  // Selected but incorrect
                  optionClass += " bg-red-100 border-red-500 text-red-800";
                } else if (!isSelected && isCorrect) {
                  // Not selected but correct
                  optionClass += " bg-green-50 border-green-300 text-green-800";
                } else {
                  // Not selected and incorrect
                  optionClass += " bg-gray-100 border-gray-300 text-gray-600";
                }
              } else {
                optionClass += isSelected
                  ? " bg-blue-100 border-blue-500 text-blue-800"
                  : " bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-300";
              }
              
              return (
                <div
                  key={option.id}
                  className={optionClass}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <div className="flex items-start">
                    <div className={`w-6 h-6 rounded flex items-center justify-center mr-3 mt-0.5 border ${
                      isSelected 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'bg-white border-gray-400'
                    }`}>
                      {isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>{option.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitted || isFinished}
            className={`px-6 py-2 rounded-lg font-medium 
              ${
                isSubmitted || isFinished
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            Submit
          </button>
        </div>

        {/* Result display */}
        {isSubmitted && score !== null && (
          <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h3 className="font-bold text-lg mb-2">Your Result</h3>
            <p className="text-lg">
              Score: <span className="font-bold text-blue-700">{score.toFixed(0)}%</span>
            </p>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Correct answers:</h4>
              <ul className="list-disc list-inside">
                {getCorrectOptions().map(option => (
                  <li key={option.id} className="mb-1">
                    Option {option.id.toUpperCase()}: <span className="font-medium">{option.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Time's up message */}
        {isFinished && !isSubmitted && (
          <div className="mt-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-center">
            <h3 className="font-bold text-lg text-yellow-700">Time's Up!</h3>
            <p className="mt-2">
              Your time has expired. Click the Submit button to see your score.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MCMulti;
