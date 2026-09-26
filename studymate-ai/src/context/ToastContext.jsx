import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

let _id = 0
const nextId = () => ++_id

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback(({ message, type = 'success', duration = 3200 }) => {
    const id = nextId()
    setToasts(prev => [...prev, { id, message, type }])
    timers.current[id] = setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])

  const success = useCallback((msg, opts) => toast({ message: msg, type: 'success', ...opts }), [toast])
  const error   = useCallback((msg, opts) => toast({ message: msg, type: 'error',   ...opts }), [toast])
  const info    = useCallback((msg, opts) => toast({ message: msg, type: 'info',    ...opts }), [toast])
  const warning = useCallback((msg, opts) => toast({ message: msg, type: 'warning', ...opts }), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning, dismiss }}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

// ── Toaster UI ────────────────────────────────────────────────────────────────

const ICONS = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' }

function Toaster({ toasts, onDismiss }) {
  if (!toasts.length) return null
  return (
    <div className="toaster" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`} role="alert">
          <span className="toast-icon" aria-hidden="true">{ICONS[t.type]}</span>
          <p className="toast-msg">{t.message}</p>
          <button
            className="toast-close"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
          >✕</button>
        </div>
      ))}
    </div>
  )
}
