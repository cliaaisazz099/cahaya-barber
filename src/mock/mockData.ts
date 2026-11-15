// ==========================================
// CAHAYA BARBER - MOCK DATA & LOCAL STORE
// Mode Demo Standalone (Aman dari Supabase Asli)
// ==========================================

export type MockUser = {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'owner'
  branch_id: string | null
  is_active: boolean
}

export type MockBranch = {
  id: string
  name: string
  location: string
  description: string
  is_active: boolean
}

export type MockBarber = {
  id: string
  name: string
  phone: string | null
  photo_url: string | null
  description: string | null
  is_active: boolean
  is_archived: boolean
  archived_at: string | null
  created_at: string
}

export type MockAssignment = {
  id: string
  barber_id: string
  branch_id: string
  is_active: boolean
}

export type MockBooking = {
  id: string
  booking_code: string
  customer_name: string
  customer_phone: string
  customer_note: string | null
  branch_id: string
  barber_id: string
  service_id: string
  starts_at: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
}

export type MockService = {
  id: string
  name: string
  description: string
  time: number
  price: number
  is_active: boolean
}

// ==========================================
// DAFTAR AKUN DEMO
// ==========================================

export const DEMO_USERS: (MockUser & { password: string })[] = [
  {
    id: 'user-owner',
    email: 'owner@cahayabarber.com',
    password: 'Owner99.',
    full_name: 'Hendra Wijaya (Owner)',
    role: 'owner',
    branch_id: null,
    is_active: true,
  },
  {
    id: 'user-admin-manislor',
    email: 'admin.manislor@cahayabarber.com',
    password: 'Owner99.',
    full_name: 'Rizky Kurniawan (Admin)',
    role: 'admin',
    branch_id: 'manislor',
    is_active: true,
  },
  {
    id: 'user-admin-jalaksana',
    email: 'admin.jalaksana@cahayabarber.com',
    password: 'Owner99.',
    full_name: 'Dedi Pratama (Admin)',
    role: 'admin',
    branch_id: 'jalaksana',
    is_active: true,
  },
  {
    id: 'user-admin-veteran',
    email: 'admin.veteran@cahayabarber.com',
    password: 'Owner99.',
    full_name: 'Budi Santoso (Admin)',
    role: 'admin',
    branch_id: 'veteran',
    is_active: true,
  },
]

// ==========================================
// SEED DATA AWAL
// ==========================================

const INITIAL_BRANCHES: MockBranch[] = [
  {
    id: 'manislor',
    name: 'Manislor',
    location: 'Cabang Manislor, Kuningan',
    description: 'Pengalaman grooming terbaik di cabang Manislor.',
    is_active: true,
  },
  {
    id: 'jalaksana',
    name: 'Jalaksana',
    location: 'Cabang Jalaksana, Kuningan',
    description: 'Pelayanan profesional untuk penampilan terbaik.',
    is_active: true,
  },
  {
    id: 'veteran',
    name: 'Veteran',
    location: 'Cabang Veteran, Kuningan',
    description: 'Temukan gaya rambut sesuai karaktermu.',
    is_active: true,
  },
]

const INITIAL_SERVICES: MockService[] = [
  {
    id: 'haircut',
    name: 'Classic Haircut',
    description: 'Potong rambut sesuai gaya pilihanmu + cuci + styling pomade.',
    time: 30,
    price: 40000,
    is_active: true,
  },
  {
    id: 'coloring',
    name: 'Hair Coloring',
    description: 'Layanan pewarnaan rambut profesional berkualitas tinggi.',
    time: 45,
    price: 120000,
    is_active: true,
  },
  {
    id: 'perm',
    name: 'Textured Perm',
    description: 'Ciptakan gelombang rambut alami ala Korean hairstyle.',
    time: 45,
    price: 150000,
    is_active: true,
  },
  {
    id: 'down-perm',
    name: 'Down Perm',
    description: 'Penataan rambut samping agar lebih rapi dan tidak mekar.',
    time: 45,
    price: 90000,
    is_active: true,
  },
  {
    id: 'massage',
    name: 'Head & Shoulder Massage',
    description: 'Relaksasi total dengan pijat kepala dan pundak aromaterapi.',
    time: 30,
    price: 35000,
    is_active: true,
  },
]

