'use client';

import { useState } from 'react';

export default function UploadForm() {
  const [modelImage, setModelImage] = useState(null);
  const [itemImage, setItemImage] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      setter(file);
    } else {
      alert('Image must be less than 2MB.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setImages([]);

    try {
      const formData = new FormData();
      formData.append('model', modelImage);
      formData.append('clothing', itemImage);

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        const base64Images = [
          `data:image/png;base64,${data.frontImageBase64}`,
          `data:image/png;base64,${data.backImageBase64}`
        ];
        setImages(base64Images);
      } else {
        setError(data.error || 'Image generation failed.');
      }
    } catch (err) {
      setError('Failed to process images.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label className="block text-lg font-semibold mb-2">Model Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setModelImage)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold mb-2">Clothing Item</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setItemImage)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#B4A29B] text-white py-2 rounded font-bold hover:bg-[#a89891] transition"
        >
          {loading ? 'Generating...' : 'Generate Images'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4 text-md">{error}</p>}

      {loading && (
        <div className="flex justify-center mt-6 animate-pulse space-x-4">
          <div className="w-32 h-32 bg-gray-300 rounded-md" />
          <div className="w-32 h-32 bg-gray-300 rounded-md" />
        </div>
      )}

      {!loading && images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img}
                alt={`Generated ${i + 1}`}
                className="rounded-md border w-full object-cover max-w-[400px]"
              />
              <a
                href={img}
                download={`generated-${i + 1}.png`}
                className="absolute bottom-2 right-2 text-sm text-white bg-black/60 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
