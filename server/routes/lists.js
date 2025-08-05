import express from 'express'
import { prisma } from '../lib/prisma.js'
import { verifyAccessToken } from '../middleware/verifyAccessToken.js'

const router = express.Router()


// Create a new list on a board
router.post('/', verifyAccessToken, async (req, res) => {
  const { title, boardId } = req.body

  try {
    const list = await prisma.list.create({
      data: {
        title,
        boardId,
        userId: req.userId, // ✅ set userId to current user
      },
    })
    res.status(201).json(list)
  } catch (err) {
    console.error('❌ Error creating list:', err)
    res.status(500).json({ error: 'Failed to create list' })
  }
})

router.get('/', verifyAccessToken, async (req, res) => {
  try {
    const lists = await prisma.list.findMany({
      where: { userId: req.userId },
      orderBy: { position: 'asc' },
      include: {
        cards: {
          orderBy: { position: 'asc' },
          include: { meta: true },
        },
      },
    })
    res.json(lists)
  } catch (err) {
    console.error('Failed to fetch lists:', err)
    res.status(500).json({ error: 'Failed to fetch lists' })
  }
})

// PATCH /api/lists/reorder — bulk update list positions
router.patch('/reorder', verifyAccessToken, async (req, res) => {
  const { boardId, positions } = req.body

  if (!boardId || !Array.isArray(positions)) {
    return res.status(400).json({ error: 'Invalid input' })
  }

  try {
    const board = await prisma.board.findFirst({
      where: { id: boardId, userId: req.userId },
    })

    if (!board) {
      return res.status(403).json({ error: 'Unauthorized or board not found' })
    }

    console.log('✅ Updating list positions...')

    const updates = await Promise.all(
      positions.map(({ id, position }) =>
        prisma.list.updateMany({
          where: { id, boardId },
          data: { position },
        })
      )
    )

    console.log('🔧 Updates applied:', updates)
    res.json({ success: true })
  } catch (err) {
    console.error('❌ Prisma error:', err)
    res.status(500).json({ error: 'Failed to reorder lists' })
  }
})

// GET /lists/:id — fetch a list and its cards
router.get('/:id', async (req, res) => {
  try {
    const listId = req.params.id;

    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        cards: {
          orderBy: { position: 'asc' },
          include: {
            meta: true, // get completed status here
          },
        },
      },
    });

    if (!list) return res.status(404).json({ error: 'List not found' });

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ PATCH /api/lists/:id → Update title
router.patch('/:id', verifyAccessToken, async (req, res) => {
  const { id } = req.params
  const { title } = req.body

  if (!title) {
    return res.status(400).json({ error: 'Title is required' })
  }

  try {
    const updatedList = await prisma.list.update({
      where: { id },
      data: { title },
    })
    res.json(updatedList)
  } catch (err) {
    console.error('❌ Error updating list:', err)
    res.status(500).json({ error: 'Failed to update list' })
  }
})

// ✅ DELETE /api/lists/:id → Delete list and its cards
router.delete('/:id', verifyAccessToken, async (req, res) => {
  const { id } = req.params

  try {
    // Delete related cards first if cascade is not handled in schema
    await prisma.card.deleteMany({ where: { listId: id } })

    await prisma.list.delete({ where: { id } })

    res.json({ success: true })
  } catch (err) {
    console.error('❌ Error deleting list:', err)
    res.status(500).json({ error: 'Failed to delete list' })
  }
})


export default router
