import express from 'express'
import multer from 'multer'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const upload = multer({ storage: multer.memoryStorage() })

app.post('/process-receipt', upload.single('image'), async (req, res) => {
  const { data1, data2 } = req.body
  const imageBuffer = req.file?.buffer
  if (!imageBuffer) {
    return res.status(400).json({ error: 'Image is required' })
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `Extract information from the receipt image along with data1: ${data1} and data2: ${data2}.`
    const result = await model.generateContent([prompt, { inlineData: { data: imageBuffer.toString('base64'), mimeType: req.file.mimetype } }])
    const response = await result.response
    const text = response.text()
    res.json({ text })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to process receipt' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
