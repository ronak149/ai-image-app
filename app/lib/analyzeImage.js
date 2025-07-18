// lib/analyzeImage.js
import fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const clothingAnalysisPrompt = `You are analyzing an image that contains only one clothing item. Focus entirely on the clothing item and ignore everything else. Do not describe the background, model, mannequin, or any environmental details. Your goal is to produce an accurate and detailed description of the clothing item so it can be digitally recreated with precision. Only describe what is visually and clearly present. Include all visible colors and their placement, the material or fabric type if identifiable, the design patterns or visual textures, the structure and shape of the garment including neckline, sleeve length, hem or other construction details, the type of clothing such as t-shirt, blouse, gown, jacket, skirt, trousers, or shorts, and any logos, icons, stitching, or embroidery. Do not infer or hallucinate unseen features. Do not describe the background. Do not assume brand, trend, or use-case. Return only a detailed visual description of the clothing. Also make sure the description generated has all the safe words and does not violate the prompt policy. If you cannot recognize the clothing piece in the image only return false (no-text just the false flag as a string)`;

const personAnalysisPrompt = `You are analyzing an image that contains a single person. Focus only on the physical appearance of the person. Do not describe clothing, accessories, background, objects, or lighting. Your task is to extract a complete and accurate physical description of the person for visual recreation. Include visible tones and undertone, body build such as slim, athletic, or broad, face shape and jawline structure, hair color, length, and styling, and any visible identifying features such as freckles, facial hair, birthmarks, scars, or tattoos. Only describe what is visually clear in the image. Do not infer or invent features that are not visible. Do not speculate about personality, identity, mood, or profession. Do not describe the background or surroundings. Also make sure the description generated has all the safe words and does not violate the prompt policy. If you cannot recognize the clothing piece in the image only return false (no-text just the false flag as a string)`;

export async function analyzeImage(imageBuffer, type = 'model') {
  const prompt = type === 'clothing' ? clothingAnalysisPrompt : personAnalysisPrompt;

  const base64Image = imageBuffer.toString('base64');
  const mimeType = 'image/png';

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    temperature: 0.4,
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
  });

  return response.choices[0].message.content;
}
