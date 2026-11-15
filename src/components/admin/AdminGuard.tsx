
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from './AdminAuth'

export default function AdminGuard() {
  const { user, profile, loading } = useAdminAuth()
  const location = useLocation()

  // Menunggu pemeriksaan session dan profil
  if (loading) {
    return (
      <div className="admin-auth-loading">
        <div className="admin-loader" />
        <p>Memeriksa akses admin...</p>
      </div>
    )
  }

  // Apabila belum login, arahkan ke halaman login
  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    )
  }

  // Jika bukan admin/owner aktif, tolak akses
  if (
    !profile ||
    !profile.is_active ||
    !['admin', 'owner'].includes(profile.role)
  ) {
    return (
      <div className="admin-access-denied">
        <h2>Akses Ditolak</h2>
        <p>
          Akun kamu tidak memiliki izin untuk
          mengakses halaman administrasi Cahaya Barber.
        </p>
      </div>
    )
  }

  return <Outlet />
}
