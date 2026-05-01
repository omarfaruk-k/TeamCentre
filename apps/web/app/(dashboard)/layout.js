'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../stores/authStore'

export default function DashboardLayout({ children }) {
  const { user, loading, fetchMe } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    fetchMe()
  }, [])

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>
  if (!user) return null

  return <div>{children}</div>
}