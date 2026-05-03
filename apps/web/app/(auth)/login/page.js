'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../../stores/authStore'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const login = useAuthStore((s) => s.login)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Dotted background */}
      <div className="absolute inset-0 dotted-bg opacity-60" />

      {/* Glow orbs */}
      <div
        className="absolute top-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none"
        style={{ backgroundColor: 'var(--accent)', opacity: 0.07 }}
      />
      <div
        className="absolute bottom-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: 'var(--accent)', opacity: 0.05 }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg2)',
          border: '1px solid var(--border2)',
          boxShadow: '0 0 0 1px var(--border), 0 32px 64px rgba(0,0,0,0.4)',
        }}
      >
        {/* Top accent line */}
        <div
          className="h-[2px] w-full"
          style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }}
        />

        <div className="p-8">

          {/* Logo + brand */}
          <div className="flex flex-col items-center mb-8">
            {/* Logo — switches based on color scheme */}
            <div className="mb-4 h-20 w-auto flex items-center justify-center">
              <picture>
                <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
                <img
                  src="/logo-light.svg"
                  alt="TeamCentre"
                  className="h-16 w-auto object-contain"
                  style={{ maxWidth: '240px' }}
                />
              </picture>
            </div>
            <p
              className="text-xs tracking-[0.18em] uppercase font-semibold mt-1"
              style={{ color: 'var(--text3)' }}
            >
              Sign in to your workspace
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-lg mb-5"
              style={{
                backgroundColor: '#f8717115',
                border: '1px solid #f8717130',
                color: 'var(--danger)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium tracking-wide"
                style={{ color: 'var(--text2)' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  caretColor: 'var(--accent)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium tracking-wide"
                  style={{ color: 'var(--text2)' }}
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs transition-colors hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text3)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text2)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                >
                  {showPassword ? (
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
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all mt-2 relative overflow-hidden"
              style={{
                backgroundColor: 'var(--accent)',
                opacity: loading ? 0.7 : 1,
                boxShadow: loading ? 'none' : '0 0 20px var(--accent-20)',
              }}
            >
              <span className={`flex items-center justify-center gap-2 transition-opacity ${loading ? 'opacity-0' : 'opacity-100'}`}>
                Sign in
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text3)' }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          </div>

          {/* Register link */}
          <p className="text-center text-sm" style={{ color: 'var(--text2)' }}>
            Don't have an account?{' '}
            <Link
              href="/register"
              className="font-semibold transition-colors hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Bottom subtle footer */}
        <div
          className="px-8 py-3 text-center text-xs"
          style={{
            borderTop: '1px solid var(--border)',
            color: 'var(--text3)',
            backgroundColor: 'var(--bg)',
          }}
        >
          TeamCentre © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}