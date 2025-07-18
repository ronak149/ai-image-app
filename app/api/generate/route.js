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

    // ⬤ 1. MODEL + CLOTHING ➝ FRONT VIEW
    const frontTryOnRes = await openai.images.edit({
      model: 'gpt-image-1',
      image: [modelFile, clothingFile],
      prompt: `
Generate a realistic, high-resolution image of a model (reference image-1) wearing a specific clothing item (reference image-2), using only the provided reference images. The image should show the model from the front, wearing the exact clothing item from the second reference. Recreate the precise appearance, fit, and fabric behavior as seen in the clothing image. The model must retain all original features — face, skin tone, hairstyle, body type, posture, and proportions — exactly as shown in the model reference. Use neutral, light background with soft studio-style lighting. The composition must be clear and focused on the subject. Do not alter the clothing design, material, pattern, color, or cut. Do not add any accessories or props. Do not change the model’s appearance. Do not hallucinate new elements. Do not include text, branding, or irrelevant background content. The generated image must closely resemble the two references combined — the original model wearing the original clothing.
      `.trim()
    });

    const frontImageBase64 = frontTryOnRes.data[0]?.b64_json;

    // ⬤ 2. MODEL + CLOTHING ➝ BACK VIEW
    const backTryOnRes = await openai.images.edit({
      model: 'gpt-image-1',
      image: [modelFile, clothingFile],
      prompt: `
Generate a realistic, high-resolution image of a model wearing a specific clothing item provided in the reference image from the back (back view of the model (reference image 1) wearing clothing piece (reference image-2), based solely on the two reference images provided. Show the model’s back view while accurately reproducing the clothing item’s back details, structure, and fit. Maintain the exact skin tone, body shape, hair, and posture from the original model. Ensure the back side of the clothing is logically consistent with the front view design (as seen in the reference). The image should have a clean, light background and studio lighting. Focus only on recreating the correct form of the model wearing the outfit. Avoid generating any accessories, props, text, or extra elements. Do not change the clothing or the model in any way. Do not hallucinate or invent new design aspects. All elements must come only from the two reference images.
      `.trim()
    });

    const backImageBase64 = backTryOnRes.data[0]?.b64_json;

    // ⬤ 3. CLOTHING ONLY ➝ FRONT VIEW
    const frontClothingRes = await openai.images.edit({
      model: 'gpt-image-1',
      image: [clothingFile],
      prompt: `
Generate a realistic, high-resolution front view of a clothing item based entirely on the provided reference image. Recreate the garment exactly as shown — matching its material, color, pattern, texture, stitching, seams, logos, folds, and fabric structure. Ensure all visual elements are faithful to the reference with no additions or stylistic alterations. Present the item isolated against a clean, neutral light background with soft studio-style lighting. Center the clothing in the frame with even spacing and no cropping. Do not add mannequins, models, shadows, text, logos, props, or background scenery. Do not hallucinate or enhance features beyond what is seen in the original reference. Focus on showing the garment clearly and accurately from the front, as it appears in the source image.
      `.trim()
    });

    const clothingFrontBase64 = frontClothingRes.data[0]?.b64_json;

    // ⬤ 4. CLOTHING ONLY ➝ BACK VIEW
    const backClothingRes = await openai.images.edit({
      model: 'gpt-image-1',
      image: [clothingFile],
      prompt: `
Generate a realistic, high-resolution back view of a clothing item based on the reference image provided. The image should accurately depict the reverse side of the same garment — preserving fabric type, shape, texture, patterns, stitching, and cut. Ensure logical consistency with the front design while rendering the back as it would appear if turned around. Use a neutral, light background with studio-style lighting. Do not include a model, mannequin, shadows, props, text, or decorative elements. Keep the focus entirely on the garment. Do not hallucinate new features or alter the design. Only reproduce details that are logically consistent with the front view of the reference item. The result must be clean, centered, and distraction-free.
      `.trim()
    });

    const clothingBackBase64 = backClothingRes.data[0]?.b64_json;

    // ✅ Check all outputs
    if (!frontImageBase64 || !backImageBase64 || !clothingFrontBase64 || !clothingBackBase64) {
      return new Response(JSON.stringify({ error: 'One or more images failed to generate.' }), { status: 500 });
    }

    // ✅ Return all 4 images
    return new Response(
      JSON.stringify({
        frontImageBase64,
        backImageBase64,
        clothingFrontBase64,
        clothingBackBase64
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating images:', error);
    return new Response(JSON.stringify({ error: 'Image generation failed' }), {
      status: 500
    });
  }
}
