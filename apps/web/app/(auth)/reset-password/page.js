'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '../../../lib/api'
import Link from 'next/link'

function getPasswordStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

function ResetPasswordInner() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const resetToken = searchParams.get('token') || ''

  const strength = getPasswordStrength(password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'var(--danger)', 'var(--warning)', 'var(--info)', 'var(--success)'][strength]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, resetToken, newPassword: password })
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = ({ open }) => open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="absolute inset-0 dotted-bg opacity-60" />
      <div
        className="absolute bottom-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'var(--accent)', opacity: 0.06 }}
      />

      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg2)',
          border: '1px solid var(--border2)',
          boxShadow: '0 0 0 1px var(--border), 0 32px 64px rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="h-[2px] w-full"
          style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }}
        />

        <div className="p-8">

          <div className="flex flex-col items-center mb-8">
            <div className="mb-4 h-20 flex items-center justify-center">
              <picture>
                <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
                <img src="/logo-light.svg" alt="TeamCentre" className="h-16 w-auto object-contain" style={{ maxWidth: '240px' }} />
              </picture>
            </div>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--accent-20)', border: '1px solid var(--accent-10)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--accent)' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>

            <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text)' }}>
              Set new password
            </h2>
            <p className="text-xs text-center" style={{ color: 'var(--text2)' }}>
              Choose a strong password for your account
            </p>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-lg mb-5"
              style={{ backgroundColor: '#f8717115', border: '1px solid #f8717130', color: 'var(--danger)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {done ? (
            <div
              className="flex flex-col items-center gap-3 py-6 px-3 rounded-lg text-center"
              style={{ backgroundColor: '#4ade8015', border: '1px solid #4ade8030' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--success)' }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>Password reset!</p>
              <p className="text-xs" style={{ color: 'var(--text2)' }}>Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-1.5">
                <label className="text-xs font-medium tracking-wide" style={{ color: 'var(--text2)' }}>
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all pr-10"
                    style={{
                      backgroundColor: 'var(--bg3)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      caretColor: 'var(--accent)',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>

                {password.length > 0 && (
                  <div>
                    <div className="flex gap-1 mt-1.5">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ backgroundColor: level <= strength ? strengthColor : 'var(--bg4)' }}
                        />
                      ))}
                    </div>
                    <p className="text-xs mt-1" style={{ color: strengthColor }}>{strengthLabel}</p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium tracking-wide" style={{ color: 'var(--text2)' }}>
                  Confirm password
                </label>
                <input
                  type="password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--bg3)',
                    border: `1px solid ${confirm && confirm !== password ? 'var(--danger)' : 'var(--border)'}`,
                    color: 'var(--text)',
                    caretColor: 'var(--accent)',
                  }}
                  onFocus={e => e.target.style.borderColor = confirm !== password ? 'var(--danger)' : 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = confirm && confirm !== password ? 'var(--danger)' : 'var(--border)'}
                />
                {confirm && confirm !== password && (
                  <p className="text-xs" style={{ color: 'var(--danger)' }}>Passwords do not match</p>
                )}
                {confirm && confirm === password && (
                  <p className="text-xs" style={{ color: 'var(--success)' }}>✓ Passwords match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || password !== confirm || password.length < 8}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all relative overflow-hidden mt-2"
                style={{
                  backgroundColor: 'var(--accent)',
                  opacity: loading || password !== confirm || password.length < 8 ? 0.5 : 1,
                  boxShadow: !loading && password === confirm && password.length >= 8 ? '0 0 20px var(--accent-20)' : 'none',
                }}
              >
                <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                  Reset password
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                {loading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                  </span>
                )}
              </button>
            </form>
          )}

          <div className="text-center mt-6">
            <Link href="/login" className="text-xs hover:underline" style={{ color: 'var(--text3)' }}>
              ← Back to login
            </Link>
          </div>
        </div>

        <div
          className="px-8 py-3 text-center text-xs"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--text3)', backgroundColor: 'var(--bg)' }}
        >
          TeamCentre © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--accent)' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>
    }>
      <ResetPasswordInner />
    </Suspense>
  )
}