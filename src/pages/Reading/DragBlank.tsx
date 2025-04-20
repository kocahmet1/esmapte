import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import Timer from '../../components/Timer';
import DraggableItem from '../../components/DraggableItem';
import DroppableArea from '../../components/DroppableArea';
import useTimer from '../../hooks/useTimer';
import { useScores } from '../../context/ScoreContext';
import { DragBlank as DragBlankType } from '../../types/exercise';
import dragBlanksData from '../../data/reading/drag_blanks.json';

const DragBlank: React.FC = () => {
  // Load the first exercise from the data
  const exercise = dragBlanksData[0] as DragBlankType;
  
  // Create refs to store state values that won't trigger re-renders
  const answersRef = useRef<Record<string, string | null>>({});
  const availableChoicesRef = useRef<string[]>([]);
  
  // Set up state for the exercise
  const [, forceUpdate] = useState<object>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Set up timer
  const { secondsLeft, start, isFinished } = useTimer(exercise.timeLimitSec);
  
  // Get score context
  const { updateScore } = useScores();
  
  // Function to force a re-render
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  // Getter methods to access current state
  const getAnswers = useCallback(() => answersRef.current, []);
  const getAvailableChoices = useCallback(() => availableChoicesRef.current, []);

  // Initialize the exercise state
  useEffect(() => {
    // Start with all choices available
    availableChoicesRef.current = exercise.choices.map(choice => choice.id);
    
    // Create blank answers for each placeholder
    const initialAnswers: Record<string, string | null> = {};
    
    // Find all placeholders in the text [n]
    const placeholderRegex = /\[(\d+)\]/g;
    let match;
    while ((match = placeholderRegex.exec(exercise.text)) !== null) {
      const placeholderId = match[1];
      initialAnswers[placeholderId] = null;
    }
    
    answersRef.current = initialAnswers;
    
    // Force a render with initial state
    triggerUpdate();
    
    // Start the timer automatically
    start();
  }, [exercise, start, triggerUpdate]);

  // Handle drag and drop
  const handleDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;
    
    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped back in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Get current state values
    const answers = getAnswers();
    const availableChoices = getAvailableChoices();

    // Handle the drop based on source and destination
    if (source.droppableId === 'choices' && destination.droppableId.startsWith('blank-')) {
      // Moving from choices to a blank
      const choiceId = availableChoices[source.index];
      const blankId = destination.droppableId.replace('blank-', '');

      // If the blank already has a choice, add it back to choices
      const existingChoiceInBlank = answers[blankId];
      if (existingChoiceInBlank) {
        availableChoicesRef.current = [...availableChoices, existingChoiceInBlank];
      } else {
        availableChoicesRef.current = [...availableChoices];
      }

      // Update the answers and available choices
      answersRef.current = { ...answers, [blankId]: choiceId };
      
      // Remove the chosen item from available choices
      availableChoicesRef.current = availableChoicesRef.current.filter((_, index) => 
        source.droppableId === 'choices' && index !== source.index
      );
    } 
    else if (source.droppableId.startsWith('blank-') && destination.droppableId === 'choices') {
      // Moving from a blank back to choices
      const blankId = source.droppableId.replace('blank-', '');
      const choiceId = answers[blankId];

      if (choiceId) {
        // Update the answers and available choices
        answersRef.current = { ...answers, [blankId]: null };
        availableChoicesRef.current = [...availableChoices, choiceId];
      }
    }
    else if (source.droppableId.startsWith('blank-') && destination.droppableId.startsWith('blank-')) {
      // Moving between blanks
      const sourceBlankId = source.droppableId.replace('blank-', '');
      const destBlankId = destination.droppableId.replace('blank-', '');
      
      // Get the choice IDs
      const sourceChoiceId = answers[sourceBlankId];
      const destChoiceId = answers[destBlankId];
      
      if (sourceChoiceId) {
        // Swap the answers
        answersRef.current = {
          ...answers,
          [sourceBlankId]: destChoiceId,
          [destBlankId]: sourceChoiceId
        };
      }
    }
    
    // Force update to refresh UI with new state
    triggerUpdate();
  }, [getAnswers, getAvailableChoices, triggerUpdate]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (isSubmitted) return;
    
    const answers = getAnswers();
    
    // Check if all blanks are filled
    const allFilled = Object.values(answers).every(answer => answer !== null);
    
    if (!allFilled) {
      toast.warning('Please fill all the blanks before submitting.');
      return;
    }

    // Calculate score
    let correctCount = 0;
    const totalBlanks = Object.keys(answers).length;
    
    // Compare answers with correct order
    Object.entries(answers).forEach(([blankId, choiceId]) => {
      if (choiceId && choiceId === exercise.correctOrder[parseInt(blankId) - 1]) {
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
  }, [isSubmitted, getAnswers, exercise.correctOrder, exercise.id, updateScore]);

  // Render text with blanks
  const renderTextWithBlanks = useCallback(() => {
    // Get current answers
    const answers = getAnswers();
    
    // Split the text by placeholders
    const parts = exercise.text.split(/(\[\d+\])/g);
    
    return parts.map((part, index) => {
      // Check if this part is a placeholder
      const match = part.match(/\[(\d+)\]/);
      
      if (match) {
        const blankId = match[1];
        const choiceId = answers[blankId];
        const choice = choiceId 
          ? exercise.choices.find(c => c.id === choiceId) 
          : undefined;
        
        return (
          <DroppableArea
            key={`blank-${blankId}`}
            id={`blank-${blankId}`}
            isDropDisabled={isSubmitted}
            className="inline-block min-w-28 min-h-[40px] mx-1 p-1 align-middle"
          >
            {choice && (
              <DraggableItem
                id={choiceId as string}
                index={0}
                isDragDisabled={isSubmitted}
                className="m-0 p-1 text-center bg-blue-100 border-blue-300"
              >
                {choice.text}
              </DraggableItem>
            )}
          </DroppableArea>
        );
      }
      
      return <span key={`text-${index}`}>{part}</span>;
    });
  }, [exercise.choices, exercise.text, getAnswers, isSubmitted]);

  // Generate the available choices for rendering
  const availableChoicesForRender = useCallback(() => {
    const availableChoices = getAvailableChoices();
    return availableChoices.map((choiceId, index) => {
      const choice = exercise.choices.find(c => c.id === choiceId);
      return (
        <DraggableItem
          key={choiceId}
          id={choiceId}
          index={index}
          isDragDisabled={isSubmitted}
          className="inline-flex justify-center w-auto"
        >
          {choice?.text}
        </DraggableItem>
      );
    });
  }, [exercise.choices, getAvailableChoices, isSubmitted]);

  return (
    <Layout title="Reading: Fill in the Blanks (Drag)" subtitle="Drag words to the appropriate blanks">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <div className="text-gray-700">{exercise.prompt}</div>
          <Timer seconds={secondsLeft} isRunning={!isFinished && !isSubmitted} />
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Text with blanks */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-lg leading-loose">
            {renderTextWithBlanks()}
          </div>

          {/* Available choices */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Available Words:</h3>
            <DroppableArea
              id="choices"
              isDropDisabled={isSubmitted}
              className="flex flex-wrap gap-2 p-4"
            >
              {availableChoicesForRender()}
            </DroppableArea>
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
                  {exercise.correctOrder.map((choiceId, index) => {
                    const choice = exercise.choices.find(c => c.id === choiceId);
                    return choice ? (
                      <li key={index} className="mb-1">
                        Blank {index + 1}: <span className="font-medium">{choice.text}</span>
                      </li>
                    ) : null;
                  })}
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
        </DragDropContext>
      </div>
    </Layout>
  );
};

export default DragBlank;
