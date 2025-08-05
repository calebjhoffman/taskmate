export async function getCroppedImg(imageSrc, croppedAreaPixels) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = croppedAreaPixels.width
  canvas.height = croppedAreaPixels.height

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/jpeg', 0.9) // optimize quality/size
  })
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', (err) => reject(err))
    img.src = url
  })
}
