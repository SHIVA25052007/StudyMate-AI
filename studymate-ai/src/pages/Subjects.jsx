import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import ProgressBar from '../components/ui/ProgressBar'
import { matchSearch } from '../utils/helpers'
import './Subjects.css'

const SUBJECT_COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6',
  '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
]
const SUBJECT_ICONS = [
  '📚','💻','⚛️','📐','🔬','📖','🎨','🌍','🧮','🏛️',
  '🎵','⚗️','📊','🧬','🌿',
]

const EMPTY_FORM = {
  name: '', code: '', description: '', instructor: '',
  color: SUBJECT_COLORS[0], icon: '📚', credits: '',
}

// ── Form ────────────────────────────────────────────────────────────────────
function SubjectForm({ initial = EMPTY_FORM, onSave, onCancel }) {
  const [form,   setForm]   = useState({ ...EMPTY_FORM, ...initial })
  const [errors, setErrors] = useState({})

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Subject name is required'
    if (form.credits && (isNaN(form.credits) || Number(form.credits) < 0))
      errs.credits = 'Credits must be a positive number'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      ...form,
      name:        form.name.trim(),
      code:        (form.code        ?? '').trim(),
      description: (form.description ?? '').trim(),
      instructor:  (form.instructor  ?? '').trim(),
      credits:     form.credits ? Number(form.credits) : 0,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Name + Code */}
      <div className="sub-row-2">
        <div className="form-group">
          <label className="form-label" htmlFor="sub-name">Subject Name *</label>
          <input
            id="sub-name" className="form-input" value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Calculus, Data Structures…" maxLength={60}
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="sub-code">Subject Code</label>
          <input
            id="sub-code" className="form-input" value={form.code ?? ''}
            onChange={e => set('code', e.target.value)}
            placeholder="e.g. MATH201" maxLength={20}
          />
        </div>
      </div>

      {/* Instructor + Credits */}
      <div className="sub-row-2">
        <div className="form-group">
          <label className="form-label" htmlFor="sub-instructor">Instructor</label>
          <input
            id="sub-instructor" className="form-input" value={form.instructor ?? ''}
            onChange={e => set('instructor', e.target.value)}
            placeholder="Prof. Smith" maxLength={60}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="sub-credits">Credits</label>
          <input
            id="sub-credits" className="form-input" type="number"
            min="0" max="20" value={form.credits ?? ''}
            onChange={e => set('credits', e.target.value)}
            placeholder="e.g. 3"
          />
          {errors.credits && <p className="form-error">{errors.credits}</p>}
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label" htmlFor="sub-desc">Description</label>
        <textarea
          id="sub-desc" className="form-textarea" value={form.description ?? ''}
          onChange={e => set('description', e.target.value)}
          placeholder="What does this subject cover?" rows={2}
          style={{ minHeight: 64 }}
        />
      </div>

      {/* Icon */}
      <div className="form-group">
        <label className="form-label">Icon</label>
        <div className="icon-picker">
          {SUBJECT_ICONS.map(ic => (
            <button
              type="button" key={ic}
              className={`icon-btn${form.icon === ic ? ' selected' : ''}`}
              onClick={() => set('icon', ic)} aria-label={ic}
            >{ic}</button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="form-group">
        <label className="form-label">Colour</label>
        <div className="color-picker">
          {SUBJECT_COLORS.map(c => (
            <button
              type="button" key={c}
              className={`color-btn${form.color === c ? ' selected' : ''}`}
              style={{ background: c }}
              onClick={() => set('color', c)}
              aria-label={`Colour ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="modal-footer" style={{ padding: 0, marginTop: 8, borderTop: 'none' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save Subject</button>
      </div>
    </form>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function Subjects() {
  const {
    subjects, addSubject, updateSubject, deleteSubject,
    getSubjectProgress, assignments, sessions,
  } = useApp()
  const { success } = useToast()

  const [showAdd,      setShowAdd]      = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search,       setSearch]       = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return subjects
    return subjects.filter(s =>
      matchSearch(s.name,        search) ||
      matchSearch(s.code,        search) ||
      matchSearch(s.instructor,  search) ||
      matchSearch(s.description, search)
    )
  }, [subjects, search])

  const handleAdd    = (data) => { addSubject(data);                     setShowAdd(false);    success('Subject added') }
  const handleEdit   = (data) => { updateSubject(editTarget.id, data);   setEditTarget(null);  success('Subject updated') }
  const handleDelete = ()     => { deleteSubject(deleteTarget.id);       setDeleteTarget(null);success('Subject deleted') }

  return (
    <div className="subjects-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Subjects</h2>
          <p className="page-subtitle">
            {subjects.length} course{subjects.length !== 1 ? 's' : ''} enrolled
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Subject</button>
      </div>

      {/* Search */}
      {subjects.length > 0 && (
        <div className="subjects-search-bar card">
          <div className="subjects-search-wrap">
            <span className="subjects-search-icon" aria-hidden="true">🔍</span>
            <input
              className="form-input subjects-search-input"
              placeholder="Search by name, code, or instructor…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search subjects"
            />
            {search && (
              <button
                className="btn btn-ghost btn-icon btn-sm subjects-search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >✕</button>
            )}
          </div>
          <span className="subjects-count">
            {filtered.length} of {subjects.length}
          </span>
        </div>
      )}

      {/* Grid */}
      {subjects.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No subjects yet"
          description="Add your first subject to start tracking your courses and progress."
          action={
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              Add Subject
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No subjects match" description="Try a different search term." />
      ) : (
        <div className="subjects-grid">
          {filtered.map(sub => {
            const prog           = getSubjectProgress(sub.id)
            const subAssignments = assignments.filter(a => a.subjectId === sub.id)
            const subSessions    = sessions.filter(s => s.subjectId === sub.id)
            return (
              <article key={sub.id} className="subject-card card">
                {/* Top stripe */}
                <div className="subject-card-stripe" style={{ background: sub.color }} />

                <div className="subject-card-body">
                  {/* Icon + actions */}
                  <div className="subject-card-top">
                    <div
                      className="subject-icon-wrap"
                      style={{ background: sub.color + '22', color: sub.color }}
                    >
                      <span aria-hidden="true">{sub.icon}</span>
                    </div>
                    <div className="subject-card-actions">
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => setEditTarget(sub)}
                        aria-label={`Edit ${sub.name}`}
                      >✏️</button>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => setDeleteTarget(sub)}
                        aria-label={`Delete ${sub.name}`}
                      >🗑️</button>
                    </div>
                  </div>

                  {/* Info */}
                  <h3 className="subject-name">{sub.name}</h3>
                  {sub.code && <p className="subject-code">{sub.code}</p>}
                  {sub.instructor && (
                    <p className="subject-instructor">👤 {sub.instructor}</p>
                  )}
                  {sub.description && (
                    <p className="subject-description">{sub.description}</p>
                  )}
                  {sub.credits > 0 && (
                    <p className="subject-credits">
                      {sub.credits} credit{sub.credits !== 1 ? 's' : ''}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="subject-stats-row">
                    <div className="subject-stat">
                      <span className="subject-stat-num">{subAssignments.length}</span>
                      <span className="subject-stat-label">Assignments</span>
                    </div>
                    <div className="subject-stat">
                      <span className="subject-stat-num">{subSessions.length}</span>
                      <span className="subject-stat-label">Sessions</span>
                    </div>
                    <div className="subject-stat">
                      <span className="subject-stat-num">
                        {Math.round(prog.totalMinutes / 60 * 10) / 10}h
                      </span>
                      <span className="subject-stat-label">Studied</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={{ marginTop: 12 }}>
                    <ProgressBar value={prog.percentage} color={sub.color} label="Progress" />
                  </div>

                  {/* Badges */}
                  <div className="subject-tag-row">
                    {prog.completedAssignments > 0 && (
                      <span className="badge badge-success">
                        ✓ {prog.completedAssignments} done
                      </span>
                    )}
                    {subAssignments.filter(a => a.status === 'pending').length > 0 && (
                      <span className="badge badge-warning">
                        {subAssignments.filter(a => a.status === 'pending').length} pending
                      </span>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Subject">
        <SubjectForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Subject">
        {editTarget && (
          <SubjectForm
            initial={{
              name:        editTarget.name,
              code:        editTarget.code        ?? '',
              description: editTarget.description ?? '',
              instructor:  editTarget.instructor  ?? '',
              color:       editTarget.color,
              icon:        editTarget.icon,
              credits:     editTarget.credits || '',
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
        title="Delete Subject"
        message={`Delete "${deleteTarget?.name}"? This won't delete associated assignments or notes.`}
      />
    </div>
  )
}
