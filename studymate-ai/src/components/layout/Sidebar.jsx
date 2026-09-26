import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import './Sidebar.css'

const NAV_ITEMS = [
  { path: '/',           label: 'Dashboard',      icon: '🏠' },
  { path: '/subjects',   label: 'Subjects',        icon: '📚' },
  { path: '/assignments',label: 'Assignments',     icon: '📝' },
  { path: '/notes',      label: 'Notes',           icon: '🗒️'  },
  { path: '/exams',      label: 'Exam Schedule',   icon: '📅' },
  { path: '/planner',    label: 'Study Planner',   icon: '⏱️'  },
  { path: '/progress',   label: 'Progress',        icon: '📊' },
  { path: '/assistant',  label: 'AI Assistant',    icon: '🤖' },
  { path: '/settings',   label: 'Settings',        icon: '⚙️'  },
]

export default function Sidebar({ open, onClose }) {
  const { studentName, subjects, assignments, exams } = useApp()
  const location = useLocation()

  const pendingAssignments = assignments.filter(a => a.status === 'pending').length
  const today = new Date().toISOString().split('T')[0]
  const upcomingExams = exams.filter(e => e.date >= today).length

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}

      <aside className={`sidebar${open ? ' sidebar--open' : ''}`} aria-label="Main navigation">
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">📚</span>
          <div>
            <span className="sidebar-logo-name">StudyMate</span>
            <span className="sidebar-logo-ai"> AI</span>
          </div>
          <button className="sidebar-close btn btn-ghost btn-icon" onClick={onClose} aria-label="Close sidebar">✕</button>
        </div>

        {/* Student info */}
        <div className="sidebar-student">
          <div className="sidebar-avatar" aria-hidden="true">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-student-info">
            <p className="sidebar-student-name">{studentName}</p>
            <p className="sidebar-student-role">College Student</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="sidebar-stats">
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{subjects.length}</span>
            <span className="sidebar-stat-label">Subjects</span>
          </div>
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{pendingAssignments}</span>
            <span className="sidebar-stat-label">Pending</span>
          </div>
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{upcomingExams}</span>
            <span className="sidebar-stat-label">Exams</span>
          </div>
        </div>

        <div className="sidebar-divider" />

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="sidebar-nav-section-label">MAIN MENU</p>
          <ul role="list">
            {NAV_ITEMS.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `sidebar-nav-link${isActive ? ' active' : ''}`}
                  onClick={onClose}
                >
                  <span className="sidebar-nav-icon" aria-hidden="true">{item.icon}</span>
                  <span className="sidebar-nav-label">{item.label}</span>
                  {item.path === '/assignments' && pendingAssignments > 0 && (
                    <span className="sidebar-badge" aria-label={`${pendingAssignments} pending`}>{pendingAssignments}</span>
                  )}
                  {item.path === '/exams' && upcomingExams > 0 && (
                    <span className="sidebar-badge" aria-label={`${upcomingExams} upcoming`}>{upcomingExams}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <p className="sidebar-footer-text">StudyMate AI v1.0</p>
          <p className="sidebar-footer-sub">AWS Hackathon 2026</p>
        </div>
      </aside>
    </>
  )
}
