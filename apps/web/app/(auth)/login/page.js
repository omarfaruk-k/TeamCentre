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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[var(--bg)]">
      <div className="w-full max-w-sm bg-[var(--bg2)] rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-[var(--text)] dark:text-[var(--text)]">Sign in</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[var(--border)] rounded-lg px-4 py-2 bg-transparent text-[var(--text)] dark:text-[var(--text)] outline-none"
            required
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[var(--border)] rounded-lg px-4 py-2 bg-transparent text-[var(--text)] dark:text-[var(--text)] outline-none"
            required
          />
          <button
            type="submit" disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-[var(--text)] rounded-lg py-2 font-medium transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-sm text-[var(--text2)] mt-4 text-center">
          No account? <Link href="/register" className="text-violet-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}