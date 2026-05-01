'use client'
import { useState } from 'react'
import { useWorkspaceStore } from '../../stores/workspaceStore'

const ACCENT_COLORS = [
  '#7C3AED', // violet
  '#2563EB', // blue
  '#059669', // emerald
  '#DC2626', // red
  '#D97706', // amber
  '#DB2777', // pink
  '#0891B2', // cyan
  '#4F46E5', // indigo
]

export default function WorkspaceSwitcher() {
  const { workspaces, active, setActive, createWorkspace } = useWorkspaceStore()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [pickedColor, setPickedColor] = useState('#7C3AED')
  const accent = active?.accentColor || '#7C3AED'

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const ws = await createWorkspace(name, pickedColor)
    setActive({ ...ws, role: 'ADMIN' })
    setName('')
    setPickedColor('#7C3AED')
    setCreating(false)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white hover:opacity-80"
      >
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
        {active?.name || 'Select workspace'}
        <span className="text-slate-400 text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute top-8 left-0 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 p-2">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => { setActive(ws); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ws.accentColor }} />
              {ws.name}
            </button>
          ))}

          {creating ? (
            <form onSubmit={handleCreate} className="mt-2 p-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <input
                autoFocus value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Workspace name"
                className="w-full text-sm px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-transparent outline-none"
              />
              <div>
                <p className="text-xs text-slate-400 mb-1">Accent color</p>
                <div className="flex flex-wrap gap-1.5">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setPickedColor(color)}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: color,
                        outline: pickedColor === color ? `2px solid ${color}` : 'none',
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="text-xs text-white px-3 py-1.5 rounded font-medium"
                  style={{ backgroundColor: pickedColor }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => { setCreating(false); setName(''); setPickedColor('#7C3AED') }}
                  className="text-xs text-slate-500 px-3 py-1.5 rounded hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full text-left px-3 py-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white border-t border-slate-200 dark:border-slate-700 mt-1"
            >
              + New workspace
            </button>
          )}
        </div>
      )}
    </div>
  )
}