import express from 'express'
import { prisma } from '../lib/prisma.js'
import { verifyAccessToken } from '../middleware/verifyAccessToken.js'

const router = express.Router()

// Get all boards for the logged-in user
// Get all boards for the logged-in user with stats
router.get('/', verifyAccessToken, async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      where: { userId: req.userId },
      orderBy: { position: 'asc' },
      include: {
        lists: {
          include: {
            cards: {
              include: { meta: true },
            },
          },
        },
      },
    });

    const enrichedBoards = boards.map((board) => {
      const allCards = board.lists.flatMap((list) => list.cards);
      const unfinishedCards = allCards.filter((card) => {
        const completedMeta = card.meta?.find((m) => m.key === 'completed');
        return completedMeta?.value !== 'true';
      });

      return {
        id: board.id,
        title: board.title,
        position: board.position,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        listCount: board.lists.length,
        cardCount: allCards.length,
        unfinishedCardCount: unfinishedCards.length,
      };
    });

    res.json(enrichedBoards);
  } catch (err) {
    console.error('Error fetching boards with stats:', err);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

router.patch('/reorder', verifyAccessToken, async (req, res) => {
  const { positions } = req.body

  if (!Array.isArray(positions)) {
    return res.status(400).json({ error: 'Invalid input' })
  }

  try {
    await Promise.all(
      positions.map(({ id, position }) =>
        prisma.board.updateMany({
          where: { id, userId: req.userId },
          data: { position },
        })
      )
    )

    res.json({ success: true })
  } catch (err) {
    console.error('Error reordering boards:', err)
    res.status(500).json({ error: 'Failed to reorder boards' })
  }
})



// Create a new board
router.post('/', verifyAccessToken, async (req, res) => {
  const { title } = req.body
  try {
    const board = await prisma.board.create({
      data: {
        title,
        userId: req.userId,
      },
    })
    res.status(201).json(board)
  } catch (err) {
    console.error('Error creating board:', err)
    res.status(500).json({ error: 'Failed to create board' })
  }
})

// DELETE /api/boards/:id — delete board and all related lists/cards
router.delete('/:id', verifyAccessToken, async (req, res) => {
  const { id } = req.params

  try {
    // Optional: manually delete related lists and cards if no cascade
    await prisma.card.deleteMany({
      where: {
        list: {
          boardId: id,
        },
      },
    })

    await prisma.list.deleteMany({
      where: { boardId: id },
    })

    const deleted = await prisma.board.deleteMany({
      where: { id, userId: req.userId },
    })

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Board not found or unauthorized' })
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting board:', err)
    res.status(500).json({ error: 'Failed to delete board' })
  }
})


// Get a single board by ID (includes lists + cards)
router.get('/:id', verifyAccessToken, async (req, res) => {
  const { id } = req.params

  try {
    const board = await prisma.board.findUnique({
      where: {
        id,
        userId: req.userId,
      },
      include: {
        lists: {
          include: {
            cards: {
              include: {
                meta: true, // 👈 include card meta here
              },
              orderBy: {
                position: 'asc', // ✅ This line is essential
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });


    if (!board) return res.status(404).json({ error: 'Board not found' })

    res.json(board)
  } catch (err) {
    console.error('Error fetching board by ID:', err)
    res.status(500).json({ error: 'Failed to fetch board' })
  }
})

// PATCH /api/boards/:id — update board title
router.patch('/:id', verifyAccessToken, async (req, res) => {
  const { id } = req.params
  const { title } = req.body

  if (!title) {
    return res.status(400).json({ error: 'Title is required' })
  }

  try {
    const updatedBoard = await prisma.board.updateMany({
      where: { id, userId: req.userId },
      data: { title },
    })

    if (updatedBoard.count === 0) {
      return res.status(404).json({ error: 'Board not found or unauthorized' })
    }

    res.json({ id, title })
  } catch (err) {
    console.error('Error updating board:', err)
    res.status(500).json({ error: 'Failed to update board' })
  }
})



export default router
