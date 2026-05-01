'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../../lib/api'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register', form)
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Create account</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text" placeholder="Full name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 bg-transparent text-slate-900 dark:text-white outline-none"
            required
          />
          <input
            type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 bg-transparent text-slate-900 dark:text-white outline-none"
            required
          />
          <input
            type="password" placeholder="Password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 bg-transparent text-slate-900 dark:text-white outline-none"
            required
          />
          <button
            type="submit" disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 font-medium transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p className="text-sm text-slate-500 mt-4 text-center">
          Have an account? <Link href="/login" className="text-violet-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}