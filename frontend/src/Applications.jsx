import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/applications/me')
      .then((res) => setApplications(res.data.applications || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Application Tracker</p>
          <h2>Your application status</h2>
        </div>
      </div>
      {loading ? <p className="muted">Loading applications...</p> : null}
      <div className="cards-grid">
        {applications.map((application) => (
          <article className="card" key={application.id}>
            <div className="card-top">
              <strong>{application.scholarshipTitle}</strong>
              <span className={`pill status-${application.status}`}>{application.status}</span>
            </div>
            <p>{application.provider}</p>
            <div className="meta-row">
              <span>Submitted: {application.submittedOn ? new Date(application.submittedOn).toLocaleDateString() : '—'}</span>
              <span>{application.documentCount} documents</span>
            </div>
            {application.documents?.length ? (
              <div className="chips-row">
                {application.documents.map((doc) => <span key={doc.fileName} className="pill">{doc.originalName}</span>)}
              </div>
            ) : null}
            {application.nextAction ? <p className="muted">Next: {application.nextAction}</p> : null}
          </article>
        ))}
      </div>
      {!loading && applications.length === 0 ? <p className="muted">No applications yet.</p> : null}
    </section>
  )
}