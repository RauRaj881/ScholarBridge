import React, { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, GraduationCap } from 'lucide-react'

export default function Register({ onRegistered, onCancel }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/register', { name, email, password })
      onRegistered(res.data.user)
    } catch (err) {
      setErr(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="auth-logo-wrap">
          <div className="auth-logo-icon">
            <GraduationCap size={32} color="#fff" />
          </div>
          <strong style={{ fontSize: '1.5rem', fontWeight: 800 }}>ScholarBridge</strong>
          <p className="muted" style={{ margin: 0, fontSize: '13px' }}>Join thousands of successful students</p>
        </div>

        <p className="eyebrow">✨ Start your journey</p>
        <h2 style={{ marginBottom: '20px' }}>Create your account</h2>

        <form onSubmit={submit}>
          <div className="auth-input-wrap">
            <span className="auth-input-icon"><User size={16} /></span>
            <input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div className="auth-input-wrap">
            <span className="auth-input-icon"><Mail size={16} /></span>
            <input
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              style={{ width: '100%' }}
            />
          </div>

          <div className="auth-input-wrap" style={{ position: 'relative' }}>
            <span className="auth-input-icon"><Lock size={16} /></span>
            <input
              placeholder="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', paddingRight: '44px' }}
            />
            <button
              type="button"
              className="auth-pw-toggle"
              onClick={() => setShowPw(v => !v)}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {err && (
            <motion.div
              className="status-msg error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ⚠️ {err}
            </motion.div>
          )}

          <button
            className="primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: '16px', fontSize: '15px', padding: '14px' }}
          >
            {loading ? <><span className="spinner" /> &nbsp;Creating account…</> : '🎉 Create account'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            style={{ width: '100%', marginTop: '8px', fontSize: '14px' }}
          >
            ← Back to sign in
          </button>
        </form>

        <div className="social-proof">
          <span className="stars">★★★★★</span>
          <span>Free forever · No credit card required</span>
        </div>
      </motion.div>
    </div>
  )
}
