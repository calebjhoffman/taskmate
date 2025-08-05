import express from 'express'
import { prisma }from '../lib/prisma.js'
import { verifyAccessToken } from '../middleware/verifyAccessToken.js'

const router = express.Router()

// GET /dashboard/summary
router.get('/summary', verifyAccessToken, async (req, res) => {
  const userId = req.userId

  try {
    const [boards, lists, cards, openCards] = await Promise.all([
    prisma.board.count({ where: { userId } }),
    prisma.list.count({ where: { userId } }),
    prisma.card.count({ where: { userId } }),
    prisma.cardMeta.count({
        where: {
        key: 'completed',
        value: 'false',
        card: { userId },
        },
    }),
    ])

    res.json({ boards, lists, cards, openCards })
  } catch (err) {
    console.error('Error getting dashboard summary:', err)
    res.status(500).json({ error: 'Failed to fetch dashboard summary' })
  }
})

export default router
