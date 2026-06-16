import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle2, XCircle, FileSearch, FileText, Calendar } from 'lucide-react'

const statusConfig = {
  submitted: { icon: <Clock size={14} />, label: 'Submitted', borderColor: '#6ea8fe' },
  approved: { icon: <CheckCircle2 size={14} />, label: 'Approved', borderColor: '#22c55e' },
  rejected: { icon: <XCircle size={14} />, label: 'Rejected', borderColor: '#f87171' },
}

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/applications/me')
      .then((res) => setApplications(res.data.applications || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <motion.section
      className="panel panel-applications"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="section-head">
        <div>
          <p className="eyebrow"><FileText size={12} /> Application Tracker</p>
          <h2>Your application status</h2>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 0', color: 'var(--muted)' }}>
          <span className="spinner" /> Loading your applications…
        </div>
      )}

      <div className="cards-grid">
        <AnimatePresence>
          {applications.map((application, index) => {
            const cfg = statusConfig[application.status] || statusConfig.submitted
            return (
              <motion.article
                className="card"
                key={application.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.07 }}
                style={{ borderLeft: `3px solid ${cfg.borderColor}` }}
              >
                <div className="card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="card-icon-badge">📋</div>
                    <strong>{application.scholarshipTitle}</strong>
                  </div>
                  <span className={`pill status-${application.status}`} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {cfg.icon} {application.status}
                  </span>
                </div>

                <p style={{ marginTop: '8px' }}>{application.provider}</p>

                <div className="meta-row" style={{ marginTop: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '13px' }}>
                    <Calendar size={12} />
                    Submitted: {application.submittedOn ? new Date(application.submittedOn).toLocaleDateString('en-IN') : '—'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '13px' }}>
                    <FileText size={12} />
                    {application.documentCount} documents
                  </span>
                </div>

                {application.documents?.length ? (
                  <div className="chips-row">
                    {application.documents.map((doc) => (
                      <span key={doc.fileName} className="pill">
                        <FileText size={10} /> {doc.originalName}
                      </span>
                    ))}
                  </div>
                ) : null}

                {application.nextAction ? (
                  <p className="muted" style={{ marginTop: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ⏭ Next: {application.nextAction}
                  </p>
                ) : null}
              </motion.article>
            )
          })}
        </AnimatePresence>
      </div>

      {!loading && applications.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No applications yet</h3>
          <p>Find scholarships that match your profile and apply today!</p>
        </div>
      )}
    </motion.section>
  )
}