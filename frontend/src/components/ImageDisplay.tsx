import { useState, useEffect } from 'react';

interface ImageDisplayProps {
  imageUrl: string;
  difficulty: string;
}

export default function ImageDisplay({ imageUrl, difficulty }: ImageDisplayProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  // Determine scale based on difficulty. Harder = more zoomed in (showing smaller part).
  // Let's say Easy is 200% zoom, Medium is 400% zoom, Hard is 800% zoom.
  const scale = difficulty === 'Easy' ? 2 : difficulty === 'Medium' ? 4 : difficulty === 'Hard' ? 8 : 3;

  useEffect(() => {
    // Randomize the background position each time the image changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPosition({
      x: Math.floor(Math.random() * 101),
      y: Math.floor(Math.random() * 101)
    });
  }, [imageUrl]);

  return (
    <div
      className="image-display-container w-64 h-64 md:w-96 md:h-96 rounded-xl shadow-lg border-4 border-white overflow-hidden mx-auto my-6 bg-gray-200"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundPosition: `${position.x}% ${position.y}%`,
        backgroundSize: `${scale * 100}%`,
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* The actual image is shown via background to make cropping easy */}
    </div>
  );
}
