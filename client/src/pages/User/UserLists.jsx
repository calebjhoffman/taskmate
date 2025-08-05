import { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Skeleton,
} from '@mui/material'
import { useFetchWithAuth } from '@/lib/fetchWithAuth'
import UserListCard from '@/components/UserListCard' // 🆕 clean version

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

export default function UserLists() {
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const fetchWithAuth = useFetchWithAuth()

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const res = await fetchWithAuth('/lists')
        const data = await res.json()
        setLists(data)
      } catch (err) {
        console.error('Failed to fetch lists:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLists()
  }, [])

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom mb={4}>
        🗂️ My Lists
      </Typography>

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
  }}
>
        {loading
          ? [...Array(3)].map((_, i) => <SkeletonList key={i} />)
          : lists.map((list) => (
              <UserListCard
                key={list.id}
                list={list}
                setLists={setLists}
                toggleComplete={(cardId, currentVal) => {
                  setLists((prevLists) =>
                    prevLists.map((l) =>
                      l.id === list.id
                        ? {
                            ...l,
                            cards: (l.cards || []).map((card) =>
                              card.id === cardId
                                ? {
                                    ...card,
                                    meta: (card.meta || []).map((m) =>
                                      m.key === 'completed'
                                        ? {
                                            ...m,
                                            value:
                                              currentVal === 'true'
                                                ? 'false'
                                                : 'true',
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
                }}
              />
            ))}
      </Box>
    </Container>
  )
}
