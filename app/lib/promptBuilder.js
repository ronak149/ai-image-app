// lib/promptBuilder.js

export function buildTryOnPrompt(personDesc, clothingDesc, view = "front") {
  if (view === "back") {
    return `Use the following detailed description of a clothing item and a model to generate a realistic image of the model wearing the clothing, viewed from the back. The image must show a complete back view with a white background. Do not include scenery, shadows, or objects. The model and the clothing should be rendered exactly as described, with correct positioning and fit. Maintain accuracy in the design, structure, and texture of the back of the clothing item. Do not hallucinate details not mentioned in the description. Avoid artistic changes, additions, or enhancements. Recreate only what is described, and match the model’s back profile faithfully. The result should be a realistic back-view image with no distractions or style alterations.
    Clothing Description:
    ${clothingDesc}

    Model Description:
    ${personDesc}
    `.trim();
  }

  return `Generate a high-quality, front-facing image of a fashion model wearing a clothing item. Use only the visual characteristics provided. The clothing item must appear exactly as described, including its material, color, texture, design patterns, logos, visible seams, stitching, and cut. The model should closely match the described features including skin tone, body type, facial structure, hair, and posture. Ensure the fit and drape of the clothing on the model is natural and realistic. Avoid all hallucinated or imagined elements. Do not alter the style, cut, or appearance of the clothing or the model. Do not include props, accessories, backgrounds, or lighting that are not described. The background should be plain, light-colored, and neutral. Composition must be centered, sharp, and high-resolution with no distractions — focus entirely on showcasing the clothing worn by the model. This image is for generating a precise, front-facing visual reference of the model wearing the specified clothing item.
  Clothing Description:
  ${clothingDesc}

  Model Description:
  ${personDesc}
  `.trim();
}
