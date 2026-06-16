import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, CheckCircle2, Clock, FileText, Info, CheckCheck } from 'lucide-react'

const typeConfig = {
  deadline: { icon: '⏰', color: '#fbbf24', borderColor: '#fbbf24', className: 'notif-type-deadline' },
  status: { icon: '📋', color: '#6ea8fe', borderColor: '#6ea8fe', className: 'notif-type-status' },
  document: { icon: '📄', color: '#a855f7', borderColor: '#a855f7', className: 'notif-type-document' },
  info: { icon: 'ℹ️', color: '#10b981', borderColor: '#10b981', className: 'notif-type-info' },
}

function getTypeConfig(type) {
  return typeConfig[type] || typeConfig.info
}

export default function NotificationsCenter() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await axios.get('/api/notifications/me')
      setItems(res.data.notifications || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function markRead(id) {
    await axios.patch(`/api/notifications/${id}/read`)
    load()
  }

  async function markAllRead() {
    const unread = items.filter(i => !i.read)
    await Promise.all(unread.map(i => axios.patch(`/api/notifications/${i.id}/read`)))
    load()
  }

  const unreadCount = items.filter(i => !i.read).length

  return (
    <motion.section
      className="panel panel-notifications"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="section-head">
        <div>
          <p className="eyebrow">
            <Bell size={12} className={unreadCount > 0 ? 'bell-icon-animated' : ''} />
            Notifications Center
          </p>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Deadline & document alerts
            {unreadCount > 0 && (
              <span className="pill" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)', fontSize: '12px' }}>
                {unreadCount} unread
              </span>
            )}
          </h2>
        </div>
        {unreadCount > 0 && (
          <button
            className="secondary"
            onClick={markAllRead}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 0', color: 'var(--muted)' }}>
          <span className="spinner" /> Loading notifications…
        </div>
      )}

      <div className="cards-grid">
        <AnimatePresence>
          {items.map((item, index) => {
            const cfg = getTypeConfig(item.type)
            return (
              <motion.article
                className={`card notification-card ${item.read ? 'is-read' : 'is-unread'} ${cfg.className}`}
                key={`${item.type}-${index}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <div className="card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{cfg.icon}</span>
                    <strong>{item.title}</strong>
                  </div>
                  <span className="pill" style={{ fontSize: '11px', textTransform: 'capitalize' }}>
                    {item.type}
                  </span>
                </div>

                <p style={{ marginTop: '8px' }}>{item.message}</p>

                <div className="meta-row wrap" style={{ marginTop: '10px' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
                    <Clock size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : ''}
                  </span>
                  {!item.read ? (
                    <button
                      className="secondary"
                      onClick={() => markRead(item.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '6px 12px', marginTop: 0 }}
                    >
                      <CheckCircle2 size={12} /> Mark read
                    </button>
                  ) : (
                    <span className="muted" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} color="#22c55e" /> Read
                    </span>
                  )}
                </div>
              </motion.article>
            )
          })}
        </AnimatePresence>
      </div>

      {!loading && !items.length && (
        <div className="empty-state">
          <div className="empty-state-icon">🔕</div>
          <h3>All caught up!</h3>
          <p>No alerts right now. We'll notify you about deadlines and updates.</p>
        </div>
      )}
    </motion.section>
  )
}