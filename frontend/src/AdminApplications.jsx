import React, { useEffect, useState } from 'react'
import axios from 'axios'

const statusOptions = ['submitted', 'under review', 'approved', 'rejected']

export default function AdminApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await axios.get('/api/applications/admin')
      setApplications(res.data.applications || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function updateStatus(id, status) {
    setUpdatingId(id)
    try {
      await axios.put(`/api/applications/${id}/status`, {
        status,
        nextAction: status === 'approved' ? 'Share the approval letter with the student' : status === 'rejected' ? 'Send a reason for rejection' : 'Review supporting documents',
      })
      load()
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Admin Review</p>
          <h2>Application queue</h2>
        </div>
      </div>
      {loading ? <p className="muted">Loading applications...</p> : null}
      <div className="cards-grid">
        {applications.map((application) => (
          <article className="card" key={application._id}>
            <div className="card-top">
              <strong>{application.scholarshipId?.title || 'Unknown Scholarship'}</strong>
              <span className="pill">{application.status}</span>
            </div>
            <p>{application.userId?.name} · {application.userId?.email}</p>
            <p className="muted">Submitted {application.submittedOn ? new Date(application.submittedOn).toLocaleDateString() : '—'}</p>
            <div className="chips-row">
              {(application.documents || []).map((doc) => <span key={doc.fileName} className="pill">{doc.originalName}</span>)}
            </div>
            <div className="field">
              <label>Update status</label>
              <select value={application.status} onChange={(e) => updateStatus(application._id, e.target.value)} disabled={updatingId === application._id}>
                {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            {application.nextAction ? <p className="muted">Next: {application.nextAction}</p> : null}
          </article>
        ))}
      </div>
      {!loading && !applications.length ? <p className="muted">No applications in the queue.</p> : null}
    </section>
  )
}