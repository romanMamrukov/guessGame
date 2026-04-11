const API_BASE = 'https://guessgame-x7zs.onrender.com/api';

export interface ImageObject {
  id?: number | string;
  imageUrl: string;
  answer: string;
  category: string;
  difficulty?: string;
  info?: string;
  specific_areas?: any;
}

export async function fetchNextImage(category?: string, difficulty?: string) {
  let url = `${API_BASE}/images?`;
  if (category && category !== 'All Categories') url += `category=${encodeURIComponent(category)}&`;
  if (difficulty) url += `difficulty=${encodeURIComponent(difficulty)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch image');
  const data = await res.json();
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
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchDifficulties() {
  return ['Easy', 'Medium', 'Hard'];
}

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
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function uploadObject(formData: FormData) {
  const res = await fetch(`${API_BASE}/objects`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to upload object');
  }
  return res.json();
}

export async function pingServer() {
  try {
    await fetch(`${API_BASE}/health`);
  } catch (err) {
    // ignore
  }
}

export async function recordObjectStat(id: number | string, statType: 'stat_1st_try' | 'stat_2nd_try' | 'stat_3rd_try' | 'stat_wrong' | 'stat_skip') {
  const res = await fetch(`${API_BASE}/objects/${id}/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statType })
  });
  return res.json();
}

export async function fetchUserUploads(username: string) {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}/uploads`);
  if (!res.ok) throw new Error('Failed to fetch user uploads');
  return res.json();
}