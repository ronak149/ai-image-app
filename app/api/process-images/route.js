import { FormData as NodeFormData } from 'formdata-node';
import { fileFromPath } from 'formdata-node/file-from-path';
import { Readable } from 'stream';
import { fileFrom } from 'formdata-node/file-from';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const modelFile = formData.get('model');
    const itemFile = formData.get('item');

    if (!modelFile || !itemFile) {
      return NextResponse.json({ error: 'Both images are required' }, { status: 400 });
    }

    const readFile = async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer.toString('base64');
    };

    const modelBase64 = await readFile(modelFile);
    const itemBase64 = await readFile(itemFile);

    const geminiPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/png', data: modelBase64 } },
            { inlineData: { mimeType: 'image/png', data: itemBase64 } },
            { text: 'Generate 4 AI images:\n1. Enhanced product photo\n2. Model wearing item\n3. Back view of product\n4. Back view of model wearing item.\nReturn them as base64 strings.' }
          ],
        },
      ],
    };

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    });

    const data = await response.json();

    const base64Results = extractBase64Images(data);

    if (!base64Results.length) {
      return NextResponse.json({ error: 'No images generated' }, { status: 500 });
    }

    const imageUrls = base64Results.map((b64) => `data:image/png;base64,${b64}`);

    return NextResponse.json({ images: imageUrls });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function extractBase64Images(data) {
  try {
    const candidates = data.candidates || [];
    const parts = candidates[0]?.content?.parts || [];
    return parts
      .filter((p) => p.inlineData?.data)
      .map((p) => p.inlineData.data);
  } catch (e) {
    return [];
  }
}