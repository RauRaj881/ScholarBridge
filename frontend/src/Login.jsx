import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, GraduationCap, ShieldCheck } from 'lucide-react'

export default function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleMode, setRoleMode] = useState('student') // 'student' or 'admin'
  const [err, setErr] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  // Inside your frontend/src/Login.jsx file, locate the submit handler and replace it with this:
async function submit(e) {
  e.preventDefault();
  setLoading(true);
  setErr('');
  try {
    // Send email, password, and the active toggle portal role back to the verification route
    const res = await axios.post('/api/auth/login', { 
      email, 
      password, 
      roleMode 
    });
    
    onLogin(res.data.user);
  } catch (err) {
    // Captures the explicit server validation messages we just created above
    setErr(err.response?.data?.message || 'Authentication channel failure');
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo-wrap">
          <div className="auth-logo-icon">
            <GraduationCap size={32} color="#fff" />
          </div>
          <strong>ScholarBridge</strong>
          <p className="muted">Multi-Tenant Access Console</p>
        </div>

        {/* Operational Sliding Selection Tabs */}
        <div className="role-toggle-bar" style={{ display: 'flex', background: '#11111b', padding: '4px', borderRadius: '8px', marginBottom: '20px' }}>
          <button 
            type="button" 
            onClick={() => setRoleMode('student')}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', background: roleMode === 'student' ? 'var(--accent)' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Student Portal
          </button>
          <button 
            type="button" 
            onClick={() => setRoleMode('admin')}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', background: roleMode === 'admin' ? '#ef4444' : 'transparent', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Admin Console
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="auth-input-wrap">
            <span className="auth-input-icon"><Mail size={16} /></span>
            <input placeholder="Enter registration email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={{ width: '100%' }} required />
          </div>

          <div className="auth-input-wrap">
            <span className="auth-input-icon"><Lock size={16} /></span>
            <input placeholder="Password" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%' }} required />
          </div>

          {err && <div className="status-msg error" style={{ color: '#ef4444', margin: '10px 0' }}>⚠️ {err}</div>}

          <button className="primary" type="submit" disabled={loading} style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Authenticating Gateway...' : `Sign In as ${roleMode}`}
          </button>
        </form>

        {roleMode === 'student' && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button onClick={onShowRegister} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}>
              Create a Student Account →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
