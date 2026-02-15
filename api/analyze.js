// Vercel Serverless Function
const { GoogleGenAI } = require("@google/genai");

module.exports = async (req, res) => {
  // CORS headers
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
      return res.status(500).json({ error: 'Ключ API не настроен в Vercel' });
    }

    const { answers } = req.body;
    if (!answers) {
      return res.status(400).json({ error: 'No answers provided' });
    }

    let answersText = 'Вот ответы человека на философские вопросы:\n\n';
    for (const [question, answer] of Object.entries(answers)) {
      answersText += `Вопрос: ${question}\nОтвет: ${answer}\n\n`;
    }

    // Твой полный промпт без урезаний
    const prompt = `${answersText}

На основе этих ответов, проанализируй глубинные ценности, мотивации и устремления этого человека. Определи его уникальный смысл жизни.

Структура ответа (используй markdown для форматирования):
1. Начни с яркой формулировки их смысла жизни (2-3 предложения)
2. ## Ваши ключевые ценности - опиши что ты видишь в их ответах (используй **жирный текст** для важных слов)
3. ## Как жить в соответствии с этим смыслом - дай 3-4 конкретные рекомендации
4. Закончи вдохновляющей мыслью

Пиши на русском, тепло, глубоко и персонально. Избегай банальностей. Используй жирный текст для ключевых понятий.`;

    const ai = new GoogleGenAI({ apiKey });
    
    // Генерируем контент. Модель БЕЗ префикса models/ (это и была ошибка 404)
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash', 
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    });

    const text = result.response.candidates[0].content.parts[0].text;

    return res.status(200).json({ 
      analysis: text 
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Ошибка нейросети',
      details: error.message 
    });
  }
};
