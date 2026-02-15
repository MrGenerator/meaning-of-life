// Vercel Serverless Function для анализа смысла жизни
// Использует НОВЫЙ SDK: @google/genai (не @google/generative-ai!)
const { GoogleGenAI } = require("@google/genai");

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API key not configured. Please add GEMINI_API_KEY to Vercel environment variables.' 
      });
    }

    // Get answers from request
    const { answers } = req.body;

    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ error: 'No answers provided' });
    }

    // Format answers
    let answersText = 'Вот ответы человека на философские вопросы:\n\n';
    for (const [question, answer] of Object.entries(answers)) {
      answersText += `Вопрос: ${question}\nОтвет: ${answer}\n\n`;
    }

    // Create prompt
    const prompt = `${answersText}

На основе этих ответов, проанализируй глубинные ценности, мотивации и устремления этого человека. Определи его уникальный смысл жизни.

Структура ответа (используй markdown для форматирования):
1. Начни с яркой формулировки их смысла жизни (2-3 предложения)
2. ## Ваши ключевые ценности - опиши что ты видишь в их ответах (используй **жирный текст** для важных слов)
3. ## Как жить в соответствии с этим смыслом - дай 3-4 конкретные рекомендации
4. Закончи вдохновляющей мыслью

Пиши на русском, тепло, глубоко и персонально. Избегай банальностей. Используй жирный текст для ключевых понятий.`;

    // Initialize NEW Gemini SDK (2026)
    const ai = new GoogleGenAI({ apiKey });
    
    // Generate content with NEW API syntax
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',  // Новая модель 2026!
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    });

    // Extract text from response (новый формат)
    const text = result.response.candidates[0].content.parts[0].text;

    return res.status(200).json({ 
      analysis: text 
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze answers',
      details: error.message 
    });
  }
};
