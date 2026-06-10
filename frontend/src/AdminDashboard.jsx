import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminDashboard({ onOpenScholarships }) {
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    axios.get('/api/admin/metrics').then((res) => setMetrics(res.data))
  }, [])

  const cards = [
    ['Users', metrics?.users],
    ['Students', metrics?.students],
    ['Scholarships', metrics?.scholarships],
    ['Applications', metrics?.applications],
  ]

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Admin Dashboard</p>
          <h2>Live platform metrics</h2>
        </div>
        <button className="secondary" onClick={onOpenScholarships}>Manage scholarships</button>
      </div>
      <div className="stats-grid">
        {cards.map(([label, value]) => (
          <div className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value ?? '—'}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}