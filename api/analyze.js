const { GoogleGenAI } = require("@google/genai");

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const { answers } = req.body;

    let answersText = '';
    for (const [q, a] of Object.entries(answers)) {
      answersText += `Вопрос: ${q}\nОтвет: ${a}\n\n`;
    }

    const prompt = `${answersText}\nПроанализируй эти ответы и определи смысл жизни человека. Ответь на русском, используй markdown, будь глубок и искренен.`;

    const ai = new GoogleGenAI({ apiKey });
    
    // ИСПРАВЛЕНО: 'gemini-1.5-flash' БЕЗ префикса 'models/'
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash', 
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    return res.status(200).json({ 
      analysis: result.response.candidates[0].content.parts[0].text 
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
