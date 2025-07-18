import { OpenAI, toFile } from 'openai';

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

    // 🔁 Generate front view image
    const frontRes = await openai.images.edit({
      model: 'gpt-image-1',
      image: inputImages,
      prompt: `Generate a realistic, high-resolution image of a model (reference image-1) wearing a specific clothing item (reference image-2), using only the provided reference images. The image should show the model from the front, wearing the exact clothing item from the second reference. Recreate the precise appearance, fit, and fabric behavior as seen in the clothing image. The model must retain all original features — face, skin tone, hairstyle, body type, posture, and proportions — exactly as shown in the model reference. Use neutral, light background with soft studio-style lighting. The composition must be clear and focused on the subject. Do not alter the clothing design, material, pattern, color, or cut. Do not add any accessories or props. Do not change the model’s appearance. Do not hallucinate new elements. Do not include text, branding, or irrelevant background content. The generated image must closely resemble the two references combined — the original model wearing the original clothing`.trim(),
    });

    const frontImageBase64 = frontRes.data[0]?.b64_json;

    // 🔁 Generate back view image
    const backRes = await openai.images.edit({
      model: 'gpt-image-1',
      image: inputImages,
      prompt:  `Generate a realistic, high-resolution image of a model wearing a specific clothing item provided in the reference image from the back (back view of the model (reference image 1) wearing clothing piece (reference image-2), based solely on the two reference images provided. Show the model’s back view while accurately reproducing the clothing item’s back details, structure, and fit. Maintain the exact skin tone, body shape, hair, and posture from the original model. Ensure the back side of the clothing is logically consistent with the front view design (as seen in the reference). The image should have a clean, light background and studio lighting. Focus only on recreating the correct form of the model wearing the outfit. Avoid generating any accessories, props, text, or extra elements. Do not change the clothing or the model in any way. Do not hallucinate or invent new design aspects. All elements must come only from the two reference images.`.trim(),
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
