import { OpenAI, toFile } from 'openai';
import { buildTryOnPrompt } from '../../lib/promptBuilder';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const modelImage = formData.get('model');
    const clothingImage = formData.get('clothing');

    if (!modelImage || !clothingImage) {
      return new Response(JSON.stringify({ error: 'Both model and clothing images are required' }), {
        status: 400
      });
    }

    // Convert to OpenAI file objects using `toFile()`
    const modelFile = await toFile(modelImage, modelImage.name || 'model.png', {
      type: modelImage.type || 'image/png'
    });

    const clothingFile = await toFile(clothingImage, clothingImage.name || 'clothing.png', {
      type: clothingImage.type || 'image/png'
    });

    const inputImages = [modelFile, clothingFile];

    // Build prompts (no need to analyze image)
    const frontPrompt = buildTryOnPrompt({
      view: 'front',
      clothingDescription: '',
      personDescription: ''
    });

    const backPrompt = buildTryOnPrompt({
      view: 'back',
      clothingDescription: '',
      personDescription: ''
    });

    // 🔁 Generate front view image
    const frontRes = await openai.images.edit({
      model: 'gpt-image-1',
      image: inputImages,
      prompt: frontPrompt
    });

    const frontImageBase64 = frontRes.data[0]?.b64_json;

    // 🔁 Generate back view image
    const backRes = await openai.images.edit({
      model: 'gpt-image-1',
      image: inputImages,
      prompt: backPrompt
    });

    const backImageBase64 = backRes.data[0]?.b64_json;

    if (!frontImageBase64 || !backImageBase64) {
      return new Response(JSON.stringify({ error: 'Image generation failed' }), { status: 500 });
    }

    // Return base64 images to frontend
    return new Response(
      JSON.stringify({ frontImageBase64, backImageBase64 }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate images' }), {
      status: 500
    });
  }
}
