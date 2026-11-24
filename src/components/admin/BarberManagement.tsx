// ==========================================
// BARBER MANAGEMENT (MODE DEMO OFFLINE)
// ==========================================

import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { useAdminAuth } from './AdminAuth'
import {
  mockDb,
  type MockBarber,
  type MockBranch,
} from '../../mock/mockData'
import './BarberManagement.css'

type Barber = MockBarber
type Branch = MockBranch

type BarberForm = {
  name: string
  branch_id: string
  phone: string
  photo_url: string
  description: string
}

type BarberTab = 'active' | 'archived'

const emptyForm: BarberForm = {
  name: '',
  branch_id: '',
  phone: '',
  photo_url: '',
  description: '',
}

export default function BarberManagement() {
  const { profile } = useAdminAuth()
  const isOwner = profile?.role === 'owner'

  const [barbers, setBarbers] = useState<Barber[]>(() => mockDb.getBarbers())
  const [branches, setBranches] = useState<Branch[]>(() => mockDb.getBranches())

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<BarberTab>('active')

  const [saving, setSaving] = useState(false)
  const [updatingBarberId, setUpdatingBarberId] = useState<string | null>(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null)
  const [form, setForm] = useState<BarberForm>(emptyForm)

  // ==========================================
  // REFRESH DATA DARI LOCAL STORAGE
  // ==========================================

  const refreshData = () => {
    setBarbers(mockDb.getBarbers())
    setBranches(mockDb.getBranches())
  }

  // ==========================================
  // SEARCH & SUMMARY (1 KAPSTER = 1 CABANG)
  // ==========================================

  // Kapster yang relevan sesuai hak akses peran
  const roleScopedBarbers = useMemo(() => {
    if (isOwner || !profile?.branch_id) return barbers
    return barbers.filter((barber) => barber.branch_id === profile.branch_id)
  }, [barbers, isOwner, profile])

  const activeBarbers = useMemo(
    () => roleScopedBarbers.filter((barber) => !barber.is_archived),
    [roleScopedBarbers]
  )

  const archivedBarbers = useMemo(
    () => roleScopedBarbers.filter((barber) => barber.is_archived),
    [roleScopedBarbers]
  )

  const activeCount = useMemo(() => {
    return activeBarbers.filter((barber) => barber.is_active).length
  }, [activeBarbers])

  const archivedCount = archivedBarbers.length

  const filteredBarbers = useMemo(() => {
    const source =
      activeTab === 'archived'
        ? archivedBarbers
        : activeBarbers

    const keyword = search.toLowerCase().trim()

    return source.filter((barber) =>
      barber.name.toLowerCase().includes(keyword)
    )
  }, [activeTab, activeBarbers, archivedBarbers, search])

  // ==========================================
  // ADD BARBER
  // ==========================================

  const openAddModal = () => {
    setEditingBarber(null)
    setForm({
      ...emptyForm,
      branch_id:
        !isOwner && profile?.branch_id
          ? profile.branch_id
          : branches[0]?.id ?? 'manislor',
    })

    setError('')
    setSuccess('')
    setModalOpen(true)
  }

  // ==========================================
  // EDIT BARBER
  // ==========================================

  const openEditModal = (barber: Barber) => {
    if (barber.is_archived) return

    setEditingBarber(barber)

    setForm({
      name: barber.name,
      branch_id: barber.branch_id,
      phone: barber.phone ?? '',
      photo_url: barber.photo_url ?? '',
      description: barber.description ?? '',
    })

    setError('')
    setSuccess('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return

    setModalOpen(false)
    setEditingBarber(null)
    setForm(emptyForm)
  }

  // ==========================================
  // SAVE BARBER (LOCAL STORAGE)
  // ==========================================

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!profile) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (!form.name.trim()) {
        throw new Error('Nama kapster wajib diisi.')
      }

      if (editingBarber) {
        mockDb.updateBarber(editingBarber.id, {
          name: form.name,
          branch_id: isOwner ? form.branch_id : editingBarber.branch_id,
          phone: form.phone,
          photo_url: form.photo_url,
          description: form.description,
        })
        setSuccess('Profil kapster berhasil diperbarui.')
      } else {
        const targetBranch = isOwner
          ? form.branch_id
          : profile.branch_id || form.branch_id

        if (!targetBranch) {
          throw new Error('Pilih cabang penempatan kapster.')
        }

        mockDb.addBarber({
          name: form.name,
          branch_id: targetBranch,
          phone: form.phone,
          photo_url: form.photo_url,
          description: form.description,
        })
        setSuccess('Kapster berhasil ditambahkan.')
      }

      setModalOpen(false)
      setEditingBarber(null)
      setForm(emptyForm)

      refreshData()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal menyimpan data kapster.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ==========================================
  // TOGGLE BARBER STATUS (OWNER ONLY)
  // ==========================================

  const toggleBarberStatus = (barber: Barber) => {
    if (!isOwner) {
      setError('Hanya Owner yang dapat mengubah status profil kapster.')
      return
    }

    if (barber.is_archived) return

    const nextStatus = !barber.is_active
    const action = nextStatus ? 'mengaktifkan' : 'menonaktifkan'

    if (
      !window.confirm(
        `Apakah kamu yakin ingin ${action} profil ${barber.name}?`
      )
    ) return

    setError('')
    setSuccess('')
    setUpdatingBarberId(barber.id)

    const updated = mockDb.toggleBarberStatus(barber.id)
    setSuccess(
      updated
        ? `Profil ${barber.name} berhasil diaktifkan kembali.`
        : `Profil ${barber.name} berhasil dinonaktifkan.`
    )
    setUpdatingBarberId(null)
    refreshData()
  }

  // ==========================================
  // ARCHIVE BARBER (OWNER ONLY)
  // ==========================================

  const archiveBarber = (barber: Barber) => {
    if (!isOwner) {
      setError('Hanya Owner yang dapat mengarsipkan kapster.')
      return
    }

    if (barber.is_archived) return

    const confirmed = window.confirm(
      `Arsipkan kapster ${barber.name}?\n\n` +
      'Profil akan dinonaktifkan dan tidak digunakan untuk operasional baru. ' +
      'Riwayat booking, jadwal, dan ulasan tetap dipertahankan.'
    )

    if (!confirmed) return

    setError('')
    setSuccess('')
    setUpdatingBarberId(barber.id)

    mockDb.archiveBarber(barber.id)
    setSuccess(`${barber.name} berhasil diarsipkan.`)
    setActiveTab('active')
    setUpdatingBarberId(null)
    refreshData()
  }

  // ==========================================
  // RESTORE BARBER (OWNER ONLY)
  // ==========================================

  const restoreBarber = (barber: Barber) => {
    if (!isOwner) {
      setError('Hanya Owner yang dapat memulihkan kapster.')
      return
    }

    if (!barber.is_archived) return

    const confirmed = window.confirm(
      `Pulihkan kapster ${barber.name}?\n\n` +
      'Profil akan kembali aktif ke operasional.'
    )

    if (!confirmed) return

    setError('')
    setSuccess('')
    setUpdatingBarberId(barber.id)

    mockDb.restoreBarber(barber.id)
    setSuccess(`${barber.name} berhasil dipulihkan.`)
    setActiveTab('active')
    setUpdatingBarberId(null)
    refreshData()
  }

  // ==========================================
  // PERMANENT DELETE (OWNER ONLY)
  // ==========================================

  const deleteBarberPermanently = (barber: Barber) => {
    if (!isOwner) {
      setError('Hanya Owner yang dapat menghapus permanen kapster.')
      return
    }

    if (!barber.is_archived) {
      setError('Arsipkan kapster terlebih dahulu.')
      return
    }

    const confirmed = window.confirm(
      `PERINGATAN PENGHAPUSAN PERMANEN\n\n` +
      `Apakah kamu yakin ingin menghapus ${barber.name} secara permanen?\n\n` +
      'Tindakan ini tidak dapat dibatalkan.'
    )

    if (!confirmed) return

    setError('')
    setSuccess('')
    setUpdatingBarberId(barber.id)

    mockDb.deleteBarberPermanently(barber.id)
    setSuccess(`${barber.name} berhasil dihapus secara permanen.`)
    setUpdatingBarberId(null)
    refreshData()
  }

  // ==========================================
  // HELPERS
  // ==========================================

  const getBranchName = (branchId: string) => {
    return (
      branches.find((branch) => branch.id === branchId)?.name ??
      'Cabang tidak tersedia'
    )
  }

  const formatArchivedDate = (value: string | null) => {
    if (!value) return 'Tanggal tidak tersedia'

    return new Date(value).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (!profile) return null

  return (
    <div className="barber-management">
      {/* PAGE HEADER */}
      <header className="barber-page-header">
        <div>
          <span className="barber-eyebrow">
            {isOwner ? 'OWNER PORTAL · ALL BRANCHES' : `CABANG ${profile.branch_id?.toUpperCase()}`}
          </span>
          <h1>Manajemen Kapster</h1>
          <p>
            {isOwner
              ? 'Kelola profil dan penempatan kapster di seluruh cabang Cahaya Barber.'
              : `Kelola kapster yang bertugas di Cabang ${getBranchName(profile.branch_id || '')}.`}
          </p>
        </div>

        {activeTab === 'active' && (
          <button
            type="button"
            className="barber-primary-button"
            onClick={openAddModal}
          >
            + Tambah Kapster
          </button>
        )}
      </header>

      {/* SUMMARY */}
      <section className="barber-summary">
        <div className="barber-summary-card">
          <span>{isOwner ? 'TOTAL KAPSTER' : 'TOTAL KAPSTER CABANG'}</span>
          <strong>{activeBarbers.length}</strong>
        </div>

        <div className="barber-summary-card">
          <span>{isOwner ? 'KAPSTER AKTIF' : 'KAPSTER TUGAS AKTIF'}</span>
          <strong>{activeCount}</strong>
        </div>

        {isOwner ? (
          <div className="barber-summary-card">
            <span>TOTAL CABANG</span>
            <strong>{branches.length}</strong>
          </div>
        ) : (
          <div className="barber-summary-card">
            <span>CABANG TUGAS</span>
            <strong style={{ fontSize: '18px', color: '#b88b43' }}>
              {getBranchName(profile.branch_id || '')}
            </strong>
          </div>
        )}

        {isOwner && (
          <div className="barber-summary-card barber-summary-archived">
            <span>KAPSTER DIARSIPKAN</span>
            <strong>{archivedCount}</strong>
          </div>
        )}
      </section>

      {/* ALERT */}
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

      {/* DIRECTORY */}
      <section className="barber-content-card">
        <div className="barber-content-header">
          <div>
            <span className="barber-eyebrow">BARBER DIRECTORY</span>
            <h2>Daftar Kapster</h2>
          </div>

          <input
            className="barber-search"
            type="search"
            placeholder="Cari nama kapster..."
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
            Kapster Aktif
            <span>{activeBarbers.length}</span>
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
              Arsip Kapster
              <span>{archivedCount}</span>
            </button>
          )}
        </div>

        {/* TABLE */}
        {filteredBarbers.length === 0 ? (
          <div className="barber-empty">
            {search
              ? 'Kapster tidak ditemukan.'
              : activeTab === 'archived'
              ? 'Belum ada kapster yang diarsipkan.'
              : 'Belum ada data kapster.'}
          </div>
        ) : (
          <div className="barber-table-wrapper">
            <table className="barber-table">
              <thead>
                <tr>
                  <th>KAPSTER</th>
                  <th>TELEPON</th>
                  <th>CABANG</th>
                  <th>STATUS</th>
                  {activeTab === 'archived' && <th>TANGGAL ARSIP</th>}
                  <th>AKSI</th>
                </tr>
              </thead>

              <tbody>
                {filteredBarbers.map((barber) => {
                  const isUpdating = updatingBarberId === barber.id

                  return (
                    <tr
                      key={barber.id}
                      className={
                        barber.is_archived ? 'barber-row-archived' : ''
                      }
                    >
                      {/* IDENTITY */}
                      <td>
                        <div className="barber-identity">
                          {barber.photo_url ? (
                            <img src={barber.photo_url} alt={barber.name} />
                          ) : (
                            <div className="barber-avatar">
                              {barber.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div>
                            <strong>{barber.name}</strong>
                            <small>
                              {barber.description || 'Kapster Cahaya Barber'}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* PHONE */}
                      <td>{barber.phone || '—'}</td>

                      {/* CABANG (1 KAPSTER = 1 CABANG) */}
                      <td>
                        <span className="barber-branch-tag">
                          {getBranchName(barber.branch_id)}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td>
                        {barber.is_archived ? (
                          <span className="barber-status archived">
                            Diarsipkan
                          </span>
                        ) : (
                          <span
                            className={
                              barber.is_active
                                ? 'barber-status active'
                                : 'barber-status inactive'
                            }
                          >
                            {barber.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        )}
                      </td>

                      {/* ARCHIVE DATE */}
                      {activeTab === 'archived' && (
                        <td>
                          <span className="barber-archive-date">
                            {formatArchivedDate(barber.archived_at)}
                          </span>
                        </td>
                      )}

                      {/* ACTIONS */}
                      <td>
                        <div className="barber-action-group">
                          {activeTab === 'active' ? (
                            <>
                              <button
                                type="button"
                                className="barber-edit-button"
                                onClick={() => openEditModal(barber)}
                              >
                                Edit
                              </button>

                              {isOwner && (
                                <>
                                  <button
                                    type="button"
                                    className={
                                      barber.is_active
                                        ? 'barber-profile-disable'
                                        : 'barber-profile-enable'
                                    }
                                    onClick={() => toggleBarberStatus(barber)}
                                    disabled={isUpdating}
                                  >
                                    {isUpdating
                                      ? 'Memproses...'
                                      : barber.is_active
                                      ? 'Nonaktifkan'
                                      : 'Aktifkan'}
                                  </button>

                                  <button
                                    type="button"
                                    className="barber-archive-button"
                                    onClick={() => archiveBarber(barber)}
                                    disabled={isUpdating}
                                  >
                                    Arsipkan
                                  </button>
                                </>
                              )}
                            </>
                          ) : (
                            isOwner && (
                              <>
                                <button
                                  type="button"
                                  className="barber-restore-button"
                                  onClick={() => restoreBarber(barber)}
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? 'Memproses...' : 'Pulihkan'}
                                </button>

                                <button
                                  type="button"
                                  className="barber-delete-button"
                                  onClick={() => deleteBarberPermanently(barber)}
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? 'Memproses...' : 'Hapus Permanen'}
                                </button>
                              </>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="barber-modal-overlay">
          <div className="barber-modal">
            <div className="barber-modal-header">
              <div>
                <span className="barber-eyebrow">BARBER MANAGEMENT</span>
                <h2>{editingBarber ? 'Edit Kapster' : 'Tambah Kapster'}</h2>
              </div>

              <button
                className="barber-modal-close"
                onClick={closeModal}
                disabled={saving}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave}>
              <label>Nama Kapster *</label>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Masukkan nama kapster"
                required
              />

              <label>Nomor Telepon</label>
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                placeholder="08xxxxxxxxxx"
              />

              <label>URL Foto</label>
              <input
                type="url"
                value={form.photo_url}
                onChange={(event) =>
                  setForm({ ...form, photo_url: event.target.value })
                }
                placeholder="https://..."
              />

              <label>Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="Deskripsi singkat kapster"
                rows={3}
              />

              <label>Cabang Penempatan *</label>
              {isOwner ? (
                <div>
                  <select
                    value={form.branch_id}
                    onChange={(event) =>
                      setForm({ ...form, branch_id: event.target.value })
                    }
                    required
                  >
                    <option value="">Pilih cabang</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  {editingBarber && (
                    <small
                      style={{
                        color: '#888',
                        display: 'block',
                        marginTop: '4px',
                        fontSize: '11px',
                      }}
                    >
                      Owner dapat memutasi kapster ini ke cabang lain.
                    </small>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={getBranchName(profile.branch_id || form.branch_id)}
                    disabled
                    style={{
                      background: '#f2f0ea',
                      color: '#444',
                      fontWeight: 600,
                      cursor: 'not-allowed',
                      border: '1px solid #d5d1c8',
                    }}
                  />
                  <small
                    style={{
                      color: '#777',
                      display: 'block',
                      marginTop: '4px',
                      fontSize: '11px',
                    }}
                  >
                    Kapster terdaftar di Cabang{' '}
                    {getBranchName(profile.branch_id || form.branch_id)}.
                  </small>
                </div>
              )}

              {error && (
                <div className="barber-alert barber-alert-error">{error}</div>
              )}

              <div className="barber-modal-actions">
                <button
                  type="button"
                  className="barber-secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="barber-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Menyimpan...'
                    : editingBarber
                    ? 'Simpan Perubahan'
                    : 'Tambah Kapster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
