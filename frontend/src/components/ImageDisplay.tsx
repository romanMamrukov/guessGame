import { useState, useEffect } from 'react';

interface ImageDisplayProps {
  imageUrl: string;
  difficulty: string;
  masks?: { x: number, y: number, w: number, h: number }[];
  isRevealed?: boolean;
}

export default function ImageDisplay({ imageUrl, difficulty, masks = [], isRevealed = false }: ImageDisplayProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  // scale 1 means seeing the full image (revealed state)
  const scale = isRevealed ? 1 : (difficulty === 'Easy' ? 2 : difficulty === 'Medium' ? 4 : difficulty === 'Hard' ? 8 : 3);

  useEffect(() => {
    // Randomize the background position each time the image changes
    setPosition({
      x: Math.floor(Math.random() * 101),
      y: Math.floor(Math.random() * 101)
    });
  }, [imageUrl]);

  return (
    <div className="image-display-container w-64 h-64 md:w-96 md:h-96 rounded-xl shadow-lg border-4 border-white overflow-hidden mx-auto my-6 bg-gray-200 relative flex items-center justify-center">
      <div 
        className="relative w-full flex items-center justify-center"
        style={{
          transformOrigin: `${position.x}% ${position.y}%`,
          transform: `scale(${scale})`,
          transition: 'transform 0.5s ease-out',
        }}
      >
        <div className="relative w-full">
           <img src={imageUrl} alt="Guess object" className="w-full h-auto block pointer-events-none" />
           {masks && masks.length > 0 && masks.map((m, i) => (
              <div 
                key={i} 
                className="absolute bg-gray-900 border border-white/30"
                style={{ left: `${m.x}%`, top: `${m.y}%`, width: `${m.w}%`, height: `${m.h}%` }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
