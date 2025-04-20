import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import Timer from '../../components/Timer';
import useTimer from '../../hooks/useTimer';
import { useScores } from '../../context/ScoreContext';
import { DropdownBlank as DropdownBlankType, MCOption } from '../../types/exercise';
import dropdownBlanksData from '../../data/reading/dropdown_blanks.json';

type SelectOption = {
  value: string;
  label: string;
};

const DropdownBlank: React.FC = () => {
  // Load the first exercise from the data
  const exercise = dropdownBlanksData[0] as DropdownBlankType;
  
  // Set up state for the exercise
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Set up timer
  const { secondsLeft, start, isFinished } = useTimer(exercise.timeLimitSec);
  
  // Get score context
  const { updateScore } = useScores();

  // Initialize answers array with empty strings
  useEffect(() => {
    setAnswers(Array(exercise.optionsPerBlank.length).fill(''));
    
    // Start the timer automatically
    start();
  }, [exercise, start]);

  // Convert MCOptions to Select options
  const getSelectOptions = (options: MCOption[]): SelectOption[] => {
    return options.map(option => ({
      value: option.id,
      label: option.text
    }));
  };

  // Handle answer change
  const handleAnswerChange = (selectedOption: SelectOption | null, index: number) => {
    if (!selectedOption) return;
    
    const newAnswers = [...answers];
    newAnswers[index] = selectedOption.value;
    setAnswers(newAnswers);
  };

  // Handle submit
  const handleSubmit = () => {
    if (isSubmitted) return;
    
    // Check if all blanks are filled
    const allFilled = answers.every(answer => answer !== '');
    
    if (!allFilled) {
      toast.warning('Please fill all the blanks before submitting.');
      return;
    }

    // Calculate score
    let correctCount = 0;
    const totalBlanks = exercise.optionsPerBlank.length;
    
    // Compare answers with correct options
    answers.forEach((answerId, index) => {
      const options = exercise.optionsPerBlank[index];
      const selectedOption = options.find(opt => opt.id === answerId);
      
      if (selectedOption && selectedOption.correct) {
        correctCount++;
      }
    });
    
    const calculatedScore = (correctCount / totalBlanks) * 100;
    setScore(calculatedScore);
    setIsSubmitted(true);
    
    // Update the score in context
    updateScore(exercise.id, calculatedScore);
    
    // Show result toast
    toast.success(`Your score: ${calculatedScore.toFixed(0)}%`);
  };

  // Render text with dropdown blanks
  const renderTextWithDropdowns = () => {
    // Split the text by placeholders
    const parts = exercise.text.split(/(\[\d+\])/g);
    
    return parts.map((part, index) => {
      // Check if this part is a placeholder
      const match = part.match(/\[(\d+)\]/);
      
      if (match) {
        const blankIndex = parseInt(match[1]) - 1;
        const options = exercise.optionsPerBlank[blankIndex];
        const selectedValue = answers[blankIndex];
        
        // Find the selected option for display
        const selectedOption = selectedValue 
          ? { value: selectedValue, label: options.find(opt => opt.id === selectedValue)?.text || '' }
          : null;
        
        // Determine if this answer is correct (for feedback)
        const isCorrect = isSubmitted && selectedValue 
          ? options.find(opt => opt.id === selectedValue)?.correct 
          : false;
          
        return (
          <span 
            key={`blank-${blankIndex}`} 
            className="inline-block align-middle mx-1 min-w-36"
          >
            <Select
              value={selectedOption}
              onChange={(option) => handleAnswerChange(option, blankIndex)}
              options={getSelectOptions(options)}
              isDisabled={isSubmitted || isFinished}
              placeholder="Select..."
              className={`${isSubmitted ? (isCorrect ? 'react-select-correct' : 'react-select-incorrect') : ''}`}
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  borderColor: isSubmitted 
                    ? (isCorrect ? '#10b981' : '#ef4444') 
                    : state.isFocused ? '#3b82f6' : '#d1d5db',
                  boxShadow: isSubmitted 
                    ? 'none' 
                    : state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                  '&:hover': {
                    borderColor: isSubmitted 
                      ? (isCorrect ? '#10b981' : '#ef4444') 
                      : '#3b82f6'
                  }
                })
              }}
            />
          </span>
        );
      }
      
      return <span key={`text-${index}`}>{part}</span>;
    });
  };

  // Get correct answers for result display
  const getCorrectAnswers = () => {
    return exercise.optionsPerBlank.map((options, index) => {
      const correctOption = options.find(opt => opt.correct);
      return {
        index: index + 1,
        text: correctOption?.text || 'No correct answer found'
      };
    });
  };

  return (
    <Layout title="Reading: Fill in the Blanks (Dropdown)" subtitle="Select the appropriate option for each blank">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <div className="text-gray-700">{exercise.prompt}</div>
          <Timer seconds={secondsLeft} isRunning={!isFinished && !isSubmitted} />
        </div>

        {/* Text with dropdown blanks */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-lg leading-loose">
          {renderTextWithDropdowns()}
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
                {getCorrectAnswers().map((answer, index) => (
                  <li key={index} className="mb-1">
                    Blank {answer.index}: <span className="font-medium">{answer.text}</span>
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

export default DropdownBlank;
