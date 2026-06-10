import React, { useState } from 'react'
import axios from 'axios'

export default function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      onLogin(res.data.user)
    } catch (err) {
      setErr(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h2>Sign in to ScholarBridge</h2>
        <form onSubmit={submit}>
          <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="primary" type="submit">Sign in</button>
        </form>
        <div style={{marginTop:8}}>
          <button onClick={(e)=>{e.preventDefault(); onShowRegister && onShowRegister()}}>Create an account</button>
        </div>
      </div>
      {err && <div style={{color:'red'}}>{err}</div>}
    </div>
  )
}
