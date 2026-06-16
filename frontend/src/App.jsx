import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Login from './Login'
import Register from './Register'
import Scholarships from './Scholarships'
import AdminDashboard from './AdminDashboard'
import Nav from './Nav'

export default function App() {
  const [user, setUser] = useState(null)
  const [showRegister, setShowRegister] = useState(false)
  const [adminView, setAdminView] = useState('metrics') // 'metrics' or 'scholarships'

  useEffect(() => {
    axios.get('/api/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => setUser(null))
  }, [])

  if (!user) {
    return showRegister ? (
      <Register onRegistered={(u) => { setUser(u); setShowRegister(false) }} onCancel={() => setShowRegister(false)} />
    ) : (
      <Login onLogin={setUser} onShowRegister={() => setShowRegister(true)} />
    )
  }

  // Check if the current view is the admin control center metrics workspace dashboard
  const isAdminDashboardActive = user.role === 'admin' && adminView === 'metrics'

  return (
    <div className="app-shell">
      {/* Renders global standard Nav bar layout only if the admin dashboard layout is NOT active */}
      {!isAdminDashboardActive && (
        <Nav user={user} onLogout={() => setUser(null)} onViewChange={setAdminView} />
      )}
      
      <main className="main-content-panel">
        {user.role === 'admin' ? (
          adminView === 'metrics' ? (
            <AdminDashboard 
              onOpenScholarships={() => setAdminView('scholarships')} 
              onLogout={() => setUser(null)} 
            />
          ) : (
            <Scholarships user={user} />
          )
        ) : (
          <Scholarships user={user} />
        )}
      </main>
    </div>
  )
}