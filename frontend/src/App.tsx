import { useState } from 'react';
import Menu from './components/Menu';
import GameBoard from './components/GameBoard';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameSettings, setGameSettings] = useState({ category: '', difficulty: '', rounds: 5 });
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const startGame = (category: string, difficulty: string, rounds: number) => {
    setGameSettings({ category, difficulty, rounds });
    setGameStarted(true);
    setFinalScore(null);
  };

  const handleGameEnd = (score: number) => {
    setFinalScore(score);
    setGameStarted(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans text-gray-800">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 tracking-tight">
          Guess <span className="text-gray-800">That Object</span>
        </h1>
        <p className="mt-2 text-gray-500">How good are your eyes?</p>
      </header>

      {!gameStarted && finalScore === null && <Menu onStartGame={startGame} />}
      
      {gameStarted && (
        <GameBoard
          category={gameSettings.category}
          difficulty={gameSettings.difficulty}
          rounds={gameSettings.rounds}
          onGameEnd={handleGameEnd}
        />
      )}
      
      {finalScore !== null && (
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-10 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Game Over!</h2>
          <div className="text-xl mb-6">
            Your Final Score: <span className="text-3xl font-extrabold text-blue-600">{finalScore}</span> / {gameSettings.rounds}
          </div>
          <button 
            onClick={() => setFinalScore(null)}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App;