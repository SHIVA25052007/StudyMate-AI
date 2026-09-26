import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { matchSearch, formatDate } from '../utils/helpers'
import './Notes.css'

const EMPTY_FORM = { title: '', subjectId: '', content: '', tags: '' }

// ── Helpers ─────────────────────────────────────────────────────────────────
/** Parse a comma-separated tag string into a trimmed array */
function parseTags(str) {
  return (str ?? '')
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean)
}

/** Join tag array for display in the input */
function joinTags(arr) {
  return (arr ?? []).join(', ')
}

// ── Form ────────────────────────────────────────────────────────────────────
function NoteForm({ initial = EMPTY_FORM, onSave, onCancel, subjects }) {
  const [form,   setForm]   = useState({ ...EMPTY_FORM, ...initial })
  const [errors, setErrors] = useState({})

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim())   errs.title   = 'Title is required'
    if (!form.content.trim()) errs.content = 'Content is required'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      ...form,
      title:   form.title.trim(),
      content: form.content.trim(),
      tags:    parseTags(form.tags),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="note-title">Title *</label>
        <input
          id="note-title" className="form-input" value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="Note title…" maxLength={120}
        />
        {errors.title && <p className="form-error">{errors.title}</p>}
      </div>

      <div className="note-form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="note-subject">Subject</label>
          <select
            id="note-subject" className="form-select" value={form.subjectId}
            onChange={e => set('subjectId', e.target.value)}
          >
            <option value="">— No subject —</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="note-tags">Tags</label>
          <input
            id="note-tags" className="form-input" value={form.tags ?? ''}
            onChange={e => set('tags', e.target.value)}
            placeholder="calculus, exam, revision…"
          />
          <p className="notes-hint">Separate tags with commas</p>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="note-content">Content *</label>
        <textarea
          id="note-content" className="form-textarea" value={form.content}
          onChange={e => set('content', e.target.value)}
          placeholder="Write your notes here…" rows={8}
          style={{ minHeight: 180 }}
        />
        {errors.content && <p className="form-error">{errors.content}</p>}
      </div>

      <div className="modal-footer" style={{ padding: 0, marginTop: 8, borderTop: 'none' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save Note</button>
      </div>
    </form>
  )
}

// ── Note card ────────────────────────────────────────────────────────────────
function NoteCard({ note, subject, onEdit, onDelete, onView }) {
  const preview = note.content.replace(/\n+/g, ' ').slice(0, 140)
  const dateStr = formatDate(note.updatedAt)

  return (
    <article className="note-card card" onClick={() => onView(note)}>
      {subject && (
        <div className="note-card-stripe" style={{ background: subject.color }} />
      )}
      <div className="note-card-body">
        <div className="note-card-top">
          {subject
            ? (
              <span
                className="chip note-subject-chip"
                style={{ color: subject.color, borderColor: subject.color + '44' }}
              >
                {subject.icon} {subject.name}
              </span>
            )
            : <span className="chip">General</span>
          }
          <div className="note-card-actions" onClick={e => e.stopPropagation()}>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onEdit(note)}
              aria-label={`Edit ${note.title}`}
            >✏️</button>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onDelete(note)}
              aria-label={`Delete ${note.title}`}
            >🗑️</button>
          </div>
        </div>

        <h3 className="note-title">{note.title}</h3>
        <p className="note-preview">{preview}{note.content.length > 140 ? '…' : ''}</p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="note-tags-row">
            {note.tags.slice(0, 4).map(tag => (
              <span key={tag} className="note-tag">#{tag}</span>
            ))}
            {note.tags.length > 4 && (
              <span className="note-tag note-tag--more">+{note.tags.length - 4}</span>
            )}
          </div>
        )}

        <p className="note-date">Updated {dateStr}</p>
      </div>
    </article>
  )
}

