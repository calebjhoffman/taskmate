import { createContext, useMemo, useState, useEffect } from 'react'
import { createTheme, ThemeProvider, CssBaseline, Box } from '@mui/material'
import { useAuth } from './AuthContext'

export const ColorModeContext = createContext()

export default function ColorModeProvider({ children }) {
  const { accessToken } = useAuth()
  const THEME_KEY = 'theme_preference'

  // 1️⃣ Load from localStorage for instant fallback
  const getInitialTheme = () =>
    localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'

  const [mode, setMode] = useState(getInitialTheme)
  const [mounted, setMounted] = useState(false)

  const API = import.meta.env.VITE_API_BASE_URL

  // 2️⃣ Fetch user’s theme preference from DB and sync localStorage
  useEffect(() => {
    if (!accessToken) {
      console.log('⛔ No token — skipping DB theme fetch')
      setMounted(true)
      return
    }

    const loadTheme = async () => {
      try {
        const res = await fetch(`${API}/users/meta/${THEME_KEY}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        const data = await res.json()
        if (data.value === 'dark' || data.value === 'light') {
          setMode(data.value)
          localStorage.setItem(THEME_KEY, data.value)
          console.log('🎨 Loaded theme from DB:', data.value)
        }
      } catch (err) {
        console.error('❌ Theme fetch failed:', err)
      } finally {
        setMounted(true)
      }
    }

    loadTheme()
  }, [accessToken])

  // 3️⃣ Toggle mode and sync both localStorage + DB
  const toggleColorMode = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light'
    setMode(newMode)
    localStorage.setItem(THEME_KEY, newMode)

    if (!accessToken) {
      console.warn('⛔ No token — skipping DB theme save')
      return
    }

    try {
      const res = await fetch(`${API}/users/meta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ key: THEME_KEY, value: newMode }),
      })

      const data = await res.json()
      console.log('✅ Theme saved to DB:', data)
    } catch (err) {
      console.error('❌ Theme save failed:', err)
    }
  }

  const colorMode = useMemo(() => ({ toggleColorMode }), [mode])
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode])

  // 4️⃣ Prevent flicker
  if (!mounted) {
    return (
      <Box sx={{ bgcolor: mode === 'dark' ? '#000' : '#fff', height: '100vh' }} />
    )
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
