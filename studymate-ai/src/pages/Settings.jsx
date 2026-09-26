import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import './Settings.css'

export default function Settings() {
  const {
    studentName, setStudentName,
    settings, updateSettings,
    clearAllData, resetDemoData,
  } = useApp()
  const { success, warning } = useToast()

  const [nameInput,  setNameInput]  = useState(studentName)
  const [emailInput, setEmailInput] = useState(settings.email ?? '')
  const [nameError,  setNameError]  = useState('')
  const [emailError, setEmailError] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // ── Profile save ──────────────────────────────────────────────────────────
  const handleSaveProfile = (e) => {
    e.preventDefault()
    let valid = true
    if (!nameInput.trim()) { setNameError('Name is required'); valid = false }
    else setNameError('')

    const emailTrimmed = emailInput.trim()
    if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setEmailError('Enter a valid email address')
      valid = false
    } else setEmailError('')

    if (!valid) return
    setStudentName(nameInput.trim())
    updateSettings({ email: emailTrimmed })
    success('Profile saved successfully')
  }

  // ── Clear all data ────────────────────────────────────────────────────────
  const handleClearAll = () => {
    clearAllData()
    setShowClearConfirm(false)
    warning('All data cleared — the app has been reset')
  }

  // ── Reset demo data ───────────────────────────────────────────────────────
  const handleResetDemo = () => {
    resetDemoData()
    setShowResetConfirm(false)
    success('Demo data restored')
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Manage your profile and app preferences</p>
        </div>
      </div>

      <div className="settings-grid">

        {/* ── Profile ─────────────────────────────────────────────── */}
        <section className="card settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">👤</span>
            <div>
              <h3 className="settings-section-title">Profile</h3>
              <p className="settings-section-sub">Your name appears on the dashboard and sidebar</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} noValidate className="settings-form">
            <div className="form-group">
              <label className="form-label" htmlFor="st-name">Student Name *</label>
              <input
                id="st-name"
                className="form-input"
                value={nameInput}
                onChange={e => { setNameInput(e.target.value); setNameError('') }}
                placeholder="Your full name"
                maxLength={60}
              />
              {nameError && <p className="form-error">{nameError}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="st-email">Email Address</label>
              <input
                id="st-email"
                className="form-input"
                type="email"
                value={emailInput}
                onChange={e => { setEmailInput(e.target.value); setEmailError('') }}
                placeholder="you@university.edu"
                maxLength={120}
              />
              {emailError && <p className="form-error">{emailError}</p>}
              <p className="settings-hint">Used for display only — no emails are sent</p>
            </div>

            <button type="submit" className="btn btn-primary">Save Profile</button>
          </form>
        </section>

        {/* ── Appearance section removed — Dark Mode is the only theme ── */}

        {/* ── Notifications ────────────────────────────────────────── */}
        <section className="card settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">🔔</span>
            <div>
              <h3 className="settings-section-title">Notifications</h3>
              <p className="settings-section-sub">Control in-app notification behaviour</p>
            </div>
          </div>

          <label className="settings-toggle-row">
            <div>
              <p className="settings-toggle-label">Toast notifications</p>
              <p className="settings-hint">Show success / error messages for actions</p>
            </div>
            <button
              role="switch"
              aria-checked={settings.notificationsEnabled}
              className={`toggle-switch${settings.notificationsEnabled ? ' toggle-switch--on' : ''}`}
              onClick={() => {
                const next = !settings.notificationsEnabled
                updateSettings({ notificationsEnabled: next })
                success(next ? 'Notifications enabled' : 'Notifications disabled')
              }}
              aria-label="Toggle notifications"
            >
              <span className="toggle-thumb" />
            </button>
          </label>
        </section>

        {/* ── App info ─────────────────────────────────────────────── */}
        <section className="card settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">ℹ️</span>
            <div>
              <h3 className="settings-section-title">About StudyMate AI</h3>
              <p className="settings-section-sub">Application information</p>
            </div>
          </div>

          <dl className="settings-info-list">
            <div className="settings-info-row">
              <dt>Version</dt>
              <dd>1.0.0</dd>
            </div>
            <div className="settings-info-row">
              <dt>Hackathon</dt>
              <dd>AWS Hackathon 2026</dd>
            </div>
            <div className="settings-info-row">
              <dt>Category</dt>
              <dd>#daily-life-enhancement</dd>
            </div>
            <div className="settings-info-row">
              <dt>Lane</dt>
              <dd>#community</dd>
            </div>
            <div className="settings-info-row">
              <dt>Data storage</dt>
              <dd>Browser localStorage (offline-first)</dd>
            </div>
            <div className="settings-info-row">
              <dt>AI Assistant</dt>
              <dd>Local demo — no external API</dd>
            </div>
          </dl>
        </section>

        {/* ── Data management ──────────────────────────────────────── */}
        <section className="card settings-section settings-section--danger">
          <div className="settings-section-header">
            <span className="settings-section-icon">🗄️</span>
            <div>
              <h3 className="settings-section-title">Data Management</h3>
              <p className="settings-section-sub">Manage your stored application data</p>
            </div>
          </div>

          <div className="settings-data-actions">
            <div className="settings-data-row">
              <div>
                <p className="settings-toggle-label">Reset demo data</p>
                <p className="settings-hint">Restore the original sample subjects, assignments, notes, exams and sessions</p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setShowResetConfirm(true)}
              >
                🔄 Reset Demo Data
              </button>
            </div>

            <div className="settings-divider" />

            <div className="settings-data-row">
              <div>
                <p className="settings-toggle-label settings-toggle-label--danger">Clear all data</p>
                <p className="settings-hint">Permanently delete all subjects, assignments, notes, exams, sessions and chat history</p>
              </div>
              <button
                className="btn btn-danger"
                onClick={() => setShowClearConfirm(true)}
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Confirm: clear all */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAll}
        title="Clear All Data"
        message="This will permanently delete ALL your subjects, assignments, notes, exams, study sessions, and chat history. This action cannot be undone."
        confirmLabel="Yes, Clear Everything"
        confirmClass="btn-danger"
      />

      {/* Confirm: reset demo */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetDemo}
        title="Reset Demo Data"
        message="This will restore the original sample data. Your existing data will NOT be deleted — demo items will be added alongside it."
        confirmLabel="Restore Demo Data"
        confirmClass="btn-primary"
      />
    </div>
  )
}
