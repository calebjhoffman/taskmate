import { Navigate, Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TopBar from '../components/TopBar'
import { useState } from 'react'
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  useMediaQuery, 
  useTheme
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import SettingsIcon from '@mui/icons-material/Settings'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban'
import ViewListIcon from '@mui/icons-material/ViewList'
import StyleIcon from '@mui/icons-material/Style'


export default function ProtectedLayout() {
  const [open, setOpen] = useState(true)
  const toggleDrawer = () => setOpen((prev) => !prev)
  const { accessToken, loading } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const drawerWidth = 200


  if (loading) return null
  if (!accessToken) return <Navigate to="/" replace />

const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: <SettingsIcon />,
  },
  {
    label: 'My Boards',
    to: '/boards',
    icon: <ViewKanbanIcon />,
  },
  {
    label: 'My Lists',
    to: '/lists',
    icon: <ViewListIcon />,
  },
  {
    label: 'My Cards',
    to: '/cards',
    icon: <StyleIcon />,
  },
]

  return (
<>
  <TopBar onToggleSidebar={toggleDrawer} />

  {/* Horizontal layout wrapper */}
  <Box sx={{ display: 'flex' }}>
    {/* Sidebar */}
<Drawer
  variant={isMobile ? 'temporary' : 'persistent'}
  open={open}
  onClose={toggleDrawer}
  sx={{
    width: open && !isMobile ? 200 : 0, // make sure desktop width is visible
    flexShrink: 0,
    display: { xs: open ? 'block' : 'none', sm: 'block' },
    [`& .MuiDrawer-paper`]: {
      width: 200,
      top: isMobile ? 57 : 80, // ✅ dynamic top based on device
      boxSizing: 'border-box',
      transition: 'width 0.3s',
    },
  }}
  PaperProps={{
    sx: {
      top: isMobile ? 57 : 80, // ✅ apply same logic here too
    },
  }}
>
    <List>
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <ListItemButton onClick={() => isMobile && toggleDrawer()}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        </NavLink>
      ))}
    </List>

    </Drawer>

    {/* Main content area */}
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 64px)', // or however tall your TopBar is
        width: open && !isMobile ? `calc(100vw - 200px)` : '100vw',
        transition: 'width 0.3s ease',
        bgcolor: 'background.default', // 👈 this also helps on edge cases
      }}
    >
      <Outlet />
    </Box>
  </Box>
</>

  )
}
