import { GoogleGenerativeAI } from '@google/generative-ai';
import { fal } from '@fal-ai/client';

export async function POST(request) {
  try {
    const { imageBase64, imageType, userRequest } = await request.json();

    if (!imageBase64 || !userRequest) {
      return Response.json({ error: 'Fotoğraf ve istek gerekli' }, { status: 400 });
    }

    // 1. Gemini ile kullanıcının isteğini profesyonel bir prompt'a çevir
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = `You are an expert aesthetic surgeon and photo retouching specialist.
The user wants the following aesthetic change: "${userRequest}"

Your job: Write a single, detailed image editing prompt in English that:
- Describes exactly what facial/physical changes to make
- Preserves the person's identity, skin tone, hair color, eye color, and background
- Uses photorealistic, natural-looking language
- References real aesthetic proportions and techniques
- Is specific about direction and magnitude of changes (e.g., "reduce nose bridge width by 20%", "strengthen jawline definition")

Return ONLY the image editing prompt. No explanations, no preamble.`;

    const geminiResult = await model.generateContent(systemPrompt);
    const editPrompt = geminiResult.response.text().trim();

    // 2. fal.ai ile fotoğrafı düzenle
    fal.config({ credentials: process.env.FAL_KEY });

    const imageDataUrl = `data:${imageType || 'image/jpeg'};base64,${imageBase64}`;

    const falResult = await fal.subscribe('fal-ai/flux-kontext/max', {
      input: {
        prompt: editPrompt,
        image_url: imageDataUrl,
        guidance_scale: 3.5,
        num_inference_steps: 28,
        strength: 0.75,
      },
      logs: false,
    });

    const outputImage = falResult.data?.images?.[0]?.url;

    if (!outputImage) {
      return Response.json({ error: 'Görsel oluşturulamadı' }, { status: 500 });
    }

    return Response.json({
      resultUrl: outputImage,
      prompt: editPrompt,
    });
  } catch (err) {
    console.error('Generate error:', err);
    return Response.json({ error: err.message || 'Bir hata oluştu' }, { status: 500 });
  }
}
