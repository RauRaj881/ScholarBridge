import React, { useState } from 'react'
import axios from 'axios'

export default function Register({ onRegistered, onCancel }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    try {
      const res = await axios.post('/api/auth/register', { name, email, password })
      onRegistered(res.data.user)
    } catch (err) {
      setErr(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Start here</p>
        <h2>Create your account</h2>
        <form onSubmit={submit}>
          <input placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="primary" type="submit">Register</button>
          <button type="button" onClick={onCancel} style={{marginLeft:8}}>Cancel</button>
        </form>
      </div>
      {err && <div style={{color:'red'}}>{err}</div>}
    </div>
  )
}
