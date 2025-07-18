'use client';
import { useState } from 'react';

export default function UploadForm() {
  const [modelFile, setModelFile] = useState(null);
  const [clothingFile, setClothingFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!modelFile || !clothingFile) return;

    setLoading(true);
    setError(null);
    setImages(null);

    const formData = new FormData();
    formData.append('model', modelFile);
    formData.append('clothing', clothingFile);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setImages({
        frontModel: data.frontImageBase64,
        backModel: data.backImageBase64,
        frontClothing: data.clothingFrontBase64,
        backClothing: data.clothingBackBase64,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (base64, filename) => {
    const a = document.createElement('a');
    a.href = `data:image/png;base64,${base64}`;
    a.download = filename;
    a.click();
  };

  return (
    <div className="p-4">
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setModelFile(e.target.files[0])}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setClothingFile(e.target.files[0])}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-secondary text-primary font-bold px-4 py-2"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
        {error && <p className="text-red-600 font-bold">{error}</p>}
      </form>

      {images && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: 'Model – Front View', key: 'frontModel' },
            { label: 'Model – Back View', key: 'backModel' },
            { label: 'Clothing – Front View', key: 'frontClothing' },
            { label: 'Clothing – Back View', key: 'backClothing' },
          ].map(({ label, key }) => (
            <div key={key} className="relative">
              <p className="font-bold mb-2">{label}</p>
              <img
                src={`data:image/png;base64,${images[key]}`}
                alt={label}
                className="w-full h-auto rounded"
              />
              <button
                type="button"
                onClick={() => downloadImage(images[key], `${label}.png`)}
                className="absolute top-2 right-2 bg-primary text-white rounded-full p-2 hover:bg-secondary focus:outline-none"
                aria-label={`Download ${label}`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
