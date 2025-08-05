import express from 'express'
import { prisma } from '../lib/prisma.js'
import { verifyAccessToken } from '../middleware/verifyAccessToken.js'

const router = express.Router()

// GET all users (dev/debug only)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany()
    res.json(users)
  } catch (err) {
    console.error('Error fetching users:', err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// POST create a user (dev/debug only)
router.post('/', async (req, res) => {
  const { email, name } = req.body
  try {
    const user = await prisma.user.create({
      data: { email, name },
    })
    res.json(user)
  } catch (err) {
    console.error('Error creating user:', err)
    res.status(500).json({ error: 'Could not create user' })
  }
})


router.get('/meta', verifyAccessToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true }
    })

    const metaRecords = await prisma.userMeta.findMany({
      where: { userId: req.userId },
    })

    const meta = metaRecords.reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {})

    res.json({ user, meta })
  } catch (err) {
    console.error('Failed to fetch user/meta:', err)
    res.status(500).json({ error: 'Failed to retrieve meta' })
  }
})


// GET /user/meta/:key — retrieve specific meta value
router.get('/meta/:key', verifyAccessToken, async (req, res) => {
  const { key } = req.params

  try {
    const meta = await prisma.userMeta.findUnique({
      where: {
        userId_key: {
          userId: req.userId,
          key,
        },
      },
    })

    res.json({ value: meta?.value || null })
  } catch (err) {
    console.error(`Error fetching meta for key "${key}":`, err)
    res.status(500).json({ error: 'Failed to retrieve meta' })
  }
})

// POST /user/meta — upsert meta { key, value }
router.post('/meta', verifyAccessToken, async (req, res) => {
  const { key, value } = req.body

  try {
    const meta = await prisma.userMeta.upsert({
      where: {
        userId_key: {
          userId: req.userId,
          key,
        },
      },
      update: { value },
      create: {
        userId: req.userId,
        key,
        value,
      },
    })

    res.json({ success: true, value: meta.value })
  } catch (err) {
    console.error('Error upserting user meta:', err)
    res.status(500).json({ error: 'Failed to save meta' })
  }
})

router.patch('/update', verifyAccessToken, async (req, res) => {
  const { name } = req.body

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { name },
      select: { id: true, email: true, name: true },
    })

    res.json(updatedUser)
  } catch (err) {
    console.error('Failed to update user:', err)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

export default router
