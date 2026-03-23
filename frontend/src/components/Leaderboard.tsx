import { useState, useEffect } from 'react';
import { fetchLeaderboard } from '../services/api';

export default function Leaderboard({ onBack }: { onBack: () => void }) {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard()
      .then((data) => {
        setLeaders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load leaderboard', err);
        setError('Failed to connect to the leaderboard. Is the backend running?');
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          🏆 Leaderboard
        </h2>
        <button onClick={onBack} className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
          Back
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 py-4 px-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse w-full"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
          {error}
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="py-3 px-4 font-bold border-b">Rank</th>
                <th className="py-3 px-4 font-bold border-b">Player</th>
                <th className="py-3 px-4 font-bold border-b text-right">Score</th>
                <th className="py-3 px-4 font-bold border-b text-right hidden sm:table-cell">Games</th>
              </tr>
            </thead>
            <tbody>
              {leaders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">No players yet. Be the first!</td>
                </tr>
              ) : (
                leaders.map((user, idx) => (
                  <tr key={user.username} className={`border-b last:border-0 hover:bg-blue-50 transition ${idx < 3 ? 'bg-yellow-50/30' : ''}`}>
                    <td className="py-3 px-4 font-semibold text-gray-600">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-600">{user.username}</td>
                    <td className="py-3 px-4 text-right font-bold text-gray-800">{user.total_score}</td>
                    <td className="py-3 px-4 text-right text-gray-500 hidden sm:table-cell">{user.games_played}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
