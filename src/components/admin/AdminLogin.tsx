import './AdminLogin.css'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from './AdminAuth'

export default function AdminLogin() {
  const { signIn, user, profile, loading } = useAdminAuth()

  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname

  // ==========================================
  // REDIRECT AFTER PROFILE IS LOADED
  // ==========================================

  useEffect(() => {
    if (!user || loading || !profile?.is_active) return

    const destination =
      from?.startsWith('/admin/') && from !== '/admin/login'
        ? from
        : '/admin/dashboard'

    navigate(destination, { replace: true })
  }, [user, profile, loading, from, navigate])

  // ==========================================
  // SIGN IN
  // ==========================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')
    setSubmitting(true)

    try {
      await signIn(email.trim(), password)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login gagal. Silakan coba kembali.'
      )

      setSubmitting(false)
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (user && (loading || submitting)) {
    return (
      <div className="admin-auth-loading">
        <div className="admin-loader" />
        <p>Memeriksa akses akun...</p>
      </div>
    )
  }

  // ==========================================
  // ACCESS DENIED
  // ==========================================

  if (user && !loading && !profile) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <h2>Akses Tidak Diizinkan</h2>
          <p>
            Akun ini tidak memiliki izin untuk mengakses
            administrasi Cahaya Barber.
          </p>

          <button
            type="button"
            onClick={() => navigate('/')}
          >
            Kembali ke Website
          </button>
        </div>
      </div>
    )
  }

  // ==========================================
  // LOGIN PAGE
  // ==========================================

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">

        <div className="admin-login-brand">
          <span>CAHAYA</span>
          <small>BARBER SHOP</small>
        </div>

        <div className="admin-login-heading">
          <span className="admin-login-eyebrow">
            MANAGEMENT PORTAL
          </span>

          <h1>Welcome Back</h1>

          <p>
            Masuk untuk mengelola operasional Cahaya Barber.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-email">
            Email Address
          </label>

          <input
            id="admin-email"
            type="email"
            placeholder="Masukkan email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
            disabled={submitting}
          />

          <label htmlFor="admin-password">
            Password
          </label>

          <div className="admin-password-wrapper">
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Masukkan password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              disabled={submitting}
            />

            <button
              type="button"
              className="admin-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword
                  ? 'Sembunyikan password'
                  : 'Tampilkan password'
              }
            >
              {showPassword ? 'SEMBUNYIKAN' : 'LIHAT'}
            </button>
          </div>

          {error && (
            <div className="admin-login-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-submit"
            disabled={submitting}
          >
            {submitting ? 'MEMERIKSA...' : 'SIGN IN'}
          </button>
        </form>

        <div className="admin-login-footer">
          CAHAYA BARBER · ADMINISTRATION
        </div>

      </div>
    </main>
  )
}
