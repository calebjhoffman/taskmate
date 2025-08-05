import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  IconButton,
  TextField,
  Button,
  Checkbox,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Check'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useFetchWithAuth } from '@/lib/fetchWithAuth'

function SortableCardItem({ card, onEdit, onDelete, onToggle, isEditing, editValue, setEditValue, onSave }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: card.id })

  const completed = card.meta?.find((m) => m.key === 'completed')?.value === 'true'

  return (
        <Box
        ref={setNodeRef}
        {...attributes}
        sx={{
            backgroundColor: 'background.paper',
            borderRadius: 1,
            mb: 1,
            p: 1,
            boxShadow: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            overflow: 'hidden',
            transform: CSS.Transform.toString(transform),
            transition,
            minWidth: 0, // ensures shrink behavior in flexbox
        }}
        >

      {/* Drag handle */}
      <Box
        {...listeners}
        sx={{
          cursor: 'grab',
          px: 1,
          color: 'text.disabled',
        }}
      >
        <DragIndicatorIcon fontSize="small" />
      </Box>

      <Checkbox
        checked={completed}
        onChange={onToggle}
      />
        <TextField
        fullWidth
        variant="standard"
        value={isEditing ? editValue : card.title}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={onSave}
        onClick={!isEditing ? onEdit : undefined}
        onKeyDown={(e) => {
            if (e.key === 'Enter') {
            e.preventDefault()
            onSave()
            }
        }}
        InputProps={{
            disableUnderline: true,
            readOnly: !isEditing,
            sx: {
            fontWeight: 'normal',
            fontSize: '1rem',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: isEditing ? 'text' : 'pointer',
            textDecoration: completed ? 'line-through' : 'none', // ✅ This is what you were missing
            },
        }}
        autoFocus={isEditing}
        />


      <IconButton onClick={onDelete} sx={{ color: 'error.main' }}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}


export default function UserListCard({ list, setLists }) {
  const [newCardTitle, setNewCardTitle] = useState('')
  const [listTitle, setListTitle] = useState(list.title)
  const [editingCardId, setEditingCardId] = useState(null)
  const [cardEditValue, setCardEditValue] = useState('')
  const fetchWithAuth = useFetchWithAuth()
  const sensors = useSensors(useSensor(PointerSensor))

  const handleUpdateListTitle = async () => {
    if (listTitle === list.title) return
    try {
      const res = await fetchWithAuth(`/lists/${list.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: listTitle }),
      })
      const updated = await res.json()
      setLists((prev) =>
        prev.map((l) =>
          l.id === list.id ? { ...l, title: updated.title } : l
        )
      )
    } catch (err) {
      console.error('Error updating list title:', err)
    }
  }

  const handleDeleteList = async () => {
    try {
      await fetchWithAuth(`/lists/${list.id}`, {
        method: 'DELETE',
      })
      setLists((prev) => prev.filter((l) => l.id !== list.id))
    } catch (err) {
      console.error('Error deleting list:', err)
    }
  }

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
      setLists((prev) =>
        prev.map((l) =>
          l.id === list.id
            ? { ...l, cards: [...(l.cards || []), newCard] }
            : l
        )
      )
      setNewCardTitle('')
    } catch (err) {
      console.error('Error adding card:', err)
    }
  }

  const handleDeleteCard = async (cardId) => {
    try {
      await fetchWithAuth(`/cards/${cardId}`, { method: 'DELETE' })
      setLists((prev) =>
        prev.map((l) =>
          l.id === list.id
            ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) }
            : l
        )
      )
    } catch (err) {
      console.error('Error deleting card:', err)
    }
  }

  const handleSaveCardTitle = async (cardId) => {
    try {
      const res = await fetchWithAuth(`/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: cardEditValue }),
      })
      const updated = await res.json()
      setLists((prev) =>
        prev.map((l) =>
          l.id === list.id
            ? {
                ...l,
                cards: l.cards.map((c) =>
                  c.id === cardId ? updated : c
                ),
              }
            : l
        )
      )
      setEditingCardId(null)
    } catch (err) {
      console.error('Error updating card:', err)
    }
  }

  const handleToggleComplete = async (cardId, currentVal) => {
    try {
      await fetchWithAuth(`/cards/${cardId}/meta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          key: 'completed',
          value: currentVal === 'true' ? 'false' : 'true',
        }),
      })

      setLists((prev) =>
        prev.map((l) =>
          l.id === list.id
            ? {
                ...l,
                cards: l.cards.map((card) =>
                  card.id === cardId
                    ? {
                        ...card,
                        meta: (card.meta || []).map((m) =>
                          m.key === 'completed'
                            ? {
                                ...m,
                                value:
                                  currentVal === 'true' ? 'false' : 'true',
                              }
                            : m
                        ),
                      }
                    : card
                ),
              }
            : l
        )
      )
    } catch (err) {
      console.error('Error toggling complete:', err)
    }
  }

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return

    const oldIndex = list.cards.findIndex((c) => c.id === active.id)
    const newIndex = list.cards.findIndex((c) => c.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(list.cards, oldIndex, newIndex)
    const reindexed = reordered.map((card, i) => ({
      ...card,
      position: i,
    }))

    setLists((prev) =>
      prev.map((l) =>
        l.id === list.id ? { ...l, cards: reindexed } : l
      )
    )

    try {
      await fetchWithAuth('/cards/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId: list.id,
          positions: reindexed.map((c) => ({ id: c.id, position: c.position })),
        }),
      })
    } catch (err) {
      console.error('Error reordering cards:', err)
    }
  }

  return (
    <Card sx={{ minWidth: 250, flexShrink: 0 }}>
      <CardContent>
        {/* List title */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="standard"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            onBlur={handleUpdateListTitle}
            InputProps={{
              disableUnderline: true,
              sx: { fontWeight: 'bold', fontSize: '1.1rem' },
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

        {/* Cards with DnD */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={(list.cards || []).map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <Box component="ul" sx={{ listStyle: 'none', pl: 0, m: 0, mt: 2 }}>
              {(list.cards || []).map((card) => (
<SortableCardItem
  key={card.id}
  card={card}
  isEditing={editingCardId === card.id}
  editValue={cardEditValue}
  setEditValue={setCardEditValue}
  onEdit={() => {
    setEditingCardId(card.id)
    setCardEditValue(card.title)
  }}
  onSave={() => handleSaveCardTitle(card.id)}
  onDelete={() => handleDeleteCard(card.id)}
  onToggle={() =>
    handleToggleComplete(
      card.id,
      card.meta?.find((m) => m.key === 'completed')?.value || 'false'
    )
  }
/>
              ))}
            </Box>
          </SortableContext>
        </DndContext>

        {/* Add Card */}
        <Box component="form" onSubmit={handleAddCard} sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Add card"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
          />
          <Button variant="contained" size="small" type="submit">
            Add
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
