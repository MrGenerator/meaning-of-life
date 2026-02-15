const { GoogleGenAI } = require("@google/genai");

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

    const { answers } = req.body;
    let answersText = 'Вот ответы человека на философские вопросы:\n\n';
    for (const [question, answer] of Object.entries(answers)) {
      answersText += `Вопрос: ${question}\nОтвет: ${answer}\n\n`;
    }

    const prompt = `${answersText}
На основе этих ответов, проанализируй глубинные ценности, мотивации и устремления этого человека. Определи его уникальный смысл жизни.
1. Начни с яркой формулировки смысла жизни (2-3 предложения)
2. ## Ваши ключевые ценности - опиши что видишь в ответах (используй **жирный текст**)
3. ## Как жить в соответствии с этим смыслом - дай 3-4 конкретные рекомендации
4. Закончи вдохновляющей мыслью.
Пиши на русском, тепло и глубоко.`;

    const ai = new GoogleGenAI({ apiKey });
    
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash', 
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    return res.status(200).json({ 
      analysis: result.response.candidates[0].content.parts[0].text 
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'AI Error', details: error.message });
  }
};
