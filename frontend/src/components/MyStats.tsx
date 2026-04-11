import { useState, useEffect } from 'react';
import { fetchUserUploads } from '../services/api';

interface MyStatsProps {
  username: string;
  onBack: () => void;
}

export default function MyStats({ username, onBack }: MyStatsProps) {
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserUploads(username)
      .then(data => {
        setUploads(data || []);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mt-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">My Upload Stats</h2>
        <button 
          onClick={onBack}
          className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          Back to Menu
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 font-medium">Loading your stats...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
      ) : uploads.length === 0 ? (
        <div className="text-center py-10 text-gray-500 font-medium bg-gray-50 rounded-xl">
          You haven't uploaded any objects yet.
        </div>
      ) : (
        <div className="space-y-6">
          {uploads.map((item, idx) => {
            const totalTries = (item.stat_1st_try || 0) + (item.stat_2nd_try || 0) + (item.stat_3rd_try || 0) + (item.stat_wrong || 0) + (item.stat_skip || 0);
            
            return (
              <div key={idx} className="flex flex-col sm:flex-row gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-full sm:w-32 h-32 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                  <img src={item.imagePath || item.imagepath} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 capitalize mb-1">{item.name}</h3>
                  <div className="text-sm text-gray-500 mb-4">{item.category} • {item.difficulty}</div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <StatBox label="1st Try" value={item.stat_1st_try} color="emerald" />
                    <StatBox label="2nd Try" value={item.stat_2nd_try} color="blue" />
                    <StatBox label="3rd+ Try" value={item.stat_3rd_try} color="indigo" />
                    <StatBox label="Wrong" value={item.stat_wrong} color="rose" />
                    <StatBox label="Skipped" value={item.stat_skip} color="gray" />
                  </div>
                  <div className="mt-2 text-xs text-gray-400 font-medium text-right">Total interactions: {totalTries}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string, value: number, color: string }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    indigo: "bg-indigo-100 text-indigo-700",
    rose: "bg-rose-100 text-rose-700",
    gray: "bg-gray-200 text-gray-700",
  };
  
  return (
    <div className={`flex flex-col items-center justify-center p-2 rounded-lg ${colorMap[color] || colorMap.gray}`}>
      <span className="text-xs font-bold uppercase opacity-80">{label}</span>
      <span className="text-xl font-extrabold">{value || 0}</span>
    </div>
  );
}