const INITIAL_BARBERS: MockBarber[] = [
  {
    id: 'barber-1',
    name: 'Ahmad Fauzi',
    phone: '081234567891',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    description: 'Senior Barber (Pengalaman 7 tahun, Fade & Pompadour specialist)',
    is_active: true,
    is_archived: false,
    archived_at: null,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'barber-2',
    name: 'Rio Ferdinand',
    phone: '082198765432',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    description: 'Spesialis Korean Perm, Two-Block, dan Textured Crop',
    is_active: true,
    is_archived: false,
    archived_at: null,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'barber-3',
    name: 'Dimas Setiawan',
    phone: '085712344321',
    photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    description: 'Master Groomer, Ahli Hair Tattoo, Razor Shave & Beard Trim',
    is_active: true,
    is_archived: false,
    archived_at: null,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'barber-4',
    name: 'Gilang Ramadhan',
    phone: '087855667788',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    description: 'Colorist & Styling Specialist, Ahli Bleaching & Fashion Color',
    is_active: true,
    is_archived: false,
    archived_at: null,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'barber-5',
    name: 'Erik Susanto',
    phone: '081399887766',
    photo_url: null,
    description: 'Mantan kapster - Arsip mutasi cabang luar kota',
    is_active: false,
    is_archived: true,
    archived_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
]

const INITIAL_ASSIGNMENTS: MockAssignment[] = [
  { id: 'asg-1', barber_id: 'barber-1', branch_id: 'manislor', is_active: true },
  { id: 'asg-2', barber_id: 'barber-1', branch_id: 'jalaksana', is_active: true },
  { id: 'asg-3', barber_id: 'barber-2', branch_id: 'manislor', is_active: true },
  { id: 'asg-4', barber_id: 'barber-3', branch_id: 'jalaksana', is_active: true },
  { id: 'asg-5', barber_id: 'barber-3', branch_id: 'veteran', is_active: true },
  { id: 'asg-6', barber_id: 'barber-4', branch_id: 'veteran', is_active: true },
  { id: 'asg-7', barber_id: 'barber-5', branch_id: 'veteran', is_active: false },
]

function generateInitialBookings(): MockBooking[] {
  const now = new Date()
  const todayStr = (hours: number, mins: number) => {
    const d = new Date(now)
    d.setHours(hours, mins, 0, 0)
    return d.toISOString()
  }

  return [
    {
      id: 'book-1',
      booking_code: 'CB-MN-261115-01',
      customer_name: 'Aditya Pratama',
      customer_phone: '081234112233',
      customer_note: 'Mohon rapikan bagian samping dan kumis tipis.',
      branch_id: 'manislor',
      barber_id: 'barber-1',
      service_id: 'haircut',
      starts_at: todayStr(10, 30),
      status: 'completed',
      created_at: todayStr(8, 0),
    },
    {
      id: 'book-2',
      booking_code: 'CB-MN-261115-02',
      customer_name: 'Kevin Sanjaya',
      customer_phone: '085799881122',
      customer_note: 'Ingin model Korean Perm alami jangan terlalu keriting.',
      branch_id: 'manislor',
      barber_id: 'barber-2',
      service_id: 'perm',
      starts_at: todayStr(13, 0),
      status: 'confirmed',
      created_at: todayStr(9, 15),
    },
    {
      id: 'book-3',
      booking_code: 'CB-JL-261115-01',
      customer_name: 'Farhan Maulana',
      customer_phone: '081377665544',
      customer_note: null,
      branch_id: 'jalaksana',
      barber_id: 'barber-3',
      service_id: 'haircut',
      starts_at: todayStr(14, 30),
      status: 'confirmed',
      created_at: todayStr(10, 0),
    },
    {
      id: 'book-4',
      booking_code: 'CB-VT-261115-01',
      customer_name: 'Bambang Pamungkas',
      customer_phone: '082155443322',
      customer_note: 'Warna ash brown gelap natural.',
      branch_id: 'veteran',
      barber_id: 'barber-4',
      service_id: 'coloring',
      starts_at: todayStr(16, 0),
      status: 'pending',
      created_at: todayStr(11, 20),
    },
    {
      id: 'book-5',
      booking_code: 'CB-VT-261115-02',
      customer_name: 'Rian Ardianto',
      customer_phone: '089912345678',
      customer_note: null,
      branch_id: 'veteran',
      barber_id: 'barber-3',
      service_id: 'massage',
      starts_at: todayStr(18, 30),
      status: 'confirmed',
      created_at: todayStr(11, 45),
    },
  ]
}

// ==========================================
// LOCAL STORAGE STORE MANAGEMENT
// ==========================================

const STORAGE_KEY_BARBERS = 'cahaya_mock_barbers'
const STORAGE_KEY_ASSIGNMENTS = 'cahaya_mock_assignments'
const STORAGE_KEY_BOOKINGS = 'cahaya_mock_bookings'
const STORAGE_KEY_SESSION = 'cahaya_mock_session'

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaultValue
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error('Failed to save to localStorage:', err)
  }
}

