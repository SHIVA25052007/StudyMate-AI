import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { formatDuration, formatDateShort } from '../utils/helpers'
import './Planner.css'

const EMPTY_FORM = {
  subjectId: '', date: '', startTime: '09:00',
  duration: 60, topic: '', notes: '',
}

function timeToMinutes(t) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

// ── Form ────────────────────────────────────────────────────────────────────
function SessionForm({ initial = EMPTY_FORM, onSave, onCancel, subjects }) {
  const [form,   setForm]   = useState({ ...EMPTY_FORM, ...initial, duration: String(initial.duration ?? 60) })
  const [errors, setErrors] = useState({})

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.subjectId) errs.subjectId = 'Please select a subject'
    if (!form.date)      errs.date      = 'Date is required'
    if (!form.duration || isNaN(form.duration) || Number(form.duration) < 5)
      errs.duration = 'Duration must be at least 5 minutes'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      ...form,
      duration: Number(form.duration),
      topic:    (form.topic ?? '').trim(),
      notes:    (form.notes ?? '').trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="pl-subject">Subject *</label>
        <select
          id="pl-subject" className="form-select" value={form.subjectId}
          onChange={e => set('subjectId', e.target.value)}
        >
          <option value="">— Select subject —</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
          ))}
        </select>
        {errors.subjectId && <p className="form-error">{errors.subjectId}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="pl-topic">Topic</label>
        <input
          id="pl-topic" className="form-input" value={form.topic ?? ''}
          onChange={e => set('topic', e.target.value)}
          placeholder="e.g. Integration by parts, Binary Trees…" maxLength={120}
        />
      </div>

      <div className="pl-row-3">
        <div className="form-group">
          <label className="form-label" htmlFor="pl-date">Date *</label>
          <input
            id="pl-date" className="form-input" type="date" value={form.date}
            onChange={e => set('date', e.target.value)}
          />
          {errors.date && <p className="form-error">{errors.date}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="pl-time">Start Time</label>
          <input
            id="pl-time" className="form-input" type="time" value={form.startTime}
            onChange={e => set('startTime', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="pl-dur">Duration (min) *</label>
          <input
            id="pl-dur" className="form-input" type="number"
            min="5" max="480" value={form.duration}
            onChange={e => set('duration', e.target.value)}
            placeholder="60"
          />
          {errors.duration && <p className="form-error">{errors.duration}</p>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="pl-notes">Notes</label>
        <textarea
          id="pl-notes" className="form-textarea" value={form.notes ?? ''}
          onChange={e => set('notes', e.target.value)}
          placeholder="Any extra details…" rows={2}
          style={{ minHeight: 60 }}
        />
      </div>

      <div className="modal-footer" style={{ padding: 0, marginTop: 8, borderTop: 'none' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save Session</button>
      </div>
    </form>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function Planner() {
  const { sessions, subjects, addSession, updateSession, deleteSession, toggleSession, getSubjectById } = useApp()
  const { success } = useToast()

  const [showAdd,      setShowAdd]      = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewDate,     setViewDate]     = useState(new Date().toISOString().split('T')[0])
  const [filterSubject, setFilterSubject] = useState('all')

  const today = new Date().toISOString().split('T')[0]

  // 7-day strip centred on viewDate
  const dates = useMemo(() => {
    const d = new Date(viewDate + 'T00:00:00')
    return Array.from({ length: 7 }, (_, i) => {
      const dt = new Date(d)
      dt.setDate(dt.getDate() - 3 + i)
      return dt.toISOString().split('T')[0]
    })
  }, [viewDate])

  // Group all sessions by date
  const sessionsByDate = useMemo(() => {
    const map = {}
    sessions.forEach(s => {
      if (!map[s.date]) map[s.date] = []
      map[s.date].push(s)
    })
    Object.values(map).forEach(arr =>
      arr.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
    )
    return map
  }, [sessions])

  // Sessions for the selected day, optionally filtered by subject
  const daySessions = useMemo(() => {
    const raw = sessionsByDate[viewDate] || []
    if (filterSubject === 'all') return raw
    return raw.filter(s => s.subjectId === filterSubject)
  }, [sessionsByDate, viewDate, filterSubject])

  const totalMinutes = sessions.filter(s => s.completed).reduce((sum, s) => sum + Number(s.duration), 0)

  const handleAdd    = (data) => { addSession(data);                    setShowAdd(false);    success('Session added') }
  const handleEdit   = (data) => { updateSession(editTarget.id, data);  setEditTarget(null);  success('Session updated') }
  const handleDelete = ()     => { deleteSession(deleteTarget.id);      setDeleteTarget(null);success('Session deleted') }

  const changeDate = (delta) => {
    const d = new Date(viewDate + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    setViewDate(d.toISOString().split('T')[0])
  }

  return (
    <div className="planner-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Study Planner</h2>
          <p className="page-subtitle">
            {sessions.length} sessions · {Math.round(totalMinutes / 60 * 10) / 10}h studied
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Session</button>
      </div>

      {/* Week strip */}
      <div className="pl-week-strip card">
        <button
          className="btn btn-ghost btn-icon pl-nav"
          onClick={() => changeDate(-1)}
          aria-label="Previous day"
        >‹</button>
        <div className="pl-days">
          {dates.map(d => {
            const daySess  = sessionsByDate[d] || []
            const isToday  = d === today
            const isSel    = d === viewDate
            const dayLabel = new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })
            const dayNum   = new Date(d + 'T00:00:00').getDate()
            return (
              <button
                key={d}
                className={`pl-day-btn${isSel ? ' selected' : ''}${isToday ? ' today' : ''}`}
                onClick={() => setViewDate(d)}
                aria-label={`${dayLabel} ${dayNum}${daySess.length ? `, ${daySess.length} session(s)` : ''}`}
              >
                <span className="pl-day-name">{dayLabel}</span>
                <span className="pl-day-num">{dayNum}</span>
                {daySess.length > 0 && <span className="pl-day-dot" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
        <button
          className="btn btn-ghost btn-icon pl-nav"
          onClick={() => changeDate(1)}
          aria-label="Next day"
        >›</button>
      </div>

      {/* Day header + subject filter */}
      <div className="pl-day-header">
        <h3>
          {viewDate === today ? 'Today' : formatDateShort(viewDate)}
          {' — '}
          {daySessions.length} session{daySessions.length !== 1 ? 's' : ''}
        </h3>
        <div className="pl-day-header-right">
          <select
            className="form-select pl-subject-filter"
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
            aria-label="Filter sessions by subject"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
            ))}
          </select>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setViewDate(today)}
          >
            Go to today
          </button>
        </div>
      </div>

      {/* Sessions for the day */}
      {daySessions.length === 0 ? (
        <EmptyState
          icon="⏱️"
          title="No sessions for this day"
          description="Plan a study session to stay on track."
          action={
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              Add Session
            </button>
          }
        />
      ) : (
        <div className="pl-session-list">
          {daySessions.map(s => {
            const sub = getSubjectById(s.subjectId)
            return (
              <div
                key={s.id}
                className={`pl-session card${s.completed ? ' pl-done' : ''}`}
              >
                {/* Colour bar */}
                <div
                  className="pl-session-bar"
                  style={{ background: sub?.color || 'var(--accent)' }}
                />

                {/* Time */}
                <div className="pl-session-time">
                  <span className="pl-session-start">{s.startTime}</span>
                  <span className="pl-session-dur">{formatDuration(Number(s.duration))}</span>
                </div>

                {/* Body */}
                <div className="pl-session-body">
                  <div
                    className="pl-session-subj"
                    style={{ color: sub?.color || 'var(--accent)' }}
                  >
                    <span>{sub?.icon || '📚'}</span>
                    <span>{sub?.name || 'Unknown Subject'}</span>
                  </div>
                  {s.topic && <p className="pl-session-topic">{s.topic}</p>}
                  {s.notes && <p className="pl-session-notes">{s.notes}</p>}
                </div>

                {/* Actions */}
                <div className="pl-session-actions">
                  <button
                    className={`btn btn-sm${s.completed ? ' btn-secondary' : ' btn-primary'}`}
                    onClick={() => { toggleSession(s.id); success(s.completed ? 'Session marked incomplete' : 'Session completed!') }}
                    aria-label={s.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {s.completed ? '↩ Undo' : '✓ Done'}
                  </button>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => setEditTarget(s)}
                    aria-label="Edit session"
                  >✏️</button>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => setDeleteTarget(s)}
                    aria-label="Delete session"
                  >🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Upcoming sessions preview */}
      {sessions.filter(s => s.date > viewDate && !s.completed).length > 0 && (
        <section className="card pl-upcoming-section">
          <h4 className="pl-upcoming-title">Upcoming Sessions</h4>
          <div className="pl-upcoming-list">
            {sessions
              .filter(s => s.date > viewDate && !s.completed)
              .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
              .slice(0, 8)
              .map(s => {
                const sub = getSubjectById(s.subjectId)
                return (
                  <div key={s.id} className="pl-upcoming-item">
                    <div
                      className="pl-upcoming-dot"
                      style={{ background: sub?.color || 'var(--accent)' }}
                    />
                    <span className="pl-upcoming-date">{formatDateShort(s.date)}</span>
                    <span className="pl-upcoming-name">{sub?.icon} {sub?.name}</span>
                    <span className="pl-upcoming-info">
                      {s.startTime} · {formatDuration(Number(s.duration))}
                      {s.topic && ` · ${s.topic}`}
                    </span>
                  </div>
                )
              })}
          </div>
        </section>
      )}

      {/* Modals */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Study Session">
        <SessionForm
          subjects={subjects}
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
          initial={{ ...EMPTY_FORM, date: viewDate }}
        />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Study Session">
        {editTarget && (
          <SessionForm
            subjects={subjects}
            initial={{
              subjectId:  editTarget.subjectId,
              date:       editTarget.date,
              startTime:  editTarget.startTime,
              duration:   editTarget.duration,
              topic:      editTarget.topic ?? '',
              notes:      editTarget.notes ?? '',
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
        title="Delete Session"
        message="Delete this study session? This action cannot be undone."
      />
    </div>
  )
}
