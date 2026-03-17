import { useState, useEffect } from 'react';
import { fetchNextImage, submitGuess, updateScore } from '../services/api';
import ScoreBoard from './ScoreBoard';
import ImageDisplay from './ImageDisplay';
import GuessInput from './GuessInput';

interface GameBoardProps {
  username: string;
  category?: string;
  difficulty?: string;
  rounds?: number;
  onGameEnd?: (score: number) => void;
}

export default function GameBoard({ username, category, difficulty = 'Medium', rounds = 5, onGameEnd }: GameBoardProps) {
  const [image, setImage] = useState<{ imageUrl: string; answer: string, info?: string } | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [isGuessing, setIsGuessing] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Tries logic
  const [triesLeft, setTriesLeft] = useState(Infinity);
  
  useEffect(() => {
    loadNextImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetTries = () => {
    if (difficulty === 'Easy') setTriesLeft(Infinity);
    else if (difficulty === 'Medium') setTriesLeft(5);
    else if (difficulty === 'Hard') setTriesLeft(3);
    else setTriesLeft(5);
  };

  const finishGame = async (finalScore: number) => {
    try {
      await updateScore(username, finalScore);
    } catch (e) {
      console.error('Failed to submit score:', e);
    }
    if (onGameEnd) onGameEnd(finalScore);
  };

  const loadNextImage = async () => {
    if (round >= rounds) {
      await finishGame(score);
      return;
    }
    setLoading(true);
    const data = await fetchNextImage(category, difficulty);
    setImage(data);
    setIsGuessing(true);
    setFeedback(null);
    setRound(prev => prev + 1);
    resetTries();
    setLoading(false);
  };

  const handleGuess = async (guess: string) => {
    if (!image || !isGuessing) return;
    
    const result = await submitGuess(guess, image.answer);
    if (result.correct) {
      setScore(prev => prev + 1);
      setFeedback('Correct!');
      setIsGuessing(false);
    } else {
      setTriesLeft(prev => prev - 1);
      if (triesLeft - 1 <= 0) {
        setFeedback(`Out of tries! The correct answer was: ${image.answer}`);
        setIsGuessing(false);
      } else {
        setFeedback(`Incorrect! ${triesLeft - 1 === Infinity ? 'Try again!' : (triesLeft - 1) + ' tries left.'}`);
      }
    }
  };

  const handleSkip = () => {
    setFeedback(`Skipped. The correct answer was: ${image?.answer}`);
    setIsGuessing(false);
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
        <div className={`mb-4 text-xl font-bold ${feedback === 'Correct!' ? 'text-green-500' : 'text-red-500'} text-center`}>
          {feedback}
        </div>
      )}

      {/* Show more info once guessing is done */}
      {!isGuessing && image.info && (
        <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm text-center">
          <strong>Did you know?</strong> {image.info}
        </div>
      )}

      {isGuessing ? (
        <>
          <GuessInput onGuess={handleGuess} />
          <button 
            onClick={handleSkip}
            className="mt-4 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            Skip this image
          </button>
        </>
      ) : (
        <button 
          onClick={loadNextImage}
          className="mt-4 w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-200"
        >
          {round >= rounds ? 'View Results' : 'Next Image'}
        </button>
      )}
    </div>
  );
}