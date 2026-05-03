'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../stores/authStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { Image, Pencil, Sun, Moon, LogOut, Mail, ChevronRight, Check } from 'lucide-react'
import api from '../../lib/api'

export default function UserMenu() {
  const { user, logout } = useAuthStore()
  const { active } = useWorkspaceStore()
  const [open, setOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const menuRef = useRef(null)
  const fileRef = useRef(null)
  const router = useRouter()
  const accent = active?.accentColor || '#7C3AED'

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
        setEditingName(false)
        setEditingEmail(false)
      }
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
  localStorage.setItem('themeOverride', 'true')
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

  const handleEmailSave = async () => {
    if (!newEmail.trim()) return
    setEmailError('')
    try {
      const res = await api.patch('/auth/me', { email: newEmail })
      useAuthStore.setState((s) => ({ user: { ...s.user, email: res.data.email } }))
      setEditingEmail(false)
    } catch (err) {
      setEmailError(err.response?.data?.error || 'Failed to update email')
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const Avatar = ({ px = 40 }) => (
    user?.avatarUrl ? (
      <img src={user.avatarUrl} alt={user.name}
        style={{ width: px, height: px }}
        className="rounded-full object-cover" />
    ) : (
      <div
        style={{ width: px, height: px, backgroundColor: accent }}
        className="rounded-full text-white flex items-center justify-center font-bold text-sm">
        {user?.name?.[0]?.toUpperCase()}
      </div>
    )
  )

  return (
    <div ref={menuRef} className="relative">

      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[var(--bg3)] transition-colors">
        <Avatar px={32} />
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-[var(--text)] truncate">{user?.name}</p>
          <p className="text-xs text-[var(--text3)] truncate">{user?.email}</p>
        </div>
        <ChevronRight size={14} className="text-[var(--text3)]" />
      </button>

      {/* Popup */}
      {open && (
        <div className="absolute bottom-14 left-0 w-72 bg-[var(--bg2)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden">

          {/* Profile header */}
          <div className="pt-6 pb-5 px-4 border-b border-[var(--border)] flex flex-col items-center gap-3"
            style={{ background: `linear-gradient(160deg, ${accent}10 0%, transparent 60%)` }}>

            {/* Avatar with upload overlay */}
            <button onClick={() => fileRef.current?.click()} className="relative group shrink-0">
              <Avatar px={72} />
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Image size={18} className="text-white" />
              </div>
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xs">...</span>
                </div>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

            {/* Name */}
            {editingName ? (
              <div className="flex gap-1.5 w-full justify-center">
                <input
                  autoFocus value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleNameSave(); if (e.key === 'Escape') setEditingName(false) }}
                  className="flex-1 text-sm border border-[var(--border)] rounded-lg px-2 py-1 bg-[var(--bg3)] text-[var(--text)] outline-none text-center max-w-[160px]"
                />
                <button onClick={handleNameSave}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: accent }}>
                  <Check size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setNewName(user?.name); setEditingName(true) }}
                className="flex items-center gap-1.5 group">
                <p className="text-sm font-semibold text-[var(--text)]">{user?.name}</p>
                <Pencil size={11} className="text-[var(--text3)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            {/* Email */}
            {editingEmail ? (
              <div className="flex flex-col gap-1 w-full items-center">
                <div className="flex gap-1.5 justify-center">
                  <input
                    autoFocus value={newEmail}
                    onChange={(e) => { setNewEmail(e.target.value); setEmailError('') }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleEmailSave(); if (e.key === 'Escape') setEditingEmail(false) }}
                    className="flex-1 text-xs border border-[var(--border)] rounded-lg px-2 py-1 bg-[var(--bg3)] text-[var(--text)] outline-none text-center max-w-[160px]"
                    placeholder="new@email.com"
                  />
                  <button onClick={handleEmailSave}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: accent }}>
                    <Check size={13} />
                  </button>
                </div>
                {emailError && <p className="text-xs text-red-400">{emailError}</p>}
              </div>
            ) : (
              <button
                onClick={() => { setNewEmail(user?.email); setEditingEmail(true) }}
                className="flex items-center gap-1.5 group">
                <span className="text-xs px-3 py-0.5 rounded-full"
                  style={{ backgroundColor: `${accent}20`, color: accent }}>
                  {user?.email}
                </span>
                <Pencil size={10} className="text-[var(--text3)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          {/* Menu rows */}
          <div className="p-2">

            {/* Change avatar */}
            <button onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg3)] text-left transition-colors">
              <Image size={14} className="text-[var(--text3)] shrink-0" />
              <span className="text-sm text-[var(--text2)]">
                {uploading ? 'Uploading...' : 'Change avatar'}
              </span>
            </button>

            {/* Edit name */}
            <button onClick={() => { setNewName(user?.name); setEditingName(true); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg3)] text-left transition-colors">
              <Pencil size={14} className="text-[var(--text3)] shrink-0" />
              <span className="text-sm text-[var(--text2)]">Edit name</span>
            </button>

            {/* Edit email */}
            <button onClick={() => { setNewEmail(user?.email); setEditingEmail(true) }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg3)] text-left transition-colors">
              <Mail size={14} className="text-[var(--text3)] shrink-0" />
              <span className="text-sm text-[var(--text2)]">Change email</span>
            </button>

            {/* Dark mode toggle */}
            <div onClick={toggleDark}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--bg3)] cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                {darkMode
                  ? <Moon size={14} className="text-[var(--text3)] shrink-0" />
                  : <Sun size={14} className="text-[var(--text3)] shrink-0" />
                }
                <span className="text-sm text-[var(--text2)]">
                  {darkMode ? 'Dark mode' : 'Light mode'}
                </span>
              </div>
              <div className="w-9 h-5 rounded-full transition-colors relative pointer-events-none"
                style={{ backgroundColor: darkMode ? accent : '#CBD5E1' }}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-[16px]' : 'translate-x-0'}`} />
              </div>
            </div>

            <div className="border-t border-[var(--border)] my-1" />

            {/* Sign out */}
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-400/10 text-left transition-colors">
              <LogOut size={14} className="text-red-400 shrink-0" />
              <span className="text-sm text-red-400">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}