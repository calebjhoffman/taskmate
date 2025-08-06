import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import cookieParser from 'cookie-parser'
import boardRoutes from './routes/boards.js'
import listRoutes from './routes/lists.js'
import cardRoutes from './routes/cards.js'
import path from 'path'
import mediaRoutes from './routes/media.js'
import dashboardRoutes from './routes/dashboard.js'




dotenv.config()
const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'https://taskmate.calebhoffman.com',
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn(`❌ Blocked CORS request from origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
app.use(express.json())

app.use(cookieParser())

app.get('/', (req, res) => {
  res.send('🚀 Taskmate API is running')
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/boards', boardRoutes)
app.use('/api/lists', listRoutes)
app.use('/api/cards', cardRoutes)
app.use('/api/media', mediaRoutes)
app.use('/uploads', express.static(path.resolve('uploads')))
app.use('/api/dashboard', dashboardRoutes)


const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running on port ${PORT}`)
})