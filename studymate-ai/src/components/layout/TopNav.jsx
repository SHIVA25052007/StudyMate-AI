import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import './TopNav.css'

const PAGE_TITLES = {
  '/':           { title: 'Dashboard',     subtitle: 'Your study overview' },
  '/subjects':   { title: 'Subjects',      subtitle: 'Manage your courses' },
  '/assignments':{ title: 'Assignments',   subtitle: 'Track your tasks' },
  '/notes':      { title: 'Notes',         subtitle: 'Your study notes' },
  '/exams':      { title: 'Exam Schedule', subtitle: 'Upcoming exams' },
  '/planner':    { title: 'Study Planner', subtitle: 'Plan your study sessions' },
  '/progress':   { title: 'Progress',      subtitle: 'Track your achievements' },
  '/assistant':  { title: 'AI Assistant',  subtitle: 'Your smart study companion' },
  '/settings':   { title: 'Settings',      subtitle: 'Manage your profile and preferences' },
}

export default function TopNav({ onMenuClick }) {
  const { studentName, setStudentName } = useApp()
  const location = useLocation()
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(studentName)

  const page = PAGE_TITLES[location.pathname] || { title: 'StudyMate AI', subtitle: '' }

  const handleNameSave = (e) => {
    e.preventDefault()
    const trimmed = nameInput.trim()
    if (trimmed) { setStudentName(trimmed); setEditingName(false) }
  }

  return (
    <header className="topnav" role="banner">
      {/* Left: hamburger + page title */}
      <div className="topnav-left">
        <button
          className="topnav-menu-btn btn btn-ghost btn-icon"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <span className="topnav-hamburger" aria-hidden="true">
            <span /><span /><span />
          </span>
        </button>

        <div className="topnav-page-info">
          <h1 className="topnav-page-title">{page.title}</h1>
          <p className="topnav-page-subtitle">{page.subtitle}</p>
        </div>
      </div>

      {/* Right: name edit + theme toggle */}
      <div className="topnav-right">
        {editingName ? (
          <form onSubmit={handleNameSave} className="topnav-name-form">
            <input
              className="form-input topnav-name-input"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              autoFocus
              maxLength={40}
              aria-label="Edit your name"
            />
            <button type="submit" className="btn btn-primary btn-sm">Save</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditingName(false); setNameInput(studentName) }}>Cancel</button>
          </form>
        ) : (
          <button
            className="topnav-name-btn btn btn-ghost"
            onClick={() => setEditingName(true)}
            title="Click to edit your name"
          >
            <span className="topnav-avatar" aria-hidden="true">{studentName.charAt(0).toUpperCase()}</span>
            <span className="topnav-name-text">{studentName}</span>
            <span className="topnav-edit-icon" aria-hidden="true">✏️</span>
          </button>
        )}

      </div>
    </header>
  )
}
