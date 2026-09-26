import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import {
  daysUntil, getDueBadgeClass, getDueBadgeLabel,
  matchSearch, formatDate,
} from '../utils/helpers'
import './Assignments.css'

const EMPTY_FORM = {
  title: '', subjectId: '', description: '',
  dueDate: '', priority: 'medium', status: 'pending',
}

const STATUS_LABELS = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' }
const STATUS_COLORS = {
  pending:       'var(--warning)',
  'in-progress': 'var(--info)',
  completed:     'var(--success)',
}
const PRIORITY_COLORS = {
  high:   'var(--danger)',
  medium: 'var(--warning)',
  low:    'var(--success)',
}

// ── Form ────────────────────────────────────────────────────────────────────
function AssignmentForm({ initial = EMPTY_FORM, onSave, onCancel, subjects }) {
  const [form,   setForm]   = useState({ ...EMPTY_FORM, ...initial })
  const [errors, setErrors] = useState({})

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title   = 'Title is required'
    if (!form.dueDate)      errs.dueDate = 'Due date is required'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      ...form,
      title:       form.title.trim(),
      description: (form.description ?? '').trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="as-title">Title *</label>
        <input
          id="as-title" className="form-input" value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="Assignment title…" maxLength={120}
        />
        {errors.title && <p className="form-error">{errors.title}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="as-desc">Description</label>
        <textarea
          id="as-desc" className="form-textarea" value={form.description ?? ''}
          onChange={e => set('description', e.target.value)}
          placeholder="What does this assignment involve?" rows={2}
          style={{ minHeight: 64 }}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="as-subject">Subject</label>
        <select
          id="as-subject" className="form-select" value={form.subjectId}
          onChange={e => set('subjectId', e.target.value)}
        >
          <option value="">— No subject —</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
          ))}
        </select>
      </div>

      <div className="as-row-2">
        <div className="form-group">
          <label className="form-label" htmlFor="as-due">Due Date *</label>
          <input
            id="as-due" className="form-input" type="date" value={form.dueDate}
            onChange={e => set('dueDate', e.target.value)}
          />
          {errors.dueDate && <p className="form-error">{errors.dueDate}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="as-priority">Priority</label>
          <select
            id="as-priority" className="form-select" value={form.priority}
            onChange={e => set('priority', e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="as-status">Status</label>
        <select
          id="as-status" className="form-select" value={form.status}
          onChange={e => set('status', e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="modal-footer" style={{ padding: 0, marginTop: 8, borderTop: 'none' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save Assignment</button>
      </div>
    </form>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function Assignments() {
  const {
    assignments, subjects,
    addAssignment, updateAssignment, deleteAssignment,
    cycleAssignmentStatus, getSubjectById,
  } = useApp()
  const { success } = useToast()

  const [showAdd,      setShowAdd]      = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search,       setSearch]       = useState('')
  const [filter,       setFilter]       = useState({ status: 'all', priority: 'all', subject: 'all' })
  const [sort,         setSort]         = useState('dueDate')

  const filtered = useMemo(() => {
    let list = [...assignments]

    // Dropdown filters
    if (filter.status   !== 'all') list = list.filter(a => a.status    === filter.status)
    if (filter.priority !== 'all') list = list.filter(a => a.priority  === filter.priority)
    if (filter.subject  !== 'all') list = list.filter(a => a.subjectId === filter.subject)

    // Text search — title, description, subject name
    if (search.trim()) {
      list = list.filter(a => {
        const subj = subjects.find(s => s.id === a.subjectId)
        return (
          matchSearch(a.title,       search) ||
          matchSearch(a.description, search) ||
          matchSearch(subj?.name,    search)
        )
      })
    }

    // Sort
    list.sort((a, b) => {
      if (sort === 'dueDate')  return (a.dueDate ?? '').localeCompare(b.dueDate ?? '')
      if (sort === 'priority') {
        const ord = { high: 0, medium: 1, low: 2 }
        return (ord[a.priority] ?? 3) - (ord[b.priority] ?? 3)
      }
      return a.title.localeCompare(b.title)
    })

    return list
  }, [assignments, filter, sort, search, subjects])

  const counts = useMemo(() => ({
    pending:    assignments.filter(a => a.status === 'pending').length,
    inProgress: assignments.filter(a => a.status === 'in-progress').length,
    completed:  assignments.filter(a => a.status === 'completed').length,
  }), [assignments])

  const handleAdd    = (data) => { addAssignment(data); setShowAdd(false); success('Assignment added') }
  const handleEdit   = (data) => { updateAssignment(editTarget.id, data); setEditTarget(null); success('Assignment updated') }
  const handleDelete = ()     => { deleteAssignment(deleteTarget.id); setDeleteTarget(null); success('Assignment deleted') }

  return (
    <div className="assignments-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Assignments</h2>
          <p className="page-subtitle">
            {counts.pending} pending · {counts.inProgress} in progress · {counts.completed} completed
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Assignment</button>
      </div>

      {/* Search + filter bar */}
      <div className="as-filter-bar card">
        {/* Search row */}
        <div className="as-search-wrap">
          <span className="as-search-icon" aria-hidden="true">🔍</span>
          <input
            className="form-input as-search-input"
            placeholder="Search assignments by title, description, or subject…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search assignments"
          />
          {search && (
            <button
              className="btn btn-ghost btn-icon btn-sm as-search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >✕</button>
          )}
        </div>

        {/* Filter row */}
        <div className="as-filter-row">
          <div className="as-filters">
            <select
              className="form-select as-filter-select" value={filter.status}
              onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              className="form-select as-filter-select" value={filter.priority}
              onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}
              aria-label="Filter by priority"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              className="form-select as-filter-select" value={filter.subject}
              onChange={e => setFilter(f => ({ ...f, subject: e.target.value }))}
              aria-label="Filter by subject"
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
              ))}
            </select>

            <select
              className="form-select as-filter-select" value={sort}
              onChange={e => setSort(e.target.value)}
              aria-label="Sort by"
            >
              <option value="dueDate">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="title">Sort: Title</option>
            </select>
          </div>

          <span className="as-count">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        assignments.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No assignments yet"
            description="Add your first assignment to start tracking your work."
            action={
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                Add Assignment
              </button>
            }
          />
        ) : (
          <EmptyState
            icon="🔍"
            title="No results"
            description="Try adjusting your search or filters."
          />
        )
      ) : (
        <div className="as-list">
          {filtered.map(a => {
            const sub  = getSubjectById(a.subjectId)
            const diff = daysUntil(a.dueDate)
            return (
              <div
                key={a.id}
                className={`as-item card${a.status === 'completed' ? ' as-completed' : ''}`}
              >
                {/* Priority stripe */}
                <div
                  className="as-priority-stripe"
                  style={{ background: PRIORITY_COLORS[a.priority] ?? 'var(--text-muted)' }}
                />

                {/* Status cycle button */}
                <button
                  className={`as-status-btn as-status-btn--${a.status}`}
                  onClick={() => cycleAssignmentStatus(a.id)}
                  aria-label={`Status: ${STATUS_LABELS[a.status] ?? a.status}. Click to advance`}
                  title={`Click to advance status (current: ${STATUS_LABELS[a.status] ?? a.status})`}
                >
                  {a.status === 'completed'   ? '✓'
                    : a.status === 'in-progress' ? '▶'
                    : '○'}
                </button>

                {/* Body */}
                <div className="as-body">
                  <p className="as-title">{a.title}</p>
                  {a.description && (
                    <p className="as-desc">{a.description}</p>
                  )}
                  <div className="as-meta">
                    {sub && (
                      <span
                        className="chip"
                        style={{ color: sub.color, borderColor: sub.color + '44' }}
                      >
                        {sub.icon} {sub.name}
                      </span>
                    )}
                    <span className="chip" style={{ color: PRIORITY_COLORS[a.priority] }}>
                      ● {a.priority}
                    </span>
                    <span className="chip" style={{ color: STATUS_COLORS[a.status] }}>
                      {STATUS_LABELS[a.status] ?? a.status}
                    </span>
                    {a.dueDate && (
                      <span className="chip">
                        📅 {formatDate(a.dueDate, { month: 'short', day: 'numeric', year: undefined })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="as-right">
                  <span className={`as-due-badge ${getDueBadgeClass(diff, a.status)}`}>
                    {getDueBadgeLabel(diff, a.status)}
                  </span>
                  <div className="as-actions">
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => setEditTarget(a)}
                      aria-label={`Edit ${a.title}`}
                    >✏️</button>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => setDeleteTarget(a)}
                      aria-label={`Delete ${a.title}`}
                    >🗑️</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Assignment">
        <AssignmentForm
          subjects={subjects}
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Assignment">
        {editTarget && (
          <AssignmentForm
            subjects={subjects}
            initial={{
              title:       editTarget.title,
              description: editTarget.description ?? '',
              subjectId:   editTarget.subjectId   ?? '',
              dueDate:     editTarget.dueDate,
              priority:    editTarget.priority,
              status:      editTarget.status,
            }}
            onSave={handleEdit}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Assignment"
        message={`Delete "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </div>
  )
}
