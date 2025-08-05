import { Box, Paper } from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import List from './List'

export default function SortableListContainer({
  id,
  list,
  setBoard,
  accessToken,
  toggleComplete,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  return (
    <Box
      ref={setNodeRef}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderTopRightRadius: 0,
        width: '100%',
        minWidth: 250,
        opacity: isDragging ? 0.6 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {/* Folder-style drag tab */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          left: 0,
          display: 'flex',
          gap: 1,
          zIndex: 100,
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Paper
          {...attributes}
          {...listeners}
          elevation={1}
          sx={(theme) => ({
            width: 60,
            height: 28,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderTopLeftRadius: 11,
            borderTopRightRadius: 11,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.disabled,
            cursor: 'grab',
            fontSize: '.8rem',
            boxShadow: `
              0px -2px 1px rgba(0, 0, 0, 0.05),
              4px -4px 8px rgba(0, 0, 0, 0.03)
            `,
          })}
        >
          <DragIndicatorIcon sx={{ transform: 'rotate(90deg)' }} />
        </Paper>
      </Box>

      {/* List Content */}
      <List
        list={list}
        setBoard={setBoard}
        accessToken={accessToken}
        toggleComplete={toggleComplete}
      />
    </Box>
  )
}
