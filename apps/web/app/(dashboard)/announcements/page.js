'use client'
import { useEffect, useState, useRef } from 'react'
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
  const commentRefs = useRef({})

  useEffect(() => {
    if (workspace) fetchAnnouncements(workspace.id)
  }, [workspace])

  useEffect(() => {
    announcements.forEach((a) => {
      const el = commentRefs.current[a.id]
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [announcements])

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

  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return (
    <div className="flex flex-col h-full">

      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-[var(--text)]">Announcements</h1>
        {role === 'ADMIN' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: accent }}>
            + Post
          </button>
        )}
      </div>

      {/* Post form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] p-4 mb-5 space-y-3">
          <input
            required placeholder="Title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg3)] text-[var(--text)] outline-none text-sm placeholder:text-[var(--text3)]" />
          <textarea
            required placeholder="Write your announcement..." value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg3)] text-[var(--text)] outline-none text-sm h-28 resize-none placeholder:text-[var(--text3)]" />
          <div className="flex gap-2 justify-end">
            <button
              type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text2)] hover:bg-[var(--bg3)] transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: accent }}>
              Post
            </button>
          </div>
        </form>
      )}

      {/* Announcements list */}
      <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1">

        {sorted.length === 0 && (
          <div className="text-center text-[var(--text2)] py-16">No announcements yet.</div>
        )}

        {sorted.map((a) => (
          <div
            key={a.id}
            className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] overflow-hidden"
            style={{ minHeight: '220px' }}
          >
            {/*
              The key insight: this inner div must be h-full so both columns
              stretch to the full card height. The card height is determined
              by whichever column is taller (content or comments).
            */}
            <div style={{ display: 'flex', minHeight: '220px' }}>

              {/* ── LEFT 70% ── header + content + spacer + reactions at bottom */}
              <div style={{ width: '70%', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '20px' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    {a.pinned && (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#f59e0b', display: 'block', marginBottom: '4px' }}>📌 Pinned</span>
                    )}
                    <h2 style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)', margin: 0 }}>{a.title}</h2>
                    <p style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '2px' }}>
                      {a.author?.name} · {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {role === 'ADMIN' && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => togglePin(workspace.id, a.id)}
                        style={{ fontSize: '11px', color: 'var(--text2)', padding: '4px 8px', borderRadius: '6px', background: 'none', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => e.target.style.color = '#f59e0b'}
                        onMouseLeave={e => e.target.style.color = 'var(--text2)'}>
                        {a.pinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(workspace.id, a.id)}
                        style={{ fontSize: '11px', color: 'var(--text2)', padding: '4px 8px', borderRadius: '6px', background: 'none', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => e.target.style.color = '#ef4444'}
                        onMouseLeave={e => e.target.style.color = 'var(--text2)'}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <p style={{ fontSize: '13px', color: 'var(--text2)', whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0 }}>
                  {a.content}
                </p>

                {/* Spacer pushes reactions to bottom */}
                <div style={{ flex: 1 }} />

                {/* Reactions — pinned to bottom */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
                  {EMOJIS.map((emoji) => {
                    const count = a.reactions?.filter((r) => r.emoji === emoji).length || 0
                    const reacted = a.reactions?.some((r) => r.emoji === emoji && r.userId === user?.id)
                    return (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(workspace.id, a.id, emoji)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '4px 10px', borderRadius: '999px', fontSize: '13px',
                          border: `1px solid ${reacted ? accent : 'var(--border)'}`,
                          backgroundColor: reacted ? `${accent}20` : 'transparent',
                          color: reacted ? accent : 'var(--text2)',
                          cursor: 'pointer', transition: 'transform 0.1s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                        {emoji}
                        {count > 0 && <span style={{ fontSize: '11px', fontWeight: 600 }}>{count}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── RIGHT 30% ── comments header + scrollable list + input at bottom */}
              <div style={{ width: '30%', display: 'flex', flexDirection: 'column' }}>

                {/* Comments header */}
                <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comments</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '999px', backgroundColor: `${accent}20`, color: accent }}>
                    {a.comments?.length || 0}
                  </span>
                </div>

                {/* Scrollable comments — flex-1 so input stays at bottom */}
                <div
                  ref={(el) => (commentRefs.current[a.id] = el)}
                  style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(!a.comments || a.comments.length === 0) && (
                    <p style={{ fontSize: '11px', color: 'var(--text3)', textAlign: 'center', marginTop: '16px' }}>No comments yet.</p>
                  )}
                  {a.comments?.map((c) => (
                    <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%', backgroundColor: accent,
                          color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontWeight: 700, flexShrink: 0
                        }}>
                          {c.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)' }}>{c.user?.name}</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text2)', marginLeft: '28px', lineHeight: '1.5', margin: '2px 0 0 28px' }}>{c.content}</p>
                    </div>
                  ))}
                </div>

                {/* Comment input — always at bottom */}
                <div style={{ padding: '8px 12px', flexShrink: 0, display: 'flex', gap: '8px' }}>
                  <input
                    placeholder="Comment..."
                    value={commentInputs[a.id] || ''}
                    onChange={(e) => setCommentInputs((s) => ({ ...s, [a.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment(a.id)}
                    style={{
                      flex: 1, fontSize: '11px', border: '1px solid var(--border)', borderRadius: '8px',
                      padding: '6px 10px', backgroundColor: 'var(--bg3)', color: 'var(--text)', outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => handleComment(a.id)}
                    style={{
                      fontSize: '11px', padding: '6px 12px', borderRadius: '8px',
                      backgroundColor: accent, color: 'white', border: 'none', cursor: 'pointer', flexShrink: 0
                    }}>
                    Send
                  </button>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}