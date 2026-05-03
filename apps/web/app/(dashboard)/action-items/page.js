'use client'
import { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useWorkspaceStore } from '../../../stores/workspaceStore'
import { useActionItemStore } from '../../../stores/actionItemStore'
import { useAuthStore } from '../../../stores/authStore'
import api from '../../../lib/api'

const COLUMNS = [
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'DONE', label: 'Done' },
]

const PRIORITY_COLORS = {
  LOW:    'bg-[var(--bg4)] text-[var(--text2)] border border-[var(--border2)]',
  MEDIUM: 'bg-[#78350f25] text-amber-400 border border-[#78350f40]',
  HIGH:   'bg-[#7f1d1d25] text-red-400 border border-[#7f1d1d40]',
}

const STATUS_COLORS = {
  TODO:        'bg-[var(--bg4)] text-[var(--text2)] border border-[var(--border2)]',
  IN_PROGRESS: 'bg-[#1e3a5f25] text-blue-400 border border-[#1e3a5f40]',
  DONE:        'bg-[#14532d25] text-emerald-400 border border-[#14532d40]',
}

const COLUMN_HEADER_COLORS = {
  TODO:        'text-[var(--text2)]',
  IN_PROGRESS: 'text-blue-400',
  DONE:        'text-emerald-400',
}

const COLUMN_COUNT_COLORS = {
  TODO:        'bg-[var(--bg4)] text-[var(--text2)] border border-[var(--border)]',
  IN_PROGRESS: 'bg-[#1e3a5f25] text-blue-400 border border-[#1e3a5f40]',
  DONE:        'bg-[#14532d25] text-emerald-400 border border-[#14532d40]',
}

