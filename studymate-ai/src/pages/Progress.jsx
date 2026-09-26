import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProgressBar from '../components/ui/ProgressBar'
import EmptyState from '../components/ui/EmptyState'
import './Progress.css'

// Simple SVG donut chart — no external dependency
function DonutChart({ value, size = 120, stroke = 14, color = 'var(--accent)', bg = 'var(--bg-tertiary)', label }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, value))
  const dash = (pct / 100) * circ
  const cx = size / 2
  return (
    <div className="donut-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${pct}% progress`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ transition: 'stroke-dasharray .5s ease' }}
        />
      </svg>
      <div className="donut-center">
        <span className="donut-pct">{pct}%</span>
        {label && <span className="donut-label">{label}</span>}
      </div>
    </div>
  )
}

// Mini bar chart — pure CSS/SVG, no library
function MiniBarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="mini-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="mini-bar-col">
          <div className="mini-bar-track">
            <div
              className="mini-bar-fill"
              style={{ height: `${(d.value / max) * 100}%`, background: color || 'var(--accent)' }}
            />
          </div>
          <span className="mini-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function Progress() {
  const navigate = useNavigate()
  const { subjects, assignments, sessions, getSubjectProgress } = useApp()

  const totalAssignments  = assignments.length
  const doneAssignments   = assignments.filter(a => a.status === 'completed').length
  const totalSessions     = sessions.length
  const doneSessions      = sessions.filter(s => s.completed).length
  const totalStudyMins    = sessions.filter(s => s.completed).reduce((sum, s) => sum + Number(s.duration), 0)
  const overallPct        = totalAssignments + totalSessions > 0
    ? Math.round(((doneAssignments + doneSessions) / (totalAssignments + totalSessions)) * 100)
    : 0

  // Sessions per day over last 7 days (for bar chart)
  const last7 = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - 6 + i)
      const dateStr = d.toISOString().split('T')[0]
      const mins = sessions
        .filter(s => s.date === dateStr && s.completed)
        .reduce((sum, s) => sum + Number(s.duration), 0)
      return {
        label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2),
        value: Math.round(mins / 60 * 10) / 10,
        date: dateStr,
      }
    })
  }, [sessions])

  // Assignments by priority
  const byPriority = useMemo(() => {
    const done   = { high: 0, medium: 0, low: 0 }
    const total  = { high: 0, medium: 0, low: 0 }
    assignments.forEach(a => {
      total[a.priority] = (total[a.priority] || 0) + 1
      if (a.status === 'completed') done[a.priority] = (done[a.priority] || 0) + 1
    })
    return [
      { priority: 'High',   done: done.high,   total: total.high,   color: 'var(--danger)' },
      { priority: 'Medium', done: done.medium, total: total.medium, color: 'var(--warning)' },
      { priority: 'Low',    done: done.low,    total: total.low,    color: 'var(--success)' },
    ]
  }, [assignments])

  // Recent completed assignments
  const recentDoneAssignments = useMemo(() =>
    assignments.filter(a => a.status === 'completed').slice(-5).reverse(),
    [assignments]
  )

  // Recent completed sessions
  const recentDoneSessions = useMemo(() =>
    sessions.filter(s => s.completed).slice(-5).reverse(),
    [sessions]
  )

  if (subjects.length === 0 && assignments.length === 0 && sessions.length === 0) {
    return (
      <EmptyState icon="📊" title="No data yet"
        description="Start adding subjects, assignments, and study sessions to track your progress."
        action={<button className="btn btn-primary" onClick={() => navigate('/subjects')}>Add Subjects</button>}
      />
    )
  }

  return (
    <div className="progress-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Progress</h2>
          <p className="page-subtitle">Your academic achievements at a glance</p>
        </div>
      </div>

      {/* Overall summary row */}
      <div className="prog-summary-row">
        {/* Donut: overall */}
        <div className="card prog-donut-card">
          <DonutChart value={overallPct} size={130} color="var(--accent)" label="Overall" />
          <div className="prog-donut-info">
            <h3 className="prog-donut-title">Overall Progress</h3>
            <p className="prog-donut-sub">{doneAssignments + doneSessions} of {totalAssignments + totalSessions} tasks completed</p>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ProgressBar value={totalAssignments > 0 ? Math.round((doneAssignments/totalAssignments)*100) : 0} label="Assignments" height={7} />
              <ProgressBar value={totalSessions > 0 ? Math.round((doneSessions/totalSessions)*100) : 0} label="Study Sessions" height={7} color="var(--success)" />
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="prog-stats-grid">
          {[
            { icon: '✅', label: 'Assignments Done', value: doneAssignments, total: totalAssignments, color: '#22c55e' },
            { icon: '⏱️',  label: 'Sessions Done',   value: doneSessions,   total: totalSessions,   color: '#6366f1' },
            { icon: '🕐', label: 'Hours Studied',    value: `${Math.round(totalStudyMins / 60 * 10) / 10}h`, total: null, color: '#f59e0b' },
            { icon: '📚', label: 'Subjects',          value: subjects.length, total: null,           color: '#3b82f6' },
          ].map(s => (
            <div key={s.label} className="card prog-stat-card">
              <div className="prog-stat-icon" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
              <div>
                <p className="prog-stat-val">{s.value}</p>
                <p className="prog-stat-label">{s.label}</p>
                {s.total !== null && <p className="prog-stat-sub">of {s.total}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study activity chart */}
      <div className="card prog-chart-card">
        <h3 className="prog-section-title">Study Activity — Last 7 Days</h3>
        <p className="prog-section-sub">Hours studied per day (completed sessions only)</p>
        {last7.every(d => d.value === 0) ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '16px 0' }}>No completed study sessions in the last 7 days.</p>
        ) : (
          <MiniBarChart data={last7} color="var(--accent)" />
        )}
      </div>

      {/* Subject-by-subject breakdown */}
      <div className="card prog-subjects-card">
        <h3 className="prog-section-title">Subject Breakdown</h3>
        {subjects.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No subjects yet.</p>
        ) : (
          <div className="prog-subject-list">
            {subjects.map(sub => {
              const prog = getSubjectProgress(sub.id)
              return (
                <div key={sub.id} className="prog-subject-row">
                  <div className="prog-subject-left">
                    <span className="prog-subject-icon" style={{ color: sub.color }}>{sub.icon}</span>
                    <div>
                      <p className="prog-subject-name">{sub.name}</p>
                      <p className="prog-subject-detail">
                        {prog.completedAssignments}/{prog.totalAssignments} assignments ·{' '}
                        {prog.completedSessions}/{prog.totalSessions} sessions ·{' '}
                        {Math.round(prog.totalMinutes / 60 * 10) / 10}h studied
                      </p>
                    </div>
                  </div>
                  <div className="prog-subject-bar">
                    <span className="prog-subject-pct" style={{ color: sub.color }}>{prog.percentage}%</span>
                    <ProgressBar value={prog.percentage} color={sub.color} height={8} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Priority breakdown */}
      <div className="card prog-priority-card">
        <h3 className="prog-section-title">Assignments by Priority</h3>
        <div className="prog-priority-list">
          {byPriority.map(p => (
            <div key={p.priority} className="prog-priority-row">
              <span className="prog-priority-label" style={{ color: p.color }}>● {p.priority}</span>
              <div className="prog-priority-bar-wrap">
                <ProgressBar value={p.total > 0 ? Math.round((p.done/p.total)*100) : 0} color={p.color} height={10} />
              </div>
              <span className="prog-priority-count">{p.done}/{p.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent completions */}
      <div className="prog-recent-row">
        <div className="card prog-recent-card">
          <h3 className="prog-section-title">Recent Completed Assignments</h3>
          {recentDoneAssignments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No completed assignments yet.</p>
          ) : (
            <ul className="prog-recent-list">
              {recentDoneAssignments.map(a => {
                const sub = subjects.find(s => s.id === a.subjectId)
                return (
                  <li key={a.id} className="prog-recent-item">
                    <span className="prog-recent-check" style={{ background: 'var(--success)' }}>✓</span>
                    <div className="prog-recent-body">
                      <p className="prog-recent-title">{a.title}</p>
                      {sub && <span className="chip" style={{ color: sub.color, borderColor: sub.color + '44', fontSize: 11 }}>{sub.icon} {sub.name}</span>}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="card prog-recent-card">
          <h3 className="prog-section-title">Recent Study Sessions</h3>
          {recentDoneSessions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No completed sessions yet.</p>
          ) : (
            <ul className="prog-recent-list">
              {recentDoneSessions.map(s => {
                const sub = subjects.find(sub => sub.id === s.subjectId)
                return (
                  <li key={s.id} className="prog-recent-item">
                    <span className="prog-recent-check" style={{ background: sub?.color || 'var(--accent)' }}>⏱</span>
                    <div className="prog-recent-body">
                      <p className="prog-recent-title">{sub?.icon} {sub?.name || 'Session'}</p>
                      <p className="prog-recent-meta">{s.date} · {s.duration}min</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
