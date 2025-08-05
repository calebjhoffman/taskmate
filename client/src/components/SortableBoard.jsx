import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  IconButton,
  Paper,
  Typography,
} from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'

export default function SortableBoard({ id, board, onDelete }) {
  const navigate = useNavigate()
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
        width: '100%',
        minWidth: 280,
        opacity: isDragging ? 0.6 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {/* Drag Tab */}
        <Paper
        {...attributes}
        {...listeners}
        sx={(theme) => ({
            position: 'absolute',
            top: -10,
            left: 0,
            width: 60,
            textAlign: 'center',
            cursor: 'grab',
            backgroundColor: theme.palette.background.paper,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            boxShadow: `0px -2px 1px rgba(0, 0, 0, 0.05), 4px -4px 8px rgba(0, 0, 0, 0.05)`,
            zIndex: 20,
        })}
        >
        <DragIndicatorIcon sx={{ transform: 'rotate(90deg)', fontSize: '2rem' }} />
        </Paper>

      {/* Card */}
      <Card sx={{ height: 200, overflow: 'hidden', borderRadius: 2, position: 'relative' }}>
        <IconButton
          size="small"
          onClick={() => onDelete(board.id)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            color: 'error.main',
            backgroundColor: 'background.paper',
            '&:hover': {
              backgroundColor: 'background.default',
            },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>

        <CardActionArea onClick={() => navigate(`/board/${board.id}`)} sx={{ height: '100%' }}>
          <CardContent
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 2,
            }}
          >
            {/* Title at Top */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  mb: 1,
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                }}
              >
                {board.title}
              </Typography>
              <Divider />
            </Box>

            {/* Stats at Bottom */}
            <Box sx={{ mt: 2, fontSize: '1.1rem' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    🗂 {board.listCount ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Lists
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    📋 {board.cardCount ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Cards
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  ✅ {board.unfinishedCardCount ?? 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Open Tasks
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  )
}
