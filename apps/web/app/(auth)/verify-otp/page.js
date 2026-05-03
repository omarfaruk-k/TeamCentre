'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '../../../lib/api'
import Link from 'next/link'

function VerifyOtpInner() {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputs = useRef([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const focusInput = (index) => {
    inputs.current[index]?.focus()
  }

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setError('')

    if (digit && index < 5) {
      focusInput(index + 1)
    }

    if (digit && index === 5) {
      const code = [...next].join('')
      if (code.length === 6) handleVerify(code)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]
        next[index] = ''
        setDigits(next)
      } else if (index > 0) {
        focusInput(index - 1)
        const next = [...digits]
        next[index - 1] = ''
        setDigits(next)
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) focusInput(index - 1)
    if (e.key === 'ArrowRight' && index < 5) focusInput(index + 1)
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = ['', '', '', '', '', '']
    pasted.split('').forEach((d, i) => { next[i] = d })
    setDigits(next)
    focusInput(Math.min(pasted.length, 5))
    if (pasted.length === 6) handleVerify(pasted)
  }

  const handleVerify = async (code) => {
    if (loading) return
    const otp = code || digits.join('')
    if (otp.length !== 6) { setError('Please enter all 6 digits'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/verify-otp', { email, otp })
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired code')
      setDigits(['', '', '', '', '', ''])
      setTimeout(() => focusInput(0), 50)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    try {
      await api.post('/auth/resend-otp', { email })
      setResent(true)
      setCountdown(60)
      setDigits(['', '', '', '', '', ''])
      focusInput(0)
      setTimeout(() => setResent(false), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend')
    } finally {
      setResending(false)
    }
  }

  const filledCount = digits.filter(Boolean).length

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="absolute inset-0 dotted-bg opacity-60" />

      <div
        className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[140px] pointer-events-none"
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

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--accent-20)', border: '1px solid var(--accent-10)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--accent)' }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>

            <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text)' }}>
              Check your email
            </h2>
            <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--text2)' }}>
              We sent a 6-digit code to
            </p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--accent)' }}>
              {email}
            </p>
          </div>

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

          {resent && (
            <div
              className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-lg mb-5"
              style={{
                backgroundColor: '#4ade8015',
                border: '1px solid #4ade8030',
                color: 'var(--success)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              New code sent to your email
            </div>
          )}

          <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={el => inputs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onFocus={e => e.target.select()}
                className="w-11 h-13 text-center text-lg font-bold rounded-xl outline-none transition-all"
                style={{
                  width: '44px',
                  height: '52px',
                  backgroundColor: digit ? 'var(--accent-10)' : 'var(--bg3)',
                  border: `1.5px solid ${digit ? 'var(--accent)' : 'var(--border)'}`,
                  color: digit ? 'var(--accent)' : 'var(--text)',
                  fontSize: '20px',
                  caretColor: 'var(--accent)',
                }}
              />
            ))}
          </div>

          <div className="flex justify-center gap-1.5 mb-6">
            {digits.map((d, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-200"
                style={{
                  width: d ? '20px' : '6px',
                  height: '4px',
                  backgroundColor: d ? 'var(--accent)' : 'var(--bg4)',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={loading || filledCount < 6}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all relative overflow-hidden"
            style={{
              backgroundColor: 'var(--accent)',
              opacity: loading || filledCount < 6 ? 0.5 : 1,
              boxShadow: filledCount === 6 && !loading ? '0 0 20px var(--accent-20)' : 'none',
            }}
          >
            <span className={`flex items-center justify-center gap-2 transition-opacity ${loading ? 'opacity-0' : 'opacity-100'}`}>
              Verify email
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

          <div className="text-center mt-5">
            {countdown > 0 ? (
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                Resend code in{' '}
                <span style={{ color: 'var(--text2)', fontVariantNumeric: 'tabular-nums' }}>
                  {countdown}s
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-xs font-medium transition-colors hover:underline disabled:opacity-50"
                style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </div>

          <p className="text-center text-xs mt-4" style={{ color: 'var(--text3)' }}>
            Wrong email?{' '}
            <Link href="/register" className="hover:underline" style={{ color: 'var(--text2)' }}>
              Go back
            </Link>
          </p>
        </div>

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

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--accent)' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>
    }>
      <VerifyOtpInner />
    </Suspense>
  )
}