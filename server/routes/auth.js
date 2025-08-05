import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { createTokens, sendRefreshToken, sendAccessToken } from '../utils/token.js'

const router = express.Router()

// Signup
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isVerified: true, // for now skip email verification
        name,          // required by schema
      },
    })

    const { accessToken, refreshToken } = createTokens(user.id)
    sendRefreshToken(res, refreshToken)
    sendAccessToken(res, accessToken)
  } catch (err) {
    console.error('❌ Signup error:', err)
    res.status(500).json({ error: 'Signup failed' })
  }
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  console.log(req.body)
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ error: 'User not found' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json({ error: 'Incorrect password' })

    const { accessToken, refreshToken } = createTokens(user.id)
    sendRefreshToken(res, refreshToken)
    sendAccessToken(res, accessToken)
  } catch (err) {
    res.status(500).json({ error: 'Login failed' })
  }
})

// Refresh access token
router.get('/refresh', async (req, res) => {
  const token = req.cookies.jid
  if (!token) return res.status(401).json({ error: 'No token provided' })

  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret')
    const { accessToken, refreshToken } = createTokens(payload.userId)

    sendRefreshToken(res, refreshToken)
    sendAccessToken(res, accessToken)
  } catch (err) {
    console.error('Refresh error:', err)
    res.status(401).json({ error: 'Invalid token' })
  }
})

// Logout (clear refresh token cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('jid', { path: '/auth/refresh' })
  res.json({ success: true })
})

export default router
