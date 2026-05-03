'use client'
import { useState, useRef, useEffect } from 'react'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { ChevronDown, Settings2, Trash2 } from 'lucide-react'
import api from '../../lib/api'

const ACCENT_COLORS = [
  '#7C3AED', '#2563EB', '#059669', '#DC2626',
  '#D97706', '#DB2777', '#0891B2', '#4F46E5',
]

export default function WorkspaceSwitcher() {
  const { workspaces, active, setActive, createWorkspace, fetchWorkspaces } = useWorkspaceStore()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(0) // 0 = none, 1 = first confirm, 2 = second confirm
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [pickedColor, setPickedColor] = useState('#7C3AED')
  const accent = active?.accentColor || '#7C3AED'
  const isAdmin = active?.role === 'ADMIN'
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setCreating(false)
        setEditing(false)
        setDeleteConfirm(0)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const ws = await createWorkspace(name, pickedColor, description)
    setActive({ ...ws, role: 'ADMIN' })
    resetForm()
    setCreating(false)
    setOpen(false)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await api.patch(`/workspaces/${active.id}`, { name, accentColor: pickedColor, description })
    await fetchWorkspaces()
    setActive({ ...active, name, accentColor: pickedColor, description })
    setEditing(false)
  }

  const handleDelete = async () => {
    if (deleteConfirm === 0) { setDeleteConfirm(1); return }
    if (deleteConfirm === 1) { setDeleteConfirm(2); return }
    // deleteConfirm === 2 — actually delete
    await api.delete(`/workspaces/${active.id}`)
    await fetchWorkspaces()
    const remaining = workspaces.filter((w) => w.id !== active.id)
    setActive(remaining[0] || null)
    setDeleteConfirm(0)
    setOpen(false)
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setPickedColor('#7C3AED')
  }

  const openEdit = () => {
    setName(active?.name || '')
    setDescription(active?.description || '')
    setPickedColor(active?.accentColor || '#7C3AED')
    setCreating(false)
    setDeleteConfirm(0)
    setEditing(true)
  }

  const ColorPicker = ({ value, onChange }) => (
    <div>
      <p className="text-xs text-[var(--text2)] mb-1.5">Accent color</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {ACCENT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className="w-6 h-6 rounded-full transition-transform hover:scale-110"
            style={{
              backgroundColor: color,
              outline: value === color ? `2px solid ${color}` : 'none',
              outlineOffset: 2,
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
          title="Custom color"
        />
        <span className="text-xs text-[var(--text3)]">or pick custom</span>
        <span className="text-xs font-mono text-[var(--text2)]">{value}</span>
      </div>
    </div>
  )

  return (
    <div className="relative ml-2" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
        style={{
          border: `1.5px solid ${accent}`,
          color: 'var(--text)',
          backgroundColor: `${accent}15`,
        }}
      >
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
        <span className="max-w-[350px] truncate">{active?.name || 'Select workspace'}</span>
        <ChevronDown size={13} style={{ color: accent }} />
      </button>

      {open && (
        <div className="absolute top-10 left-0 w-64 bg-[var(--bg2)] border border-[var(--border)] rounded-xl shadow-lg z-50 p-2">

          {/* Workspace list */}
          {!editing && !creating && workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => { setActive(ws); setOpen(false); setDeleteConfirm(0) }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg3)] text-left transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ws.accentColor }} />
              <div className="min-w-0 flex-1">
                <p className="text-[var(--text)] truncate">{ws.name}</p>
                {ws.description && (
                  <p className="text-xs text-[var(--text3)] truncate">{ws.description}</p>
                )}
              </div>
            </button>
          ))}

          {/* Admin actions for active workspace */}
          {!editing && !creating && isAdmin && active && (
            <div className="border-t border-[var(--border)] mt-1 pt-1 space-y-0.5">

              {/* Edit button */}
              <button
                onClick={openEdit}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg3)] text-left transition-colors"
                style={{ color: 'var(--text2)' }}
              >
                <Settings2 size={13} />
                Edit workspace
              </button>

              {/* Delete with double confirm */}
              {deleteConfirm === 0 && (
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-red-400/10 text-left transition-colors text-red-400"
                >
                  <Trash2 size={13} />
                  Delete workspace
                </button>
              )}
              {deleteConfirm === 1 && (
                <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: '#f8717110', border: '1px solid #f8717130' }}>
                  <p className="text-xs text-red-400 mb-2">Are you sure? This cannot be undone.</p>
                  <div className="flex gap-2">
                    <button onClick={handleDelete} className="text-xs text-white px-2.5 py-1 rounded-lg bg-red-500 font-medium">
                      Yes, delete
                    </button>
                    <button onClick={() => setDeleteConfirm(0)} className="text-xs px-2.5 py-1 rounded-lg transition-colors" style={{ color: 'var(--text2)' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {deleteConfirm === 2 && (
                <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: '#f8717110', border: '1px solid #f8717130' }}>
                  <p className="text-xs text-red-400 mb-2 font-medium">Last chance — really delete "{active.name}"?</p>
                  <div className="flex gap-2">
                    <button onClick={handleDelete} className="text-xs text-white px-2.5 py-1 rounded-lg bg-red-500 font-medium">
                      Delete forever
                    </button>
                    <button onClick={() => setDeleteConfirm(0)} className="text-xs px-2.5 py-1 rounded-lg transition-colors" style={{ color: 'var(--text2)' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edit form */}
          {editing && (
            <form onSubmit={handleEdit} className="p-2 space-y-2">
              <p className="text-xs font-semibold px-1" style={{ color: 'var(--text2)' }}>Edit workspace</p>
              <input
                autoFocus value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Workspace name"
                className="w-full text-sm px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg3)] text-[var(--text)] outline-none"
              />
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full text-sm px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg3)] text-[var(--text)] outline-none resize-none"
              />
              <ColorPicker value={pickedColor} onChange={setPickedColor} />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="text-xs text-white px-3 py-1.5 rounded-lg font-medium"
                  style={{ backgroundColor: pickedColor }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); resetForm() }}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--text2)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Create form */}
          {creating && (
            <form onSubmit={handleCreate} className="mt-2 p-2 border-t border-[var(--border)] space-y-2">
              <p className="text-xs font-semibold px-1" style={{ color: 'var(--text2)' }}>New workspace</p>
              <input
                autoFocus value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Workspace name"
                className="w-full text-sm px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg3)] text-[var(--text)] outline-none"
              />
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full text-sm px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg3)] text-[var(--text)] outline-none resize-none"
              />
              <ColorPicker value={pickedColor} onChange={setPickedColor} />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="text-xs text-white px-3 py-1.5 rounded-lg font-medium"
                  style={{ backgroundColor: pickedColor }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => { setCreating(false); resetForm() }}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--text2)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* New workspace button */}
          {!creating && !editing && (
            <button
              onClick={() => { setCreating(true); setDeleteConfirm(0) }}
              className="w-full text-left px-3 py-2 text-sm text-[var(--text2)] hover:text-[var(--text)] border-t border-[var(--border)] mt-1 transition-colors"
            >
              + New workspace
            </button>
          )}
        </div>
      )}
    </div>
  )
}