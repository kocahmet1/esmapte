import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Score {
  exerciseId: string;
  attempts: number;
  bestScore: number;
}

interface ScoreContextType {
  scores: Record<string, Score>;
  updateScore: (exerciseId: string, score: number) => void;
  resetScores: () => void;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export const ScoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scores, setScores] = useState<Record<string, Score>>({});

  // Load scores from localStorage on initial render
  useEffect(() => {
    const savedScores = localStorage.getItem('pteProgress');
    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch (error) {
        console.error('Failed to parse scores from localStorage', error);
      }
    }
  }, []);

  // Save scores to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pteProgress', JSON.stringify(scores));
  }, [scores]);

  const updateScore = (exerciseId: string, score: number) => {
    setScores((prevScores) => {
      const existingScore = prevScores[exerciseId];
      
      if (!existingScore) {
        return {
          ...prevScores,
          [exerciseId]: {
            exerciseId,
            attempts: 1,
            bestScore: score,
          },
        };
      }
      
      return {
        ...prevScores,
        [exerciseId]: {
          ...existingScore,
          attempts: existingScore.attempts + 1,
          bestScore: Math.max(existingScore.bestScore, score),
        },
      };
    });
  };

  const resetScores = () => {
    setScores({});
    localStorage.removeItem('pteProgress');
  };

  return (
    <ScoreContext.Provider value={{ scores, updateScore, resetScores }}>
      {children}
    </ScoreContext.Provider>
  );
};

export const useScores = (): ScoreContextType => {
  const context = useContext(ScoreContext);
  if (context === undefined) {
    throw new Error('useScores must be used within a ScoreProvider');
  }
  return context;
};

export default ScoreContext;
