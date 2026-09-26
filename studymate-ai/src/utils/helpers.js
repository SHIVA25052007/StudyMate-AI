/**
 * StudyMate AI — Shared utility helpers
 * Single source of truth for date helpers, formatters, and colour utilities.
 */

// ── Date helpers ──────────────────────────────────────────────────────────────

/** Returns the number of whole days from today (midnight) to dateStr (YYYY-MM-DD). Negative = past. */
export function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.round((target - today) / 86_400_000)
}

/** Formats a YYYY-MM-DD string to a human-readable date, e.g. "Sep 25, 2026". */
export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return ''
  const defaults = { month: 'short', day: 'numeric', year: 'numeric' }
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { ...defaults, ...opts })
}

/** Formats a YYYY-MM-DD string to abbreviated day + date, e.g. "Fri, Sep 25". */
export function formatDateShort(dateStr) {
  return formatDate(dateStr, { weekday: 'short', month: 'short', day: 'numeric', year: undefined })
}

/** Returns today as YYYY-MM-DD. */
export function todayStr() {
  return new Date().toISOString().split('T')[0]
}

/** Adds n calendar days to a Date object and returns a new Date. */
export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

/** Returns a friendly relative label for a day-diff, e.g. "Today", "Tomorrow", "In 3 days". */
export function getDayLabel(diff) {
  if (diff === null) return ''
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return `In ${diff} days`
}

/** Formats duration in minutes to a human string, e.g. "1h 30m". */
export function formatDuration(minutes) {
  const m = Number(minutes)
  const h = Math.floor(m / 60)
  const rem = m % 60
  if (h === 0) return `${rem}m`
  if (rem === 0) return `${h}h`
  return `${h}h ${rem}m`
}

// ── Colour / priority helpers ─────────────────────────────────────────────────

export function getPriorityColor(priority) {
  switch (priority) {
    case 'high':   return 'var(--danger)'
    case 'medium': return 'var(--warning)'
    case 'low':    return 'var(--success)'
    default:       return 'var(--text-muted)'
  }
}

export function getPriorityBadgeClass(priority) {
  switch (priority) {
    case 'high':   return 'badge-danger'
    case 'medium': return 'badge-warning'
    case 'low':    return 'badge-success'
    default:       return ''
  }
}

export function getDueBadgeClass(diff, status) {
  if (status === 'completed') return 'due-done'
  if (diff === null) return ''
  if (diff < 0)  return 'due-overdue'
  if (diff === 0) return 'due-today'
  if (diff <= 2) return 'due-soon'
  return 'due-upcoming'
}

export function getDueBadgeLabel(diff, status) {
  if (status === 'completed') return 'Completed'
  if (diff === null) return 'No due date'
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Due tomorrow'
  return `Due in ${diff}d`
}

// ── String helpers ────────────────────────────────────────────────────────────

/** Normalise a string for case-insensitive searching. */
export function normalise(str) {
  return (str ?? '').toLowerCase().trim()
}

/** True if haystack contains needle (case-insensitive). */
export function matchSearch(haystack, needle) {
  if (!needle) return true
  return normalise(haystack).includes(normalise(needle))
}
