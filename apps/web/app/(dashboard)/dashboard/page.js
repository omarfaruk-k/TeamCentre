'use client'
import { useAuthStore } from '../../../stores/authStore'

export default function DashboardPage() {
  const { user, logout } = useAuthStore()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <button onClick={logout} className="mt-4 text-sm text-red-500 hover:underline">Logout</button>
    </div>
  )
}