'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../../lib/api'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      // Redirect to OTP page after short delay
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&mode=reset`)
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="absolute inset-0 dotted-bg opacity-60" />
      <div
        className="absolute top-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none"
        style={{ backgroundColor: 'var(--accent)', opacity: 0.07 }}
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

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4 h-20 flex items-center justify-center">
              <picture>
                <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
                <img src="/logo-light.svg" alt="TeamCentre" className="h-16 w-auto object-contain" style={{ maxWidth: '240px' }} />
              </picture>
            </div>

            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--accent-20)', border: '1px solid var(--accent-10)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--accent)' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>

            <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text)' }}>
              Forgot password?
            </h2>
            <p className="text-xs text-center" style={{ color: 'var(--text2)' }}>
              Enter your email and we'll send a reset code
            </p>
          </div>

          {/* Error */}
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

          {/* Success state */}
          {sent ? (
            <div
              className="flex flex-col items-center gap-3 py-4 px-3 rounded-lg text-center"
              style={{ backgroundColor: '#4ade8015', border: '1px solid #4ade8030' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--success)' }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>Code sent!</p>
              <p className="text-xs" style={{ color: 'var(--text2)' }}>Redirecting to verification...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium tracking-wide" style={{ color: 'var(--text2)' }}>
                  Email address
                </label>
                <input
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--accent)',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: loading ? 'none' : '0 0 20px var(--accent-20)',
                }}
              >
                <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                  Send reset code
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
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

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text3)' }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          </div>

          <p className="text-center text-sm" style={{ color: 'var(--text2)' }}>
            Remember it?{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
              Sign in
            </Link>
          </p>
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