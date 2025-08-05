import { Avatar } from '@mui/material'
import { useAuth } from '../context/AuthContext'

export default function UserAvatar({ size = 40, sx = {}, ...props }) {
  const { user, meta } = useAuth()

  const name = user?.name || user?.email || 'User'
  const initial = name[0]?.toUpperCase() || '?'
  const avatarUrl = meta.avatarUrl || null

  return (
    <Avatar
      src={avatarUrl || undefined}
      alt={name}
      sx={{ width: size, height: size, ...sx }}
      {...props}
    >
      {avatarUrl ? null : initial}
    </Avatar>
  )
}
