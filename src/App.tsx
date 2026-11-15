
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Routes, Route, Navigate } from 'react-router-dom'

import AdminLogin from './components/admin/AdminLogin'
import AdminGuard from './components/admin/AdminGuard'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './components/admin/AdminDashboard'
import BarberManagement from './components/admin/BarberManagement'
import {
  AdminBookingsView,
  AdminServicesView,
  AdminSchedulesView,
  AdminReviewsView,
} from './components/admin/AdminPlaceholderViews'
import { mockDb, type MockBooking } from './mock/mockData'

import './App.css'
import './Booking.css'


// ==========================================
// DATA CAHAYA BARBER
// ==========================================

const branches = [
  {
    id: 'manislor',
    name: 'Manislor',
    location: 'Cabang Manislor',
    description: 'Pengalaman grooming terbaik di cabang Manislor.',
  },
  {
    id: 'jalaksana',
    name: 'Jalaksana',
    location: 'Cabang Jalaksana',
    description: 'Pelayanan profesional untuk penampilan terbaik.',
  },
  {
    id: 'veteran',
    name: 'Veteran',
    location: 'Cabang Veteran',
    description: 'Temukan gaya rambut sesuai karaktermu.',
  },
]

const services = [
  {
    id: 'haircut',
    name: 'Haircut',
    description: 'Potong rambut sesuai gaya pilihanmu.',
    time: 30,
  },
  {
    id: 'coloring',
    name: 'Coloring',
    description: 'Layanan pewarnaan rambut profesional.',
    time: 45,
  },
  {
    id: 'perm',
    name: 'Perm',
    description: 'Ciptakan tekstur rambut lebih menarik.',
    time: 45,
  },
  {
    id: 'down-perm',
    name: 'Down Perm',
    description: 'Penataan rambut agar lebih rapi.',
    time: 45,
  },
  {
    id: 'massage',
    name: 'Head Massage',
    description: 'Relaksasi dengan pijat kepala.',
    time: 30,
  },
]

