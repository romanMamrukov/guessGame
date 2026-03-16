import { useEffect, useState } from 'react';
import { fetchCategories, fetchDifficulties } from '../services/api';

interface MenuProps {
  onStartGame: (category: string, difficulty: string, rounds: number) => void;
}

export default function Menu({ onStartGame }: MenuProps) {
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
    <div className="menu max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Game Setup</h2>
      
      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-700">Category</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border border-gray-300 rounded bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-700">Difficulty</label>
          <select 
            value={selectedDifficulty} 
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="p-2 border border-gray-300 rounded bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {difficulties.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Difficulty affects how much of the image you see.</p>
        </div>

        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-700">Rounds</label>
          <input
            type="number"
            min={1}
            max={20}
            value={rounds}
            onChange={(e) => setRounds(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button 
          onClick={handleStart}
          className="w-full py-3 mt-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}