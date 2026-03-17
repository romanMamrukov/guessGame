import { useState, useEffect } from 'react';
import { fetchLeaderboard } from '../services/api';

interface UserScore {
  username: string;
  total_score: number;
  games_played: number;
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard().then((data) => {
      setLeaders(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Global Leaderboard</h2>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : leaders.length === 0 ? (
        <p className="text-center text-gray-500">No scores yet. Be the first!</p>
      ) : (
        <ul className="space-y-4">
          {leaders.map((user, index) => (
            <li key={user.username} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded">
              <span className="font-semibold text-gray-700">
                <span className="text-sm text-gray-400 mr-2">#{index + 1}</span>
                {user.username}
              </span>
              <div className="text-right">
                <div className="font-bold text-blue-600">{user.total_score} pts</div>
                <div className="text-xs text-gray-400">{user.games_played} games</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