// Data kapster sementara untuk prototype.
// Nantinya diganti dengan data dari Supabase.
const barbers = [
  { id: 'barber-1', name: 'Kapster 1' },
  { id: 'barber-2', name: 'Kapster 2' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const viewportSettings = {
  once: true,
  amount: 0.12,
}

// ==========================================
// HELPER
// ==========================================

function getToday() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getAvailableTimes(duration: number) {
  const times: string[] = []

  for (let minutes = 10 * 60; minutes + duration <= 21 * 60; minutes += 30) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0')
    const mins = String(minutes % 60).padStart(2, '0')

    times.push(`${hours}:${mins}`)
  }

  return times
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================

function CustomerHome() {
  const [menuOpen, setMenuOpen] = useState(false)

  // Booking states
  const [step, setStep] = useState(1)
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedBarber, setSelectedBarber] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [selectedTime, setSelectedTime] = useState('')

  // Customer data
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerNote, setCustomerNote] = useState('')

  // Memori Reservasi Aktif Perangkat (Device Persistence)
  const [activeBooking, setActiveBooking] = useState<MockBooking | null>(() => {
    try {
      const savedId = localStorage.getItem('cahaya_customer_active_booking_id')
      if (!savedId) return null
      const all = mockDb.getBookings()
      const found = all.find((b) => b.id === savedId)
      // Jika statusnya masih aktif (pending atau confirmed), tetap tampilkan tiketnya
      if (found && (found.status === 'pending' || found.status === 'confirmed')) {
        return found
      }
      // Jika sudah selesai atau dibatalkan, bersihkan memori perangkat
      if (found && (found.status === 'completed' || found.status === 'cancelled')) {
        localStorage.removeItem('cahaya_customer_active_booking_id')
      }
      return null
    } catch {
      return null
    }
  })

  const currentBranch = branches.find(
    (branch) => branch.id === selectedBranch,
  )

  const currentBarber = barbers.find(
    (barber) => barber.id === selectedBarber,
  )

  const currentService = services.find(
    (service) => service.id === selectedService,
  )

  const availableTimes = useMemo(
    () => getAvailableTimes(currentService?.time ?? 30),
    [currentService],
  )

  const ticketBranch =
    branches.find((b) => b.id === activeBooking?.branch_id)?.name ||
    activeBooking?.branch_id ||
    ''
  const ticketBarber =
    barbers.find((b) => b.id === activeBooking?.barber_id)?.name ||
    'Kapster'
  const ticketService =
    services.find((s) => s.id === activeBooking?.service_id)?.name ||
    'Layanan'
  const ticketDate = activeBooking ? activeBooking.starts_at.slice(0, 10) : ''
  const ticketTime = activeBooking
    ? new Date(activeBooking.starts_at).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    : ''

  const closeMenu = () => setMenuOpen(false)

  const handleNewBooking = () => {
    // Membuka form pendaftaran baru tanpa membatalkan tiket aktif yang sudah ada
    setActiveBooking(null)
    setStep(1)
    setSelectedBranch('')
    setSelectedBarber('')
    setSelectedService('')
    setSelectedDate(getToday())
    setSelectedTime('')
    setCustomerName('')
    setCustomerPhone('')
    setCustomerNote('')
  }

  const viewSavedActiveTicket = () => {
    try {
      const savedId = localStorage.getItem('cahaya_customer_active_booking_id')
      if (!savedId) return
      const found = mockDb.getBookings().find((b) => b.id === savedId)
      if (found && (found.status === 'pending' || found.status === 'confirmed')) {
        setActiveBooking(found)
      }
    } catch {
      // ignore
    }
  }

  let savedActiveBooking: MockBooking | null = null
  try {
    const savedId = localStorage.getItem('cahaya_customer_active_booking_id')
    if (savedId) {
      const found = mockDb.getBookings().find((b) => b.id === savedId)
      if (found && (found.status === 'pending' || found.status === 'confirmed')) {
        savedActiveBooking = found
      }
    }
  } catch {
    savedActiveBooking = null
  }

  const nextStep = () => {
    setStep((previous) => Math.min(previous + 1, 4))
  }

  const previousStep = () => {
    setStep((previous) => Math.max(previous - 1, 1))
  }

  const handleConfirmation = () => {
    if (
      !customerName.trim() ||
      !customerPhone.trim() ||
      !selectedBranch ||
      !selectedBarber ||
      !selectedService ||
      !selectedDate ||
      !selectedTime
    ) {
      alert('Mohon lengkapi seluruh data booking.')
      return
    }

    // 1. Validasi Bentrok: Cek apakah No. HP atau Nama sedang ada booking aktif
    const cleanPhone = customerPhone.replace(/\D/g, '')
    const allBookings = mockDb.getBookings()
    const conflictBooking = allBookings.find((b) => {
      const bPhone = b.customer_phone.replace(/\D/g, '')
      const isSamePhone = cleanPhone && bPhone === cleanPhone
      const isSameName =
        b.customer_name.trim().toLowerCase() === customerName.trim().toLowerCase()
      return (
        (isSamePhone || isSameName) &&
        (b.status === 'pending' || b.status === 'confirmed')
      )
    })

    if (conflictBooking) {
      alert(
        `PERINGATAN: RESERVASI MASIH AKTIF!\n\n` +
        `Nomor WhatsApp (${customerPhone}) atau nama "${customerName}" saat ini masih memiliki jadwal reservasi aktif dengan Kode: ${conflictBooking.booking_code}.\n\n` +
        `Sistem akan menampilkan tiket reservasi aktif Anda.`
      )
      localStorage.setItem('cahaya_customer_active_booking_id', conflictBooking.id)
      setActiveBooking(conflictBooking)
      return
    }

    // 2. Simpan ke local mock repository
    const newBooking = mockDb.addCustomerBooking({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_note: customerNote.trim() || null,
      branch_id: selectedBranch,
      barber_id: selectedBarber,
      service_id: selectedService,
      starts_at: `${selectedDate}T${selectedTime}:00`,
    })

    localStorage.setItem('cahaya_customer_active_booking_id', newBooking.id)
    setActiveBooking(newBooking)
  }

  return (
    <main>

      {/* ======================================
          NAVBAR
      ====================================== */}

      <motion.header
        className={`navbar ${menuOpen ? 'menu-open' : ''}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <a href="#home" className="logo" onClick={closeMenu}>
          <span>CAHAYA</span>
          <small>BARBER SHOP</small>
        </a>

        <nav className="nav-links" id="main-navigation">
          <a href="#home" onClick={closeMenu}>Beranda</a>
          <a href="#branches" onClick={closeMenu}>Cabang</a>
          <a href="#services" onClick={closeMenu}>Layanan</a>
          <a href="#contact" onClick={closeMenu}>Kontak</a>

          <a
            href="#booking"
            className="mobile-booking"
            onClick={closeMenu}
          >
            Booking Sekarang →
          </a>
        </nav>

        <a href="#booking" className="button button-small desktop-booking">
          Booking Sekarang
        </a>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
        >
          <span className={`line line-one ${menuOpen ? 'active' : ''}`} />
          <span className={`line line-two ${menuOpen ? 'active' : ''}`} />
          <span className={`line line-three ${menuOpen ? 'active' : ''}`} />
        </button>
      </motion.header>

      {/* ======================================
          HERO
      ====================================== */}

      <section className="hero" id="home">
        <motion.div
          className="hero-content"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.span className="eyebrow" variants={fadeUp}>
            THE ART OF GROOMING
          </motion.span>

          <motion.h1 variants={fadeUp}>
            LOOK SHARP.
            <br />
            <span>FEEL CONFIDENT.</span>
          </motion.h1>

          <motion.p variants={fadeUp}>
            Temukan gaya terbaikmu bersama Cahaya Barber.
            Nikmati layanan grooming profesional dengan
            pengalaman yang nyaman dan berkualitas.
          </motion.p>

          <motion.div className="hero-actions" variants={fadeUp}>
            <a href="#booking" className="button">
              Booking Sekarang <span>→</span>
            </a>

            <a href="#services" className="button button-outline">
              Lihat Layanan
            </a>
          </motion.div>

          <motion.div className="hero-note" variants={fadeUp}>
            <span>✦</span> PROFESSIONAL BARBER EXPERIENCE
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
        >
          <div className="visual-frame">
            <div className="visual-decoration">CB</div>

            <div className="visual-center">
              <span>✂</span>
              <h2>CAHAYA</h2>
              <p>BARBER SHOP</p>
            </div>

            <div className="visual-bottom">
              EST. CAHAYA BARBER
            </div>
          </div>
        </motion.div>
      </section>

      {/* ======================================
          INTRO
      ====================================== */}

      <motion.section
        className="intro-strip"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportSettings}
      >
        {[
          ['3 CABANG', 'Lokasi pilihanmu'],
          ['PROFESSIONAL', 'Pelayanan berkualitas'],
          ['YOUR STYLE', 'Gaya sesuai karaktermu'],
        ].map(([title, description]) => (
          <motion.div key={title} variants={fadeUp}>
            <strong>{title}</strong>
            <span>{description}</span>
          </motion.div>
        ))}
      </motion.section>

      {/* ======================================
          BRANCHES
      ====================================== */}

      <section className="section" id="branches">
        <motion.div
          className="section-heading"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
        >
          <motion.span className="eyebrow" variants={fadeUp}>
            OUR LOCATIONS
          </motion.span>

          <motion.h2 variants={fadeUp}>
            Pilih Cabang Favoritmu
          </motion.h2>

          <motion.p variants={fadeUp}>
            Pilih lokasi Cahaya Barber yang paling dekat
            dan sesuai dengan kebutuhanmu.
          </motion.p>
        </motion.div>

        <motion.div
          className="branch-grid"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
        >
          {branches.map((branch, index) => (
            <motion.article
              className="branch-card"
              key={branch.id}
              variants={fadeUp}
            >
              <div className="branch-number">0{index + 1}</div>
              <div className="branch-icon">⌖</div>

              <span className="card-label">CAHAYA BARBER</span>

              <h3>{branch.name}</h3>
              <p>{branch.description}</p>

              <div className="branch-location">
                ⌖ {branch.location}
              </div>

              <a
                href="#booking"
                className="text-link"
                onClick={() => setSelectedBranch(branch.id)}
              >
                Pilih Cabang <span>→</span>
              </a>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* ======================================
          SERVICES
      ====================================== */}

      <section className="services-section" id="services">
        <motion.div
          className="section-heading"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
        >
          <motion.span className="eyebrow" variants={fadeUp}>
            OUR SERVICES
          </motion.span>

          <motion.h2 variants={fadeUp}>
            Layanan Kami
          </motion.h2>

          <motion.p variants={fadeUp}>
            Berbagai pilihan layanan untuk menunjang
            penampilan dan kepercayaan dirimu.
          </motion.p>
        </motion.div>

        <motion.div
          className="service-grid"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
        >
          {services.map((service, index) => (
            <motion.article
              className="service-card"
              key={service.id}
              variants={fadeUp}
            >
              <span className="service-number">0{index + 1}</span>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <span className="service-time">
                {service.time} menit
              </span>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* ======================================
          BOOKING SECTION
      ====================================== */}

      <section className="booking-section" id="booking">
        <div className="booking-container">

          <div className="booking-heading">
            <span className="eyebrow">ONLINE RESERVATION</span>
            <h2>Book Your Experience</h2>
            <p>
              Jadwalkan kunjunganmu bersama Cahaya Barber
              dengan mudah dan praktis.
            </p>
          </div>

          {!activeBooking ? (
            <div className="booking-card">

              {/* PROGRESS */}

              <div className="booking-progress">
                {[1, 2, 3, 4].map((number) => (
                  <div
                    className={`progress-item ${step >= number ? 'active' : ''
                      }`}
                    key={number}
                  >
                    <div className="progress-circle">
                      {step > number ? '✓' : number}
                    </div>

                    <span>
                      {[
                        'Cabang',
                        'Layanan',
                        'Jadwal',
                        'Data',
                      ][number - 1]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="booking-divider" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  className="booking-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >

                  {/* STEP 1 */}

                  {step === 1 && (
                    <>
                      {savedActiveBooking && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            background: '#221a11',
                            border: '1px solid #c9a66b55',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            gap: '12px',
                          }}
                        >
                          <div>
                            <span style={{ color: '#c9a66b', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>
                              ✦ TIKET AKTIF DITEMUKAN
                            </span>
                            <div style={{ color: '#eee', fontSize: '12px', marginTop: '2px' }}>
                              Kode: <strong>{savedActiveBooking.booking_code}</strong> ({savedActiveBooking.customer_name})
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={viewSavedActiveTicket}
                            style={{
                              padding: '6px 12px',
                              background: '#c9a66b',
                              border: 'none',
                              borderRadius: '4px',
                              color: '#111',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Lihat Tiket →
                          </button>
                        </div>
                      )}

                      <span className="step-label">STEP 01</span>
                      <h3>Pilih Cabang</h3>
                      <p className="step-description">
                        Di cabang mana kamu ingin mendapatkan layanan?
                      </p>

                      <div className="booking-option-grid">
                        {branches.map((branch) => (
                          <button
                            type="button"
                            key={branch.id}
                            className={`booking-option ${selectedBranch === branch.id ? 'selected' : ''
                              }`}
                            onClick={() => {
                              setSelectedBranch(branch.id)
                              setSelectedBarber('')
                              setSelectedTime('')
                            }}
                          >
                            <span className="option-icon">⌖</span>
                            <strong>{branch.name}</strong>
                            <small>{branch.location}</small>
                            {selectedBranch === branch.id && (
                              <span className="option-check">✓</span>
                            )}
                          </button>
                        ))}
                      </div>

                      <h3 className="substep-title">Pilih Kapster</h3>
                      <p className="step-description">
                        Pilih kapster yang kamu inginkan.
                      </p>

                      <div className="booking-option-grid">
                        {barbers.map((barber) => (
                          <button
                            type="button"
                            key={barber.id}
                            disabled={!selectedBranch}
                            className={`booking-option barber-option ${selectedBarber === barber.id ? 'selected' : ''
                              }`}
                            onClick={() => setSelectedBarber(barber.id)}
                          >
                            <span className="option-icon">♙</span>
                            <strong>{barber.name}</strong>
                            <small>
                              {selectedBranch
                                ? 'Kapster cabang terpilih'
                                : 'Pilih cabang terlebih dahulu'}
                            </small>
                            {selectedBarber === barber.id && (
                              <span className="option-check">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* STEP 2 */}

                  {step === 2 && (
                    <>
                      <span className="step-label">STEP 02</span>
                      <h3>Pilih Layanan</h3>
                      <p className="step-description">
                        Tentukan layanan yang ingin kamu nikmati.
                      </p>

                      <div className="booking-service-list">
                        {services.map((service) => (
                          <button
                            type="button"
                            key={service.id}
                            className={`booking-service-option ${selectedService === service.id ? 'selected' : ''
                              }`}
                            onClick={() => {
                              setSelectedService(service.id)
                              setSelectedTime('')
                            }}
                          >
                            <div>
                              <strong>{service.name}</strong>
                              <small>{service.description}</small>
                              <span>{service.time} menit</span>
                            </div>

                            <span className="service-radio">
                              {selectedService === service.id ? '✓' : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* STEP 3 */}

                  {step === 3 && (
                    <>
                      <span className="step-label">STEP 03</span>
                      <h3>Pilih Jadwal</h3>
                      <p className="step-description">
                        Tentukan tanggal dan waktu kunjunganmu.
                      </p>

                      <label className="booking-label" htmlFor="booking-date">
                        Tanggal Booking
                      </label>

                      <input
                        id="booking-date"
                        className="booking-input"
                        type="date"
                        min={getToday()}
                        value={selectedDate}
                        onChange={(event) => {
                          setSelectedDate(event.target.value)
                          setSelectedTime('')
                        }}
                      />

                      <label className="booking-label">
                        Pilih Waktu
                      </label>

                      <div className="time-grid">
                        {availableTimes.map((time) => (
                          <button
                            type="button"
                            key={time}
                            className={`time-option ${selectedTime === time ? 'selected' : ''
                              }`}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </button>
                        ))}
                      </div>

                      <div className="booking-notice">
                        <span>ⓘ</span>
                        <p>
                          Jam operasional 10.00–21.00 WIB.
                          Pilihan waktu di atas masih berupa contoh.
                          Ketersediaan sebenarnya akan mengikuti jadwal
                          kapster yang dikelola admin.
                        </p>
                      </div>
                    </>
                  )}

                  {/* STEP 4 */}

                  {step === 4 && (
                    <>
                      <span className="step-label">STEP 04</span>
                      <h3>Data Pelanggan</h3>
                      <p className="step-description">
                        Masukkan data untuk menyelesaikan pemesanan.
                      </p>

                      <label className="booking-label" htmlFor="customer-name">
                        Nama Lengkap
                      </label>

                      <input
                        id="customer-name"
                        className="booking-input"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        value={customerName}
                        onChange={(event) => setCustomerName(event.target.value)}
                      />

                      <label className="booking-label" htmlFor="customer-phone">
                        Nomor WhatsApp
                      </label>

                      <input
                        id="customer-phone"
                        className="booking-input"
                        type="tel"
                        placeholder="Contoh: 081234567890"
                        value={customerPhone}
                        onChange={(event) => setCustomerPhone(event.target.value)}
                      />

                      <label className="booking-label" htmlFor="customer-note">
                        Catatan Tambahan
                      </label>

                      <textarea
                        id="customer-note"
                        className="booking-input booking-textarea"
                        placeholder="Contoh: ingin potongan rambut tertentu..."
                        rows={4}
                        value={customerNote}
                        onChange={(event) => setCustomerNote(event.target.value)}
                      />

                      <div className="booking-summary">
                        <h4>Ringkasan Booking</h4>

                        <div><span>Cabang</span><strong>{currentBranch?.name}</strong></div>
                        <div><span>Kapster</span><strong>{currentBarber?.name}</strong></div>
                        <div><span>Layanan</span><strong>{currentService?.name}</strong></div>
                        <div><span>Tanggal</span><strong>{selectedDate}</strong></div>
                        <div><span>Waktu</span><strong>{selectedTime} WIB</strong></div>
                        <div><span>Durasi</span><strong>{currentService?.time} menit</strong></div>
                        <div><span>Nama</span><strong>{customerName || '-'}</strong></div>
                        <div><span>WhatsApp</span><strong>{customerPhone || '-'}</strong></div>
                      </div>
                    </>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* NAVIGATION BUTTONS */}

              <div className="booking-navigation">
                {step > 1 && (
                  <button
                    type="button"
                    className="booking-back"
                    onClick={previousStep}
                  >
                    ← Kembali
                  </button>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    className="booking-next"
                    disabled={
                      (step === 1 && (!selectedBranch || !selectedBarber)) ||
                      (step === 2 && !selectedService) ||
                      (step === 3 && (!selectedDate || !selectedTime))
                    }
                    onClick={nextStep}
                  >
                    Lanjutkan →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="booking-next"
                    disabled={!customerName.trim() || !customerPhone.trim()}
                    onClick={handleConfirmation}
                  >
                    Konfirmasi Booking →
                  </button>
                )}
              </div>

            </div>
          ) : (
            <motion.div
              className="booking-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="success-icon">✓</div>
              <span className="eyebrow">RESERVASI AKTIF PERANGKAT ANDA</span>
              <h3>Kode Booking: {activeBooking.booking_code}</h3>

              <div style={{ margin: '8px 0 16px' }}>
                <span
                  style={{
                    padding: '5px 14px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    background: activeBooking.status === 'confirmed' ? '#2e7d32' : '#c9a66b',
                    color: '#fff',
                  }}
                >
                  Status: {activeBooking.status === 'confirmed' ? 'Terkonfirmasi (Siap Datang)' : 'Menunggu Konfirmasi Admin'}
                </span>
              </div>

              <p>
                Halo, <strong>{activeBooking.customer_name}</strong>. Sistem mengenali tiket reservasi aktif Anda pada perangkat ini.
              </p>

              <div className="booking-summary">
                <div><span>Kode Booking</span><strong>{activeBooking.booking_code}</strong></div>
                <div><span>Cabang</span><strong>{ticketBranch}</strong></div>
                <div><span>Kapster</span><strong>{ticketBarber}</strong></div>
                <div><span>Layanan</span><strong>{ticketService}</strong></div>
                <div><span>Tanggal</span><strong>{ticketDate}</strong></div>
                <div><span>Waktu</span><strong>{ticketTime} WIB</strong></div>
                <div><span>WhatsApp</span><strong>{activeBooking.customer_phone}</strong></div>
                {activeBooking.customer_note && (
                  <div><span>Catatan</span><strong style={{ fontStyle: 'italic' }}>"{activeBooking.customer_note}"</strong></div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                <a
                  href={`https://api.whatsapp.com/send?phone=6281234567890&text=${encodeURIComponent(
                    `Halo Cahaya Barber Cabang ${ticketBranch}, saya ingin mengonfirmasi booking saya:\n\n` +
                    `• Kode Booking: ${activeBooking.booking_code}\n` +
                    `• Nama: ${activeBooking.customer_name}\n` +
                    `• Layanan: ${ticketService}\n` +
                    `• Kapster: ${ticketBarber}\n` +
                    `• Jadwal: ${ticketDate} jam ${ticketTime} WIB\n\n` +
                    `Terima kasih.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="button"
                  style={{ textAlign: 'center', background: '#25D366', color: '#fff', borderColor: '#25D366' }}
                >
                  💬 Konfirmasi Booking ke WhatsApp
                </a>

                <a
                  href={`https://api.whatsapp.com/send?phone=6281234567890&text=${encodeURIComponent(
                    `Halo Cahaya Barber Cabang ${ticketBranch}, saya ${activeBooking.customer_name} pemegang Kode Booking ${activeBooking.booking_code} untuk jadwal ${ticketDate} jam ${ticketTime} WIB.\n\n` +
                    `Mohon izin mengajukan pembatalan reservasi ini karena ada keperluan mendadak. Terima kasih.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-outline"
                  style={{ textAlign: 'center', borderColor: '#666', color: '#bbb', fontSize: '13px' }}
                >
                  ✕ Ingin Batalkan? Hubungi WhatsApp Admin
                </a>

                <button
                  type="button"
                  className="booking-next"
                  onClick={handleNewBooking}
                >
                  Buat Booking Baru
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ======================================
          BOOKING BANNER
      ====================================== */}

      <section className="booking-banner">
        <span className="eyebrow">YOUR NEXT LOOK STARTS HERE</span>
        <h2>Ready for a Fresh Look?</h2>
        <p>
          Pilih cabang Cahaya Barber dan jadwalkan
          kunjunganmu sekarang.
        </p>
        <a href="#booking" className="button">
          Mulai Booking →
        </a>
      </section>

      {/* ======================================
          FOOTER
      ====================================== */}

      <motion.footer
        id="contact"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportSettings}
      >
        <div className="logo">
          <span>CAHAYA</span>
          <small>BARBER SHOP</small>
        </div>

        <p>Premium Grooming Experience.</p>

        <small>© 2026 Cahaya Barber. All rights reserved.</small>
      </motion.footer>

    </main>
  )
}


export default function App() {
  return (
    <Routes>
      {/* WEBSITE PELANGGAN */}
      <Route path="/" element={<CustomerHome />} />

      {/* LOGIN ADMIN */}
      <Route path="/admin/login" element={<AdminLogin />} />


      {/* HALAMAN YANG DILINDUNGI */}
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/barbers" element={<BarberManagement />} />
          <Route path="/admin/bookings" element={<AdminBookingsView />} />
          <Route path="/admin/services" element={<AdminServicesView />} />
          <Route path="/admin/schedules" element={<AdminSchedulesView />} />
          <Route path="/admin/reviews" element={<AdminReviewsView />} />
        </Route>
      </Route>


      {/* REDIRECT */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

