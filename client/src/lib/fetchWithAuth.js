import { useAuth } from '@/context/AuthContext'

export function useFetchWithAuth() {
  const { accessToken, logout } = useAuth()

  return async (url, options = {}) => {
    const token = accessToken
    if (!token) throw new Error('No access token available')

    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    }

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
      ...options,
      headers,
      credentials: 'include',
    })

    // If token expired or unauthorized, optionally handle logout
    if (res.status === 401) {
      console.warn('🔒 Unauthorized — token may have expired')
      await logout()
    }

    return res
  }
}
