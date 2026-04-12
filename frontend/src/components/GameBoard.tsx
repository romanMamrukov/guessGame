import { useState, useEffect } from 'react';
import { fetchNextImage, submitGuess, recordObjectStat } from '../services/api';
import type { ImageObject } from '../services/api';
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
  const [image, setImage] = useState<ImageObject | null>(null);
  const [nextImageCache, setNextImageCache] = useState<ImageObject | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [isGuessing, setIsGuessing] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);

  const fetchAndPreload = async () => {
    const data = await fetchNextImage(category, difficulty);
    const img = new Image();
    img.src = data.imageUrl;
    return data;
  };

  useEffect(() => {
    const initGame = async () => {
      setLoading(true);
      const firstImg = await fetchAndPreload();
      setImage(firstImg);
      setRound(1);
      setLoading(false);
      
      const secondImg = await fetchAndPreload();
      setNextImageCache(secondImg);
    };
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advanceRound = async (currentScore: number) => {
    if (round >= rounds) {
      if (onGameEnd) onGameEnd(currentScore);
      return;
    }
    
    setImage(nextImageCache);
    setIsGuessing(true);
    setFeedback(null);
    setAttempts(0);
    const newRound = round + 1;
    setRound(newRound);
    
    if (newRound <= rounds) {
      const nextOne = await fetchAndPreload();
      setNextImageCache(nextOne);
    }
  };

  const skipImage = () => {
    if (image?.id) {
      recordObjectStat(image.id, 'stat_skip').catch(console.error);
    }
    advanceRound(score);
  };

  const handleGuess = async (guess: string) => {
    if (!image) return;
    const result = await submitGuess(guess, image.answer);
    const newScore = result.correct ? score + 1 : score;
    const currentAttempt = attempts + 1;
    setAttempts(currentAttempt);
    
    if (result.correct) {
      setScore(newScore);
      setFeedback('Correct!');
      setIsGuessing(false);
      
      if (image.id) {
        if (currentAttempt === 1) recordObjectStat(image.id, 'stat_1st_try').catch(console.error);
        else if (currentAttempt === 2) recordObjectStat(image.id, 'stat_2nd_try').catch(console.error);
        else recordObjectStat(image.id, 'stat_3rd_try').catch(console.error);
      }
      
      setTimeout(() => advanceRound(newScore), 1500); 
    } else {
      setFeedback('Incorrect, try again! Or skip.');
      if (image.id) {
        recordObjectStat(image.id, 'stat_wrong').catch(console.error);
      }
    }
  };

  if (loading || !image) return <div className="text-center py-10 text-xl font-semibold">Loading next image...</div>;

  return (
    <div className="game-board flex flex-col items-center max-w-2xl mx-auto p-4 bg-white rounded-xl shadow-lg mt-8">
      <div className="w-full flex justify-between items-center mb-4 px-4">
        <div className="text-lg font-bold text-gray-700">Round: {round} / {rounds}</div>
        <ScoreBoard score={score} />
      </div>

      <div className={`transition-transform duration-500 ease-out ${!isGuessing ? 'scale-105' : 'scale-100'}`}>
        <ImageDisplay 
          imageUrl={image.imageUrl} 
          difficulty={difficulty} 
          masks={image.specific_areas} 
          isRevealed={!isGuessing} 
        />
      </div>
      
      {feedback && (
        <div className={`mb-4 mt-2 p-3 text-xl font-bold text-center rounded-xl w-full shadow-sm ${feedback === 'Correct!' ? 'bg-green-100 text-green-700 animate-bounce' : 'bg-red-100 text-red-700 animate-pulse'}`}>
          {feedback}
        </div>
      )}

      {isGuessing && <GuessInput onGuess={handleGuess} />}
      
      {isGuessing && (
        <button 
          onClick={skipImage}
          className="mt-4 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          Skip this image
        </button>
      )}
    </div>
  );
}