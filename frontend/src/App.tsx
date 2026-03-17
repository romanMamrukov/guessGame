import { useState } from 'react';
import Menu from './components/Menu';
import GameBoard from './components/GameBoard';
import Leaderboard from './components/Leaderboard';
import { registerUser } from './services/api';

function App() {
  const [username, setUsername] = useState<string | null>(localStorage.getItem('guessGameUser'));
  const [inputName, setInputName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameSettings, setGameSettings] = useState({ category: '', difficulty: '', rounds: 5 });
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    try {
      const user = await registerUser(inputName.trim());
      localStorage.setItem('guessGameUser', user.username);
      setUsername(user.username);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('guessGameUser');
    setUsername(null);
    setGameStarted(false);
    setShowLeaderboard(false);
  };

  const startGame = (category: string, difficulty: string, rounds: number) => {
    setGameSettings({ category, difficulty, rounds });
    setGameStarted(true);
    setFinalScore(null);
  };

  const handleGameEnd = (score: number) => {
    setFinalScore(score);
    setGameStarted(false);
  };

  if (!username) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Welcome to Guess That Object!</h2>
          <label className="block mb-2 font-semibold text-gray-700">Enter your username:</label>
          <input 
            type="text" 
            value={inputName}
            onChange={e => setInputName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Username"
            required
          />
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-200">
            Start Playing
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans text-gray-800 relative">
      <div className="absolute top-4 right-4 flex space-x-4">
        <span className="font-semibold text-gray-600 self-center">Welcome, {username}</span>
        <button onClick={() => setShowLeaderboard(!showLeaderboard)} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
          {showLeaderboard ? 'Back to Game' : 'Leaderboard'}
        </button>
        <button onClick={handleLogout} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition">
          Logout
        </button>
      </div>

      <header className="text-center mb-8 pt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 tracking-tight">
          Guess <span className="text-gray-800">That Object</span>
        </h1>
        <p className="mt-2 text-gray-500">How good are your eyes?</p>
      </header>

      {showLeaderboard ? (
        <Leaderboard />
      ) : (
        <>
          {!gameStarted && finalScore === null && <Menu onStartGame={startGame} />}
          
          {gameStarted && (
            <GameBoard
              username={username}
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
        </>
      )}
    </div>
  );
}

export default App;