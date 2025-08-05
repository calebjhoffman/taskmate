// main.jsx or index.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { AuthProvider, useAuth } from './context/AuthContext'
import ColorModeProvider from './context/ColorModeContext'

// 🔁 Wrapper component to delay rendering until token is ready
function Providers() {
  const { loading } = useAuth()

  if (loading) return null // or <LoadingSpinner />

  return (
    <ColorModeProvider>
      <App />
    </ColorModeProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Providers />
    </AuthProvider>
  </StrictMode>
)
