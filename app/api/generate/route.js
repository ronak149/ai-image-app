import { OpenAI } from 'openai';
import { buildTryOnPrompt } from '../../lib/promptBuilder';
import { analyzeImage } from '../../lib/analyzeImage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const modelImage = formData.get('model');
    const clothingImage = formData.get('clothing');

    const modelBuffer = Buffer.from(await modelImage.arrayBuffer());
    const clothingBuffer = Buffer.from(await clothingImage.arrayBuffer());

    if (!modelImage || !clothingImage) {
      return new Response(JSON.stringify({ error: 'Both model and clothing images are required' }), {
        status: 400
      });
    }

    const clothingDescription = await analyzeImage(clothingBuffer, 'clothing');
    const personDescription = await analyzeImage(modelBuffer, 'model');

    if (!clothingBuffer || !modelBuffer) {
      return new Response(JSON.stringify({ error: 'Could not recognize the image' }), { status: 500 });
    }

    const frontPrompt = buildTryOnPrompt({
      view: 'front',
      clothingDescription,
      personDescription
    });

    const backPrompt = buildTryOnPrompt({
      view: 'back',
      clothingDescription,
      personDescription
    });

    // 🔁 Front View Generation
    const frontRes = await openai.images.generate({
      model: 'dall-e-3',
      prompt: frontPrompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url'
    });

    const frontImageUrl = frontRes.data[0]?.url;
    console.log(frontImageUrl);

    // 🔁 Back View Generation
    const backRes = await openai.images.generate({
      model: 'dall-e-3',
      prompt: backPrompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url'
    });

    const backImageUrl = backRes.data[0]?.url;
    console.log(frontImageUrl);

    if (!frontImageUrl || !backImageUrl) {
      return new Response(JSON.stringify({ error: 'Image generation failed' }), { status: 500 });
    }

    return new Response(
      JSON.stringify({ frontImageUrl, backImageUrl }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate images' }), {
      status: 500
    });
  }
}
