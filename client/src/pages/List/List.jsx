import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Checkbox,
  Paper,
  CircularProgress,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext'
import { useFetchWithAuth } from '@/lib/fetchWithAuth'
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

export default function ListPage() {
  const { id } = useParams();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuth()
  const [newCardTitle, setNewCardTitle] = useState('');
  const fetchWithAuth = useFetchWithAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    fetchWithAuth(`/lists/${id}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then(setList)
      .finally(() => setLoading(false));
  }, [id]);

    // Add this handler:
    const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    const res = await fetchWithAuth(`/cards`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
        title: newCardTitle,
        listId: list.id,
    }),
    });

    const newCard = await res.json();

    setList((prev) => ({
        ...prev,
        cards: [...prev.cards, { ...newCard, meta: [] }],
    }));

    setNewCardTitle('');
    };

  const handleDeleteCard = async (cardId) => {
    try {
      const res = await fetchWithAuth(`/cards/${cardId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete card');

      setList((prev) => ({
        ...prev,
        cards: prev.cards.filter((card) => card.id !== cardId),
      }));
    } catch (err) {
      console.error('Error deleting card:', err.message);
    }
  };

  const handleUpdateCard = async (cardId, newTitle) => {
    try {
      const res = await fetchWithAuth(`/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!res.ok) throw new Error('Failed to update card');
    } catch (err) {
      console.error('Error updating card title:', err.message);
    }
  };

  const toggleComplete = async (cardId, currentVal) => {
    await fetchWithAuth(`/cards/${cardId}/meta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      credentials: 'include',
      body: JSON.stringify({
        cardId,
        key: 'completed',
        value: currentVal === 'true' ? 'false' : 'true',
      }),
    });

setList((prev) => {
  const updatedCards = prev.cards.map((card) => {
    if (card.id !== cardId) return card

    const existingCompleted = card.meta.find((m) => m.key === 'completed')
    const newValue = existingCompleted?.value === 'true' ? 'false' : 'true'

    let newMeta

    if (existingCompleted) {
      newMeta = card.meta.map((m) =>
        m.key === 'completed' ? { ...m, value: newValue } : m
      )
    } else {
      newMeta = [...card.meta, { key: 'completed', value: 'true' }]
    }

    return {
      ...card,
      meta: newMeta,
    }
  })

  return {
    ...prev,
    cards: updatedCards,
  }
})

  };

  if (loading) return <CircularProgress />;

return (
  <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: '100vh' }}>
    {/* Header */}
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column-reverse', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 4,
      }}
    >
      <TextField
        variant="standard"
        value={list.title}
        onChange={(e) =>
          setList((prev) => ({ ...prev, title: e.target.value }))
        }
        onBlur={async () => {
          try {
            await fetchWithAuth(`/lists/${id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ title: list.title }),
            })
          } catch (err) {
            console.error('Error updating list title:', err)
          }
        }}
        InputProps={{
          disableUnderline: true,
          sx: { fontSize: '2rem', fontWeight: 'bold' },
        }}
        fullWidth
      />

      <Button
        onClick={() => window.history.back()}
        variant="outlined"
        size="medium"
        sx={{
          alignSelf: { xs: 'flex-end', sm: 'center' },
          minWidth: 150, // ✅ Prevent line break
          whiteSpace: 'nowrap', // ✅ Force inline
        }}
      >
        Back to Lists
      </Button>
    </Box>

    {/* Cards */}
    {list.cards.map((card) => {
      const completedMeta = card.meta.find((m) => m.key === 'completed')
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
              <TextField
                variant="standard"
                value={card.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setList((prev) => ({
                    ...prev,
                    cards: prev.cards.map((c) =>
                      c.id === card.id ? { ...c, title: newTitle } : c
                    ),
                  }));
                }}
                onBlur={() => handleUpdateCard(card.id, card.title)}
                fullWidth
                InputProps={{ disableUnderline: true }}
                sx={{ fontSize: '1rem' }}
              />
          </Box>
          <IconButton
            edge="end"
            size="small"
            color="error"
            onClick={() => handleDeleteCard(card.id)} // You must already have this
          >
            <DeleteIcon />
          </IconButton>
        </Paper>
      )
    })}

    {/* Add Card Form */}
    <Box
      component="form"
      onSubmit={handleAddCard}
      sx={{
        mt: 4,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
      }}
    >
      <TextField
        fullWidth
        size="medium"
        label="New card title"
        value={newCardTitle}
        onChange={(e) => setNewCardTitle(e.target.value)}
      />
      <Button
        type="submit"
        variant="contained"
        sx={{
          height: '54px', // ✅ Match MUI medium input
          whiteSpace: 'nowrap',
        }}
      >
        Add Card
      </Button>
    </Box>
  </Box>
)
}
