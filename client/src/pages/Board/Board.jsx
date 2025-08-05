import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import List from '../../components/List'
import SortableListContainer from '../../components/SortableListContainer'
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { useFetchWithAuth } from '@/lib/fetchWithAuth'



export default function BoardPage() {
  const { id } = useParams()
  const { accessToken } = useAuth()
  const [board, setBoard] = useState({ id: '', title: '', lists: [] })
  const [loadingLists, setLoadingLists] = useState(true)
  const [newListTitle, setNewListTitle] = useState('')
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const fetchWithAuth = useFetchWithAuth()

  const API = import.meta.env.VITE_API_BASE_URL

  const sensors = useSensors(
    useSensor(PointerSensor)
  )

useEffect(() => {
  const fetchBoard = async () => {
    try {
      const res = await fetchWithAuth(`/boards/${id}`)
      const data = await res.json()
      setBoard(data)
    } catch (err) {
      console.error('Error fetching board:', err)
    } finally {
      setLoadingLists(false)
    }
  }

  fetchBoard()
}, [id, accessToken])

const handleDragEnd = ({ active, over }) => {
  if (!over || active.id === over.id) return;

  const oldIndex = board.lists.findIndex((l) => l.id === active.id);
  const newIndex = board.lists.findIndex((l) => l.id === over.id);
  if (oldIndex === -1 || newIndex === -1) return;

  const reordered = [...board.lists];
  const [moved] = reordered.splice(oldIndex, 1);
  reordered.splice(newIndex, 0, moved);

  const reindexed = reordered.map((list, index) => ({
    ...list,
    position: index,
  }));

  // Update UI
  setBoard((prev) => ({
    ...prev,
    lists: reindexed,
  }));

    // ✅ Patch to server
  fetchWithAuth(`/lists/reorder`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      boardId: board.id, // ✅ required by backend
      positions: reindexed.map((l) => ({ id: l.id, position: l.position })),
    }),
  }).then((res) => {
      if (!res.ok) throw new Error('Failed to save list order');
    }).catch((err) => {
      console.error('Error saving list order:', err);
    });
  };


  const handleAddList = async (e) => {
    e.preventDefault()
    if (!newListTitle.trim()) return

    try {
      const res = await fetchWithAuth(`/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newListTitle,
          boardId: board.id,
        }),
      })
      const newList = await res.json()
      setBoard({
        ...board,
        lists: [...board.lists, { ...newList, cards: [] }],
      })
      setNewListTitle('')
    } catch (err) {
      console.error('Error creating list:', err)
    }
  }

const toggleComplete = async (cardId, currentVal) => {
  
  try {
    await fetchWithAuth(`/cards/${cardId}/meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        cardId,
        key: 'completed',
        value: currentVal === 'true' ? 'false' : 'true',
      }),
    });

    setBoard((prev) => {

      const updatedLists = prev.lists.map((list) => {
        const updatedCards = list.cards.map((card) => {
          if (card.id !== cardId) return card

          const currentMeta = card.meta || []
          const completedEntry = currentMeta.find((m) => m.key === 'completed')
          const newValue = completedEntry?.value === 'true' ? 'false' : 'true'

          const newMeta = currentMeta.map((m) =>
            m.key === 'completed' ? { ...m, value: newValue } : m
          )

          return {
            ...card,
            meta: newMeta,
          }
        })

        return {
          ...list,
          cards: updatedCards,
        }
      })

      return {
        ...prev,
        lists: updatedLists,
      }
    })

  } catch (err) {
    console.error('Error toggling completion:', err);
  }
};


