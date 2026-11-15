// ==========================================
// ADMIN DASHBOARD (MODE DEMO OFFLINE)
// ==========================================

import { useMemo } from 'react'
import { useAdminAuth } from './AdminAuth'
import { mockDb } from '../../mock/mockData'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const { profile } = useAdminAuth()
  const isOwner = profile?.role === 'owner'
  const branchFilter = isOwner ? null : profile?.branch_id

  // Ambil data dashboard dari mock store secara reaktif
  const stats = useMemo(() => {
    return mockDb.getDashboardStats(branchFilter)
  }, [branchFilter])

  const branches = useMemo(() => {
    return mockDb.getBranches()
  }, [])

  const formatDate = (value: string) => {
    try {
      const date = new Date(value)
      const dateStr = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      const hours = String(date.getHours()).padStart(2, '0')
      const mins = String(date.getMinutes()).padStart(2, '0')
      return `${dateStr} · ${hours}:${mins} WIB`
    } catch {
      return value
    }
  }

  if (!profile) return null

  return (
    <div>
      {/* WELCOME */}
      <section className="admin-welcome">
        <div>
          <span>OVERVIEW</span>
          <h1>Selamat datang, {profile.full_name}.</h1>
          <p>
            Pantau aktivitas operasional Cahaya Barber
            {isOwner ? ' seluruh cabang.' : ` cabang ${profile.branch_id?.toUpperCase()}.`}
          </p>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="admin-stats-grid">
        <div className="admin-stat-card">
          <span>BOOKING HARI INI</span>
          <strong>{stats.bookingCount}</strong>
          <small>Total reservasi tercatat</small>
        </div>

        <div className="admin-stat-card">
          <span>TOTAL KAPSTER</span>
          <strong>{stats.barberCount}</strong>
          <small>Kapster dengan jadwal aktif</small>
        </div>

        <div className="admin-stat-card">
          <span>LAYANAN AKTIF</span>
          <strong>{stats.serviceCount}</strong>
          <small>Layanan tersedia</small>
        </div>

        <div className="admin-stat-card">
          <span>BOOKING SELESAI</span>
          <strong>{stats.completedCount}</strong>
          <small>Reservasi selesai</small>
        </div>
      </section>

      {/* RECENT BOOKINGS */}
      <section className="admin-content-card">
        <div className="admin-content-heading">
          <div>
            <span>RESERVATION MANAGEMENT</span>
            <h3>Booking Terbaru</h3>
          </div>
        </div>

        {stats.recentBookings.length === 0 ? (
          <p className="admin-empty-state">Belum ada data booking.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-booking-table">
              <thead>
                <tr>
                  <th>KODE</th>
                  <th>PELANGGAN</th>
                  <th>TELEPON</th>
                  <th>WAKTU</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {stats.recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <strong>{booking.booking_code}</strong>
                    </td>
                    <td>{booking.customer_name}</td>
                    <td>{booking.customer_phone || '—'}</td>
                    <td>{formatDate(booking.starts_at)}</td>
                    <td>
                      <span className={`booking-status ${booking.status}`}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* OWNER BRANCH MANAGEMENT */}
      {isOwner && (
        <section className="admin-content-card" style={{ marginTop: '24px' }}>
          <div className="admin-content-heading">
            <div>
              <span>BRANCH MANAGEMENT</span>
              <h3>Daftar Cabang Aktif</h3>
            </div>
          </div>

          <div className="admin-branch-list">
            {branches.map((branch) => (
              <div key={branch.id}>
                <span>{branch.name}</span>
                <small>{branch.location}</small>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
