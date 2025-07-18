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

  return (
    <form onSubmit={handleUpload} className="max-w-2xl mx-auto p-4 space-y-4">
      <div>
        <label className="block font-bold mb-1">Model Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setModelFile(e.target.files[0])}
          className="w-full"
        />
      </div>

      <div>
        <label className="block font-bold mb-1">Clothing Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setClothingFile(e.target.files[0])}
          className="w-full"
        />
      </div>

      <button
        type="submit"
        className="bg-secondary text-primary font-bold px-4 py-2"
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {error && <p className="text-red-600 font-bold">{error}</p>}

      {images && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="font-bold mb-2">Model – Front View</p>
            <img
              src={`data:image/png;base64,${images.frontModel}`}
              alt="Model Front"
              className="w-full h-auto rounded"
            />
          </div>

          <div>
            <p className="font-bold mb-2">Model – Back View</p>
            <img
              src={`data:image/png;base64,${images.backModel}`}
              alt="Model Back"
              className="w-full h-auto rounded"
            />
          </div>

          <div>
            <p className="font-bold mb-2">Clothing – Front View</p>
            <img
              src={`data:image/png;base64,${images.frontClothing}`}
              alt="Clothing Front"
              className="w-full h-auto rounded"
            />
          </div>

          <div>
            <p className="font-bold mb-2">Clothing – Back View</p>
            <img
              src={`data:image/png;base64,${images.backClothing}`}
              alt="Clothing Back"
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}
    </form>
  );
}
