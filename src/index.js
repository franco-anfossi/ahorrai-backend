import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './database/mongo.js'
import exampleRoutes from './routes/example.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/example', exampleRoutes)

connectDB()

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})