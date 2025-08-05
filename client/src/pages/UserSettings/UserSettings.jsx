import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Stack,
  Divider,
  Snackbar, 
  Alert
} from '@mui/material'
import UserAvatar from '../../components/UserAvatar'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

export default function UserSettings() {
  const { user, meta, accessToken, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(meta.avatarUrl || '')
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' })

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: formData,
    })

    const data = await res.json()
    const mediaId = data.id
    const url = `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${data.url}`

    await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ key: 'avatar', value: mediaId }),
    })

    setAvatarUrl(url)
    await refreshUser()
  }

const handleSave = async () => {
  setSaving(true)
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ name }),
    })

    if (!res.ok) throw new Error('Update failed')

    setFeedback({
      open: true,
      message: 'Settings updated!',
      severity: 'success',
    })
  } catch (err) {
    console.error('Save error:', err)
    setFeedback({
      open: true,
      message: 'Failed to update settings',
      severity: 'error',
    })
  } finally {
    setSaving(false)
  }
}


  return (
    <Container maxWidth="sm" sx={{ py: 6 ,height:'100vh'}}>
      <Typography variant="h5" gutterBottom>
        Profile Settings
      </Typography>

      <Stack spacing={3}>

        <TextField
          label="Email"
          value={user?.email || ''}
          InputProps={{ readOnly: true }}
          fullWidth
        />

        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <Divider/>

        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between" sx={{ mt: 4 }}>
        <UserAvatar size={72} />
        <Box>
            <label htmlFor="avatar-upload">
            <Button
                variant="outlined"
                component="span"
            >
                Change Avatar
            </Button>
            </label>
            <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            />
        </Box>
        </Stack>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Stack>
        <Snackbar
        open={feedback.open}
        autoHideDuration={3000}
        onClose={() => setFeedback({ ...feedback, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
        <Alert
            onClose={() => setFeedback({ ...feedback, open: false })}
            severity={feedback.severity}
            variant="filled"
        >
            {feedback.message}
        </Alert>
        </Snackbar>
    </Container>
  )
}
