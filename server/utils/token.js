import jwt from 'jsonwebtoken'

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret'

const isProd = process.env.NODE_ENV === 'production'

export function createTokens(userId) {
  const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
  return { accessToken, refreshToken }
}


export function sendRefreshToken(res, token) {
  res.cookie('jid', token, {
    httpOnly: true,
    sameSite: isProd ? 'None' : 'Lax',
    secure: isProd,
    path: '/api/auth/refresh',
  })
}

export function sendAccessToken(res, token) {
  res.json({ accessToken: token })
}
