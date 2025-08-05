import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
} from '@mui/material'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import SortableBoard from '../../components/SortableBoard'
import { useFetchWithAuth } from '../../lib/fetchWithAuth'

export default function UserBoards() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const fetchWithAuth = useFetchWithAuth()
  const API = import.meta.env.VITE_API_BASE_URL

  const [boards, setBoards] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await fetchWithAuth('/boards')
        const data = await res.json()
        setBoards(data)
      } catch (err) {
        console.error('Error fetching boards:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBoards()
  }, [])

  const handleCreateBoard = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      const res = await fetchWithAuth('/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      })

      const data = await res.json()
      setBoards([data, ...boards])
      setNewTitle('')
    } catch (err) {
      console.error('Error creating board:', err)
    }
  }

  const handleDeleteBoard = async (boardId) => {
    if (!confirm('Are you sure you want to delete this board?')) return

    try {
      const res = await fetchWithAuth(`/boards/${boardId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete board')

      setBoards((prev) => prev.filter((b) => b.id !== boardId))
    } catch (err) {
      console.error('Error deleting board:', err)
    }
  }

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return

    const oldIndex = boards.findIndex((b) => b.id === active.id)
    const newIndex = boards.findIndex((b) => b.id === over.id)
    const reordered = arrayMove(boards, oldIndex, newIndex)

    setBoards(reordered)

    fetchWithAuth('/boards/reorder', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        positions: reordered.map((b, i) => ({ id: b.id, position: i })),
      }),
    }).catch((err) => console.error('Error saving order:', err))
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: '100vh' }}>
      <Typography variant="h4" gutterBottom mb={4}>
        📋 Your Boards
      </Typography>

      <Box
        component="form"
        onSubmit={handleCreateBoard}
        sx={{
          display: 'flex',
          gap: 2,
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
        }}
      >
        <TextField
          label="Board title"
          variant="outlined"
          size="small"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          sx={{
            whiteSpace: 'nowrap',
            height: '40px',
            alignSelf: { xs: 'stretch', sm: 'center' },
          }}
        >
          Create Board
        </Button>
      </Box>

      {boards.length === 0 ? (
        <Typography>No boards yet. Create one to get started!</Typography>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={boards.map((b) => b.id)} strategy={rectSortingStrategy}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr',
                  md: '1fr 1fr',
                  lg: '1fr 1fr 1fr'
                },
                gap: 3,
                maxWidth: 1400,
                mx: 'auto',
              }}
            >
              {boards.map((board) => (
                <SortableBoard
                  key={board.id}
                  id={board.id}
                  board={board}
                  onDelete={handleDeleteBoard}
                  onNavigate={navigate}
                />
              ))}
            </Box>
          </SortableContext>
        </DndContext>
      )}
    </Container>
  )
}
