// ==========================================
// INTERACTIVE DEMO VIEWS FOR ADMIN
// (Booking, Layanan, Jadwal, Ulasan)
// ==========================================

import { useState, useMemo, type FormEvent } from 'react'
import { mockDb, type MockBooking, type MockService, type MockReview } from '../../mock/mockData'
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
// 2. SERVICES MANAGEMENT VIEW (OWNER ONLY CRUD)
// ==========================================
export function AdminServicesView() {
  const { profile } = useAdminAuth()
  const isOwner = profile?.role === 'owner'

  const [services, setServices] = useState<MockService[]>(() =>
    mockDb.getServices()
  )

  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')
  const [search, setSearch] = useState('')
  const [updatingServiceId, setUpdatingServiceId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<MockService | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    time: 30,
    price: 40000,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const refreshServices = () => {
    setServices(mockDb.getServices())
  }

  const activeServices = useMemo(
    () => services.filter((s) => !s.is_archived),
    [services]
  )

  const archivedServices = useMemo(
    () => services.filter((s) => s.is_archived),
    [services]
  )

  const currentList = activeTab === 'active' ? activeServices : archivedServices

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return currentList
    return currentList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    )
  }, [currentList, search])

  const formatArchivedDate = (isoString: string | null) => {
    if (!isoString) return '-'
    try {
      return new Date(isoString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return isoString
    }
  }

  const openAddModal = () => {
    setEditingService(null)
    setForm({
      name: '',
      description: '',
      time: 30,
      price: 40000,
    })
    setError('')
    setSuccess('')
    setModalOpen(true)
  }

  const openEditModal = (service: MockService) => {
    setEditingService(service)
    setForm({
      name: service.name,
      description: service.description,
      time: service.time,
      price: service.price,
    })
    setError('')
    setSuccess('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingService(null)
  }

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isOwner) return

    setError('')
    setSuccess('')

    try {
      if (!form.name.trim()) {
        throw new Error('Nama layanan wajib diisi.')
      }

      const numTime = Number(form.time)
      const numPrice = Number(form.price)

      if (isNaN(numTime) || numTime <= 0) {
        throw new Error('Durasi layanan harus lebih dari 0 menit.')
      }

      if (isNaN(numPrice) || numPrice < 0) {
        throw new Error('Tarif harga layanan tidak valid.')
      }

      if (editingService) {
        mockDb.updateService(editingService.id, {
          name: form.name,
          description: form.description,
          time: numTime,
          price: numPrice,
        })
        setSuccess(`Layanan "${form.name}" berhasil diperbarui.`)
      } else {
        mockDb.addService({
          name: form.name,
          description: form.description,
          time: numTime,
          price: numPrice,
        })
        setSuccess(`Layanan "${form.name}" berhasil ditambahkan ke katalog.`)
      }

      closeModal()
      refreshServices()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menyimpan data layanan.'
      )
    }
  }

  const handleToggleStatus = (service: MockService) => {
    if (!isOwner) return
    if (service.is_archived) return

    const action = service.is_active ? 'menonaktifkan' : 'mengaktifkan'
    if (
      !window.confirm(
        `Apakah Anda yakin ingin ${action} layanan "${service.name}"?`
      )
    ) {
      return
    }

    setUpdatingServiceId(service.id)
    const nextStatus = mockDb.toggleServiceStatus(service.id)
    setSuccess(
      `Layanan "${service.name}" berhasil ${
        nextStatus ? 'diaktifkan' : 'dinonaktifkan'
      }.`
    )
    setUpdatingServiceId(null)
    refreshServices()
  }

  const handleArchive = (service: MockService) => {
    if (!isOwner) {
      setError('Hanya Owner yang dapat mengarsipkan layanan.')
      return
    }
    if (service.is_archived) return

    const confirmed = window.confirm(
      `Arsipkan layanan "${service.name}"?\n\n` +
        'Layanan akan dipindahkan ke tab Arsip, dinonaktifkan dari pilihan booking pelanggan, ' +
        'dan tidak muncul di katalog kasir. Riwayat booking masa lalu tetap aman dipertahankan.'
    )
    if (!confirmed) return

    setError('')
    setSuccess('')
    setUpdatingServiceId(service.id)

    mockDb.archiveService(service.id)
    setSuccess(`Layanan "${service.name}" berhasil diarsipkan.`)
    setActiveTab('active')
    setUpdatingServiceId(null)
    refreshServices()
  }

  const handleRestore = (service: MockService) => {
    if (!isOwner) {
      setError('Hanya Owner yang dapat memulihkan layanan.')
      return
    }
    if (!service.is_archived) return

    const confirmed = window.confirm(
      `Pulihkan layanan "${service.name}"?\n\n` +
        'Layanan akan kembali aktif di katalog dan dapat dipilih pelanggan.'
    )
    if (!confirmed) return

    setError('')
    setSuccess('')
    setUpdatingServiceId(service.id)

    mockDb.restoreService(service.id)
    setSuccess(`Layanan "${service.name}" berhasil dipulihkan ke katalog aktif.`)
    setActiveTab('active')
    setUpdatingServiceId(null)
    refreshServices()
  }

  const handleDeletePermanently = (service: MockService) => {
    if (!isOwner) {
      setError('Hanya Owner yang dapat menghapus layanan secara permanen.')
      return
    }
    if (!service.is_archived) {
      setError('Arsipkan layanan terlebih dahulu sebelum menghapus permanen.')
      return
    }

    const confirmed = window.confirm(
      `PERINGATAN PENGHAPUSAN PERMANEN\n\n` +
        `Apakah Anda yakin ingin menghapus layanan "${service.name}" secara permanen?\n\n` +
        'Tindakan ini akan menghapus data dari sistem secara total dan tidak dapat dibatalkan.'
    )
    if (!confirmed) return

    setError('')
    setSuccess('')
    setUpdatingServiceId(service.id)

    mockDb.deleteServicePermanently(service.id)
    setSuccess(`Layanan "${service.name}" berhasil dihapus secara permanen.`)
    setUpdatingServiceId(null)
    refreshServices()
  }

  return (
    <div className="barber-management">
      <header className="barber-page-header">
        <div>
          <span className="barber-eyebrow">
            {isOwner ? 'OWNER PORTAL · MASTER PRICING' : 'CATALOG & PRICING'}
          </span>
          <h1>Daftar Layanan & Harga</h1>
          <p>
            {isOwner
              ? 'Kelola paket treatment, durasi pengerjaan, patokan tarif harga, serta siklus arsip layanan.'
              : 'Katalog referensi paket treatment dan patokan tarif resmi Cahaya Barber.'}
          </p>
        </div>

        {isOwner && (
          <button
            type="button"
            className="barber-primary-button"
            onClick={openAddModal}
          >
            + Tambah Layanan
          </button>
        )}
      </header>

      {!isOwner && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            background: '#fff',
            border: '1px solid #e5dfd5',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#706050',
          }}
        >
          <span style={{ fontSize: '18px', color: '#b88b43' }}>ⓘ</span>
          <span>
            <strong>Mode Referensi Kasir:</strong> Penetapan katalog paket
            layanan, durasi pengerjaan, dan tarif harga dikelola terpusat oleh{' '}
            <strong>Owner</strong>.
          </span>
        </div>
      )}

      {/* SUMMARY METRICS */}
      <section className="barber-summary" style={{ marginBottom: '20px' }}>
        <div className="barber-summary-card">
          <span>TOTAL LAYANAN AKTIF</span>
          <strong>{activeServices.length}</strong>
        </div>

        <div className="barber-summary-card">
          <span>LAYANAN TERSEDIA</span>
          <strong>{activeServices.filter((s) => s.is_active).length}</strong>
        </div>

        <div className="barber-summary-card">
          <span>TARIF TERMURAH - TERTINGGI</span>
          <strong style={{ fontSize: '18px', color: '#b88b43' }}>
            {activeServices.length > 0
              ? `Rp ${Math.min(...activeServices.map((s) => s.price)).toLocaleString('id-ID')} – Rp ${Math.max(...activeServices.map((s) => s.price)).toLocaleString('id-ID')}`
              : 'Rp 0'}
          </strong>
        </div>

        {isOwner && (
          <div className="barber-summary-card barber-summary-archived">
            <span>LAYANAN DIARSIPKAN</span>
            <strong>{archivedServices.length}</strong>
          </div>
        )}
      </section>

      {/* ALERTS */}
      {error && (
        <div className="barber-alert barber-alert-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="barber-alert barber-alert-success" role="status">
          {success}
        </div>
      )}

      <section className="barber-content-card">
        <div className="barber-content-header">
          <div>
            <span className="barber-eyebrow">CATALOG & PRICING</span>
            <h2>Daftar Paket Layanan</h2>
          </div>

          <input
            className="barber-search"
            type="search"
            placeholder="Cari nama atau deskripsi layanan..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {/* TABS */}
        <div className="barber-tabs">
          <button
            type="button"
            className={`barber-tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('active')
              setSearch('')
              setError('')
              setSuccess('')
            }}
          >
            Layanan Aktif
            <span>{activeServices.length}</span>
          </button>

          {isOwner && (
            <button
              type="button"
              className={`barber-tab ${activeTab === 'archived' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('archived')
                setSearch('')
                setError('')
                setSuccess('')
              }}
            >
              Arsip Layanan
              <span>{archivedServices.length}</span>
            </button>
          )}
        </div>

        {filteredServices.length === 0 ? (
          <div className="barber-empty">
            {search
              ? 'Layanan tidak ditemukan.'
              : activeTab === 'archived'
              ? 'Belum ada layanan yang diarsipkan.'
              : 'Belum ada data layanan.'}
          </div>
        ) : (
          <div className="barber-table-wrapper">
            <table className="barber-table">
              <thead>
                <tr>
                  <th>LAYANAN</th>
                  <th>DESKRIPSI</th>
                  <th>DURASI</th>
                  <th>TARIF HARGA</th>
                  {activeTab === 'active' ? <th>STATUS</th> : <th>TANGGAL ARSIP</th>}
                  {isOwner && <th>AKSI</th>}
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((s) => {
                  const isUpdating = updatingServiceId === s.id
                  return (
                    <tr
                      key={s.id}
                      className={s.is_archived ? 'barber-row-archived' : undefined}
                    >
                      <td>
                        <strong>{s.name}</strong>
                      </td>
                      <td style={{ color: '#666', maxWidth: '320px' }}>
                        {s.description}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{s.time} Menit</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <strong style={{ color: '#b88b43' }}>
                          Rp {s.price.toLocaleString('id-ID')}
                        </strong>
                      </td>
                      {activeTab === 'active' ? (
                        <td>
                          <span
                            className={
                              s.is_active
                                ? 'barber-status active'
                                : 'barber-status inactive'
                            }
                          >
                            {s.is_active ? 'Tersedia' : 'Nonaktif'}
                          </span>
                        </td>
                      ) : (
                        <td>
                          <span className="barber-archive-date">
                            {formatArchivedDate(s.archived_at)}
                          </span>
                        </td>
                      )}
                      {isOwner && (
                        <td>
                          <div className="barber-action-group">
                            {activeTab === 'active' ? (
                              <>
                                <button
                                  type="button"
                                  className="barber-edit-button"
                                  onClick={() => openEditModal(s)}
                                  disabled={isUpdating}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className={
                                    s.is_active
                                      ? 'barber-profile-disable'
                                      : 'barber-profile-enable'
                                  }
                                  onClick={() => handleToggleStatus(s)}
                                  disabled={isUpdating}
                                >
                                  {isUpdating
                                    ? 'Memproses...'
                                    : s.is_active
                                    ? 'Nonaktifkan'
                                    : 'Aktifkan'}
                                </button>
                                <button
                                  type="button"
                                  className="barber-archive-button"
                                  onClick={() => handleArchive(s)}
                                  disabled={isUpdating}
                                >
                                  Arsipkan
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="barber-restore-button"
                                  onClick={() => handleRestore(s)}
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? 'Memproses...' : 'Pulihkan'}
                                </button>
                                <button
                                  type="button"
                                  className="barber-delete-button"
                                  onClick={() => handleDeletePermanently(s)}
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? 'Memproses...' : 'Hapus Permanen'}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL TAMBAH / EDIT LAYANAN (OWNER ONLY) */}
      {modalOpen && isOwner && (
        <div className="barber-modal-overlay">
          <div className="barber-modal">
            <div className="barber-modal-header">
              <div>
                <span className="barber-eyebrow">MASTER PRICING</span>
                <h2>{editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}</h2>
              </div>
              <button
                type="button"
                className="barber-modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave}>
              <label>Nama Layanan *</label>
              <input
                type="text"
                placeholder="Contoh: Royal Beard Treatment"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />

              <label>Deskripsi Layanan *</label>
              <textarea
                placeholder="Deskripsi singkat mengenai perawatan dan produk yang digunakan"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div>
                  <label>Durasi (Menit) *</label>
                  <input
                    type="number"
                    min={15}
                    step={5}
                    placeholder="30"
                    value={form.time}
                    onChange={(e) =>
                      setForm({ ...form, time: Number(e.target.value) })
                    }
                    required
                  />
                </div>

                <div>
                  <label>Tarif Harga (Rp) *</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="40000"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: Number(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="barber-alert barber-alert-error">{error}</div>
              )}

              <div className="barber-modal-actions">
                <button
                  type="button"
                  className="barber-secondary-button"
                  onClick={closeModal}
                >
                  Batal
                </button>
                <button type="submit" className="barber-primary-button">
                  {editingService ? 'Simpan Perubahan' : 'Tambah Layanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
// 4. REVIEWS VIEW (ROLE-AWARE: ADMIN VS OWNER)
// ==========================================
export function AdminReviewsView() {
  const { profile } = useAdminAuth()
  const isOwner = profile?.role === 'owner'
  const userBranchId = isOwner ? null : profile?.branch_id

  const [reviews] = useState<MockReview[]>(() =>
    mockDb.getReviews(userBranchId)
  )
  const [filterRating, setFilterRating] = useState<'all' | '5' | '4' | 'low'>('all')
  const [search, setSearch] = useState('')

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // 1. Rating filter
      if (filterRating === '5' && r.rating !== 5) return false
      if (filterRating === '4' && r.rating !== 4) return false
      if (filterRating === 'low' && r.rating > 3) return false

      // 2. Search query
      const q = search.trim().toLowerCase()
      if (q) {
        const matchName = r.customer_name.toLowerCase().includes(q)
        const matchComment = r.comment
          ? r.comment.toLowerCase().includes(q)
          : false
        const matchBarber = r.barber_name.toLowerCase().includes(q)
        const matchCode = r.booking_code?.toLowerCase().includes(q)
        if (!matchName && !matchComment && !matchBarber && !matchCode) return false
      }

      return true
    })
  }, [reviews, filterRating, search])

  const totalReviews = reviews.length
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return '0.0'
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }, [reviews])

  const star5Count = reviews.filter((r) => r.rating === 5).length
  const star4Count = reviews.filter((r) => r.rating === 4).length
  const satisfactionRate =
    reviews.length > 0
      ? Math.round(((star5Count + star4Count) / reviews.length) * 100)
      : 100

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return isoString
    }
  }

  return (
    <div className="barber-management">
      <header className="barber-page-header">
        <div>
          <span className="barber-eyebrow">
            {isOwner
              ? 'CUSTOMER SATISFACTION · ALL BRANCHES'
              : 'CUSTOMER FEEDBACK · CABANG ' +
                (profile?.branch_id?.toUpperCase() || '')}
          </span>
          <h1>Ulasan & Kepuasan Pelanggan</h1>
          <p>
            {isOwner
              ? 'Pantau feedback pelanggan dan performa kepuasan kapster di seluruh cabang Cahaya Barber.'
              : 'Feedback asli dari pelanggan yang telah menyelesaikan reservasi di cabang Anda.'}
          </p>
        </div>
      </header>

      {/* SUMMARY METRICS */}
      <section className="barber-summary" style={{ marginBottom: '20px' }}>
        <div className="barber-summary-card">
          <span>RATA-RATA RATING</span>
          <strong style={{ fontSize: '24px', color: '#b88b43' }}>
            ⭐ {averageRating}{' '}
            <small
              style={{ fontSize: '13px', color: '#777', fontWeight: 400 }}
            >
              / 5.0
            </small>
          </strong>
        </div>

        <div className="barber-summary-card">
          <span>TOTAL ULASAN</span>
          <strong>{totalReviews}</strong>
        </div>

        <div className="barber-summary-card">
          <span>TINGKAT KEPUASAN (4-5★)</span>
          <strong style={{ fontSize: '22px', color: '#2e7d32' }}>
            {satisfactionRate}%
          </strong>
        </div>

        <div className="barber-summary-card">
          <span>BINTANG 5 SEMPURNA</span>
          <strong>{star5Count} ulasan</strong>
        </div>
      </section>

      {/* FILTER & SEARCH */}
      <section className="barber-content-card">
        <div className="barber-content-header">
          <div>
            <span className="barber-eyebrow">VERIFIED REVIEWS</span>
            <h2>Daftar Testimoni</h2>
          </div>

          <input
            className="barber-search"
            type="search"
            placeholder="Cari pelanggan, kapster, atau komentar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABS FILTER RATING */}
        <div className="barber-tabs" style={{ marginBottom: '20px' }}>
          <button
            type="button"
            className={`barber-tab ${filterRating === 'all' ? 'active' : ''}`}
            onClick={() => setFilterRating('all')}
          >
            Semua Ulasan
            <span>{reviews.length}</span>
          </button>
          <button
            type="button"
            className={`barber-tab ${filterRating === '5' ? 'active' : ''}`}
            onClick={() => setFilterRating('5')}
          >
            5 Bintang ★★★★★
            <span>{star5Count}</span>
          </button>
          <button
            type="button"
            className={`barber-tab ${filterRating === '4' ? 'active' : ''}`}
            onClick={() => setFilterRating('4')}
          >
            4 Bintang ★★★★
            <span>{star4Count}</span>
          </button>
          <button
            type="button"
            className={`barber-tab ${filterRating === 'low' ? 'active' : ''}`}
            onClick={() => setFilterRating('low')}
          >
            1 - 3 Bintang
            <span>{reviews.filter((r) => r.rating <= 3).length}</span>
          </button>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="barber-empty">
            {search
              ? 'Tidak ada ulasan yang sesuai dengan pencarian.'
              : 'Belum ada ulasan untuk kategori ini.'}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredReviews.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: '20px',
                  background: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #e5dfd5',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <strong style={{ fontSize: '15px', color: '#262626' }}>
                          {r.customer_name}
                        </strong>
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '2px 7px',
                            borderRadius: '12px',
                            background: '#e8f4eb',
                            color: '#2e7d32',
                            fontWeight: 700,
                          }}
                        >
                          ✓ Terverifikasi
                        </span>
                      </div>
                      {r.booking_code && (
                        <small style={{ color: '#888', fontSize: '11px' }}>
                          Kode: {r.booking_code}
                        </small>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          color: '#b88b43',
                          fontSize: '14px',
                          letterSpacing: '2px',
                        }}
                      >
                        {'★'.repeat(r.rating)}
                        <span style={{ color: '#ddd' }}>
                          {'★'.repeat(5 - r.rating)}
                        </span>
                      </span>
                    </div>
                  </div>

                  <p
                    style={{
                      color: r.comment ? '#444' : '#888',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      margin: '12px 0 16px',
                      fontStyle: 'italic',
                    }}
                  >
                    {r.comment
                      ? `"${r.comment}"`
                      : '(Rating bintang tanpa ulasan tertulis)'}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: '12px',
                    borderTop: '1px solid #f0eeea',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                    color: '#888',
                  }}
                >
                  <div>
                    <span>
                      Kapster: <strong>{r.barber_name}</strong>
                    </span>
                    <span style={{ margin: '0 6px' }}>·</span>
                    <span>{r.service_name}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span
                      className="barber-branch-tag"
                      style={{ fontSize: '10px', padding: '3px 6px' }}
                    >
                      {r.branch_id.toUpperCase()}
                    </span>
                    <span>{formatDate(r.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