// Inisialisasi awal jika belum ada
export function initializeMockStore(): void {
  if (!localStorage.getItem(STORAGE_KEY_BARBERS)) {
    setToStorage(STORAGE_KEY_BARBERS, INITIAL_BARBERS)
  }
  if (!localStorage.getItem(STORAGE_KEY_ASSIGNMENTS)) {
    setToStorage(STORAGE_KEY_ASSIGNMENTS, INITIAL_ASSIGNMENTS)
  }
  if (!localStorage.getItem(STORAGE_KEY_BOOKINGS)) {
    setToStorage(STORAGE_KEY_BOOKINGS, generateInitialBookings())
  }
}

// Jalankan inisialisasi
initializeMockStore()

// ==========================================
// MOCK REPOSITORY METHODS
// ==========================================

export const mockDb = {
  // BRANCHES
  getBranches(): MockBranch[] {
    return INITIAL_BRANCHES
  },

  // SERVICES
  getServices(): MockService[] {
    return INITIAL_SERVICES
  },

  // BARBERS
  getBarbers(): MockBarber[] {
    return getFromStorage<MockBarber[]>(STORAGE_KEY_BARBERS, INITIAL_BARBERS)
  },

  addBarber(payload: {
    name: string
    branch_id: string
    phone?: string | null
    photo_url?: string | null
    description?: string | null
  }): MockBarber {
    const barbers = this.getBarbers()
    const newBarber: MockBarber = {
      id: `barber-${Date.now()}`,
      name: payload.name.trim(),
      phone: payload.phone?.trim() || null,
      photo_url: payload.photo_url?.trim() || null,
      description: payload.description?.trim() || null,
      is_active: true,
      is_archived: false,
      archived_at: null,
      created_at: new Date().toISOString(),
    }

    const updatedBarbers = [...barbers, newBarber]
    setToStorage(STORAGE_KEY_BARBERS, updatedBarbers)

    // Tambah penempatan cabang awal
    this.addAssignment(newBarber.id, payload.branch_id)

    return newBarber
  },

  updateBarber(
    id: string,
    payload: {
      name: string
      phone?: string | null
      photo_url?: string | null
      description?: string | null
    }
  ): void {
    const barbers = this.getBarbers().map((b) => {
      if (b.id !== id) return b
      return {
        ...b,
        name: payload.name.trim(),
        phone: payload.phone?.trim() || null,
        photo_url: payload.photo_url?.trim() || null,
        description: payload.description?.trim() || null,
      }
    })
    setToStorage(STORAGE_KEY_BARBERS, barbers)
  },

  toggleBarberStatus(id: string): boolean {
    let nextStatus = false
    const barbers = this.getBarbers().map((b) => {
      if (b.id !== id) return b
      nextStatus = !b.is_active
      return { ...b, is_active: nextStatus }
    })
    setToStorage(STORAGE_KEY_BARBERS, barbers)
    return nextStatus
  },

  archiveBarber(id: string): void {
    const barbers = this.getBarbers().map((b) => {
      if (b.id !== id) return b
      return {
        ...b,
        is_active: false,
        is_archived: true,
        archived_at: new Date().toISOString(),
      }
    })
    setToStorage(STORAGE_KEY_BARBERS, barbers)

    // Nonaktifkan semua assignment cabangnya
    const assignments = this.getAssignments().map((a) => {
      if (a.barber_id !== id) return a
      return { ...a, is_active: false }
    })
    setToStorage(STORAGE_KEY_ASSIGNMENTS, assignments)
  },

  restoreBarber(id: string): void {
    const barbers = this.getBarbers().map((b) => {
      if (b.id !== id) return b
      return {
        ...b,
        is_active: true,
        is_archived: false,
        archived_at: null,
      }
    })
    setToStorage(STORAGE_KEY_BARBERS, barbers)
  },

  deleteBarberPermanently(id: string): void {
    const barbers = this.getBarbers().filter((b) => b.id !== id)
    setToStorage(STORAGE_KEY_BARBERS, barbers)

    const assignments = this.getAssignments().filter((a) => a.barber_id !== id)
    setToStorage(STORAGE_KEY_ASSIGNMENTS, assignments)
  },

  // ASSIGNMENTS
  getAssignments(): MockAssignment[] {
    return getFromStorage<MockAssignment[]>(
      STORAGE_KEY_ASSIGNMENTS,
      INITIAL_ASSIGNMENTS
    )
  },

  addAssignment(barberId: string, branchId: string): void {
    const assignments = this.getAssignments()
    const existing = assignments.find(
      (a) => a.barber_id === barberId && a.branch_id === branchId
    )

    if (existing) {
      if (!existing.is_active) {
        this.toggleAssignment(existing.id)
      }
      return
    }

    const newAssignment: MockAssignment = {
      id: `asg-${Date.now()}`,
      barber_id: barberId,
      branch_id: branchId,
      is_active: true,
    }
    setToStorage(STORAGE_KEY_ASSIGNMENTS, [...assignments, newAssignment])
  },

  toggleAssignment(assignmentId: string): void {
    const assignments = this.getAssignments().map((a) => {
      if (a.id !== assignmentId) return a
      return { ...a, is_active: !a.is_active }
    })
    setToStorage(STORAGE_KEY_ASSIGNMENTS, assignments)
  },

  // BOOKINGS
  getBookings(branchId?: string | null): MockBooking[] {
    const all = getFromStorage<MockBooking[]>(
      STORAGE_KEY_BOOKINGS,
      generateInitialBookings()
    )
    if (!branchId) return all
    return all.filter((b) => b.branch_id === branchId)
  },

  addCustomerBooking(payload: {
    customer_name: string
    customer_phone: string
    customer_note?: string | null
    branch_id: string
    barber_id: string
    service_id: string
    starts_at: string
  }): MockBooking {
    const bookings = this.getBookings()

    // 1. KODE CABANG (2 Digit)
    const branchCodeMap: Record<string, string> = {
      manislor: 'MN',
      jalaksana: 'JL',
      veteran: 'VT',
    }
    const branchCode = branchCodeMap[payload.branch_id.toLowerCase()] || 'CB'

    // 2. KODE TANGGAL YYMMDD (6 Digit)
    const bookingDate = new Date(payload.starts_at)
    const yy = String(bookingDate.getFullYear()).slice(-2)
    const mm = String(bookingDate.getMonth() + 1).padStart(2, '0')
    const dd = String(bookingDate.getDate()).padStart(2, '0')
    const dateCode = `${yy}${mm}${dd}`

    // 3. NOMOR URUT 2 DIGIT PER CABANG & TANGGAL
    const sameDayBranchBookings = bookings.filter((b) => {
      if (b.branch_id !== payload.branch_id) return false
      const bDate = new Date(b.starts_at)
      return (
        bDate.getFullYear() === bookingDate.getFullYear() &&
        bDate.getMonth() === bookingDate.getMonth() &&
        bDate.getDate() === bookingDate.getDate()
      )
    })
    const seq = String(sameDayBranchBookings.length + 1).padStart(2, '0')

    // FORMAT OPSI 1: Tepat 15 Karakter Permanen
    const customCode = `CB-${branchCode}-${dateCode}-${seq}`

    const newBooking: MockBooking = {
      id: `book-${Date.now()}`,
      booking_code: customCode,
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      customer_note: payload.customer_note?.trim() || null,
      branch_id: payload.branch_id,
      barber_id: payload.barber_id,
      service_id: payload.service_id,
      starts_at: payload.starts_at,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    setToStorage(STORAGE_KEY_BOOKINGS, [newBooking, ...bookings])
    return newBooking
  },

  updateBookingStatus(
    bookingId: string,
    nextStatus: MockBooking['status']
  ): void {
    const bookings = this.getBookings().map((b) => {
      if (b.id !== bookingId) return b
      return { ...b, status: nextStatus }
    })
    setToStorage(STORAGE_KEY_BOOKINGS, bookings)
  },

  // DASHBOARD STATS
  getDashboardStats(branchId?: string | null) {
    const bookings = this.getBookings(branchId)
    const barbers = this.getBarbers()
    const assignments = this.getAssignments()
    const services = this.getServices()

    let activeBarbersCount: number
    if (branchId) {
      const activeBarberIds = new Set(
        assignments
          .filter((a) => a.branch_id === branchId && a.is_active)
          .map((a) => a.barber_id)
      )
      activeBarbersCount = barbers.filter(
        (b) => activeBarberIds.has(b.id) && b.is_active && !b.is_archived
      ).length
    } else {
      activeBarbersCount = barbers.filter(
        (b) => b.is_active && !b.is_archived
      ).length
    }

    const completedBookings = bookings.filter((b) => b.status === 'completed')

    return {
      bookingCount: bookings.length,
      completedCount: completedBookings.length,
      barberCount: activeBarbersCount,
      serviceCount: services.filter((s) => s.is_active).length,
      recentBookings: bookings.slice(0, 5),
    }
  },

  // SESSION
  getCurrentUser(): MockUser | null {
    return getFromStorage<MockUser | null>(STORAGE_KEY_SESSION, null)
  },

  setCurrentUser(user: MockUser | null): void {
    setToStorage(STORAGE_KEY_SESSION, user)
  },
}
