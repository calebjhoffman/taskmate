import { Box, Checkbox, IconButton, TextField } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function SortableCard({ card, listId, handleDeleteCard, handleUpdateCard, toggleComplete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const completedMeta = card.meta?.find((m) => m.key === 'completed')
  const completed = completedMeta?.value === 'true'

  return (
    <Box
      component="li"
      ref={setNodeRef}
      {...attributes}
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'background.paper',
        borderRadius: 1,
        mb: 1,
        px: 1,
        py: 0.5,
        boxShadow: 1,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.1s ease',
        opacity: completed ? 0.5 : 1,
        textDecoration: completed ? 'line-through' : 'none',
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {/* Drag Handle */}
      <Box
        {...listeners}
        sx={{
          mr: 1,
          px: 1,
          cursor: 'grab',
          color: 'text.disabled',
          userSelect: 'none',
          fontWeight: 'bold',
        }}
      >
        ☰
      </Box>

      <Checkbox
        size="small"
        checked={completed}
        onChange={() =>
          toggleComplete(card.id, completedMeta?.value || 'false')
        }
        sx={{ mr: 1 }}
      />

      <TextField
        fullWidth
        variant="standard"
        defaultValue={card.title}
        onBlur={(e) => handleUpdateCard(card.id, e.target.value)}
        InputProps={{
          disableUnderline: true,
          sx: { fontSize: '0.95rem' },
        }}
      />

      <IconButton
        onClick={() => handleDeleteCard(card.id)}
        size="small"
        sx={{
          ml: 1,
          color: 'error.light',
          '&:hover': { color: 'error.main' },
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}
