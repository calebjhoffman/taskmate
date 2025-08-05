import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { prisma } from '../lib/prisma.js'
import { verifyAccessToken } from '../middleware/verifyAccessToken.js'

const router = express.Router()

// 🔧 Ensure uploads directory exists
const uploadDir = path.resolve('uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

// 🔧 Setup multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname
    cb(null, uniqueName)
  },
})

const upload = multer({ storage })

// ✅ POST /api/media/upload
router.post('/upload', verifyAccessToken, upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const media = await prisma.media.create({
      data: {
        url: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
        userId: req.userId,
      },
    })

    res.json(media)
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: 'Failed to upload file' })
  }
})

// ✅ GET /api/media/:id → fetch a media record by ID
router.get('/:id', verifyAccessToken, async (req, res) => {
  try {
    const media = await prisma.media.findUnique({
      where: { id: req.params.id },
    })
    if (!media) return res.status(404).json({ error: 'Media not found' })
    res.json(media)
  } catch (err) {
    console.error('Error fetching media by ID:', err)
    res.status(500).json({ error: 'Failed to fetch media' })
  }
})

router.delete('/:id', verifyAccessToken, async (req, res) => {
  const { id } = req.params

  try {
    const media = await prisma.media.findUnique({ where: { id } })
    if (!media || media.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized or not found' })
    }

    const filePath = path.resolve('uploads', path.basename(media.url))
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

    await prisma.media.delete({ where: { id } })

    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting media:', err)
    res.status(500).json({ error: 'Failed to delete media' })
  }
})

export default router
