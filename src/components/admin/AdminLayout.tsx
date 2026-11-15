// ==========================================
// ADMIN LAYOUT - KONSISTEN UNTUK SEMUA HALAMAN ADMIN
// ==========================================

import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuth'
import './AdminDashboard.css'

export default function AdminLayout() {
  const { profile, signOut } = useAdminAuth()
  const navigate = useNavigate()

  const isOwner = profile?.role === 'owner'

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/admin/login', { replace: true })
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  if (!profile) return null

  const branchLabel = isOwner
    ? 'Semua Cabang (Owner)'
    : profile.branch_id
      ? `Cabang ${profile.branch_id.toUpperCase()}`
      : 'Cabang Admin'

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR BERSAMA */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h2>CAHAYA</h2>
          <span>BARBER SHOP</span>
        </div>

        <div className="admin-sidebar-section">
          <span className="admin-sidebar-label">MENU UTAMA</span>

          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `admin-menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span>▦</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/bookings"
            className={({ isActive }) =>
              `admin-menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span>▣</span>
            Booking
          </NavLink>

          <NavLink
            to="/admin/barbers"
            className={({ isActive }) =>
              `admin-menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span>♙</span>
            Kapster
          </NavLink>

          <NavLink
            to="/admin/services"
            className={({ isActive }) =>
              `admin-menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span>✂</span>
            Layanan
          </NavLink>

          <NavLink
            to="/admin/schedules"
            className={({ isActive }) =>
              `admin-menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span>◷</span>
            Jadwal
          </NavLink>

          <NavLink
            to="/admin/reviews"
            className={({ isActive }) =>
              `admin-menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span>☆</span>
            Ulasan
          </NavLink>
        </div>

        <div className="admin-sidebar-bottom">
          <div className="admin-account">
            <div className="admin-avatar">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{profile.full_name}</strong>
              <span>{profile.role.toUpperCase()}</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            ↪ Keluar
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="admin-main">
        {/* TOPBAR BERSAMA */}
        <header className="admin-topbar">
          <div>
            <span>MANAGEMENT PORTAL</span>
            <h2>Cahaya Barber Admin</h2>
          </div>

          <div className="admin-branch-badge">
            <span>LOKASI AKTIF</span>
            <strong>{branchLabel}</strong>
          </div>
        </header>

        {/* OUTLET HALAMAN SPESIFIK */}
        <div style={{ marginTop: '24px' }}>
          <Outlet />
        </div>

        <footer className="admin-dashboard-footer" style={{ marginTop: '40px' }}>
          CAHAYA BARBER · MANAGEMENT SYSTEM
        </footer>
      </main>
    </div>
  )
}
