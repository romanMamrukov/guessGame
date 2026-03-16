import { useState, useEffect } from 'react';
import { fetchNextImage, submitGuess } from '../services/api';
import ScoreBoard from './ScoreBoard';
import ImageDisplay from './ImageDisplay';
import GuessInput from './GuessInput';

interface GameBoardProps {
  category?: string;
  difficulty?: string;
  rounds?: number;
  onGameEnd?: (score: number) => void;
}

export default function GameBoard({ category, difficulty = 'Medium', rounds = 5, onGameEnd }: GameBoardProps) {
  const [image, setImage] = useState<{ imageUrl: string; answer: string } | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [isGuessing, setIsGuessing] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNextImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNextImage = async () => {
    if (round >= rounds) {
      if (onGameEnd) onGameEnd(score);
      return;
    }
    setLoading(true);
    const data = await fetchNextImage(category, difficulty);
    setImage(data);
    setIsGuessing(true);
    setFeedback(null);
    setRound(prev => prev + 1);
    setLoading(false);
  };

  const handleGuess = async (guess: string) => {
    if (!image) return;
    const result = await submitGuess(guess, image.answer);
    if (result.correct) {
      setScore(prev => prev + 1);
      setFeedback('Correct!');
      setIsGuessing(false);
      setTimeout(loadNextImage, 1500); // Wait a bit before moving on
    } else {
      setFeedback('Incorrect, try again! Or skip.');
    }
  };

  if (loading || !image) return <div className="text-center py-10 text-xl font-semibold">Loading next image...</div>;

  return (
    <div className="game-board flex flex-col items-center max-w-2xl mx-auto p-4 bg-white rounded-xl shadow-lg mt-8">
      <div className="w-full flex justify-between items-center mb-4 px-4">
        <div className="text-lg font-bold text-gray-700">Round: {round} / {rounds}</div>
        <ScoreBoard score={score} />
      </div>

      <ImageDisplay imageUrl={image.imageUrl} difficulty={difficulty} />
      
      {feedback && (
        <div className={`mb-4 text-xl font-bold ${feedback === 'Correct!' ? 'text-green-500' : 'text-red-500'}`}>
          {feedback}
        </div>
      )}

      {isGuessing && <GuessInput onGuess={handleGuess} />}
      
      {isGuessing && (
        <button 
          onClick={loadNextImage}
          className="mt-4 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          Skip this image
        </button>
      )}
    </div>
  );
}