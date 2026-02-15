import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // Настройка заголовков (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found check Vercel Settings");
    }

    // Обработка данных
    const { answers } = req.body || {};
    if (!answers) {
      return res.status(400).json({ error: 'No answers provided' });
    }

    let answersText = '';
    for (const [q, a] of Object.entries(answers)) {
      answersText += `В: ${q}\nО: ${a}\n\n`;
    }

    const fullPrompt = `Проанализируй ответы человека и напиши его смысл жизни:\n\n${answersText}\n\nОтветь на русском, используй markdown, будь глубок и краток.`;

    const ai = new GoogleGenAI({ apiKey });

    // Используем самую надежную бесплатную модель
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash', 
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    });

    const text = result.response.candidates[0].content.parts[0].text;

    return res.status(200).json({ analysis: text });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Ошибка нейросети. Попробуйте позже.', 
      details: error.message 
    });
  }
}
