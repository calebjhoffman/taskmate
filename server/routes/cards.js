import express from 'express'
import { prisma } from '../lib/prisma.js'
import { verifyAccessToken } from '../middleware/verifyAccessToken.js'

const router = express.Router()

// Create card
router.post('/', verifyAccessToken, async (req, res) => {
  const { title, listId } = req.body
  if (!title || !listId) {
    return res.status(400).json({ error: 'Missing title or listId' })
  }

  try {
    const card = await prisma.card.create({
      data: {
        title,
        content: '',
        listId,
        userId: req.userId, // ✅ ensure the card is tied to the user
        meta: {
          create: {
            key: 'completed',
            value: 'false',
          },
        },
      },
      include: {
        meta: true,
      },
    });

    res.status(201).json(card)
  } catch (err) {
    console.error('❌ Error creating card:', err)
    res.status(500).json({ error: 'Failed to create card' })
  }
})


// GET /cards
router.get('/', async (req, res) => {
  try {
    const cards = await prisma.card.findMany({
      where: {
        list: {
          board: {
            userId: req.userId,
          },
        },
      },
      include: {
        meta: true,
        list: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.json(cards)
  } catch (err) {
    console.error('Failed to fetch cards:', err)
    res.status(500).json({ error: 'Failed to fetch cards' })
  }
})


// PATCH /cards/reorder — reorder cards within a list
router.patch('/reorder', verifyAccessToken, async (req, res) => {
  const { listId, positions } = req.body

  if (!listId || !Array.isArray(positions)) {
    return res.status(400).json({ error: 'Invalid input' })
  }

  try {
    const updatePromises = positions.map(({ id, position }) =>
      prisma.card.updateMany({
        where: {
          id,
          listId,
          list: {
            board: {
              userId: req.userId,
            },
          },
        },
        data: { position },
      })
    )

    await Promise.all(updatePromises)

    res.json({ success: true })
  } catch (err) {
    console.error('Error updating card positions:', err)
    res.status(500).json({ error: 'Failed to reorder cards' })
  }
})


// Update card
router.patch('/:id', verifyAccessToken, async (req, res) => {
  const { id } = req.params
  const { title } = req.body

  if (!title) {
    return res.status(400).json({ error: 'Missing title' })
  }

  try {
    const card = await prisma.card.update({
      where: { id },
      data: { title },
      include: {
        meta: true, // 👈 include meta so frontend keeps it
      },
    })
    res.json(card)
  } catch (err) {
    console.error('❌ Error updating card:', err)
    res.status(500).json({ error: 'Failed to update card' })
  }
})

// POST /cards/:id/meta — upsert metadata for a card
router.post('/:id/meta', verifyAccessToken, async (req, res) => {
  const { id } = req.params
  const { key, value } = req.body

  if (!key) return res.status(400).json({ error: 'Key is required' })

  try {
    const existing = await prisma.cardMeta.findFirst({
      where: { cardId: id, key },
    })

    let result
    if (existing) {
      result = await prisma.cardMeta.update({
        where: { id: existing.id },
        data: { value },
      })
    } else {
      result = await prisma.cardMeta.create({
        data: {
          cardId: id,
          key,
          value,
        },
      })
    }

    res.json(result)
  } catch (err) {
    console.error('❌ Error updating card meta:', err)
    res.status(500).json({ error: 'Failed to update metadata' })
  }
})

// Delete card
router.delete('/:id', verifyAccessToken, async (req, res) => {
  const { id } = req.params

  try {
    await prisma.card.delete({ where: { id } })
    res.json({ success: true })
  } catch (err) {
    console.error('❌ Error deleting card:', err)
    res.status(500).json({ error: 'Failed to delete card' })
  }
})


export default router
