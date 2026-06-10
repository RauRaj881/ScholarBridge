import React from 'react'
import axios from 'axios'

export default function Nav({ user, onLogout }) {
  async function logout() {
    await axios.post('/api/auth/logout')
    onLogout()
  }

  return (
    <div className="topbar">
      <div>
        <strong>ScholarBridge</strong>
        <div className="muted">BHAROSA Scholarship Hub</div>
      </div>
      <div className="topbar-actions">
        <span>{user.name} ({user.role})</span>
        <button onClick={logout}>Sign out</button>
      </div>
    </div>
  )
}
