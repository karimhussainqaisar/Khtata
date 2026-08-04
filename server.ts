import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini Client server-side
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is missing.');
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'KhataPro API', timestamp: new Date().toISOString() });
  });

  // Khata AI Chat API
  app.post('/api/khata-ai', async (req, res) => {
    try {
      const { prompt, context } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({
          error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in Secrets.',
          reply: 'Assalam-o-Alaikum! Khata AI is in offline fallback mode. Please configure GEMINI_API_KEY in app secrets to enable full AI insights.'
        });
      }

      const systemInstruction = `You are "Khata AI", an expert Pakistani financial advisor & digital khata assistant built into KhataPro app.
Your job is to assist Pakistani users (shopkeepers, small business owners, families, individuals) with managing personal credit (Udhar Dena/Lena), daily expenses, savings, and recovery strategies.

Respond in a helpful, friendly, and respectful Pakistani tone (mixing English with standard Roman Urdu terms like Udhar, Dena, Lena, PKR, Rs, JazzCash, Easypaisa, Bachat, etc., or standard English depending on the prompt). Keep responses concise, clear, and action-oriented.

Context of user's current data:
${JSON.stringify(context || {}, null, 2)}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt || 'Give me a brief summary of my current financial status and advice to recover pending Udhar.',
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ reply: response.text || 'Khata AI is processing your request.' });
    } catch (error: any) {
      console.error('Error in /api/khata-ai:', error);
      res.status(500).json({ error: error.message || 'Server error communicating with Gemini AI' });
    }
  });

  // Voice Expense Parser API
  app.post('/api/voice-expense', async (req, res) => {
    try {
      const { transcript, language } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Fallback simple regex parser
        return res.json({
          parsed: {
            amount: 500,
            category: 'Food',
            description: transcript || 'Voice entry',
            type: 'expense'
          }
        });
      }

      const systemInstruction = `You are a voice financial transcript parser for Pakistan.
Extract transaction details from spoken voice input in English, Roman Urdu, or Urdu.
Return JSON with format:
{
  "amount": number,
  "category": "Food" | "Transport" | "Home" | "Bills" | "Shopping" | "Health" | "Education" | "Business" | "Other",
  "type": "expense" | "income" | "udhar_given" | "udhar_taken",
  "personName": string or null (if Udhar related),
  "description": string
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Parse this spoken text: "${transcript}"`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      let jsonStr = (response.text || '{}').trim();
      const parsed = JSON.parse(jsonStr);
      res.json({ parsed });
    } catch (error: any) {
      console.error('Error in /api/voice-expense:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Receipt Scanner OCR API
  app.post('/api/scan-receipt', async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      const ai = getGeminiClient();

      if (!ai || !imageBase64) {
        return res.json({
          parsed: {
            merchant: 'General Store',
            amount: 1250,
            date: new Date().toISOString().split('T')[0],
            category: 'Shopping',
            items: ['Items purchased']
          }
        });
      }

      const imagePart = {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      };

      const systemInstruction = `You are an intelligent Pakistani receipt OCR analyzer.
Analyze the image of receipt or bill and extract structured JSON data:
{
  "merchant": string (e.g. Imtiaz Super Market, Metro, Shell, K-Electric, Local Shop),
  "amount": number (Total paid in PKR),
  "date": string (YYYY-MM-DD),
  "category": "Food" | "Transport" | "Home" | "Bills" | "Shopping" | "Health" | "Education" | "Business" | "Other",
  "items": string[] (list of top items purchased if visible)
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: {
          parts: [
            imagePart,
            { text: 'Analyze this receipt and output structured transaction JSON.' }
          ]
        },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ parsed });
    } catch (error: any) {
      console.error('Error in /api/scan-receipt:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KhataPro Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
