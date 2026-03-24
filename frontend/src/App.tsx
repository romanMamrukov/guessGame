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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans text-gray-800">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-2xl text-center border border-indigo-50">
          <div className="mb-8">
             <span className="text-5xl mb-4 block">🔍</span>
             <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">Guess That Object</h1>
             <p className="mt-3 text-gray-500 font-medium">How good are your eyes?</p>
          </div>
          
          <form onSubmit={handleSetUsername} className="space-y-6">
            <div className="text-left">
              <label className="block text-sm font-bold text-gray-700 mb-2">Choose your Player Name:</label>
              <input 
                name="username"
                type="text" 
                className="w-full p-4 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg"
                placeholder="e.g. MasterGuesser99"
                required
              />
            </div>
            <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 text-lg">
              Start Playing
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/50 py-8 px-4 font-sans text-gray-800 flex flex-col items-center">
      
      {/* Top Banner Ad Placeholder */}
      <div className="w-full max-w-4xl h-24 bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-mono text-sm rounded-lg mb-8">
        [ Advertisement Banner 728x90 ]
      </div>

      <header className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight cursor-pointer hover:opacity-80 transition" onClick={() => { setGameStarted(false); setShowUpload(false); setShowLeaderboard(false); }}>
            Guess <span className="text-gray-800">That Object</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-semibold text-sm border border-indigo-100">
            👤 {username}
          </div>
          {!gameStarted && !showUpload && !showLeaderboard && (
             <button 
               onClick={() => { localStorage.removeItem('guessing_game_username'); setUsername(null); }}
               className="text-sm px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-full font-medium transition"
             >
               Logout
             </button>
          )}
        </div>
      </header>

      <div className="w-full max-w-4xl mx-auto flex-1">
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
          <div className="max-w-md mx-auto bg-white p-10 rounded-2xl shadow-xl mt-10 text-center border border-gray-100">
             <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Game Over!</h2>
            <p className="text-gray-500 mb-6">Great job, {username}!</p>
            
            <div className="text-2xl mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100 shadow-inner">
              Score: <span className="text-5xl font-extrabold text-blue-600 block mt-2">{finalScore} <span className="text-2xl text-blue-400">/ {gameSettings.rounds}</span></span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button 
                onClick={async () => {
                  const text = `I just scored ${finalScore} / ${gameSettings.rounds} in Guess That Object. Can you beat my score?`;
                  if (navigator.share) await navigator.share({ title: 'Guess That Object', text, url: window.location.href });
                  else { await navigator.clipboard.writeText(text); alert('Score copied to clipboard!'); }
                }}
                className="flex-1 py-4 bg-blue-100 text-blue-700 font-bold rounded-xl shadow-sm hover:bg-blue-200 hover:-translate-y-0.5 transition-all duration-200 text-lg flex justify-center items-center gap-2"
              >
                Share Score 📤
              </button>
              <button 
                onClick={() => setFinalScore(null)}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 text-lg flex justify-center items-center gap-2"
              >
                Play Again 🔄
              </button>
            </div>
          </div>
        )}
      </div>

       {/* Bottom Ad Placeholder */}
       <div className="w-full max-w-4xl h-64 bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-mono text-sm rounded-lg mt-12 mb-4">
        [ Advertisement Square 300x250 ]
      </div>

    </div>
  );
}

export default App;