import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material'
import logo from '@/assets/tm-logo.png'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const { login, signup, accessToken, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (accessToken) {
      navigate('/dashboard')
    }
  }, [accessToken, navigate])

  if (loading) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const action = mode === 'login' ? login : signup

    try {
      const res = await action(email, password, name)
      if (res.error) {
        setError(res.error)
        return
      }
    } catch (err) {
      setError('Something went wrong')
    }
  }

  return (
    <Container maxWidth="xs" sx={{ pt: 12 , height:'100vh'}}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img
            src={logo}
            alt="TaskMate"
              style={{
                height: '70px',
                background: '#3283d9',
                padding: '0px 15px',
                marginBottom: '20px',
                borderRadius: '11px',
              }}
          />
        </Box>

        <Typography
          variant="subtitle1" // ⬅️ Smaller than h5
          align="left"
          sx={{ fontWeight: 600 }}
        >
          {mode === 'login' ? 'Login to TaskMate' : 'Create your account'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          {mode === 'signup' && (
            <TextField
              label="Name"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
          >
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </Button>
        </Box>

        <Button
          onClick={() =>
            setMode((prev) => (prev === 'login' ? 'signup' : 'login'))
          }
          fullWidth
          sx={{ mt: 2 }}
        >
          {mode === 'login'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Log in'}
        </Button>
      </Paper>
    </Container>
  )
}
