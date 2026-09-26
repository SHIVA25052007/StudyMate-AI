import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './context/ToastContext'
import Sidebar from './components/layout/Sidebar'
import TopNav from './components/layout/TopNav'
import Dashboard   from './pages/Dashboard'
import Subjects    from './pages/Subjects'
import Assignments from './pages/Assignments'
import Notes       from './pages/Notes'
import Exams       from './pages/Exams'
import Planner     from './pages/Planner'
import Progress    from './pages/Progress'
import Assistant   from './pages/Assistant'
import Settings    from './pages/Settings'
import NotFound    from './pages/NotFound'
import './App.css'

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <TopNav onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className="app-content" id="main-content">
          <Routes>
            <Route path="/"            element={<Dashboard />}   />
            <Route path="/subjects"    element={<Subjects />}    />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/notes"       element={<Notes />}       />
            <Route path="/exams"       element={<Exams />}       />
            <Route path="/planner"     element={<Planner />}     />
            <Route path="/progress"    element={<Progress />}    />
            <Route path="/assistant"   element={<Assistant />}   />
            <Route path="/settings"    element={<Settings />}    />
            <Route path="*"            element={<NotFound />}    />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AppProvider>
  )
}
