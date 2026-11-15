// ==========================================
// ADMIN AUTH CONTEXT (MODE DEMO OFFLINE)
// ==========================================

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { DEMO_USERS, mockDb, type MockUser } from '../../mock/mockData'

export type AdminProfile = {
  id: string
  user_id: string
  full_name: string
  role: 'admin' | 'owner'
  branch_id: string | null
  is_active: boolean
  created_at: string
}

type AdminAuthContextType = {
  user: { id: string; email: string } | null
  session: { access_token: string } | null
  profile: AdminProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AdminAuthContext =
  createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(() =>
    mockDb.getCurrentUser()
  )
  const [loading, setLoading] = useState(false)

  const profile: AdminProfile | null = currentUser
    ? {
        id: currentUser.id,
        user_id: currentUser.id,
        full_name: currentUser.full_name,
        role: currentUser.role,
        branch_id: currentUser.branch_id,
        is_active: currentUser.is_active,
        created_at: new Date().toISOString(),
      }
    : null

  const user = currentUser
    ? { id: currentUser.id, email: currentUser.email }
    : null

  const session = currentUser
    ? { access_token: 'demo-token-' + currentUser.id }
    : null

  const signIn = async (email: string, password: string) => {
    setLoading(true)

    // Simulasi delay jaringan cepat (150ms) agar terasa nyata
    await new Promise((resolve) => setTimeout(resolve, 150))

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    // Cari di daftar akun demo
    const matched = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail
    )

    if (matched) {
      // Verifikasi password (menerima password spesifik atau contoh 'Owner99.')
      if (
        cleanPassword === matched.password ||
        cleanPassword === 'Owner99.' ||
        cleanPassword === 'Admin99.'
      ) {
        mockDb.setCurrentUser(matched)
        setCurrentUser(matched)
        setLoading(false)
        return
      } else {
        setLoading(false)
        throw new Error('Password salah. Silakan coba kembali.')
      }
    }

    // Jika memasukkan email lain tapi password 'Owner99.'
    if (cleanPassword === 'Owner99.') {
      const isOwnerRole = cleanEmail.includes('owner')
      const mockUser: MockUser = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        full_name: isOwnerRole ? 'Hendra Wijaya (Owner)' : 'Admin Cahaya Barber',
        role: isOwnerRole ? 'owner' : 'admin',
        branch_id: isOwnerRole ? null : 'manislor',
        is_active: true,
      }
      mockDb.setCurrentUser(mockUser)
      setCurrentUser(mockUser)
      setLoading(false)
      return
    }

    setLoading(false)
    throw new Error('Email atau password salah. Silakan coba kembali.')
  }

  const signOut = async () => {
    mockDb.setCurrentUser(null)
    setCurrentUser(null)
  }

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

// ==========================================
// AUTH HOOK
// ==========================================
// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth() {
  const context = useContext(AdminAuthContext)

  if (!context) {
    throw new Error(
      'useAdminAuth harus digunakan di dalam AdminAuthProvider.'
    )
  }

  return context
}
