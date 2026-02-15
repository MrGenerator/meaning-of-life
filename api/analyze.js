// Vercel Serverless Function для анализа смысла жизни
// Использует НОВЫЙ SDK: @google/genai
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // CORS headers для работы с фронтендом
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Обработка предварительного запроса (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Получаем API ключ из переменных окружения Vercel
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API key not configured. Please add GEMINI_API_KEY to Vercel environment variables.' 
      });
    }

    // Получаем ответы пользователя
    const { answers } = req.body;

    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ error: 'No answers provided' });
    }

    // Форматируем текст ответов для нейросети
    let answersText = 'Вот ответы человека на философские вопросы:\n\n';
    for (const [question, answer] of Object.entries(answers)) {
      answersText += `Вопрос: ${question}\nОтвет: ${answer}\n\n`;
    }

    // Тот самый подробный промпт без урезаний
    const prompt = `${answersText}

На основе этих ответов, проанализируй глубинные ценности, мотивации и устремления этого человека. Определи его уникальный смысл жизни.

Структура ответа (используй markdown для форматирования):
1. Начни с яркой формулировки их смысла жизни (2-3 предложения)
2. ## Ваши ключевые ценности - опиши что ты видишь в их ответах (используй **жирный текст** для важных слов)
3. ## Как жить в соответствии с этим смыслом - дай 3-4 конкретные рекомендации
4. Закончи вдохновляющей мыслью

Пиши на русском, тепло, глубоко и персонально. Избегай банальностей. Используй жирный текст для ключевых понятий.`;

    // Инициализируем Google AI SDK
    const ai = new GoogleGenAI({ apiKey });
    
    // Генерируем контент
    // ВАЖНО: Добавлен префикс models/ для устранения ошибки 404
    const result = await ai.models.generateContent({
      model: 'models/gemini-1.5-flash', 
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    });

    // Извлекаем текст из ответа (новый формат SDK)
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
}