function BoardSkeleton() {
  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 6,
        minHeight: '100vh', // ✅ ensures full screen scaffold
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Title and header buttons */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <Skeleton variant="text" animation="wave" width={300} height={48} />
        <Skeleton variant="rectangular" animation="wave" width={150} height={40} />
      </Box>

      {/* Board ID */}
      <Skeleton
        variant="text"
        animation="wave"
        width={180}
        height={24}
        sx={{ mb: 4 }}
      />

      {/* New List Form */}
      <Box sx={{ display: 'flex', gap: 2, mb: 5 }}>
        <Skeleton
          variant="rectangular"
          animation="wave"
          width="100%"
          height={40}
          sx={{ flex: 1 }}
        />
        <Skeleton variant="rectangular" animation="wave" width={100} height={40} />
      </Box>

      {/* Lists */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr',
            md: '1fr 1fr',
            lg: '1fr 1fr 1fr',
          },
          gap: 5,
          flexGrow: 1, // ✅ allows it to fill remaining space
          maxWidth: 1400,
          mx: 'auto',
        }}
      >
        {[1, 2, 3].map((i) => (
          <Box
            key={i}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: 1,
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Skeleton
              variant="text"
              animation="wave"
              width="80%"
              height={30}
              sx={{ mb: 1 }}
            />
            {[...Array(4)].map((_, idx) => (
              <Skeleton
                key={idx}
                variant="rectangular"
                animation="wave"
                width="100%"
                height={50}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Container>
  )
}

function SkeletonList() {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
        minHeight: 250,
      }}
    >
      <Skeleton variant="text" animation="wave" width="70%" height={30} sx={{ mb: 2 }} />
      {[...Array(3)].map((_, idx) => (
        <Skeleton
          key={idx}
          variant="rectangular"
          animation="wave"
          width="100%"
          height={50}
          sx={{ mb: 1, borderRadius: 1 }}
        />
      ))}
    </Box>
  )
}


  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
      {/* Action buttons top right */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 2,
          mb: 2,
        }}
      >
        <Button
          onClick={() => navigate('/dashboard')}
          variant="outlined"
          sx={{ whiteSpace: 'nowrap' }}
        >
          Back to Boards
        </Button>

        <IconButton
          onClick={() => setShowDeleteConfirm(true)}
          size="small"
          sx={{
            color: 'error.light',
            '&:hover': { color: 'error.main' },
          }}
        >
          <DeleteIcon fontSize="medium" />
        </IconButton>
      </Box>

      {/* Editable title */}
      <TextField
        variant="standard"
        value={board.title}
        onChange={(e) =>
          setBoard((prev) => ({ ...prev, title: e.target.value }))
        }
        onBlur={async () => {
          try {
            const res = await fetch(`${API}/boards/${board.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: 'include',
              body: JSON.stringify({ title: board.title }),
            })
            if (!res.ok) throw new Error('Failed to update board')
          } catch (err) {
            console.error('Error updating board title:', err.message)
          }
        }}
        InputProps={{
          disableUnderline: true,
          sx: {
            fontSize: '2rem',
            fontWeight: 'bold',
          },
        }}
        fullWidth
        sx={{ mb: 1 }}
      />

      {/* Board ID below title */}
      <Typography
        variant="body2"
        color="text.secondary"
        gutterBottom
        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 4 }}
      >
        ID: {board.id}
      </Typography>

      {/* Add List Form (unchanged except spacing) */}
      <Box
        component="form"
        onSubmit={handleAddList}
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <TextField
          label="New List Title"
          variant="outlined"
          size="small"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth={{ xs: true, sm: false }}
        >
          Add List
        </Button>
      </Box>

      {/* Lists */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={board.lists.map((list) => list.id)} strategy={rectSortingStrategy}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr',
                md: '1fr 1fr',
                lg: '1fr 1fr 1fr',
                xl: '1fr 1fr 1fr 1fr',
              },
              gap: 5,
              maxWidth: 1400,
              mx: 'auto',
              mt: 10,
            }}
          >
          {loadingLists
            ? [...Array(3)].map((_, i) => <SkeletonList key={i} />)
            : board.lists.map((list) => (
                <SortableListContainer
                  key={list.id}
                  id={list.id}
                  list={list}
                  setBoard={setBoard}
                  accessToken={accessToken}
                  toggleComplete={toggleComplete}
                />
              ))}
          </Box>
        </SortableContext>
      </DndContext>


        <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        >
        <DialogTitle>Delete Board?</DialogTitle>
        <DialogContent>
            This will permanently delete the board and all its lists and cards.
            Are you sure you want to continue?
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setShowDeleteConfirm(false)}>
            Cancel
            </Button>
            <Button
            onClick={async () => {
                try {
                const res = await fetch(`${API}/boards/${board.id}`, {
                    method: 'DELETE',
                    headers: {
                    Authorization: `Bearer ${accessToken}`,
                    },
                    credentials: 'include',
                })

                if (!res.ok) throw new Error('Failed to delete board')

                navigate('/dashboard')
                } catch (err) {
                console.error('Error deleting board:', err.message)
                }
            }}
            color="error"
            variant="contained"
            >
            Delete
            </Button>
        </DialogActions>
        </Dialog>
    </Container>

  )
}
