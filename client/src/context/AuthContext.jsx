import { createContext, useContext, useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_BASE_URL

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [meta, setMeta] = useState({})

  const refreshUser = async (token = accessToken) => {
    if (!token) {
      console.warn('⛔️ No access token available for refreshUser')
      return
    }

    try {
      const res = await fetch(`${API}/users/meta`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      })

      const data = await res.json()

      if (data.user) setUser(data.user)

      const meta = data.meta || {}
      console.log(meta)
      // If meta.avatar exists, fetch the media record
      if (meta.avatar) {
        try {
          const mediaRes = await fetch(`${API}/media/${meta.avatar}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          })
          const mediaData = await mediaRes.json()
          meta.avatarUrl = `${API.replace('/api', '')}${mediaData.url}`
        } catch (err) {
          console.warn('⚠️ Failed to fetch media for avatar', err)
        }
      }

      setMeta(meta)
    } catch (err) {
      console.error('Failed to fetch user/meta:', err)
    }
  }



  

  // Refresh token on load
useEffect(() => {
  const refresh = async () => {
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        credentials: 'include',
      })
      console.log(res)
      const data = await res.json()
      
      if (data.accessToken) {
        setAccessToken(data.accessToken)
        await refreshUser(data.accessToken) // ✅ pass token directly
      }
    } catch (err) {
      console.error('Refresh failed:', err)
    } finally {
      setLoading(false)
    }
  }

  refresh()
}, [])


const login = async (email, password) => {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  console.log(data)
  if (data.accessToken) {
    setAccessToken(data.accessToken)
    await refreshUser(data.accessToken) // ✅ fetch user/meta immediately
  }
  return data
}

const signup = async (email, password, name) => {
  try {
    alert(`POST to: ${API}/auth/signup`);
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, name }),
    });

    const contentType = res.headers.get('content-type') || '';

    if (!res.ok) {
      const errorText = contentType.includes('application/json')
        ? await res.json()
        : await res.text();

      throw new Error(
        typeof errorText === 'string' ? errorText : errorText.message || 'Signup failed'
      );
    }

    const data = await res.json();
    if (data.accessToken) {
      setAccessToken(data.accessToken)
      await refreshUser(data.accessToken) // ✅ fetch user/meta immediately
    }

    return data;
  } catch (err) {
    console.error('❌ Signup fetch error:', err.message);
    alert(`❌ Signup error:\n${err?.message || JSON.stringify(err) || data}`);
    return { error: err.message };
  }
};


const logout = async () => {
  await fetch(`${API}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  setAccessToken(null)
}

  return (
    <AuthContext.Provider value={{
      accessToken,
      login,
      signup,
      logout,
      loading,
      user,
      meta,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
