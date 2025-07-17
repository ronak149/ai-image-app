'use client';
import { useState } from 'react';
import ImageDisplay from './ImageDisplay';

export default function UploadForm() {
  const [modelImage, setModelImage] = useState(null);
  const [itemImage, setItemImage] = useState(null);
  const [resultImages, setResultImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!modelImage || !itemImage) {
      setError('Please upload both images');
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('model', modelImage);
    formData.append('item', itemImage);

    try {
      const res = await fetch('/api/process-images', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setResultImages(data.images || []);
    } catch (err) {
      setError('Failed to process images.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setModelImage(e.target.files[0])}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setItemImage(e.target.files[0])}
      />
      <button
        onClick={handleUpload}
        className="bg-black text-white py-2 px-4 rounded"
      >
        {loading ? 'Processing...' : 'Generate Images'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {resultImages.length > 0 && <ImageDisplay images={resultImages} />}
    </div>
  );
}
