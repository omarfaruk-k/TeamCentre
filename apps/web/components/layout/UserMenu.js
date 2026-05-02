'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../stores/authStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { Image, Pencil, Sun, Moon, LogOut } from 'lucide-react'
import api from '../../lib/api'
import { ChevronRight } from 'lucide-react'

export default function UserMenu() {
  const { user, logout } = useAuthStore()
  const { active } = useWorkspaceStore()
  const [open, setOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const menuRef = useRef(null)
  const fileRef = useRef(null)
  const router = useRouter()
  const accent = active?.accentColor || '#7C3AED'

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

useEffect(() => {
  const isLight = document.documentElement.classList.contains('light')
  setDarkMode(!isLight)
}, [])

  const toggleDark = () => {
    document.documentElement.classList.toggle('light')
    setDarkMode((d) => !d)
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const res = await api.post('/auth/avatar', { imageBase64: ev.target.result })
        useAuthStore.setState((s) => ({ user: { ...s.user, avatarUrl: res.data.avatarUrl } }))
      } catch {
        alert('Upload failed')
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleNameSave = async () => {
    if (!newName.trim()) return
    try {
      const res = await api.patch('/auth/me', { name: newName })
      useAuthStore.setState((s) => ({ user: { ...s.user, name: res.data.name } }))
      setEditingName(false)
    } catch {
      alert('Failed to update name')
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const Avatar = ({ px = 40 }) => (
    user?.avatarUrl ? (
      <img
        src={user.avatarUrl}
        alt={user.name}
        style={{ width: px, height: px }}
        className="rounded-full object-cover"
      />
    ) : (
      <div
        style={{ width: px, height: px, backgroundColor: accent }}
        className="rounded-full text-[var(--text)] flex items-center justify-center font-bold text-sm"
      >
        {user?.name?.[0]?.toUpperCase()}
      </div>
    )
  )

  return (
    <div ref={menuRef} className="relative">

      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
      >
        <Avatar px={32} />
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-[var(--text)] dark:text-[var(--text)] truncate">{user?.name}</p>
          <p className="text-xs text-[var(--text2)] truncate">{user?.email}</p>
        </div>
        <ChevronRight size={14} />
      </button>

      {/* Popup card */}
      {open && (
        <div className="absolute bottom-14 left-0 w-72 bg-[var(--bg2)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">

          {/* Centered profile header */}
          <div className="pt-6 pb-4 px-4 border-b border-slate-100 dark:border-[var(--border)] flex flex-col items-center gap-3">

            {/* Avatar */}
            <button onClick={() => fileRef.current?.click()} className="relative group shrink-0">
              <Avatar px={90} />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <span className="text-[var(--text)] text-xs">{uploading ? '...' : '📷'}</span>
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

            {/* Name */}
            <div className="flex flex-col items-center gap-2">
              {editingName ? (
                <div className="flex gap-1 justify-center">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                    className="flex-1 text-sm border border-[var(--border)] rounded px-2 py-0.5 bg-transparent outline-none text-center"
                  />
                  <button
                    onClick={handleNameSave}
                    className="text-xs px-2 py-0.5 rounded text-[var(--text)]"
                    style={{ backgroundColor: accent }}
                  >✓</button>
                </div>
              ) : (
                <p className="text-sm font-semibold text-[var(--text)] dark:text-[var(--text)]">{user?.name}</p>
              )}

              {/* Email pill */}
              <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-0.5 rounded-full">
                {user?.email}
              </span>
            </div>
          </div>

          {/* Menu rows */}
          <div className="p-2">

            {/* Change avatar */}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg3)] dark:hover:bg-[var(--bg3)] text-left"
            >
              <Image size={15} className="text-[var(--text2)] shrink-0" />
              <span className="text-sm text-[var(--text2)] dark:text-[var(--text)]">
                {uploading ? 'Uploading...' : 'Change avatar'}
              </span>
            </button>

            {/* Edit name */}
            <button
              onClick={() => { setNewName(user?.name); setEditingName(true) }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg3)] dark:hover:bg-[var(--bg3)] text-left"
            >
              <Pencil size={15} className="text-[var(--text2)] shrink-0" />
              <span className="text-sm text-[var(--text2)] dark:text-[var(--text)]">Edit name</span>
            </button>

            {/* Dark mode toggle */}
            <div onClick={toggleDark} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--bg3)] dark:hover:bg-[var(--bg3)] cursor-pointer">
              <div className="flex items-center gap-3">
                {darkMode
                  ? <Moon size={15} className="text-[var(--text2)] shrink-0" />
                  : <Sun size={15} className="text-[var(--text2)] shrink-0" />
                }
                <span className="text-sm text-[var(--text2)] dark:text-[var(--text)]">
                  {darkMode ? 'Dark mode' : 'Light mode'}
                </span>
              </div>
              <button
                
                className="w-10 h-5 rounded-full transition-colors relative"
                style={{ backgroundColor: darkMode ? accent : '#CBD5E1' }}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-[20px]' : 'translate-x-0'}`}
                />
              </button>
            </div>

            <div className="border-t border-slate-100 dark:border-[var(--border)] my-1" />

            {/* Sign out */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
            >
              <LogOut size={15} className="text-red-500 shrink-0" />
              <span className="text-sm text-red-500">Sign out</span>
            </button>

          </div>
        </div>
      )}
    </div>
  )
}