// ── Viewer modal ─────────────────────────────────────────────────────────────
function NoteViewer({ note, subject, onClose, onEdit }) {
  if (!note) return null
  return (
    <Modal
      isOpen={!!note}
      onClose={onClose}
      title={note.title}
      size="lg"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={() => { onClose(); onEdit(note) }}>Edit</button>
        </>
      }
    >
      <div className="note-viewer">
        <div className="note-viewer-meta">
          {subject && (
            <span
              className="chip"
              style={{ color: subject.color, borderColor: subject.color + '44' }}
            >
              {subject.icon} {subject.name}
            </span>
          )}
          {note.tags && note.tags.length > 0 && note.tags.map(tag => (
            <span key={tag} className="note-tag">#{tag}</span>
          ))}
        </div>
        <pre className="note-viewer-content">{note.content}</pre>
      </div>
    </Modal>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function Notes() {
  const { notes, subjects, addNote, updateNote, deleteNote, getSubjectById } = useApp()
  const { success } = useToast()

  const [showAdd,      setShowAdd]      = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewTarget,   setViewTarget]   = useState(null)
  const [search,       setSearch]       = useState('')
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterTag,    setFilterTag]    = useState('')

  // Collect all unique tags
  const allTags = useMemo(() => {
    const set = new Set()
    notes.forEach(n => (n.tags ?? []).forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [notes])

  const filtered = useMemo(() => {
    let list = [...notes]

    // Subject filter
    if (filterSubject !== 'all') list = list.filter(n => n.subjectId === filterSubject)

    // Tag filter
    if (filterTag) list = list.filter(n => (n.tags ?? []).includes(filterTag))

    // Text search (title + content + tags)
    if (search.trim()) {
      list = list.filter(n =>
        matchSearch(n.title,   search) ||
        matchSearch(n.content, search) ||
        (n.tags ?? []).some(t => matchSearch(t, search))
      )
    }

    return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [notes, search, filterSubject, filterTag])

  const handleAdd    = (data) => { addNote(data);                    setShowAdd(false);    success('Note created') }
  const handleEdit   = (data) => { updateNote(editTarget.id, data);  setEditTarget(null);  success('Note updated') }
  const handleDelete = ()     => { deleteNote(deleteTarget.id);      setDeleteTarget(null);success('Note deleted') }

  return (
    <div className="notes-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Notes</h2>
          <p className="page-subtitle">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ New Note</button>
      </div>

      {/* Toolbar */}
      <div className="notes-toolbar card">
        {/* Search */}
        <div className="notes-search-wrap">
          <span className="notes-search-icon" aria-hidden="true">🔍</span>
          <input
            className="form-input notes-search"
            placeholder="Search notes by title, content, or tag…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search notes"
          />
          {search && (
            <button
              className="btn btn-ghost btn-icon btn-sm notes-search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >✕</button>
          )}
        </div>

        {/* Filters */}
        <div className="notes-filters">
          <select
            className="form-select notes-filter-select"
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
            aria-label="Filter by subject"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
            ))}
          </select>

          {allTags.length > 0 && (
            <select
              className="form-select notes-filter-select"
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
              aria-label="Filter by tag"
            >
              <option value="">All Tags</option>
              {allTags.map(t => (
                <option key={t} value={t}>#{t}</option>
              ))}
            </select>
          )}

          <span className="notes-count">
            {filtered.length} note{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        notes.length === 0 ? (
          <EmptyState
            icon="🗒️"
            title="No notes yet"
            description="Create your first note to start building your study library."
            action={
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                New Note
              </button>
            }
          />
        ) : (
          <EmptyState
            icon="🔍"
            title="No notes match"
            description="Try a different search or filter."
          />
        )
      ) : (
        <div className="notes-grid">
          {filtered.map(n => (
            <NoteCard
              key={n.id}
              note={n}
              subject={getSubjectById(n.subjectId)}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
              onView={setViewTarget}
            />
          ))}
        </div>
      )}

      {/* Add */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Note" size="lg">
        <NoteForm
          subjects={subjects}
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>

      {/* Edit */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Note" size="lg">
        {editTarget && (
          <NoteForm
            subjects={subjects}
            initial={{
              title:     editTarget.title,
              subjectId: editTarget.subjectId ?? '',
              content:   editTarget.content,
              tags:      joinTags(editTarget.tags),
            }}
            onSave={handleEdit}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>

      {/* View */}
      <NoteViewer
        note={viewTarget}
        subject={viewTarget ? getSubjectById(viewTarget.subjectId) : null}
        onClose={() => setViewTarget(null)}
        onEdit={(n) => setEditTarget(n)}
      />

      {/* Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Note"
        message={`Delete "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </div>
  )
}