export default function ActionItemsPage() {
  const { active: workspace, role } = useWorkspaceStore()
  const { items, fetchItems, createItem, moveItem, deleteItem } = useActionItemStore()
  const { user } = useAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState('board')
  const accent = workspace?.accentColor || '#7C3AED'

  useEffect(() => {
    if (workspace) fetchItems(workspace.id)
  }, [workspace])

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return
    moveItem(workspace.id, draggableId, destination.droppableId)
  }

  const columnItems = (colId) => items.filter((i) => i.status === colId)

  return (
    <div>

      <div className="flex items-center gap-4 mb-6">
  <h1 className="text-2xl font-bold text-[var(--text)]">Action Items</h1>
  <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-sm">
    <button
      onClick={() => setView('board')}
      className={`px-3 py-1.5 transition-colors ${view === 'board'
        ? 'bg-[var(--bg3)] text-[var(--text)]'
        : 'text-[var(--text2)] hover:bg-[var(--bg3)]'}`}>
      Board
    </button>
    <button
      onClick={() => setView('list')}
      className={`px-3 py-1.5 transition-colors ${view === 'list'
        ? 'bg-[var(--bg3)] text-[var(--text)]'
        : 'text-[var(--text2)] hover:bg-[var(--bg3)]'}`}>
      List
    </button>
  </div>
  <div className="ml-auto">
    <button
      onClick={() => setShowForm(true)}
      className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-80"
      style={{ backgroundColor: accent }}>
      + New Item
    </button>
  </div>
</div>

      {view === 'board' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-3 gap-4">
            {COLUMNS.map((col) => (
              <div key={col.id} className="flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className={`font-semibold text-xs uppercase tracking-widest ${COLUMN_HEADER_COLORS[col.id]}`}>
                    {col.label}
                  </h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COLUMN_COUNT_COLORS[col.id]}`}>
                    {columnItems(col.id).length}
                  </span>
                </div>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-32 rounded-xl p-2 space-y-2 transition-colors ${
                        snapshot.isDraggingOver
                          ? 'bg-[var(--bg3)]'
                          : 'bg-[var(--bg2)]'
                      }`}
                    >
                      {columnItems(col.id).map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-[var(--bg3)] rounded-lg border border-[var(--border)] p-3 transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg rotate-1 border-[var(--border2)]' : ''
                              }`}
                            >
                              <p className="text-sm font-medium text-[var(--text)] mb-2">{item.title}</p>
                              {item.goal && (
                                <p className="text-xs text-[var(--text3)] mb-2 truncate">⬡ {item.goal.title}</p>
                              )}
                              <div className="flex items-center justify-between">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[item.priority]}`}>
                                  {item.priority}
                                </span>
                                <div className="flex items-center gap-2">
                                  {item.assignee && (
                                    <div className="flex items-center gap-1">
                                      <div
                                        className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                                        style={{ backgroundColor: accent }}>
                                        {item.assignee.name[0].toUpperCase()}
                                      </div>
                                      <span className="text-xs text-[var(--text2)]">{item.assignee.name}</span>
                                    </div>
                                  )}
                                  {item.dueDate && (
                                    <span className="text-xs text-[var(--text3)]">
                                      {new Date(item.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                  {role === 'ADMIN' && (
                                    <button
                                      onClick={() => deleteItem(workspace.id, item.id)}
                                      className="text-[var(--text3)] hover:text-red-400 text-xs transition-colors">✕</button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="bg-[var(--bg2)] rounded-xl border border-[var(--border)] overflow-hidden">
          {items.length === 0 ? (
            <div className="p-12 text-center text-[var(--text2)]">No action items yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--bg)]">
                <tr>
                  {['Title', 'Status', 'Priority', 'Assignee', 'Linked Goal', 'Due', role === 'ADMIN' ? '' : null]
                    .filter(Boolean)
                    .map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text2)] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] hover:bg-[var(--bg3)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--text)]">{item.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[item.priority]}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.assignee ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold"
                            style={{ backgroundColor: accent }}>
                            {item.assignee.name[0].toUpperCase()}
                          </div>
                          <span className="text-[var(--text2)]">{item.assignee.name}</span>
                        </div>
                      ) : <span className="text-[var(--text3)]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[var(--text2)]">
                      {item.goal ? `⬡ ${item.goal.title}` : <span className="text-[var(--text3)]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[var(--text2)]">
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : <span className="text-[var(--text3)]">—</span>}
                    </td>
                    {role === 'ADMIN' && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteItem(workspace.id, item.id)}
                          className="text-[var(--text3)] hover:text-red-400 text-xs transition-colors">✕</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showForm && (
        <ActionItemForm
          workspaceId={workspace?.id}
          accent={accent}
          onClose={() => setShowForm(false)}
          onCreate={createItem}
        />
      )}
    </div>
  )
}

function ActionItemForm({ workspaceId, accent, onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', priority: 'MEDIUM', dueDate: '', assigneeId: '', goalId: '' })
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState([])
  const [goals, setGoals] = useState([])

  useEffect(() => {
    api.get(`/workspaces/${workspaceId}/members`).then((r) => setMembers(r.data))
    api.get(`/workspaces/${workspaceId}/goals`).then((r) => setGoals(r.data))
  }, [workspaceId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onCreate(workspaceId, {
      ...form,
      assigneeId: form.assigneeId || undefined,
      goalId: form.goalId || undefined,
    })
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--bg2)] rounded-xl p-6 w-full max-w-md border border-[var(--border)]">
        <h2 className="text-lg font-bold text-[var(--text)] mb-4">New Action Item</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required placeholder="Title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg3)] text-[var(--text)] outline-none text-sm placeholder:text-[var(--text3)]" />
          <select
            value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg3)] text-[var(--text)] outline-none text-sm">
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
          </select>
          <select
            value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg3)] text-[var(--text)] outline-none text-sm">
            <option value="">No assignee</option>
            {members.map((m) => (
              <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
            ))}
          </select>
          <select
            value={form.goalId} onChange={(e) => setForm({ ...form, goalId: e.target.value })}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg3)] text-[var(--text)] outline-none text-sm">
            <option value="">No linked goal</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
          <input
            type="date" value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg3)] text-[var(--text)] outline-none text-sm" />
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text2)] hover:bg-[var(--bg3)] transition-colors">
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="px-4 py-2 text-sm rounded-lg text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ backgroundColor: accent }}>
              {loading ? 'Saving...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}