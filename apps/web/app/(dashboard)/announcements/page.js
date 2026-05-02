'use client'
import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '../../../stores/workspaceStore'
import { useAnnouncementStore } from '../../../stores/announcementStore'
import { useAuthStore } from '../../../stores/authStore'

const EMOJIS = ['👍', '❤️', '🎉', '🔥', '👀']

export default function AnnouncementsPage() {
  const { active: workspace, role } = useWorkspaceStore()
  const { announcements, fetchAnnouncements, createAnnouncement, togglePin, deleteAnnouncement, toggleReaction, addComment } = useAnnouncementStore()
  const { user } = useAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [commentInputs, setCommentInputs] = useState({})
  const accent = workspace?.accentColor || '#7C3AED'

  useEffect(() => {
    if (workspace) fetchAnnouncements(workspace.id)
  }, [workspace])

  const handleCreate = async (e) => {
    e.preventDefault()
    await createAnnouncement(workspace.id, form)
    setForm({ title: '', content: '' })
    setShowForm(false)
  }

  const handleComment = async (announcementId) => {
    const content = commentInputs[announcementId]
    if (!content?.trim()) return
    await addComment(workspace.id, announcementId, content)
    setCommentInputs((s) => ({ ...s, [announcementId]: '' }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        {role === 'ADMIN' && (
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: accent }}>
            + Post
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6 space-y-3">
          <input required placeholder="Title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent outline-none text-sm" />
          <textarea required placeholder="Write your announcement..." value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-transparent outline-none text-sm h-28 resize-none" />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm rounded-lg text-white" style={{ backgroundColor: accent }}>Post</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {announcements.length === 0 && (
          <div className="text-center text-slate-400 py-12">No announcements yet.</div>
        )}
        {announcements.map((a) => (
          <div key={a.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                {a.pinned && <span className="text-xs font-medium text-amber-500 mb-1 block">📌 Pinned</span>}
                <h2 className="font-semibold text-lg">{a.title}</h2>
                <p className="text-xs text-slate-400">{a.author?.name} · {new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
              {role === 'ADMIN' && (
                <div className="flex gap-2 text-xs">
                  <button onClick={() => togglePin(workspace.id, a.id)} className="text-slate-400 hover:text-amber-500">
                    {a.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button onClick={() => deleteAnnouncement(workspace.id, a.id)} className="text-slate-400 hover:text-red-500">Delete</button>
                </div>
              )}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 whitespace-pre-wrap">{a.content}</p>

            {/* Reactions */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {EMOJIS.map((emoji) => {
                const count = a.reactions?.filter((r) => r.emoji === emoji).length || 0
                return (
                  <button key={emoji} onClick={() => toggleReaction(workspace.id, a.id, emoji)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm border transition ${count > 0 ? 'border-violet-300 bg-violet-50 dark:bg-violet-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                    {emoji} {count > 0 && <span className="text-xs">{count}</span>}
                  </button>
                )
              })}
            </div>

            {/* Comments */}
            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-2">
              {a.comments?.map((c) => (
                <div key={c.id} className="text-sm">
                  <span className="font-medium">{c.user?.name}: </span>
                  <span className="text-slate-500">{c.content}</span>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input
                  placeholder="Add a comment..."
                  value={commentInputs[a.id] || ''}
                  onChange={(e) => setCommentInputs((s) => ({ ...s, [a.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleComment(a.id)}
                  className="flex-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-transparent outline-none"
                />
                <button onClick={() => handleComment(a.id)}
                  className="text-xs px-3 py-1.5 rounded-lg text-white"
                  style={{ backgroundColor: accent }}>
                  Send
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}