const API_BASE = 'http://localhost:3000/api';

const MOCK_CATEGORIES = ['All Categories', 'Animals', 'Vehicles', 'Fruits'];
const MOCK_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export async function registerUser(username: string) {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  return res.json();
}

export async function updateScore(username: string, score: number) {
  const res = await fetch(`${API_BASE}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, score })
  });
  return res.json();
}

export async function fetchLeaderboard() {
  const res = await fetch(`${API_BASE}/leaderboard`);
  return res.json();
}

export async function fetchNextImage(category?: string, difficulty?: string) {
  let url = `${API_BASE}/images?`;
  if (category) url += `category=${encodeURIComponent(category)}&`;
  if (difficulty) url += `difficulty=${encodeURIComponent(difficulty)}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return null; // No images found
    throw new Error('Failed to fetch image');
  }
  const data = await res.json();
  data.imageUrl = `http://localhost:3000${data.imageUrl}`;
  return data;
}

export async function submitGuess(guess: string, correctAnswer: string) {
  const res = await fetch(`${API_BASE}/guess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guess, correctAnswer })
  });
  return res.json();
}

export async function fetchCategories() {
  return Promise.resolve(MOCK_CATEGORIES);
}

export async function fetchDifficulties() {
  return Promise.resolve(MOCK_DIFFICULTIES);
}