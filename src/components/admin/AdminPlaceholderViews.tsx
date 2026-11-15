// ==========================================
// INTERACTIVE DEMO VIEWS FOR ADMIN
// (Booking, Layanan, Jadwal, Ulasan)
// ==========================================

import { useState } from 'react'
import { mockDb, type MockBooking, type MockService } from '../../mock/mockData'
import { useAdminAuth } from './AdminAuth'

// ==========================================
// 1. BOOKING MANAGEMENT VIEW
// ==========================================
export function AdminBookingsView() {
  const { profile } = useAdminAuth()
  const isOwner = profile?.role === 'owner'

  const [bookings, setBookings] = useState<MockBooking[]>(() =>
    mockDb.getBookings(isOwner ? null : profile?.branch_id)
  )
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const handleUpdateStatus = (
    bookingId: string,
    newStatus: MockBooking['status']
  ) => {
    mockDb.updateBookingStatus(bookingId, newStatus)
    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: newStatus } : b
    )
    setBookings(updated)
  }

  const handleCancelBooking = (booking: MockBooking) => {
    const confirmed = window.confirm(
      `Batalkan reservasi ${booking.booking_code} atas nama ${booking.customer_name}?\n\nTindakan ini tidak dapat dibatalkan.`
    )
    if (!confirmed) return
    handleUpdateStatus(booking.id, 'cancelled')
  }

  const formatBookingTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      const dateStr = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      const hours = String(date.getHours()).padStart(2, '0')
      const mins = String(date.getMinutes()).padStart(2, '0')
      return `${dateStr} · ${hours}:${mins} WIB`
    } catch {
      return isoString
    }
  }

  const filtered = bookings.filter((b) =>
    filterStatus === 'all' ? true : b.status === filterStatus
  )

  return (
    <div className="barber-management">
      <header className="barber-page-header">
        <div>
          <span className="barber-eyebrow">RESERVATION SYSTEM</span>
          <h1>Manajemen Booking & Antrean</h1>
          <p>Kelola status dan jadwal reservasi pelanggan.</p>
        </div>
      </header>

      {/* FILTER TABS */}
      <div className="barber-tabs" style={{ marginBottom: '20px' }}>
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(
          (status) => (
            <button
              key={status}
              type="button"
              className={`barber-tab ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status.toUpperCase()}
              <span>
                {
                  bookings.filter((b) =>
                    status === 'all' ? true : b.status === status
                  ).length
                }
              </span>
            </button>
          )
        )}
      </div>

      <section className="barber-content-card">
        <div className="barber-table-wrapper">
          <table className="barber-table">
            <thead>
              <tr>
                <th>KODE</th>
                <th>PELANGGAN</th>
                <th>CATATAN</th>
                <th>WHATSAPP</th>
                <th>CABANG</th>
                <th>WAKTU BOOKING</th>
                <th>STATUS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.booking_code}</strong>
                  </td>
                  <td>{b.customer_name}</td>
                  <td>
                    {b.customer_note ? (
                      <span
                        style={{
                          fontStyle: 'italic',
                          color: '#444',
                          fontSize: '12px',
                          display: 'inline-block',
                          maxWidth: '220px',
                          overflowWrap: 'break-word',
                        }}
                      >
                        "{b.customer_note}"
                      </span>
                    ) : (
                      <span style={{ color: '#aaa', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td>{b.customer_phone}</td>
                  <td>
                    <span className="barber-branch-tag">
                      {b.branch_id.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {formatBookingTime(b.starts_at)}
                  </td>
                  <td>
                    <span className={`booking-status ${b.status}`}>
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {/* 1. KETIKA PENDING: BISA KONFIRMASI ATAU BATAL DENGAN DIALOG */}
                      {b.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            className="barber-primary-button"
                            onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                            style={{ padding: '6px 12px', fontSize: '11px' }}
                          >
                            Konfirmasi
                          </button>
                          <button
                            type="button"
                            className="barber-delete-button"
                            onClick={() => handleCancelBooking(b)}
                            style={{ padding: '6px 12px', fontSize: '11px' }}
                          >
                            Batal
                          </button>
                        </>
                      )}

                      {/* 2. KETIKA CONFIRMED: HANYA ADA SELESAI (TIDAK BISA DIBATALKAN SEPIHAK) */}
                      {b.status === 'confirmed' && (
                        <button
                          type="button"
                          className="barber-primary-button"
                          onClick={() => handleUpdateStatus(b.id, 'completed')}
                          style={{
                            padding: '6px 14px',
                            fontSize: '11px',
                            background: '#2e7d32',
                            borderColor: '#2e7d32',
                            color: '#fff',
                          }}
                        >
                          Selesai ✓
                        </button>
                      )}

                      {/* 3. KETIKA COMPLETED: TUNTAS, TIDAK ADA TOMBOL */}
                      {b.status === 'completed' && (
                        <span style={{ color: '#2e7d32', fontSize: '12px', fontWeight: 600 }}>
                          Tuntas ✓
                        </span>
                      )}

                      {/* 4. KETIKA CANCELLED: SUDAH GUGUR, TIDAK ADA TOMBOL PULIHKAN */}
                      {b.status === 'cancelled' && (
                        <span style={{ color: '#999', fontSize: '12px' }}>
                          Dibatalkan
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

// ==========================================
// 2. SERVICES MANAGEMENT VIEW
// ==========================================
export function AdminServicesView() {
  const [services] = useState<MockService[]>(() => mockDb.getServices())

  return (
    <div className="barber-management">
      <header className="barber-page-header">
        <div>
          <span className="barber-eyebrow">CATALOG & PRICING</span>
          <h1>Daftar Layanan & Harga</h1>
          <p>Katalog paket treatment dan durasi pengerjaan barbershop.</p>
        </div>
      </header>

      <section className="barber-content-card">
        <div className="barber-table-wrapper">
          <table className="barber-table">
            <thead>
              <tr>
                <th>LAYANAN</th>
                <th>DESKRIPSI</th>
                <th>DURASI</th>
                <th>ESTIMASI HARGA</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.name}</strong>
                  </td>
                  <td style={{ color: '#666' }}>{s.description}</td>
                  <td>{s.time} Menit</td>
                  <td>
                    <strong style={{ color: '#b88b43' }}>
                      Rp {s.price.toLocaleString('id-ID')}
                    </strong>
                  </td>
                  <td>
                    <span className="barber-status active">Tersedia</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

// ==========================================
// 3. SCHEDULES VIEW
// ==========================================
export function AdminSchedulesView() {
  return (
    <div className="barber-management">
      <header className="barber-page-header">
        <div>
          <span className="barber-eyebrow">OPERATIONAL HOURS</span>
          <h1>Jadwal Kerja Kapster</h1>
          <p>Pengaturan shift kerja dan ketersediaan kapster tiap cabang.</p>
        </div>
      </header>

      <div
        style={{
          padding: '40px',
          background: '#fff',
          borderRadius: '8px',
          border: '1px solid #e0ded9',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '32px' }}>◷</span>
        <h3 style={{ margin: '12px 0 6px' }}>Shift Operasional Aktif</h3>
        <p style={{ color: '#777', fontSize: '14px' }}>
          Seluruh cabang buka setiap hari pukul <strong>10.00 – 21.00 WIB</strong>.
          Ketersediaan slot booking diatur otomatis mengikuti durasi layanan.
        </p>
      </div>
    </div>
  )
}

// ==========================================
// 4. REVIEWS VIEW
// ==========================================
export function AdminReviewsView() {
  const sampleReviews = [
    {
      name: 'Dimas Anggara',
      branch: 'Manislor',
      rating: 5,
      comment: 'Potongan rambut Mas Ahmad rapi banget dan detail! Tempatnya nyaman dan wangi.',
      date: 'Kemarin',
    },
    {
      name: 'Rifki Pratama',
      branch: 'Jalaksana',
      rating: 5,
      comment: 'Korean Perm-nya juara, tahan lama dan ga bikin rambut rusak.',
      date: '2 hari lalu',
    },
    {
      name: 'Bagus Setiawan',
      branch: 'Veteran',
      rating: 4.8,
      comment: 'Pelayanan ramah, booking lewat web ga pake ngantri lama.',
      date: '4 hari lalu',
    },
  ]

  return (
    <div className="barber-management">
      <header className="barber-page-header">
        <div>
          <span className="barber-eyebrow">CUSTOMER SATISFACTION</span>
          <h1>Ulasan Pelanggan</h1>
          <p>Feedback kepuasan pelanggan terhadap layanan Cahaya Barber.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {sampleReviews.map((r, i) => (
          <div
            key={i}
            style={{
              padding: '24px',
              background: '#fff',
              borderRadius: '8px',
              border: '1px solid #e0ded9',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <strong>{r.name}</strong>
              <span style={{ color: '#b88b43', fontWeight: 'bold' }}>⭐ {r.rating}</span>
            </div>
            <p style={{ color: '#555', fontSize: '13px', lineHeight: '1.6', marginBottom: '12px' }}>
              "{r.comment}"
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#999' }}>
              <span>Cabang {r.branch}</span>
              <span>{r.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
