import React, { useState, useRef, useEffect } from 'react';
import { uploadObject, fetchCategories } from '../services/api';

interface ImageUploadProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ImageUpload({ onSuccess, onCancel }: ImageUploadProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [info, setInfo] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // Masking state
  const [masks, setMasks] = useState<{ x: number, y: number, w: number, h: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories().then(setAvailableCategories).catch(console.error);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setMasks([]);
      setError('');
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentBox(null);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    const curX = Math.max(0, Math.min(x, 100));
    const curY = Math.max(0, Math.min(y, 100));

    setCurrentBox({
      x: Math.min(startPos.x, curX),
      y: Math.min(startPos.y, curY),
      w: Math.abs(curX - startPos.x),
      h: Math.abs(curY - startPos.y)
    });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentBox && currentBox.w > 1 && currentBox.h > 1) {
      setMasks([...masks, currentBox]);
    }
    setIsDrawing(false);
    setCurrentBox(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !imageFile) {
      setError('Please fill in all required fields and select an image.');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('difficulty', difficulty);
      formData.append('info', info);
      formData.append('specific_areas', JSON.stringify(masks));
      formData.append('uploader', localStorage.getItem('guessing_game_username') || '');
      formData.append('image', imageFile);

      await uploadObject(formData);

      setSuccess('Image successfully uploaded securely to the cloud!');
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to save image.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Upload Custom Image</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer (Name) *</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="e.g., Golden Retriever"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <input 
              type="text" 
              list="category-options"
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Animals"
              required
            />
            <datalist id="category-options">
              {availableCategories.map(cat => <option key={cat} value={cat} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">More Info (Fun Fact)</label>
          <textarea 
            value={info} 
            onChange={(e) => setInfo(e.target.value)}
            className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            rows={3}
            placeholder="e.g., Golden Retrievers are known for their intelligence..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image File *</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required
          />
        </div>

        {preview && (
          <div className="mt-4">
            <p className="text-sm font-bold text-gray-700 mb-2">Image Masking (Optional):</p>
            <p className="text-xs text-gray-500 mb-2">Click and drag over sensitive areas (like license plates or brand logos) to hide them from players.</p>
            <div 
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              className="relative w-full rounded border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden cursor-crosshair select-none"
              style={{ touchAction: 'none' }}
            >
              <img src={preview} alt="Upload preview" className="w-full h-auto block pointer-events-none" />
              
              {masks.map((m, i) => (
                <div 
                  key={i} 
                  className="absolute bg-gray-900 border-2 border-white/50"
                  style={{ left: `${m.x}%`, top: `${m.y}%`, width: `${m.w}%`, height: `${m.h}%` }}
                />
              ))}
              
              {currentBox && (
                <div 
                  className="absolute bg-black/50 border-2 border-dashed border-red-500"
                  style={{ left: `${currentBox.x}%`, top: `${currentBox.y}%`, width: `${currentBox.w}%`, height: `${currentBox.h}%` }}
                />
              )}
            </div>
            {masks.length > 0 && (
              <div className="mt-3 flex items-center gap-6">
                <button type="button" onClick={() => setMasks(masks.slice(0, -1))} className="text-sm text-indigo-600 font-bold hover:text-indigo-800 transition">
                  ↩ Undo Last Mark
                </button>
                <button type="button" onClick={() => setMasks([])} className="text-sm text-rose-500 font-medium hover:text-rose-700 transition">
                  ⟲ Clear All ({masks.length})
                </button>
              </div>
            )}
          </div>
        )}

        <button 
          type="submit"
          disabled={isUploading}
          className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition duration-200 disabled:opacity-70 text-lg flex justify-center"
        >
          {isUploading ? 'Uploading...' : 'Save & Upload'}
        </button>
      </form>
    </div>
  );
}
