import { useTheme } from '@mui/material/styles'
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  AppBar,
  Toolbar,
  Typography,
  Box
} from '@mui/material'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import { useContext, useState } from 'react'
import { ColorModeContext } from '../context/ColorModeContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import logo from '@/assets/tm-logo.png'
import UserAvatar from './UserAvatar'
import MenuIcon from '@mui/icons-material/Menu'



export default function TopBar({ onToggleSidebar }) {
  const theme = useTheme()
  const colorMode = useContext(ColorModeContext)
  const { user, meta, logout } = useAuth()

  const navigate = useNavigate()

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const handleLogout = () => {
    logout()
    handleMenuClose()
    navigate('/')
  }

  const avatarUrl = meta?.avatar || '' // fallback handled below

  return (
    <AppBar position="static" sx={{ width: '100%' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left: Drawer toggle + Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onToggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src={logo}
              alt="TaskMate"
              style={{
                height: 'auto',
                maxHeight: 48,
                display: 'block',
              }}
            />
          </Link>
        </Box>

        {/* Right: Theme toggle + Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={colorMode.toggleColorMode}
            aria-label="toggle theme"
          >
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {user && (
            <>
              <Tooltip title="Account">
                <IconButton onClick={handleMenuOpen} size="small">
                  <UserAvatar size={36} />
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => navigate('/settings')}>Profile Settings</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
