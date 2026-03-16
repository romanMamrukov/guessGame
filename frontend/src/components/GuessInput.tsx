import { useState } from 'react';

interface GuessInputProps {
  onGuess: (guess: string) => void;
  disabled?: boolean;
}

export default function GuessInput({ onGuess, disabled }: GuessInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onGuess(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 justify-center my-4 w-full px-4">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your guess..."
        disabled={disabled}
        className="px-4 py-2 text-lg rounded-lg border-2 border-gray-300 bg-white text-gray-800 focus:border-blue-500 focus:outline-none w-full max-w-xs shadow-sm"
        autoFocus
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="px-6 py-2 text-lg rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md transition-colors"
      >
        Guess
      </button>
    </form>
  );
}
