import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AppContext = createContext(null)

// ── localStorage hook ─────────────────────────────────────────────────────────
function useLocalStorage(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setter = useCallback((value) => {
    setState(prev => {
      const next = typeof value === 'function' ? value(prev) : value
      try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* quota */ }
      return next
    })
  }, [key])

  return [state, setter]
}

// ── Seed data (injected only on first launch) ─────────────────────────────────
const _today = new Date()
const _fmt  = (d) => d.toISOString().split('T')[0]
const _add  = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }

export const SEED_SUBJECTS = [
  { id: 's1', name: 'Mathematics',     code: 'MATH201', description: 'Calculus and Linear Algebra', instructor: 'Prof. Adams',   color: '#6366f1', icon: '📐', credits: 4, createdAt: _fmt(_today) },
  { id: 's2', name: 'Computer Science', code: 'CS301',   description: 'Data Structures & Algorithms', instructor: 'Prof. Chen',   color: '#22c55e', icon: '💻', credits: 3, createdAt: _fmt(_today) },
  { id: 's3', name: 'Physics',          code: 'PHY102',  description: 'Classical Mechanics & Optics', instructor: 'Prof. Rivera', color: '#f59e0b', icon: '⚛️',  credits: 3, createdAt: _fmt(_today) },
]

export const SEED_ASSIGNMENTS = [
  { id: 'a1', title: 'Calculus Problem Set 3',              subjectId: 's1', description: 'Integration techniques — chapter 5 exercises.', dueDate: _fmt(_add(_today, 2)),  priority: 'high',   status: 'pending',     createdAt: _fmt(_today) },
  { id: 'a2', title: 'Binary Search Tree Implementation',   subjectId: 's2', description: 'Implement BST with insert, delete, and search.', dueDate: _fmt(_add(_today, 5)),  priority: 'medium', status: 'in-progress', createdAt: _fmt(_today) },
  { id: 'a3', title: 'Lab Report – Wave Optics',            subjectId: 's3', description: 'Analyse double-slit experiment results.',        dueDate: _fmt(_add(_today, -1)), priority: 'high',   status: 'completed',   createdAt: _fmt(_today) },
  { id: 'a4', title: 'Linear Algebra Quiz Prep',            subjectId: 's1', description: 'Review eigenvalues and eigenvectors.',           dueDate: _fmt(_add(_today, 8)),  priority: 'low',    status: 'pending',     createdAt: _fmt(_today) },
]

export const SEED_NOTES = [
  { id: 'n1', title: 'Integration Techniques',  subjectId: 's1', content: 'Key integration methods:\n1. Substitution\n2. Integration by Parts: ∫u dv = uv − ∫v du\n3. Partial Fractions\n4. Trigonometric Substitution',         tags: ['calculus', 'integrals'],   createdAt: _fmt(_today), updatedAt: _fmt(_today) },
  { id: 'n2', title: 'React Hooks Summary',      subjectId: 's2', content: 'useState – local state\nuseEffect – side effects\nuseContext – consume context\nuseRef – mutable ref without re-render\nuseMemo / useCallback – memoisation', tags: ['react', 'hooks', 'js'],    createdAt: _fmt(_today), updatedAt: _fmt(_today) },
  { id: 'n3', title: 'Newton\'s Laws of Motion', subjectId: 's3', content: '1st Law: An object at rest stays at rest unless acted upon.\n2nd Law: F = ma\n3rd Law: Every action has an equal and opposite reaction.',              tags: ['physics', 'mechanics'],    createdAt: _fmt(_today), updatedAt: _fmt(_today) },
]

export const SEED_EXAMS = [
  { id: 'e1', subjectId: 's1', title: 'Midterm Exam',         date: _fmt(_add(_today, 10)), time: '09:00', venue: 'Hall A, Block 2',   description: 'Covers chapters 1–5. Open book allowed.' },
  { id: 'e2', subjectId: 's2', title: 'Data Structures Quiz', date: _fmt(_add(_today, 3)),  time: '14:00', venue: 'Room 201, CS Block', description: '' },
  { id: 'e3', subjectId: 's3', title: 'Physics Practical',    date: _fmt(_add(_today, 7)),  time: '10:30', venue: 'Physics Lab 3',      description: 'Bring safety goggles and lab coat.' },
]

