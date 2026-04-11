import { useEffect, useState } from 'react';
import { fetchCategories, fetchDifficulties } from '../services/api';

interface MenuProps {
  onStartGame: (category: string, difficulty: string, rounds: number) => void;
  onNavigateUpload: () => void;
  onNavigateLeaderboard: () => void;
  onNavigateStats: () => void;
}

export default function Menu({ onStartGame, onNavigateUpload, onNavigateLeaderboard, onNavigateStats }: MenuProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [rounds, setRounds] = useState(5);

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchDifficulties().then((diff) => {
      setDifficulties(diff);
      if (diff.includes('Medium')) setSelectedDifficulty('Medium');
      else if (diff.length) setSelectedDifficulty(diff[0]);
    });
  }, []);

  const handleStart = () => {
    onStartGame(selectedCategory, selectedDifficulty, rounds);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mt-4">
      <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-800 flex items-center justify-center gap-2">
        Game Setup
      </h2>
      
      <div className="space-y-5">
        <div className="flex flex-col">
          <label className="mb-2 font-bold text-gray-700 text-sm uppercase tracking-wide">Category</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-2 font-bold text-gray-700 text-sm uppercase tracking-wide">Difficulty</label>
          <select 
            value={selectedDifficulty} 
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="p-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
          >
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2 font-medium">Difficulty affects how much of the image you see.</p>
        </div>

        <div className="flex flex-col">
          <label className="mb-2 font-bold text-gray-700 text-sm uppercase tracking-wide">Rounds</label>
          <input
            type="number"
            min={1}
            max={20}
            value={rounds}
            onChange={(e) => setRounds(parseInt(e.target.value))}
            className="p-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        <button 
          onClick={handleStart}
          className="w-full py-4 mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 text-lg flex justify-center"
        >
          Play Now
        </button>

        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
          <button 
            onClick={onNavigateUpload}
            className="py-3 bg-gray-50 text-gray-700 font-bold flex items-center justify-center gap-2 rounded-xl hover:bg-gray-100 border border-gray-200 transition duration-200 text-sm"
          >
            Upload
          </button>
          
          <button 
            onClick={onNavigateLeaderboard}
            className="py-3 bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center gap-2 rounded-xl hover:bg-indigo-100 border border-indigo-100 transition duration-200 text-sm"
          >
            Rankings
          </button>

          <button 
            onClick={onNavigateStats}
            className="py-3 bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center gap-2 rounded-xl hover:bg-emerald-100 border border-emerald-100 transition duration-200 text-sm"
          >
            My Stats
          </button>
        </div>
      </div>
    </div>
  );
}