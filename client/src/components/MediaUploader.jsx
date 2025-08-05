import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box } from '@mui/material'
import { getCroppedImg } from '../utils/getCroppedImg'

export default function MediaUploader({ onCropComplete }) {
  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [open, setOpen] = useState(false)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onSelectFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setImageSrc(reader.result)
      setOpen(true)
    })
    reader.readAsDataURL(file)
  }

  const onCropCompleteHandler = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleClose = () => {
    setOpen(false)
    setImageSrc(null)
  }

    // Inside your component...
    const handleCrop = async () => {
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })

    // Call parent with the cropped file
    onCropComplete(file)

    handleClose()
    }

  return (
    <Box>
      <input
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        style={{ marginBottom: 8 }}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Crop your image</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 300,
              backgroundColor: '#333',
            }}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteHandler}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleCrop}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
