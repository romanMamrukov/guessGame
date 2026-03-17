import { useState, useEffect } from 'react';
import Menu from './components/Menu';
import GameBoard from './components/GameBoard';
import ImageUpload from './components/ImageUpload';
import Leaderboard from './components/Leaderboard';
import { updateScore, registerUser } from './services/api';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameSettings, setGameSettings] = useState({ category: '', difficulty: '', rounds: 5 });
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('guessing_game_username');
    if (savedName) setUsername(savedName);
  }, []);

  const handleSetUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nameInput = (form.elements.namedItem('username') as HTMLInputElement).value;
    if (nameInput.trim()) {
      try {
        await registerUser(nameInput.trim());
        localStorage.setItem('guessing_game_username', nameInput.trim());
        setUsername(nameInput.trim());
      } catch (err) {
        console.error("Failed to register user to cloud", err);
      }
    }
  };

  const startGame = (category: string, difficulty: string, rounds: number) => {
    setGameSettings({ category, difficulty, rounds });
    setGameStarted(true);
    setFinalScore(null);
  };

  const handleGameEnd = async (score: number) => {
    setFinalScore(score);
    setGameStarted(false);
    if (username) {
      try {
        await updateScore(username, score);
      } catch (err) {
        console.error("Failed to update score to cloud", err);
      }
    }
  };

  if (!username) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4 font-sans text-gray-800">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <h1 className="text-3xl font-extrabold text-blue-600 mb-6">Welcome to Guess That Object</h1>
          <form onSubmit={handleSetUsername} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Please enter your username to play:</label>
              <input 
                name="username"
                type="text" 
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="AwesomePlayer99"
                required
              />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-200">
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans text-gray-800">
      <header className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 tracking-tight cursor-pointer" onClick={() => { setGameStarted(false); setShowUpload(false); setShowLeaderboard(false); }}>
            Guess <span className="text-gray-800">That Object</span>
          </h1>
          <p className="mt-2 text-gray-500">Playing as: <span className="font-bold text-gray-700">{username}</span></p>
        </div>
        {!gameStarted && !showUpload && !showLeaderboard && (
           <button 
             onClick={() => { localStorage.removeItem('guessing_game_username'); setUsername(null); }}
             className="text-sm px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded transition"
           >
             Change User
           </button>
        )}
      </header>

      {!gameStarted && finalScore === null && !showUpload && !showLeaderboard && (
        <Menu 
          onStartGame={startGame} 
          onNavigateUpload={() => setShowUpload(true)} 
          onNavigateLeaderboard={() => setShowLeaderboard(true)} 
        />
      )}
      
      {showUpload && (
        <ImageUpload onSuccess={() => setShowUpload(false)} onCancel={() => setShowUpload(false)} />
      )}

      {showLeaderboard && (
        <Leaderboard onBack={() => setShowLeaderboard(false)} />
      )}
      
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