export const SEED_SESSIONS = [
  { id: 'ss1', subjectId: 's2', date: _fmt(_today),             startTime: '10:00', duration: 90,  topic: 'Trees and Graphs',    notes: 'Practice BST operations', completed: false },
  { id: 'ss2', subjectId: 's1', date: _fmt(_today),             startTime: '14:00', duration: 60,  topic: 'Integration review',  notes: 'Revise substitution',     completed: true  },
  { id: 'ss3', subjectId: 's3', date: _fmt(_add(_today, 1)),    startTime: '09:00', duration: 120, topic: 'Optics chapter 4',    notes: 'Light interference',      completed: false },
  { id: 'ss4', subjectId: 's1', date: _fmt(_add(_today, -1)),   startTime: '15:00', duration: 60,  topic: 'Linear Algebra',      notes: 'Eigenvalues',             completed: true  },
]

const DEFAULT_SETTINGS = {
  email: '',
  notificationsEnabled: true,
  language: 'en',
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [theme,       setTheme]       = useLocalStorage('sm_theme',       'light')
  const [studentName, setStudentName] = useLocalStorage('sm_studentName', 'Student')
  const [settings,    setSettings]    = useLocalStorage('sm_settings',    DEFAULT_SETTINGS)
  const [subjects,    setSubjects]    = useLocalStorage('sm_subjects',    SEED_SUBJECTS)
  const [assignments, setAssignments] = useLocalStorage('sm_assignments', SEED_ASSIGNMENTS)
  const [notes,       setNotes]       = useLocalStorage('sm_notes',       SEED_NOTES)
  const [exams,       setExams]       = useLocalStorage('sm_exams',       SEED_EXAMS)
  const [sessions,    setSessions]    = useLocalStorage('sm_sessions',    SEED_SESSIONS)

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() =>
    setTheme(t => t === 'light' ? 'dark' : 'light'), [setTheme])

  const updateSettings = useCallback((patch) =>
    setSettings(prev => ({ ...prev, ...patch })), [setSettings])

  // ── Subjects ────────────────────────────────────────────────────────────────
  const addSubject = useCallback((data) => {
    const s = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString().split('T')[0] }
    setSubjects(prev => [...prev, s])
    return s
  }, [setSubjects])

  const updateSubject = useCallback((id, data) =>
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...data } : s)), [setSubjects])

  const deleteSubject = useCallback((id) =>
    setSubjects(prev => prev.filter(s => s.id !== id)), [setSubjects])

  const getSubjectById = useCallback((id) =>
    subjects.find(s => s.id === id), [subjects])

  // ── Assignments ─────────────────────────────────────────────────────────────
  const addAssignment = useCallback((data) => {
    const a = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString().split('T')[0] }
    setAssignments(prev => [...prev, a])
    return a
  }, [setAssignments])

  const updateAssignment = useCallback((id, data) =>
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...data } : a)), [setAssignments])

  const deleteAssignment = useCallback((id) =>
    setAssignments(prev => prev.filter(a => a.id !== id)), [setAssignments])

  /** Cycles status: pending → in-progress → completed → pending */
  const cycleAssignmentStatus = useCallback((id) => {
    const cycle = { 'pending': 'in-progress', 'in-progress': 'completed', 'completed': 'pending' }
    setAssignments(prev => prev.map(a =>
      a.id === id ? { ...a, status: cycle[a.status] ?? 'pending' } : a
    ))
  }, [setAssignments])

  /** Legacy toggle (pending ↔ completed) kept for dashboard quick-check */
  const toggleAssignmentStatus = useCallback((id) =>
    setAssignments(prev => prev.map(a =>
      a.id === id ? { ...a, status: a.status === 'completed' ? 'pending' : 'completed' } : a
    )), [setAssignments])

  // ── Notes ───────────────────────────────────────────────────────────────────
  const addNote = useCallback((data) => {
    const now = new Date().toISOString().split('T')[0]
    const n = { ...data, id: crypto.randomUUID(), tags: data.tags ?? [], createdAt: now, updatedAt: now }
    setNotes(prev => [...prev, n])
    return n
  }, [setNotes])

  const updateNote = useCallback((id, data) =>
    setNotes(prev => prev.map(n =>
      n.id === id
        ? { ...n, ...data, tags: data.tags ?? n.tags ?? [], updatedAt: new Date().toISOString().split('T')[0] }
        : n
    )), [setNotes])

  const deleteNote = useCallback((id) =>
    setNotes(prev => prev.filter(n => n.id !== id)), [setNotes])

  // ── Exams ───────────────────────────────────────────────────────────────────
  const addExam = useCallback((data) => {
    const e = { ...data, id: crypto.randomUUID() }
    setExams(prev => [...prev, e])
    return e
  }, [setExams])

  const updateExam = useCallback((id, data) =>
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...data } : e)), [setExams])

  const deleteExam = useCallback((id) =>
    setExams(prev => prev.filter(e => e.id !== id)), [setExams])

  // ── Sessions ────────────────────────────────────────────────────────────────
  const addSession = useCallback((data) => {
    const s = { ...data, id: crypto.randomUUID(), completed: false }
    setSessions(prev => [...prev, s])
    return s
  }, [setSessions])

  const updateSession = useCallback((id, data) =>
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...data } : s)), [setSessions])

  const deleteSession = useCallback((id) =>
    setSessions(prev => prev.filter(s => s.id !== id)), [setSessions])

  const toggleSession = useCallback((id) =>
    setSessions(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s)), [setSessions])

  // ── Derived: subject progress ────────────────────────────────────────────────
  const getSubjectProgress = useCallback((subjectId) => {
    const subAssignments = assignments.filter(a => a.subjectId === subjectId)
    const subSessions    = sessions.filter(s => s.subjectId === subjectId)
    const completedAssignments = subAssignments.filter(a => a.status === 'completed').length
    const completedSessions    = subSessions.filter(s => s.completed).length
    const totalMinutes = subSessions.filter(s => s.completed).reduce((sum, s) => sum + Number(s.duration), 0)
    const total    = subAssignments.length + subSessions.length
    const completed = completedAssignments + completedSessions
    return {
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      completedAssignments,
      totalAssignments: subAssignments.length,
      completedSessions,
      totalSessions:    subSessions.length,
      totalMinutes,
    }
  }, [assignments, sessions])

  // ── Data management ──────────────────────────────────────────────────────────
  /** Wipe all app data from localStorage and memory */
  const clearAllData = useCallback(() => {
    const keys = ['sm_subjects','sm_assignments','sm_notes','sm_exams','sm_sessions','sm_chatMessages','sm_settings','sm_studentName']
    keys.forEach(k => { try { localStorage.removeItem(k) } catch { /* ignore */ } })
    setSubjects([])
    setAssignments([])
    setNotes([])
    setExams([])
    setSessions([])
    setSettings(DEFAULT_SETTINGS)
    setStudentName('Student')
  }, [setSubjects, setAssignments, setNotes, setExams, setSessions, setSettings, setStudentName])

  /** Restore seed / demo data */
  const resetDemoData = useCallback(() => {
    setSubjects(SEED_SUBJECTS)
    setAssignments(SEED_ASSIGNMENTS)
    setNotes(SEED_NOTES)
    setExams(SEED_EXAMS)
    setSessions(SEED_SESSIONS)
  }, [setSubjects, setAssignments, setNotes, setExams, setSessions])

  return (
    <AppContext.Provider value={{
      // Theme
      theme, toggleTheme,
      // Student
      studentName, setStudentName,
      // Settings
      settings, updateSettings,
      // Subjects
      subjects, addSubject, updateSubject, deleteSubject, getSubjectById,
      // Assignments
      assignments, addAssignment, updateAssignment, deleteAssignment,
      toggleAssignmentStatus, cycleAssignmentStatus,
      // Notes
      notes, addNote, updateNote, deleteNote,
      // Exams
      exams, addExam, updateExam, deleteExam,
      // Sessions
      sessions, addSession, updateSession, deleteSession, toggleSession,
      // Derived
      getSubjectProgress,
      // Data management
      clearAllData, resetDemoData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
