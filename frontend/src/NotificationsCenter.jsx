import React, { useEffect, useState } from 'react'
import axios from 'axios'

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

  useEffect(() => {
    load()
  }, [])

  async function markRead(id) {
    await axios.patch(`/api/notifications/${id}/read`)
    load()
  }

  return (
    <section className="panel panel-notifications">
      <div className="section-head">
        <div>
          <p className="eyebrow">Notifications Center</p>
          <h2>Deadline and document alerts</h2>
        </div>
      </div>
      {loading ? <p className="muted">Loading notifications...</p> : null}
      <div className="cards-grid">
        {items.map((item, index) => (
          <article className={`card notification-card ${item.read ? 'is-read' : 'is-unread'}`} key={`${item.type}-${index}`}>
            <div className="card-top">
              <strong>{item.title}</strong>
              <span className="pill">{item.type}</span>
            </div>
            <p>{item.message}</p>
            <div className="meta-row wrap">
              <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</span>
              {!item.read ? <button className="secondary" onClick={() => markRead(item.id)}>Mark read</button> : <span className="muted">Read</span>}
            </div>
          </article>
        ))}
      </div>
      {!loading && !items.length ? <p className="muted">No alerts right now.</p> : null}
    </section>
  )
}