import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  LinearProgress,
  Button,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban'
import ViewListIcon from '@mui/icons-material/ViewList'
import StyleIcon from '@mui/icons-material/Style'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import { useFetchWithAuth } from '@/lib/fetchWithAuth'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'


export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const fetchWithAuth = useFetchWithAuth()
  const navigate = useNavigate()
  const { user } = useAuth()


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetchWithAuth('/dashboard/summary')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const fetchUser = async () => {
      try {
        const res = await fetchWithAuth('/auth/refresh')
        const data = await res.json()
        setUser(data.user)
      } catch (err) {
        console.error('Error fetching user info:', err)
      }
    }

    fetchUser()

  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10, height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const statBoxes = [
    {
      label: 'Boards',
      value: stats?.boards ?? 0,
      icon: <ViewKanbanIcon fontSize="large" />,
      color: '#1976d2',
    },
    {
      label: 'Lists',
      value: stats?.lists ?? 0,
      icon: <ViewListIcon fontSize="large" />,
      color: '#388e3c',
    },
    {
      label: 'Cards',
      value: stats?.cards ?? 0,
      icon: <StyleIcon fontSize="large" />,
      color: '#f57c00',
    },
    {
      label: 'Incomplete Cards',
      value: stats?.openCards ?? 0,
      icon: <DashboardIcon fontSize="large" />,
      color: '#d32f2f',
    },
  ]

  const totalCards = stats?.cards ?? 0
  const openCards = stats?.openCards ?? 0
  const completionRate = totalCards > 0 ? ((totalCards - openCards) / totalCards) * 100 : 0

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 4,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default', // 👈 Theme-aware background
      }}
    >
      <Typography variant="h4" gutterBottom mb={2}>
        👋 Welcome Back{user?.name ? `, ${user.name}` : ''}!
      </Typography>

      <Typography variant="h6" mb={5} color="text.secondary">
        Let’s see how your productivity is shaping up today.
      </Typography>

      <Grid
        container
        spacing={3}
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr',
            md: '1fr 1fr',
            lg: '1fr 1fr',
          },
        }}
      >
        {statBoxes.map((box) => (
          <Grid item key={box.label} sx={{ width: '100%' }}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                width: '100%',
                minHeight: 160,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: box.color,
              }}
            >
              {box.icon}
              <Typography variant="h6" mt={2}>
                {box.label}
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {box.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Completion Progress */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" gutterBottom>
          ✅ Completion Progress
        </Typography>
        <LinearProgress
          variant="determinate"
          value={completionRate}
          sx={{ height: 10, borderRadius: 1 }}
        />
        <Typography mt={1} variant="body2" color="text.secondary">
          {completionRate.toFixed(0)}% of your cards are complete
        </Typography>
      </Box>

      {/* Motivational Quote */}
      <Box mt={8}>
        <Typography variant="h6" fontStyle="italic" textAlign="center">
          “Success doesn’t come from what you do occasionally. It comes from what you do consistently.”
        </Typography>
      </Box>

      {/* Call to Action */}
      <Box mt={4} textAlign="center">
        <Button
          variant="contained"
          color="primary"
          startIcon={<RocketLaunchIcon />}
          onClick={() => navigate('/boards')}
        >
          Go to My Boards
        </Button>
      </Box>
    </Container>
  )
}
