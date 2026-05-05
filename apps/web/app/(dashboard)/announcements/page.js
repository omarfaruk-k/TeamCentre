'use client'
import { useEffect, useState, useRef } from 'react'
import { useWorkspaceStore } from '../../../stores/workspaceStore'
import { useAnnouncementStore } from '../../../stores/announcementStore'
import { useAuthStore } from '../../../stores/authStore'
import { useSearchParams } from 'next/navigation'

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
  const [expandedComments, setExpandedComments] = useState({})
  const toggleComments = (id) => setExpandedComments((s) => ({ ...s, [id]: !s[id] }))

  const searchParams = useSearchParams()
const highlightId = searchParams.get('id')

useEffect(() => {
  if (highlightId) {
    setTimeout(() => {
      const el = document.getElementById(`announcement-${highlightId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 500)
  }
}, [highlightId, announcements])

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
    const titleVal = form.title
    const contentVal = form.content
    setForm({ title: '', content: '' })
    setShowForm(false)
    try {
      await createAnnouncement(workspace.id, { title: titleVal, content: contentVal }, user)
    } catch {
      setShowForm(true)
      setForm({ title: titleVal, content: contentVal })
    }
  }

  const handleComment = async (announcementId) => {
    const content = commentInputs[announcementId]
    if (!content?.trim()) return
    await addComment(workspace.id, announcementId, content, user)
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
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text2)] hover:bg-[var(--bg3)] transition-colors">
              Cancel
            </button>
            <button type="submit"
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
  id={`announcement-${a.id}`}
  key={a.id}
  className="bg-[var(--bg2)] rounded-xl border overflow-hidden transition-all"
  style={{
    borderColor: highlightId === a.id ? accent : 'var(--border)',
    boxShadow: highlightId === a.id ? `0 0 0 2px ${accent}40` : 'none'
  }}
>
            {/* Mobile: stacked. Desktop: side-by-side absolute layout */}
            <div className="flex flex-col md:block md:relative" style={{ minHeight: '220px' }}>

              {/* LEFT — content panel */}
              <div
                className="border-b border-[var(--border)] md:border-b-0 md:border-r md:border-[var(--border)] md:absolute md:top-0 md:left-0 md:bottom-0 md:w-[70%]"
                style={{
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '20px',
                  minHeight: '200px',
                }}
              >
                {/* Top: header + content */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      {a.pinned && (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#f59e0b', display: 'block', marginBottom: '4px' }}>
                          📌 Pinned
                        </span>
                      )}
                      <h2 style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)', margin: 0 }}>{a.title}</h2>
                      <p style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '2px' }}>
                        {a.author?.name} · {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {role === 'ADMIN' && (
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button
                          onClick={() => togglePin(workspace.id, a.id)}
                          className="text-[var(--text2)] hover:text-amber-400 px-2 py-1 rounded-lg hover:bg-[var(--bg3)] transition-colors"
                          style={{ fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer' }}>
                          {a.pinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button
                          onClick={() => deleteAnnouncement(workspace.id, a.id)}
                          className="text-[var(--text2)] hover:text-red-400 px-2 py-1 rounded-lg hover:bg-[var(--bg3)] transition-colors"
                          style={{ fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text2)', whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: 0 }}>
                    {a.content}
                  </p>
                </div>

                {/* Bottom: reactions + mobile comment toggle */}
                <div>
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

                  {/* Mobile-only comment toggle */}
                  <button
                    onClick={() => toggleComments(a.id)}
                    className="md:hidden mt-3 flex items-center gap-1.5 transition-colors"
                    style={{
                      fontSize: '12px',
                      color: expandedComments[a.id] ? accent : 'var(--text2)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}>
                    💬 {expandedComments[a.id] ? 'Hide' : 'Show'} comments
                    {a.comments?.length > 0 && (
                      <span style={{
                        fontSize: '10px', fontWeight: 700,
                        padding: '1px 6px', borderRadius: '999px',
                        backgroundColor: `${accent}20`, color: accent,
                      }}>
                        {a.comments.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* RIGHT — comments panel: always visible on desktop, toggled on mobile */}
              <div
                className={`md:absolute md:top-0 md:right-0 md:bottom-0 md:w-[30%] md:flex ${expandedComments[a.id] ? 'flex' : 'hidden'}`}
                style={{
                  flexDirection: 'column',
                  borderTop: '1px solid var(--border)',
                  minHeight: '200px',
                }}
              >
                {/* Comments header */}
                <div style={{
                  padding: '6px 12px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Comments
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '999px', backgroundColor: `${accent}20`, color: accent }}>
                    {a.comments?.length || 0}
                  </span>
                </div>

                {/* Scrollable comments */}
                <div
                  ref={(el) => (commentRefs.current[a.id] = el)}
                  style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}
                >
                  {(!a.comments || a.comments.length === 0) && (
                    <p style={{ fontSize: '11px', color: 'var(--text3)', textAlign: 'center', marginTop: '16px' }}>No comments yet.</p>
                  )}
                  {a.comments?.map((c) => (
                    <div key={c.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          backgroundColor: accent, color: 'white', fontSize: '10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, flexShrink: 0,
                        }}>
                          {c.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)' }}>{c.user?.name}</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text2)', lineHeight: '1.5', margin: '0 0 0 28px' }}>
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Comment input */}
                <div style={{ padding: '8px 12px', flexShrink: 0, display: 'flex', gap: '8px', borderTop: '1px solid var(--border)' }}>
                  <input
                    placeholder="Comment..."
                    value={commentInputs[a.id] || ''}
                    onChange={(e) => setCommentInputs((s) => ({ ...s, [a.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment(a.id)}
                    style={{
                      flex: 1, fontSize: '11px',
                      border: '1px solid var(--border)', borderRadius: '8px',
                      padding: '6px 10px', backgroundColor: 'var(--bg3)',
                      color: 'var(--text)', outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => handleComment(a.id)}
                    style={{
                      fontSize: '11px', padding: '6px 12px', borderRadius: '8px',
                      backgroundColor: accent, color: 'white',
                      border: 'none', cursor: 'pointer', flexShrink: 0,
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