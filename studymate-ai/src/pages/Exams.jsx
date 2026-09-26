import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { daysUntil, formatDate, matchSearch } from '../utils/helpers'
import './Exams.css'

const EMPTY_FORM = {
  subjectId: '', title: '', date: '', time: '09:00', venue: '', description: '',
}

// ── Form ────────────────────────────────────────────────────────────────────
function ExamForm({ initial = EMPTY_FORM, onSave, onCancel, subjects }) {
  const [form,   setForm]   = useState({ ...EMPTY_FORM, ...initial })
  const [errors, setErrors] = useState({})

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Exam title is required'
    if (!form.date)         errs.date  = 'Date is required'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      ...form,
      title:       form.title.trim(),
      venue:       (form.venue       ?? '').trim(),
      description: (form.description ?? '').trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="ex-title">Exam Title *</label>
        <input
          id="ex-title" className="form-input" value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="e.g. Midterm Exam, Chapter 5 Quiz…" maxLength={100}
        />
        {errors.title && <p className="form-error">{errors.title}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="ex-subject">Subject</label>
        <select
          id="ex-subject" className="form-select" value={form.subjectId}
          onChange={e => set('subjectId', e.target.value)}
        >
          <option value="">— No subject —</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
          ))}
        </select>
      </div>

      <div className="ex-row-2">
        <div className="form-group">
          <label className="form-label" htmlFor="ex-date">Date *</label>
          <input
            id="ex-date" className="form-input" type="date" value={form.date}
            onChange={e => set('date', e.target.value)}
          />
          {errors.date && <p className="form-error">{errors.date}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="ex-time">Time</label>
          <input
            id="ex-time" className="form-input" type="time" value={form.time}
            onChange={e => set('time', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="ex-venue">Venue</label>
        <input
          id="ex-venue" className="form-input" value={form.venue ?? ''}
          onChange={e => set('venue', e.target.value)}
          placeholder="e.g. Hall A, Room 201…" maxLength={80}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="ex-description">Description / Notes</label>
        <textarea
          id="ex-description" className="form-textarea" value={form.description ?? ''}
          onChange={e => set('description', e.target.value)}
          placeholder="Topics covered, preparation notes…" rows={3}
          style={{ minHeight: 72 }}
        />
      </div>

      <div className="modal-footer" style={{ padding: 0, marginTop: 8, borderTop: 'none' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save Exam</button>
      </div>
    </form>
  )
}

// ── Countdown ring ───────────────────────────────────────────────────────────
function CountdownRing({ days, color }) {
  const ringColor = days === null ? 'var(--text-muted)'
    : days < 0  ? 'var(--text-muted)'
    : days <= 3 ? 'var(--danger)'
    : days <= 7 ? 'var(--warning)'
    : (color || 'var(--accent)')

  return (
    <div className="exam-countdown-ring" style={{ borderColor: ringColor, color: ringColor }}>
      {days === null || days < 0
        ? <><span className="crd-num">—</span><span className="crd-label">past</span></>
        : days === 0
          ? <span className="crd-num" style={{ fontSize: 12 }}>TODAY</span>
          : <><span className="crd-num">{days}</span><span className="crd-label">days</span></>
      }
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function Exams() {
  const { exams, subjects, addExam, updateExam, deleteExam, getSubjectById } = useApp()
  const { success } = useToast()

  const [showAdd,      setShowAdd]      = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showPast,     setShowPast]     = useState(false)
  const [search,       setSearch]       = useState('')

  const today = new Date().toISOString().split('T')[0]

  const upcoming = useMemo(() =>
    exams.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
    [exams, today])

  const past = useMemo(() =>
    exams.filter(e => e.date < today).sort((a, b) => b.date.localeCompare(a.date)),
    [exams, today])

  const displayList = useMemo(() => {
    const base = showPast ? past : upcoming
    if (!search.trim()) return base
    return base.filter(e => {
      const sub = getSubjectById(e.subjectId)
      return (
        matchSearch(e.title,       search) ||
        matchSearch(e.venue,       search) ||
        matchSearch(e.description, search) ||
        matchSearch(sub?.name,     search)
      )
    })
  }, [showPast, upcoming, past, search, getSubjectById])

  const handleAdd    = (data) => { addExam(data);                    setShowAdd(false);    success('Exam added') }
  const handleEdit   = (data) => { updateExam(editTarget.id, data);  setEditTarget(null);  success('Exam updated') }
  const handleDelete = ()     => { deleteExam(deleteTarget.id);      setDeleteTarget(null);success('Exam deleted') }

  return (
    <div className="exams-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Exam Schedule</h2>
          <p className="page-subtitle">
            {upcoming.length} upcoming · {past.length} past
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Exam</button>
      </div>

      {/* Tab bar + search */}
      <div className="ex-controls card">
        <div className="ex-tab-bar">
          <button
            className={`ex-tab${!showPast ? ' active' : ''}`}
            onClick={() => setShowPast(false)}
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            className={`ex-tab${showPast ? ' active' : ''}`}
            onClick={() => setShowPast(true)}
          >
            Past ({past.length})
          </button>
        </div>

        <div className="ex-search-wrap">
          <span className="ex-search-icon" aria-hidden="true">🔍</span>
          <input
            className="form-input ex-search-input"
            placeholder="Search exams…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search exams"
          />
          {search && (
            <button
              className="btn btn-ghost btn-icon btn-sm ex-search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >✕</button>
          )}
        </div>
      </div>

      {/* List */}
      {displayList.length === 0 ? (
        <EmptyState
          icon={showPast ? '📜' : '📅'}
          title={search ? 'No exams match' : showPast ? 'No past exams' : 'No upcoming exams'}
          description={
            search ? 'Try a different search term.' :
            showPast ? 'Past exams will appear here.' :
            'Schedule your next exam to start the countdown.'
          }
          action={
            !showPast && !search && (
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                Add Exam
              </button>
            )
          }
        />
      ) : (
        <div className="ex-list">
          {displayList.map(e => {
            const sub  = getSubjectById(e.subjectId)
            const diff = daysUntil(e.date)
            const isPast = diff !== null && diff < 0
            return (
              <article
                key={e.id}
                className={`ex-card card${isPast ? ' ex-past' : ''}`}
              >
                {/* Left: countdown */}
                <div className="ex-card-left">
                  <CountdownRing days={diff} color={sub?.color} />
                </div>

                {/* Middle: info */}
                <div className="ex-card-info">
                  <div className="ex-card-header">
                    <h3 className="ex-title">{e.title}</h3>
                    {sub && (
                      <span
                        className="chip"
                        style={{ color: sub.color, borderColor: sub.color + '44' }}
                      >
                        {sub.icon} {sub.name}
                      </span>
                    )}
                  </div>

                  <div className="ex-meta">
                    <span className="ex-meta-item">
                      📅 {formatDate(e.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    {e.time && <span className="ex-meta-item">🕐 {e.time}</span>}
                    {(e.venue || e.location) && (
                      <span className="ex-meta-item">
                        📍 {e.venue || e.location}
                      </span>
                    )}
                  </div>

                  {e.description && <p className="ex-notes">{e.description}</p>}

                  {/* Urgency bar for exams ≤14 days away */}
                  {!isPast && diff !== null && diff <= 14 && (
                    <div className="ex-urgency-bar">
                      <div className="ex-urgency-label">
                        {diff === 0 ? 'Exam is today!' : `${diff} day${diff !== 1 ? 's' : ''} to prepare`}
                      </div>
                      <div className="progress-bar-track" style={{ height: 5 }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${Math.max(5, ((14 - diff) / 14) * 100)}%`,
                            background: diff <= 3 ? 'var(--danger)' : diff <= 7 ? 'var(--warning)' : 'var(--accent)',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: actions */}
                <div className="ex-card-actions">
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => setEditTarget(e)}
                    aria-label={`Edit ${e.title}`}
                  >✏️</button>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => setDeleteTarget(e)}
                    aria-label={`Delete ${e.title}`}
                  >🗑️</button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Exam">
        <ExamForm subjects={subjects} onSave={handleAdd} onCancel={() => setShowAdd(false)} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Exam">
        {editTarget && (
          <ExamForm
            subjects={subjects}
            initial={{
              subjectId:   editTarget.subjectId   ?? '',
              title:       editTarget.title        ?? '',
              date:        editTarget.date,
              time:        editTarget.time         ?? '09:00',
              venue:       editTarget.venue        ?? editTarget.location ?? '',
              description: editTarget.description  ?? editTarget.notes   ?? '',
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
        title="Delete Exam"
        message={`Delete "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </div>
  )
}
