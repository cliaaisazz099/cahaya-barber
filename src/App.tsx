
import { useMemo, useState, useEffect, type FormEvent } from 'react'
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
import { mockDb, type MockBooking, type MockReview } from './mock/mockData'

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

// Layanan & Kapster diambil dinamis dari mockDb (katalog master dikelola Owner)

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

function parseBookingTime(startsAt: string) {
  // Jika format YYYY-MM-DDTHH:mm:ss tanpa timezone (format local default mock)
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(startsAt) &&
    !startsAt.includes('Z') &&
    !startsAt.includes('+')
  ) {
    const [dPart, tPart] = startsAt.split('T')
    const [hh, mm] = tPart.split(':').map(Number)
    return {
      dateStr: dPart,
      startMinutes: hh * 60 + mm,
    }
  }

  // Jika format ISO standar dengan Z atau offset
  const d = new Date(startsAt)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return {
    dateStr: `${y}-${m}-${day}`,
    startMinutes: d.getHours() * 60 + d.getMinutes(),
  }
}

// ==========================================
// STAR RATING INPUT COMPONENT
// ==========================================

function StarRatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (val: number) => void
}) {
  const [hover, setHover] = useState(0)

  const labels: Record<number, string> = {
    1: 'Sangat Buruk 😞',
    2: 'Kurang Puas 😐',
    3: 'Cukup Baik 🙂',
    4: 'Puas & Rapi 😊',
    5: 'Sangat Puas & Rekomended! ⭐',
  }

  const currentVal = hover || value

  return (
    <div style={{ margin: '14px 0', textAlign: 'center' }}>
      <div
        style={{
          display: 'inline-flex',
          gap: '10px',
          fontSize: '36px',
          cursor: 'pointer',
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            style={{
              color: star <= currentVal ? '#fbbf24' : '#4a3f35',
              transition: 'color 0.15s ease, transform 0.15s ease',
              transform: star <= currentVal ? 'scale(1.15)' : 'scale(1)',
              display: 'inline-block',
              userSelect: 'none',
              padding: '0 2px',
            }}
          >
            ★
          </span>
        ))}
      </div>
      <div
        style={{
          marginTop: '6px',
          fontSize: '13px',
          color: '#c9a66b',
          fontWeight: 650,
        }}
      >
        {labels[currentVal] || 'Pilih Bintang (1 - 5)'}
      </div>
    </div>
  )
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

  // Tiket Search Modal states
  const [ticketModalOpen, setTicketModalOpen] = useState(false)
  const [ticketSearchQuery, setTicketSearchQuery] = useState('')
  const [ticketSearchError, setTicketSearchError] = useState('')

  // Review states
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [customerReviews, setCustomerReviews] = useState<MockReview[]>(() =>
    mockDb.getReviews()
  )

  // Memori Reservasi Aktif Perangkat (Device Persistence)
  const [activeBooking, setActiveBooking] = useState<MockBooking | null>(() => {
    try {
      const savedId = localStorage.getItem('cahaya_customer_active_booking_id')
      if (!savedId) return null
      const all = mockDb.getBookings()
      const found = all.find((b) => b.id === savedId)
      // Tiket dianggap aktif dan ditampilkan otomatis HANYA jika:
      // status 'pending', 'confirmed', atau 'completed' TAPI BELUM diulas (!found.has_reviewed)
      if (
        found &&
        (found.status === 'pending' ||
          found.status === 'confirmed' ||
          (found.status === 'completed' && !found.has_reviewed))
      ) {
        return found
      }
      // Jika sudah selesai DAN sudah diulas, atau jika dibatalkan, bersihkan memori perangkat
      if (
        found &&
        ((found.status === 'completed' && found.has_reviewed) ||
          found.status === 'cancelled')
      ) {
        localStorage.removeItem('cahaya_customer_active_booking_id')
      }
      return null
    } catch {
      return null
    }
  })

  // Data kapster dinamis dari mock store
  const allBarbers = useMemo(() => mockDb.getBarbers(), [])

  // Data layanan dinamis dari mock store
  const allServices = useMemo(() => mockDb.getServices(), [])
  const services = useMemo(
    () => allServices.filter((s) => s.is_active && !s.is_archived),
    [allServices]
  )

  // Kapster aktif yang bertugas di cabang terpilih (1 kapster = 1 cabang tetap)
  const availableBarbers = useMemo(() => {
    if (!selectedBranch) return []
    return allBarbers.filter(
      (b) => b.branch_id === selectedBranch && b.is_active && !b.is_archived
    )
  }, [selectedBranch, allBarbers])

  const currentBranch = branches.find(
    (branch) => branch.id === selectedBranch,
  )

  const currentBarber = allBarbers.find(
    (barber) => barber.id === selectedBarber,
  )

  const currentService = services.find(
    (service) => service.id === selectedService,
  )

  const availableTimes = useMemo(
    () => getAvailableTimes(currentService?.time ?? 30),
    [currentService],
  )

  const [bookingsVersion, setBookingsVersion] = useState(0)

  useEffect(() => {
    const syncBookings = () => setBookingsVersion((v) => v + 1)
    window.addEventListener('storage', syncBookings)
    window.addEventListener('focus', syncBookings)
    window.addEventListener('cahaya-storage-sync', syncBookings)
    return () => {
      window.removeEventListener('storage', syncBookings)
      window.removeEventListener('focus', syncBookings)
      window.removeEventListener('cahaya-storage-sync', syncBookings)
    }
  }, [])

  // Data reservasi aktif dari mock store (sinkron realtime)
  const currentBookings = useMemo(() => {
    void bookingsVersion
    return mockDb.getBookings()
  }, [bookingsVersion])

  // Validasi slot collision: Cek apakah slot jam tertentu bentrok dengan jadwal kapster yang sudah terisi
  const isSlotBooked = (timeStr: string): boolean => {
    if (!selectedBarber || !selectedDate || !timeStr) return false

    const [slotH, slotM] = timeStr.split(':').map(Number)
    const slotStart = slotH * 60 + slotM
    const slotEnd = slotStart + (currentService?.time ?? 30)

    return currentBookings.some((b) => {
      // 1. Kapster harus sama
      if (b.barber_id !== selectedBarber) return false

      // 2. Status yang menempati slot HANYA reservasi yang sedang aktif: 'pending' atau 'confirmed'
      // Reservasi yang sudah 'completed' (tuntas) atau 'cancelled' (batal) tidak mengunci slot
      if (b.status !== 'pending' && b.status !== 'confirmed') {
        return false
      }

      // 4. Tanggal harus sama
      const bInfo = parseBookingTime(b.starts_at)
      if (bInfo.dateStr !== selectedDate) return false

      // 5. Cek tumpang tindih waktu (overlap interval): slotStart < bEnd && slotEnd > bStart
      const bService = allServices.find((s) => s.id === b.service_id)
      const bDuration = bService?.time ?? 30
      const bStart = bInfo.startMinutes
      const bEnd = bStart + bDuration

      return slotStart < bEnd && slotEnd > bStart
    })
  }

  const ticketBranch =
    branches.find((b) => b.id === activeBooking?.branch_id)?.name ||
    activeBooking?.branch_id ||
    ''
  const ticketBarber =
    allBarbers.find((b) => b.id === activeBooking?.barber_id)?.name ||
    'Kapster'
  const ticketServiceObj = allServices.find(
    (s) => s.id === activeBooking?.service_id
  )
  const ticketService = ticketServiceObj
    ? `${ticketServiceObj.name} (Rp ${ticketServiceObj.price.toLocaleString('id-ID')})`
    : 'Layanan'
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
    // Bersihkan memori jika tiket sebelumnya sudah diulas atau selesai
    try {
      const savedId = localStorage.getItem('cahaya_customer_active_booking_id')
      if (savedId) {
        const found = mockDb.getBookings().find((b) => b.id === savedId)
        if (
          found &&
          (found.has_reviewed ||
            found.status === 'completed' ||
            found.status === 'cancelled')
        ) {
          localStorage.removeItem('cahaya_customer_active_booking_id')
        }
      }
    } catch {
      // ignore
    }
  }

  const viewSavedActiveTicket = () => {
    try {
      const savedId = localStorage.getItem('cahaya_customer_active_booking_id')
      if (!savedId) return
      const found = mockDb.getBookings().find((b) => b.id === savedId)
      // Hanya buka jika tiket masih aktif atau completed yang belum diulas
      if (
        found &&
        (found.status === 'pending' ||
          found.status === 'confirmed' ||
          (found.status === 'completed' && !found.has_reviewed))
      ) {
        setActiveBooking(found)
      } else if (found && (found.has_reviewed || found.status === 'cancelled')) {
        localStorage.removeItem('cahaya_customer_active_booking_id')
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
      // Hanya tampilkan notice tiket aktif jika status pending, confirmed, atau completed BELUM diulas
      if (
        found &&
        (found.status === 'pending' ||
          found.status === 'confirmed' ||
          (found.status === 'completed' && !found.has_reviewed))
      ) {
        savedActiveBooking = found
      } else if (found && (found.has_reviewed || found.status === 'cancelled')) {
        localStorage.removeItem('cahaya_customer_active_booking_id')
      }
    }
  } catch {
    savedActiveBooking = null
  }

  const handleSearchTicket = (e: FormEvent) => {
    e.preventDefault()
    setTicketSearchError('')

    const found = mockDb.findBookingByCodeOrPhone(ticketSearchQuery)
    if (found) {
      setActiveBooking(found)
      // Hanya simpan ke memori aktif perangkat jika tiket masih butuh perhatian (pending, confirmed, atau belum diulas)
      if (
        found.status === 'pending' ||
        found.status === 'confirmed' ||
        (found.status === 'completed' && !found.has_reviewed)
      ) {
        localStorage.setItem('cahaya_customer_active_booking_id', found.id)
      } else {
        localStorage.removeItem('cahaya_customer_active_booking_id')
      }
      setTicketModalOpen(false)
      setTicketSearchQuery('')

      // Scroll ke bagian booking
      setTimeout(() => {
        const el = document.getElementById('booking')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      setTicketSearchError(
        'Tiket tidak ditemukan. Pastikan Kode Booking (contoh: CB-MN-261115-99) atau Nomor WhatsApp sudah benar.'
      )
    }
  }

  const handleReviewSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!activeBooking) return

    setReviewError('')
    setSubmittingReview(true)
    try {
      const res = mockDb.submitBookingReview(
        activeBooking.id,
        reviewRating,
        reviewComment
      )
      setActiveBooking(res.booking)
      setCustomerReviews(mockDb.getReviews())
      setReviewComment('')

      // LANGSUNG BERSIHKAN MEMORI AKTIF:
      // Ulasan telah terkirim dan tiket telah tuntas 100%.
      // Saat refresh atau membuat booking baru, tiket lama tidak akan di-notice lagi.
      localStorage.removeItem('cahaya_customer_active_booking_id')
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : 'Gagal mengirim ulasan.'
      )
    } finally {
      setSubmittingReview(false)
    }
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

    // 1. Validasi Bentrok Jadwal Kapster (Slot Collision)
    if (isSlotBooked(selectedTime)) {
      alert(
        `JADWAL TIDAK TERSEDIA!\n\n` +
        `Mohon maaf, jadwal kapster ${currentBarber?.name || ''} pada ${selectedDate} pukul ${selectedTime} WIB baru saja dipesan oleh pelanggan lain atau bertabrakan dengan reservasi aktif.\n\n` +
        `Silakan kembali ke Langkah 3 untuk memilih jam lain.`
      )
      setStep(3)
      setSelectedTime('')
      return
    }

    // 2. Validasi Bentrok: Cek apakah No. HP atau Nama sedang ada booking aktif
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

    // 3. Simpan ke local mock repository
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
    setBookingsVersion((v) => v + 1)
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
          <a href="#reviews" onClick={closeMenu}>Ulasan</a>
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

            <button
              type="button"
              className="button button-outline"
              onClick={() => setTicketModalOpen(true)}
            >
              🔍 Cek Tiket
            </button>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <span className="service-time">
                  {service.time} menit
                </span>
                <strong style={{ color: 'var(--gold)', fontSize: '15px' }}>
                  Rp {service.price.toLocaleString('id-ID')}
                </strong>
              </div>
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
                        {currentBranch
                          ? `Pilih kapster yang bertugas di Cabang ${currentBranch.name}.`
                          : 'Pilih cabang terlebih dahulu untuk melihat kapster yang bertugas.'}
                      </p>

                      {!selectedBranch ? (
                        <div
                          style={{
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px dashed #443527',
                            borderRadius: '8px',
                            color: '#998a7b',
                            fontSize: '13px',
                            textAlign: 'center',
                          }}
                        >
                          Pilih salah satu cabang di atas terlebih dahulu.
                        </div>
                      ) : availableBarbers.length === 0 ? (
                        <div
                          style={{
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px dashed #443527',
                            borderRadius: '8px',
                            color: '#c69b64',
                            fontSize: '13px',
                            textAlign: 'center',
                          }}
                        >
                          Saat ini belum ada kapster aktif yang bertugas di cabang ini.
                        </div>
                      ) : (
                        <div className="booking-option-grid">
                          {availableBarbers.map((barber) => (
                            <button
                              type="button"
                              key={barber.id}
                              className={`booking-option barber-option ${selectedBarber === barber.id ? 'selected' : ''
                                }`}
                              onClick={() => {
                                setSelectedBarber(barber.id)
                                setSelectedTime('')
                              }}
                            >
                              <span className="option-icon">♙</span>
                              <strong>{barber.name}</strong>
                              <small>
                                {barber.description || `Kapster Cabang ${currentBranch?.name}`}
                              </small>
                              {selectedBarber === barber.id && (
                                <span className="option-check">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
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
                              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
                                {service.time} menit · Rp {service.price.toLocaleString('id-ID')}
                              </span>
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
                        {availableTimes.map((time) => {
                          const booked = isSlotBooked(time)
                          const isSelected = selectedTime === time
                          return (
                            <button
                              type="button"
                              key={time}
                              disabled={booked}
                              className={`time-option ${isSelected ? 'selected' : ''} ${booked ? 'booked' : ''}`}
                              onClick={() => {
                                if (!booked) setSelectedTime(time)
                              }}
                              title={
                                booked
                                  ? `Jadwal pukul ${time} WIB sudah terisi`
                                  : `Pilih pukul ${time} WIB`
                              }
                            >
                              <span className="time-text">{time}</span>
                              {booked && <span className="time-status-badge">Penuh</span>}
                            </button>
                          )
                        })}
                      </div>

                      <div className="booking-notice">
                        <span>ⓘ</span>
                        <p>
                          Jam operasional 10.00–21.00 WIB. Slot bertanda{' '}
                          <strong style={{ color: '#e07a5f' }}>Penuh</strong> telah
                          direservasi oleh pelanggan lain. Durasi layanan{' '}
                          <strong>{currentService?.time ?? 30} menit</strong>.
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
                        <div><span>Layanan</span><strong>{currentService ? `${currentService.name} (Rp ${currentService.price.toLocaleString('id-ID')})` : '-'}</strong></div>
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
                      (step === 3 &&
                        (!selectedDate || !selectedTime || isSlotBooked(selectedTime)))
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
                    background:
                      activeBooking.status === 'completed'
                        ? '#2e7d32'
                        : activeBooking.status === 'confirmed'
                        ? '#2e7d32'
                        : '#c9a66b',
                    color: '#fff',
                  }}
                >
                  Status:{' '}
                  {activeBooking.status === 'completed'
                    ? 'Layanan Selesai ✓'
                    : activeBooking.status === 'confirmed'
                    ? 'Terkonfirmasi (Siap Datang)'
                    : 'Menunggu Konfirmasi Admin'}
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

              {/* REVIEW SECTION WHEN COMPLETED */}
              {activeBooking.status === 'completed' && (
                <div
                  style={{
                    marginTop: '24px',
                    padding: '24px 20px',
                    background: 'rgba(28, 21, 16, 0.85)',
                    border: '1px solid #57402b',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  {!activeBooking.has_reviewed ? (
                    <form onSubmit={handleReviewSubmit}>
                      <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>
                        FEEDBACK LAYANAN
                      </span>
                      <h4
                        style={{
                          margin: '8px 0 6px',
                          fontSize: '18px',
                          color: '#f5eee5',
                        }}
                      >
                        Bagaimana Pengalaman Cukurmu?
                      </h4>
                      <p
                        style={{
                          color: '#b7a797',
                          fontSize: '13px',
                          marginBottom: '16px',
                        }}
                      >
                        Beri rating dan ulasan untuk Mas <strong>{ticketBarber}</strong> di Cabang{' '}
                        <strong>{ticketBranch}</strong>.
                      </p>

                      <StarRatingInput
                        value={reviewRating}
                        onChange={setReviewRating}
                      />

                      <div style={{ textAlign: 'left', marginTop: '10px' }}>
                        <label
                          style={{
                            color: '#b7a797',
                            fontSize: '11px',
                            display: 'block',
                            marginBottom: '6px',
                          }}
                        >
                          Pesan atau Masukan (Opsional):
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Tuliskan pengalaman atau pesan tambahan di sini (opsional)..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            background: '#100d0b',
                            border: '1px solid #57402b',
                            borderRadius: '6px',
                            color: '#f5eee5',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      {reviewError && (
                        <div
                          style={{
                            color: '#ef4444',
                            fontSize: '12px',
                            marginTop: '8px',
                          }}
                        >
                          {reviewError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="booking-next"
                        style={{ width: '100%', marginTop: '16px' }}
                        disabled={submittingReview}
                      >
                        {submittingReview
                          ? 'Mengirim Ulasan...'
                          : 'Kirim Ulasan ★'}
                      </button>
                    </form>
                  ) : (
                    <div>
                      <div
                        style={{
                          fontSize: '28px',
                          color: '#25D366',
                          marginBottom: '8px',
                        }}
                      >
                        ✓
                      </div>
                      <h4
                        style={{
                          margin: '0 0 6px',
                          color: '#f5eee5',
                          fontSize: '18px',
                        }}
                      >
                        Ulasan Anda Telah Terkirim
                      </h4>
                      <div
                        style={{
                          color: '#fbbf24',
                          fontSize: '22px',
                          margin: '8px 0',
                          letterSpacing: '3px',
                        }}
                      >
                        {'★'.repeat(activeBooking.review_rating || 5)}
                      </div>
                      {activeBooking.review_comment ? (
                        <p
                          style={{
                            fontStyle: 'italic',
                            color: '#b7a797',
                            fontSize: '13px',
                          }}
                        >
                          "{activeBooking.review_comment}"
                        </p>
                      ) : (
                        <p
                          style={{
                            fontStyle: 'italic',
                            color: '#8f7d6b',
                            fontSize: '12px',
                          }}
                        >
                          (Rating bintang tanpa ulasan tertulis)
                        </p>
                      )}
                      <p
                        style={{
                          color: '#888',
                          fontSize: '12px',
                          marginTop: '12px',
                        }}
                      >
                        Terima kasih! Feedback Anda sangat membantu kami untuk
                        terus menjaga standar kualitas pelayanan.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                {activeBooking.status !== 'completed' && (
                  <>
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
                  </>
                )}

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
          REVIEWS / TESTIMONIALS SECTION
      ====================================== */}
      <section className="section" id="reviews" style={{ padding: '80px 20px', background: '#120f0d' }}>
        <motion.div
          className="section-heading"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
        >
          <motion.span className="eyebrow" variants={fadeUp}>
            CUSTOMER STORIES
          </motion.span>
          <motion.h2 variants={fadeUp}>
            Apa Kata Pelanggan?
          </motion.h2>
          <motion.p variants={fadeUp}>
            Pengalaman dan ulasan kepuasan asli dari pelanggan setia Cahaya Barber.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {customerReviews.slice(0, 4).map((r) => (
            <motion.div
              key={r.id}
              variants={fadeUp}
              style={{
                background: '#1c1510',
                border: '1px solid #493523',
                borderRadius: '8px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ color: 'var(--gold)', fontSize: '16px', letterSpacing: '2px' }}>
                    {'★'.repeat(r.rating)}
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: 'rgba(198, 155, 100, 0.15)',
                      color: 'var(--gold-light)',
                      border: '1px solid rgba(198, 155, 100, 0.3)',
                    }}
                  >
                    Cabang {r.branch_id.toUpperCase()}
                  </span>
                </div>
                <p style={{ color: '#d1c4b7', fontSize: '13px', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '16px' }}>
                  "{r.comment || 'Pelanggan memberikan rating bintang tanpa ulasan tertulis.'}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid #382718', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#f5eee5', fontSize: '13px', display: 'block' }}>{r.customer_name}</strong>
                  <small style={{ color: '#8f7d6b', fontSize: '11px' }}>Bersama {r.barber_name}</small>
                </div>
                <span style={{ color: '#25D366', fontSize: '10px', fontWeight: 700 }}>
                  ✓ Verified
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
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
          MODAL CARI & BUKA TIKET
      ====================================== */}
      {ticketModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setTicketModalOpen(false)}
        >
          <div
            style={{
              background: '#1c1510',
              border: '1px solid #57402b',
              borderRadius: '10px',
              width: '100%',
              maxWidth: '460px',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '14px',
              }}
            >
              <div>
                <span className="eyebrow" style={{ fontSize: '10px' }}>
                  PORTAL PELANGGAN
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '20px', color: '#f5eee5' }}>
                  Cek & Buka Tiket
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTicketModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#999',
                  fontSize: '26px',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <p
              style={{
                color: '#b7a797',
                fontSize: '13px',
                lineHeight: 1.6,
                marginBottom: '20px',
              }}
            >
              Masukkan <strong>Kode Booking</strong> Anda (contoh:{' '}
              <code style={{ color: 'var(--gold-light)' }}>CB-MN-261115-99</code>) atau{' '}
              <strong>Nomor WhatsApp</strong> yang digunakan saat reservasi.
            </p>

            <form onSubmit={handleSearchTicket}>
              <input
                type="text"
                placeholder="Contoh: CB-MN-261115-99 atau 081234567000"
                value={ticketSearchQuery}
                onChange={(e) => {
                  setTicketSearchQuery(e.target.value)
                  setTicketSearchError('')
                }}
                required
                autoFocus
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  background: '#100d0b',
                  border: '1px solid #57402b',
                  borderRadius: '6px',
                  color: '#f5eee5',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              {ticketSearchError && (
                <div
                  style={{
                    color: '#ef4444',
                    fontSize: '12px',
                    marginTop: '10px',
                    lineHeight: 1.5,
                  }}
                >
                  {ticketSearchError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setTicketModalOpen(false)}
                  style={{ flex: 1 }}
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="button"
                  style={{ flex: 2 }}
                >
                  Buka Tiket →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

