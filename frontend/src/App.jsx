import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Login from './Login'
import Register from './Register'
import Scholarships from './Scholarships'
import Nav from './Nav'

export default function App() {
  const [user, setUser] = useState(null)
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    axios.get('/api/health').catch(() => {})
    // try to load current user
    axios.get('/api/auth/me').then((r) => setUser(r.data.user)).catch(() => {})
  }, [])

  if (!user) {
    return showRegister ? (
      <Register onRegistered={(u) => { setUser(u); setShowRegister(false) }} onCancel={() => setShowRegister(false)} />
    ) : (
      <Login onLogin={setUser} onShowRegister={() => setShowRegister(true)} />
    )
  }

  return (
    <div className="app-shell">
      <Nav user={user} onLogout={() => setUser(null)} />
      <Scholarships user={user} />
    </div>
  )
}
