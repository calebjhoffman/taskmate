import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Checkbox,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useFetchWithAuth } from '@/lib/fetchWithAuth'

export default function UserCards() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const fetchWithAuth = useFetchWithAuth()

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetchWithAuth('/cards')
        const data = await res.json()
        setCards(data)
      } catch (err) {
        console.error('Failed to fetch cards:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  const handleDelete = async (id) => {
    try {
      await fetchWithAuth(`/cards/${id}`, {
        method: 'DELETE',
      })
      setCards((prev) => prev.filter((card) => card.id !== id))
    } catch (err) {
      console.error('Failed to delete card:', err)
    }
  }

  const handleUpdate = async (id) => {
    try {
      const res = await fetchWithAuth(`/cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editValue }),
      })
      const updated = await res.json()

      setCards((prev) =>
        prev.map((card) => (card.id === id ? updated : card))
      )
      setEditingId(null)
      setEditValue('')
    } catch (err) {
      console.error('Failed to update card:', err)
    }
  }

  const toggleComplete = async (id, currentVal) => {
    const newValue = currentVal === 'true' ? 'false' : 'true'

    try {
      await fetchWithAuth(`/cards/${id}/meta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: id,
          key: 'completed',
          value: newValue,
        }),
      })

      setCards((prev) =>
        prev.map((card) =>
          card.id === id
            ? {
                ...card,
                meta: (card.meta || []).map((m) =>
                  m.key === 'completed' ? { ...m, value: newValue } : m
                ),
              }
            : card
        )
      )
    } catch (err) {
      console.error('Failed to toggle complete:', err)
    }
  }

  if (loading) return <CircularProgress />

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: '100vh' }}>
      <Typography variant="h4" mb={4}>
        🧾 My Cards
      </Typography>

      {cards.length === 0 && (
        <Typography variant="body1" sx={{ opacity: 0.6 }}>
          You don’t have any cards yet.
        </Typography>
      )}

      {cards.map((card) => {
        const completedMeta = card.meta?.find((m) => m.key === 'completed')
        const completed = completedMeta?.value === 'true'

        return (
          <Paper
            key={card.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              mb: 2,
              opacity: completed ? 0.5 : 1,
              textDecoration: completed ? 'line-through' : 'none',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Checkbox
                checked={completed}
                onChange={() =>
                  toggleComplete(card.id, completedMeta?.value || 'false')
                }
              />

              {editingId === card.id ? (
                <TextField
                  variant="standard"
                  fullWidth
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleUpdate(card.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleUpdate(card.id)
                    }
                  }}
                  autoFocus
                  InputProps={{ disableUnderline: true }}
                />
              ) : (
                <Typography
                  onClick={() => {
                    setEditingId(card.id)
                    setEditValue(card.title)
                  }}
                  sx={{
                    cursor: 'pointer',
                    flexGrow: 1,
                    fontSize: '1rem',
                  }}
                >
                  {card.title}
                </Typography>
              )}
            </Box>

            <IconButton
              edge="end"
              size="small"
              color="error"
              onClick={() => handleDelete(card.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Paper>
        )
      })}
    </Box>
  )
}
