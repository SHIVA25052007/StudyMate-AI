import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProgressBar from '../components/ui/ProgressBar'
import { daysUntil, formatDate, getDayLabel, getPriorityColor } from '../utils/helpers'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    studentName, subjects, assignments, exams, sessions, notes,
    toggleAssignmentStatus, getSubjectById, getSubjectProgress,
  } = useApp()

  const today    = new Date().toISOString().split('T')[0]
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  // ── Derived data ──────────────────────────────────────────────────────────
  const todaySessions = useMemo(() =>
    sessions.filter(s => s.date === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [sessions, today])

  const activeAssignments = useMemo(() =>
    assignments
      .filter(a => a.status !== 'completed')
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
      .slice(0, 5),
    [assignments])

  const upcomingExams = useMemo(() =>
    exams
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4),
    [exams, today])

  const recentNotes = useMemo(() =>
    [...notes]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 4),
    [notes])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalAssignments    = assignments.length
  const completedAssignments = assignments.filter(a => a.status === 'completed').length
  const pendingAssignments   = assignments.filter(a => a.status === 'pending').length
  const totalSessions        = sessions.length
  const completedSessions    = sessions.filter(s => s.completed).length
  const studyMinutes         = sessions.filter(s => s.completed).reduce((sum, s) => sum + Number(s.duration), 0)
  const overallProgress      = totalAssignments + totalSessions > 0
    ? Math.round(((completedAssignments + completedSessions) / (totalAssignments + totalSessions)) * 100)
    : 0

  const QUICK_ACTIONS = [
    { label: 'Add Subject',    icon: '📚', path: '/subjects',    color: '#6366f1' },
    { label: 'Add Assignment', icon: '📝', path: '/assignments', color: '#22c55e' },
    { label: 'Create Note',    icon: '🗒️',  path: '/notes',      color: '#f59e0b' },
    { label: 'Schedule Study', icon: '⏱️',  path: '/planner',    color: '#3b82f6' },
    { label: 'AI Assistant',   icon: '🤖', path: '/assistant',  color: '#a855f7' },
    { label: 'View Progress',  icon: '📊', path: '/progress',   color: '#ef4444' },
  ]

  return (
    <div className="dashboard">

      {/* ── Welcome banner ────────────────────────────────────── */}
      <div className="dashboard-welcome card">
        <div className="dashboard-welcome-text">
          <p className="dashboard-date">{todayStr}</p>
          <h2 className="dashboard-greeting">Welcome back, {studentName}! 👋</h2>
          <p className="dashboard-tagline">
            You have <strong>{pendingAssignments}</strong> pending assignment{pendingAssignments !== 1 ? 's' : ''}{' '}
            and <strong>{upcomingExams.length}</strong> upcoming exam{upcomingExams.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <div className="dashboard-welcome-stats">
          <div className="dash-stat-pill">
            <span className="dash-stat-pill-num">{overallProgress}%</span>
            <span className="dash-stat-pill-label">Overall Progress</span>
            <ProgressBar value={overallProgress} height={6} />
          </div>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────── */}
      <div className="dashboard-stats-row">
        {[
          { icon: '📚', label: 'Subjects',     value: subjects.length,       sub: 'enrolled',                          color: '#6366f1' },
          { icon: '📝', label: 'Assignments',  value: completedAssignments,  sub: `of ${totalAssignments} completed`,  color: '#22c55e' },
          { icon: '⏱️',  label: 'Study Hours',  value: `${Math.round(studyMinutes / 60 * 10) / 10}h`, sub: `${completedSessions} sessions done`, color: '#f59e0b' },
          { icon: '📅', label: 'Exams',        value: upcomingExams.length,  sub: 'upcoming',                          color: '#ef4444' },
        ].map(stat => (
          <div className="dash-stat-card card" key={stat.label}>
            <div className="dash-stat-icon" style={{ background: stat.color + '20', color: stat.color }}>
              {stat.icon}
            </div>
            <div className="dash-stat-body">
              <p className="dash-stat-value">{stat.value}</p>
              <p className="dash-stat-label">{stat.label}</p>
              <p className="dash-stat-sub">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main 2-column grid ───────────────────────────────── */}
      <div className="dashboard-grid">

        {/* Left column */}
        <div className="dashboard-col">

          {/* Today's sessions */}
          <section className="card dashboard-section">
            <div className="dashboard-section-header">
              <h3>Today's Study Schedule</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/planner')}>View all →</button>
            </div>
            {todaySessions.length === 0 ? (
              <div className="dash-empty">
                <span>⏱️</span>
                <p>No sessions planned for today.</p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/planner')}>
                  Plan a Session
                </button>
              </div>
            ) : (
              <ul className="dash-session-list">
                {todaySessions.map(s => {
                  const sub = getSubjectById(s.subjectId)
                  return (
                    <li key={s.id} className={`dash-session-item${s.completed ? ' completed' : ''}`}>
                      <div className="dash-session-time">{s.startTime}</div>
                      <div className="dash-session-dot" style={{ background: sub?.color || 'var(--accent)' }} />
                      <div className="dash-session-body">
                        <p className="dash-session-subject">{sub?.name || 'Unknown'}</p>
                        <p className="dash-session-duration">
                          {s.duration} min
                          {s.topic ? ` · ${s.topic}` : s.notes ? ` · ${s.notes}` : ''}
                        </p>
                      </div>
                      {s.completed && <span className="badge badge-success">✓ Done</span>}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Subject progress */}
          <section className="card dashboard-section">
            <div className="dashboard-section-header">
              <h3>Subject Progress</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/subjects')}>Manage →</button>
            </div>
            {subjects.length === 0 ? (
              <div className="dash-empty">
                <span>📚</span>
                <p>No subjects added yet.</p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/subjects')}>
                  Add Subject
                </button>
              </div>
            ) : (
              <ul className="dash-progress-list">
                {subjects.map(sub => {
                  const prog = getSubjectProgress(sub.id)
                  return (
                    <li key={sub.id} className="dash-progress-item">
                      <div className="dash-progress-header">
                        <span style={{ color: sub.color }} className="dash-progress-icon">{sub.icon}</span>
                        <span className="dash-progress-name">{sub.name}</span>
                        <span className="dash-progress-pct">{prog.percentage}%</span>
                      </div>
                      <ProgressBar value={prog.percentage} color={sub.color} height={6} />
                      <p className="dash-progress-detail">
                        {prog.completedAssignments}/{prog.totalAssignments} assignments ·{' '}
                        {prog.completedSessions}/{prog.totalSessions} sessions
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Recent Notes */}
          <section className="card dashboard-section">
            <div className="dashboard-section-header">
              <h3>Recent Notes</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/notes')}>View all →</button>
            </div>
            {recentNotes.length === 0 ? (
              <div className="dash-empty">
                <span>🗒️</span>
                <p>No notes yet.</p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/notes')}>
                  Create Note
                </button>
              </div>
            ) : (
              <ul className="dash-notes-list">
                {recentNotes.map(n => {
                  const sub = getSubjectById(n.subjectId)
                  return (
                    <li
                      key={n.id}
                      className="dash-note-item"
                      onClick={() => navigate('/notes')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && navigate('/notes')}
                    >
                      {sub && (
                        <div
                          className="dash-note-dot"
                          style={{ background: sub.color }}
                        />
                      )}
                      <div className="dash-note-body">
                        <p className="dash-note-title">{n.title}</p>
                        <p className="dash-note-meta">
                          {sub ? `${sub.icon} ${sub.name}` : 'General'} · {formatDate(n.updatedAt, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="dashboard-col">

          {/* Upcoming assignments */}
          <section className="card dashboard-section">
            <div className="dashboard-section-header">
              <h3>Upcoming Assignments</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/assignments')}>View all →</button>
            </div>
            {activeAssignments.length === 0 ? (
              <div className="dash-empty">
                <span>🎉</span>
                <p>All caught up! No pending assignments.</p>
              </div>
            ) : (
              <ul className="dash-assignment-list">
                {activeAssignments.map(a => {
                  const sub      = getSubjectById(a.subjectId)
                  const diff     = daysUntil(a.dueDate)
                  const isOverdue = diff !== null && diff < 0
                  return (
                    <li key={a.id} className="dash-assignment-item">
                      <button
                        className={`dash-check${a.status === 'completed' ? ' checked' : ''}`}
                        onClick={() => toggleAssignmentStatus(a.id)}
                        aria-label={`Mark "${a.title}" as ${a.status === 'completed' ? 'pending' : 'completed'}`}
                      >
                        {a.status === 'completed' ? '✓' : ''}
                      </button>
                      <div className="dash-assignment-body">
                        <p className="dash-assignment-title">{a.title}</p>
                        <div className="dash-assignment-meta">
                          {sub && (
                            <span
                              className="chip"
                              style={{ color: sub.color, borderColor: sub.color + '44' }}
                            >
                              {sub.icon} {sub.name}
                            </span>
                          )}
                          <span
                            className={`chip${isOverdue ? ' overdue-chip' : ''}`}
                            style={{ color: getPriorityColor(a.priority) }}
                          >
                            {a.priority}
                          </span>
                        </div>
                      </div>
                      <span className={`dash-due-badge${isOverdue ? ' overdue' : diff === 0 ? ' today' : ''}`}>
                        {getDayLabel(diff)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Upcoming exams */}
          <section className="card dashboard-section">
            <div className="dashboard-section-header">
              <h3>Upcoming Exams</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/exams')}>View all →</button>
            </div>
            {upcomingExams.length === 0 ? (
              <div className="dash-empty">
                <span>📅</span>
                <p>No upcoming exams scheduled.</p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/exams')}>
                  Add Exam
                </button>
              </div>
            ) : (
              <ul className="dash-exam-list">
                {upcomingExams.map(e => {
                  const sub  = getSubjectById(e.subjectId)
                  const diff = daysUntil(e.date)
                  return (
                    <li key={e.id} className="dash-exam-item">
                      <div
                        className="dash-exam-countdown"
                        style={{ background: (sub?.color || '#6366f1') + '20', color: sub?.color || '#6366f1' }}
                      >
                        <span className="dash-exam-days">{diff}</span>
                        <span className="dash-exam-days-label">days</span>
                      </div>
                      <div className="dash-exam-body">
                        <p className="dash-exam-title">{e.title || sub?.name || 'Exam'}</p>
                        <p className="dash-exam-meta">
                          {sub?.icon} {sub?.name} · {formatDate(e.date)} at {e.time}
                        </p>
                        {(e.venue || e.location) && (
                          <p className="dash-exam-location">📍 {e.venue || e.location}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* ── AI Assistant promo card ───────────────────────────── */}
      <section className="card dash-ai-card">
        <div className="dash-ai-left">
          <div className="dash-ai-icon-wrap" aria-hidden="true">🤖</div>
          <div className="dash-ai-text">
            <div className="dash-ai-badge">
              <span className="dash-ai-badge-dot" aria-hidden="true" />
              Local Demo · No internet required
            </div>
            <h3 className="dash-ai-title">StudyMate AI Assistant</h3>
            <p className="dash-ai-desc">
              Your built-in study companion. Create study plans, generate quiz questions,
              summarise notes, prepare for exams, and understand tough topics — all offline.
            </p>
            <div className="dash-ai-caps">
              {['📅 Study Plans','❓ Quiz Questions','📝 Note Summaries','🎯 Exam Prep','💻 Programming Help','💡 Explain Topics']
                .map(c => (
                  <span key={c} className="dash-ai-cap-chip">{c}</span>
                ))}
            </div>
          </div>
        </div>
        <div className="dash-ai-right">
          <button
            className="btn dash-ai-btn"
            onClick={() => navigate('/assistant')}
            aria-label="Open AI Study Assistant"
          >
            🤖 Open AI Assistant
          </button>
          <p className="dash-ai-note">Powered by local logic — no external AI API</p>
        </div>
      </section>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <section className="card dashboard-section">
        <div className="dashboard-section-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="dashboard-quick-actions">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.path}
              className="dash-quick-btn"
              onClick={() => navigate(action.path)}
              style={{ '--qa-color': action.color }}
            >
              <span className="dash-quick-icon" aria-hidden="true">{action.icon}</span>
              <span className="dash-quick-label">{action.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
