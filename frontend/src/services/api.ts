// Mock data for MVP
const MOCK_CATEGORIES = ['Animals', 'Vehicles', 'Fruits'];
const MOCK_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const MOCK_IMAGES = [
  { id: 1, imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&q=80', answer: 'lion', category: 'Animals' },
  { id: 2, imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&q=80', answer: 'dog', category: 'Animals' },
  { id: 3, imageUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80', answer: 'car', category: 'Vehicles' },
  { id: 4, imageUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457ab8bb?w=800&q=80', answer: 'bicycle', category: 'Vehicles' },
  { id: 5, imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6caa6?w=800&q=80', answer: 'apple', category: 'Fruits' },
  { id: 6, imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=800&q=80', answer: 'banana', category: 'Fruits' },
  { id: 7, imageUrl: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800&q=80', answer: 'strawberry', category: 'Fruits' },
  { id: 8, imageUrl: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=800&q=80', answer: 'puppy', category: 'Animals' },
  { id: 9, imageUrl: 'https://images.unsplash.com/photo-1473283147055-e39c51470700?w=800&q=80', answer: 'motorcycle', category: 'Vehicles' },
  { id: 10, imageUrl: 'https://images.unsplash.com/photo-1437622368342-7a3d73a40c75?w=800&q=80', answer: 'turtle', category: 'Animals' },
];

export async function fetchNextImage(category?: string, difficulty?: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let available = MOCK_IMAGES;
  if (category && category !== '') {
    available = available.filter(img => img.category === category);
  }
  
  if (available.length === 0) {
    available = MOCK_IMAGES; // fallback if category has no images
  }
  
  // We mock difficulty usage by just pretending we fetch based on it
  if (difficulty) {
    // In a real app we might filter images suitable for 'Hard'
  }
  
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

export async function submitGuess(guess: string, correctAnswer: string) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const isCorrect = guess.trim().toLowerCase() === correctAnswer.toLowerCase();
  return { correct: isCorrect };
}

export async function fetchCategories() {
  return Promise.resolve(MOCK_CATEGORIES);
}

export async function fetchDifficulties() {
  return Promise.resolve(MOCK_DIFFICULTIES);
}