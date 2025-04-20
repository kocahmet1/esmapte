import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import Timer from '../../components/Timer';
import useTimer from '../../hooks/useTimer';
import { useScores } from '../../context/ScoreContext';
import { MCSingle as MCSingleType } from '../../types/exercise';
import mcSingleData from '../../data/reading/mc_single.json';

const MCSingle: React.FC = () => {
  // Load the first exercise from the data
  const exercise = mcSingleData[0] as MCSingleType;
  
  // Set up state for the exercise
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
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
    setSelectedOption(optionId);
  };

  // Handle submit
  const handleSubmit = () => {
    if (isSubmitted) return;
    
    // Check if an option is selected
    if (!selectedOption) {
      toast.warning('Please select an option before submitting.');
      return;
    }

    // Find the selected option
    const selectedOpt = exercise.options.find(opt => opt.id === selectedOption);
    
    // Calculate score (100% if correct, 0% if wrong)
    const calculatedScore = selectedOpt?.correct ? 100 : 0;
    setScore(calculatedScore);
    setIsSubmitted(true);
    
    // Update the score in context
    updateScore(exercise.id, calculatedScore);
    
    // Show result toast
    toast.success(`Your answer is ${selectedOpt?.correct ? 'correct' : 'incorrect'}`);
  };

  // Find the correct option for display in the results
  const getCorrectOption = () => {
    return exercise.options.find(opt => opt.correct);
  };

  return (
    <Layout title="Reading: Multiple Choice, Choose Single Answer" subtitle="Select the best answer for the question">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <div className="text-gray-700">{exercise.prompt}</div>
          <Timer seconds={secondsLeft} isRunning={!isFinished && !isSubmitted} />
        </div>

        {/* Passage */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <p className="text-lg leading-relaxed">{exercise.text}</p>
        </div>

        {/* Question */}
        <div className="bg-blue-50 p-5 rounded-lg mb-6 border border-blue-200">
          <h3 className="font-bold text-lg text-blue-800 mb-2">Question</h3>
          <p className="text-lg">{exercise.question}</p>
        </div>

        {/* Options */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Select ONE correct answer:</h3>
          <div className="space-y-3">
            {exercise.options.map(option => {
              // Determine styling based on selection and submission status
              const isSelected = selectedOption === option.id;
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
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 border ${
                      isSelected 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'bg-white border-gray-400'
                    }`}>
                      <span className="font-medium text-sm">{option.id.toUpperCase()}</span>
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
              <h4 className="font-medium mb-2">Correct answer:</h4>
              <p className="font-medium">
                Option {getCorrectOption()?.id.toUpperCase()}: {getCorrectOption()?.text}
              </p>
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

export default MCSingle;
