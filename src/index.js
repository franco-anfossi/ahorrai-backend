import express from 'express'
import multer from 'multer'
import cors from 'cors';
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildPrompt } from './prompt.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['POST'],
}));

const upload = multer({ storage: multer.memoryStorage() })

app.post('/process-receipt', upload.single('image'), async (req, res) => {
  const imageBuffer = req.file?.buffer;
  if (!imageBuffer) {
    return res.status(400).json({ error: 'Image is required' });
  }

  let categories = [];
  try {
    categories = JSON.parse(req.body.categories);
  } catch {
    return res.status(400).json({ error: 'Invalid categories JSON' });
  }

  try {
    const prompt = buildPrompt(categories);
    const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: req.file.mimetype,
        },
      },
    ]);
    const text = await result.response.text();
    const jsonString = text
      .replace(/```json/, '')
      .replace(/```/, '')
      .trim();

    const json = JSON.parse(jsonString);
    return res.json(json);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to process receipt' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
