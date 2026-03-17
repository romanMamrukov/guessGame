import React, { useState } from 'react';
import { uploadObject } from '../services/api';

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
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
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="e.g., Golden Retriever"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <input 
              type="text" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Animals"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
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
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
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
            <p className="text-sm text-gray-500 mb-2">Preview:</p>
            <div className="w-full h-48 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
              <img src={preview} alt="Upload preview" className="max-h-full object-contain" />
            </div>
          </div>
        )}

        <button 
          type="submit"
          disabled={isUploading}
          className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
        >
          {isUploading ? 'Uploading...' : 'Save Image Securely'}
        </button>
      </form>
    </div>
  );
}
