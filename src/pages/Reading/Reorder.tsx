import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import Timer from '../../components/Timer';
import useTimer from '../../hooks/useTimer';
import { useScores } from '../../context/ScoreContext';
import { Reorder as ReorderType } from '../../types/exercise';
import reorderData from '../../data/reading/reorder.json';

// Create a combined state type to track all sentences
type SentenceItem = {
  id: string;
  text: string;
  location: 'source' | 'target';
  index: number;
};

const Reorder: React.FC = () => {
  // Load the first exercise from the data
  const exercise = reorderData[0] as ReorderType;
  
  // Set up state for the exercise - use a flat array approach instead of nested objects
  const [sentences, setSentences] = useState<SentenceItem[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Set up timer
  const { secondsLeft, start, isFinished } = useTimer(exercise.timeLimitSec);
  
  // Get score context
  const { updateScore } = useScores();

  // Initialize the exercise state
  useEffect(() => {
    // Map sentences to our format with location and index
    const initialSentences = [...exercise.sentences]
      .sort(() => Math.random() - 0.5)
      .map((sentence, index) => ({
        ...sentence,
        location: 'source' as const,
        index
      }));
    
    setSentences(initialSentences);
    
    // Start the timer automatically
    start();
  }, [exercise, start]);

  // Helper function to get target sentences by location and order
  const getTargetSentences = () => sentences.filter(s => s.location === 'target')
    .sort((a, b) => a.index - b.index);

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    
    const { source, destination } = result;
    
    // If dropped outside a droppable area or in the same spot
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return;
    }

    // Create a deep copy of sentences array
    const newSentences = [...sentences];
    
    // Find the sentence being moved
    const sourceIndex = newSentences.findIndex(s => 
      s.location === source.droppableId && s.index === source.index
    );

    if (sourceIndex === -1) return;
    
    // Get the sentence being moved
    const movedSentence = { ...newSentences[sourceIndex] };
    
    // Update its location and index
    movedSentence.location = destination.droppableId as 'source' | 'target';
    
    // Update indices of other sentences in the same location
    // For the source list, decrease indices of items after the moved item
    newSentences.forEach((sentence, i) => {
      if (sentence.location === source.droppableId && sentence.index > source.index) {
        newSentences[i] = { ...sentence, index: sentence.index - 1 };
      }
    });
    
    // For the destination list, increase indices of items at or after the insertion point
    newSentences.forEach((sentence, i) => {
      if (sentence.location === destination.droppableId && sentence.index >= destination.index) {
        newSentences[i] = { ...sentence, index: sentence.index + 1 };
      }
    });
    
    // Set the index of the moved sentence to its new position
    movedSentence.index = destination.index;
    
    // Update the moved sentence in the array
    newSentences[sourceIndex] = movedSentence;
    
    // Update state with the new arrangement
    setSentences(newSentences);
  };

  // Handle submit
  const handleSubmit = () => {
    if (isSubmitted) return;
    
    // Get target sentences in order
    const targetSentences = getTargetSentences();
    
    // Check if all sentences are moved to the target
    if (targetSentences.length !== exercise.sentences.length) {
      toast.warning('Please use all sentences before submitting.');
      return;
    }

    // Calculate score
    const totalSentences = exercise.sentences.length;
    let correctCount = 0;
    
    // Compare answers with correct order
    targetSentences.forEach((sentence, index) => {
      if (sentence.id === exercise.correctOrder[index]) {
        correctCount++;
      }
    });
    
    // Calculate sequence matching (pairs of adjacent sentences that are correct)
    let sequenceCount = 0;
    for (let i = 0; i < totalSentences - 1; i++) {
      const currentId = targetSentences[i].id;
      const nextId = targetSentences[i + 1].id;
      
      // Find the positions in the correct order
      const currentPosInCorrect = exercise.correctOrder.indexOf(currentId);
      const nextPosInCorrect = exercise.correctOrder.indexOf(nextId);
      
      // Check if they form a correct sequence
      if (nextPosInCorrect === currentPosInCorrect + 1) {
        sequenceCount++;
      }
    }
    
    // Final score calculation:
    // 50% based on exact position + 50% based on correct sequence pairs
    const positionScore = (correctCount / totalSentences) * 0.5;
    const sequenceScore = totalSentences > 1 ? (sequenceCount / (totalSentences - 1)) * 0.5 : 0.5;
    const calculatedScore = (positionScore + sequenceScore) * 100;
    
    setScore(calculatedScore);
    setIsSubmitted(true);
    
    // Update the score in context
    updateScore(exercise.id, calculatedScore);
    
    // Show result toast
    toast.success(`Your score: ${calculatedScore.toFixed(0)}%`);
  };

  // Get the sentences in correct order for the results display
  const getCorrectSentences = () => {
    return exercise.correctOrder.map(id => {
      return exercise.sentences.find(s => s.id === id);
    });
  };

  // Get source and target sentences for rendering
  const sourceSentencesForRender = sentences
    .filter(s => s.location === 'source')
    .sort((a, b) => a.index - b.index);
  
  const targetSentencesForRender = sentences
    .filter(s => s.location === 'target')
    .sort((a, b) => a.index - b.index);

  return (
    <Layout title="Reading: Reorder Paragraphs" subtitle="Restore the original order of the paragraph">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <div className="text-gray-700">{exercise.prompt}</div>
          <Timer seconds={secondsLeft} isRunning={!isFinished && !isSubmitted} />
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source area */}
            <div>
              <h3 className="font-medium mb-2">Available Sentences:</h3>
              <Droppable droppableId="source">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 rounded border min-h-[200px] ${snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'}`}
                  >
                    {sourceSentencesForRender.map((sentence, index) => (
                      <Draggable
                        key={sentence.id}
                        draggableId={sentence.id}
                        index={index}
                        isDragDisabled={isSubmitted}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 mb-2 rounded border ${snapshot.isDragging ? 'shadow-lg bg-blue-50' : 'bg-white'}`}
                          >
                            <p>{sentence.text}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Target area */}
            <div>
              <h3 className="font-medium mb-2">Your Paragraph Order:</h3>
              <Droppable droppableId="target">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 rounded border min-h-[200px] ${snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'}`}
                  >
                    {targetSentencesForRender.map((sentence, index) => (
                      <Draggable
                        key={sentence.id}
                        draggableId={sentence.id}
                        index={index}
                        isDragDisabled={isSubmitted}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 mb-2 rounded border ${snapshot.isDragging ? 'shadow-lg bg-blue-50' : 'bg-white'} ${
                              isSubmitted ? (
                                sentence.id === exercise.correctOrder[index] ? 
                                "border-green-500 bg-green-50" : 
                                "border-red-300 bg-red-50"
                              ) : ""
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mr-3 font-medium">
                                {index + 1}
                              </span>
                              <p>{sentence.text}</p>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end mt-6">
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
                <h4 className="font-medium mb-2">Correct paragraph order:</h4>
                <div className="space-y-2">
                  {getCorrectSentences().map((sentence, index) => (
                    sentence && (
                      <div key={index} className="p-3 border border-green-200 bg-green-50 rounded">
                        <div className="flex items-center">
                          <span className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-3 font-medium">
                            {index + 1}
                          </span>
                          <p>{sentence.text}</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>
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

export default Reorder;
