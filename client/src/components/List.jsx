import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  IconButton,
  TextField,
  Button,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import SortableCard from './SortableCard'
import { useNavigate } from 'react-router-dom'
import { useFetchWithAuth } from '@/lib/fetchWithAuth'

export default function List({ list, setBoard, accessToken, toggleComplete }) {
  const [newCardTitle, setNewCardTitle] = useState('')
  const [listTitle, setListTitle] = useState(list.title)
  const navigate = useNavigate()
  const API = import.meta.env.VITE_API_BASE_URL
  const sensors = useSensors(useSensor(PointerSensor))
  const fetchWithAuth = useFetchWithAuth()

  const handleAddCard = async (e) => {
    e.preventDefault()
    if (!newCardTitle.trim()) return

    try {
      const res = await fetchWithAuth('/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newCardTitle, listId: list.id }),
      })
      const newCard = await res.json()

      setBoard((prev) => {
        const updatedLists = prev.lists.map((l) =>
          l.id === list.id ? { ...l, cards: [...(l.cards || []), newCard] } : l
        )
        return { ...prev, lists: updatedLists }
      })

      setNewCardTitle('')
    } catch (err) {
      console.error('Error adding card:', err)
    }
  }

  const handleUpdateCard = async (cardId, newTitle) => {
    try {
      const res = await fetchWithAuth(`/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newTitle }),
      })
      const updatedCard = await res.json()

      setBoard((prev) => {
        const updatedLists = prev.lists.map((l) =>
          l.id === list.id
            ? {
                ...l,
                cards: l.cards.map((c) =>
                  c.id === cardId ? updatedCard : c
                ),
              }
            : l
        )
        return { ...prev, lists: updatedLists }
      })
    } catch (err) {
      console.error('Error updating card:', err)
    }
  }

  const handleDeleteCard = async (cardId) => {
    try {
      await fetchWithAuth(`/cards/${cardId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      setBoard((prev) => {
        const updatedLists = prev.lists.map((l) =>
          l.id === list.id
            ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) }
            : l
        )
        return { ...prev, lists: updatedLists }
      })
    } catch (err) {
      console.error('Error deleting card:', err)
    }
  }

  const handleUpdateListTitle = async () => {
    if (listTitle === list.title) return
    try {
      const res = await fetchWithAuth(`/lists/${list.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: listTitle }),
      })
      const updated = await res.json()
      setBoard((prev) => {
        const updatedLists = prev.lists.map((l) =>
          l.id === list.id ? { ...l, title: updated.title } : l
        )
        return { ...prev, lists: updatedLists }
      })
    } catch (err) {
      console.error('Error updating list title:', err)
    }
  }

  const handleDeleteList = async () => {
    try {
      await fetchWithAuth(`/lists/${list.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      setBoard((prev) => {
        const updatedLists = prev.lists.filter((l) => l.id !== list.id)
        return { ...prev, lists: updatedLists }
      })
    } catch (err) {
      console.error('Error deleting list:', err)
    }
  }

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return

    const oldIndex = list.cards.findIndex((c) => c.id === active.id)
    const newIndex = list.cards.findIndex((c) => c.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = Array.from(list.cards)
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    const reindexed = reordered.map((card, index) => ({
      ...card,
      position: index,
    }))

    setBoard((prev) => {
      const updatedLists = prev.lists.map((l) =>
        l.id === list.id ? { ...l, cards: reindexed } : l
      )
      return { ...prev, lists: updatedLists }
    })

    try {
      await fetchWithAuth(`/cards/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          listId: list.id,
          positions: reindexed.map((c) => ({
            id: c.id,
            position: c.position,
          })),
        }),
      })
    } catch (err) {
      console.error('Failed to persist card order:', err)
    }
  }

  return (
    <Card sx={{ minWidth: 250, flexShrink: 0, overflow: 'visible' }}>
      <CardContent>
        {/* List Title */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="standard"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            onBlur={handleUpdateListTitle}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontWeight: 'bold',
                fontSize: '1.1rem',
              },
            }}
          />
          <IconButton
            onClick={handleDeleteList}
            size="small"
            sx={{ ml: 1, color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Cards with drag-and-drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={(list.cards || []).map((card) => card.id)}
            strategy={verticalListSortingStrategy}
          >
            <Box
              component="ul"
              sx={{ listStyle: 'none', pl: 0, m: 0, mt: 2 }}
            >
              {(list.cards || []).map((card) => (
                <SortableCard
                  key={card.id}
                  card={card}
                  listId={list.id}
                  handleDeleteCard={handleDeleteCard}
                  handleUpdateCard={handleUpdateCard}
                  toggleComplete={toggleComplete}
                />
              ))}
            </Box>
          </SortableContext>
        </DndContext>

        {/* Add Card */}
        <Box
          component="form"
          onSubmit={handleAddCard}
          sx={{ mt: 2, display: 'flex', gap: 1 }}
        >
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Add card"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
          />
          <Button
            variant="contained"
            size="small"
            type="submit"
            sx={{ whiteSpace: 'nowrap' }}
          >
            Add
          </Button>
        </Box>

        <Button
          fullWidth
          variant="outlined"
          size="small"
          sx={{ mt: 1 }}
          onClick={() => navigate(`/list/${list.id}`)}
        >
          View List
        </Button>
      </CardContent>
    </Card>
  )
}
