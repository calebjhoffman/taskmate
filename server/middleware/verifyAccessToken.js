import jwt from 'jsonwebtoken'

export function verifyAccessToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Missing auth header' })

  const token = authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Missing token' })

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'access_secret')
    req.userId = payload.userId
    next()
  } catch (err) {
    console.error('Invalid access token:', err)
    res.status(403).json({ error: 'Invalid token' })
  }
}
