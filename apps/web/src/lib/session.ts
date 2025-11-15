import { useSession } from '@tanstack/react-start/server'

export type SessionUser = {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
}

export type SessionData = {
  user?: SessionUser
}

export function useAppSession() {
  return useSession<SessionData>({
    name: 'app-session',
    password: process.env.SESSION_SECRET || 'development-secret-min-32-characters-long!',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
  })
}