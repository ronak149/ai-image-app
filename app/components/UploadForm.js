'use client';

import { useState } from 'react';
import OpenAI from "openai";

export default function UploadForm() {
  const [modelImage, setModelImage] = useState(null);
  const [itemImage, setItemImage] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  

// const openai = new OpenAI({
//   apiKey: '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',
//   dangerouslyAllowBrowser: true
// });

// const test = async () => {
//   const response = await openai.responses.create({
//     model: "gpt-4.1-mini",
//     input: [
//         {
//             role: "user",
//             content: [
//                 { type: "input_text", text: "You are analyzing an image that contains a single fashion model. Focus entirely on summarizing the model’s visible physical characteristics and do not describe any clothing, accessories, or background elements. Your task is to provide a detailed and objective description of the model to enable visual reconstruction. Include only what is clearly visible in the image. Describe the model’s skin tone and undertone, overall body build such as slim, athletic, or broad, visible face shape, jawline structure, and hair color, length, and style. If visible, include distinct features such as facial marks, freckles, scars, or tattoos. Avoid assumptions or inferred details. Do not describe clothing, pose, mood, personality, or background. Do not include creative or imaginative content. Only return clear, specific, and fact-based visual attributes based on what is shown in the image of the model." },
//                 {
//                     type: "input_image",
//                     image_url:
//                         "https://img.freepik.com/free-psd/portrait-young-man-with-afro-dreadlocks-hairstyle_23-2150164396.jpg",
//                 },
//             ],
//         },
//     ],
// });
// console.log(response.output_text);
// }
// test();

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

    if (!modelImage || !itemImage) {
      setError('Please upload both images.');
      return;
    }

    const formData = new FormData();
    formData.append('model', modelImage);
    formData.append('clothing', itemImage);

    setLoading(true);
    setError('');
    setImages([]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Image generation failed.');
      }

      setImages([data.frontImageUrl, data.backImageUrl]);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
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
          <div className="w-24 h-24 bg-gray-300 rounded-md" />
          <div className="w-24 h-24 bg-gray-300 rounded-md" />
        </div>
      )}

      {!loading && images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img}
                alt={`Generated ${i + 1}`}
                className="rounded-md border"
              />
              <a
                href={img}
                download={`generated-${i + 1}.png`}
                className="absolute bottom-2 right-2 text-md text-white bg-black/60 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
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
