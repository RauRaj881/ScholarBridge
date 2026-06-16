import React, { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, IndianRupee, Calendar, FileUp, CheckCircle2, XCircle, Loader2,
  ExternalLink, Tag, MapPin, BookOpen, FileText, Rocket
} from 'lucide-react'

function urgencyColor(deadline) {
  if (!deadline) return null
  const days = Math.ceil((new Date(deadline) - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return '#fca5a5'
  if (days <= 7) return '#f97316'
  if (days <= 30) return '#fbbf24'
  return '#86efac'
}

export default function ScholarshipDetail({ scholarship, onClose }) {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [statusType, setStatusType] = useState('')
  const [dragging, setDragging] = useState(false)

  async function apply(e) {
    e.preventDefault()
    if (!file) { setStatus('Please attach a document'); setStatusType('error'); return }
    const fd = new FormData()
    fd.append('documents', file)
    try {
      setStatus('Uploading your application…'); setStatusType('loading')
      await axios.post(`/api/scholarships/${scholarship._id}/apply`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setStatus('🎉 Application submitted successfully!'); setStatusType('success')
    } catch (err) {
      setStatus(err.response?.data?.message || 'Apply failed'); setStatusType('error')
    }
  }

  const deadlineColor = urgencyColor(scholarship.deadline)

  return (
    <motion.div
      className="detail-panel"
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Close button */}
      <button
        className="ghost-right"
        onClick={onClose}
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <X size={14} /> Close
      </button>

      {/* Header */}
      <div className="detail-header">
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div className="card-icon-badge" style={{ width: 52, height: 52, fontSize: '26px', borderRadius: '14px' }}>
            🏫
          </div>
          <div>
            <p className="eyebrow"><Tag size={12} /> Scholarship Details</p>
            <h3 style={{ margin: '4px 0 8px' }}>{scholarship.title}</h3>
            <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14.5px', lineHeight: 1.6 }}>
              {scholarship.description}
            </p>
          </div>
        </div>

        <div className="detail-meta">
          <span style={{ color: 'var(--muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
            <MapPin size={12} /> {scholarship.provider}
          </span>
          <div className="amount-badge">
            <IndianRupee size={18} />
            <span>{scholarship.amount || 'Funding available'}</span>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="meta-row wrap" style={{ marginTop: '16px', gap: '16px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: deadlineColor || 'var(--muted)' }}>
          <Calendar size={14} />
          Deadline: {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Open'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)' }}>
          <FileText size={14} />
          Status: <span className={`pill status-${scholarship.status}`} style={{ marginLeft: '4px' }}>{scholarship.status}</span>
        </span>
      </div>

      {/* Tags */}
      <div className="chips-row">
        {(scholarship.states || []).map((item) => (
          <span key={item} className="pill"><MapPin size={10} /> {item}</span>
        ))}
        {(scholarship.courses || []).map((item) => (
          <span key={item} className="pill"><BookOpen size={10} /> {item}</span>
        ))}
        {(scholarship.categories || []).map((item) => (
          <span key={item} className="pill">{item}</span>
        ))}
        {(scholarship.requiredDocuments || []).map((item) => (
          <span key={item} className="pill"><FileText size={10} /> {item}</span>
        ))}
      </div>

      {scholarship.applicationLink && (
        <a className="primary-link" href={scholarship.applicationLink} target="_blank" rel="noreferrer">
          <ExternalLink size={15} />
          Open official application
        </a>
      )}

      {/* Application Form */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileUp size={16} color="var(--accent)" /> Submit Your Application
        </h4>

        <form onSubmit={apply}>
          {/* Upload zone */}
          <label
            className={`upload-zone ${dragging ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0]) }}
          >
            <FileUp size={36} className="upload-zone-icon" />
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
              {file ? `📄 ${file.name}` : 'Drag & drop or click to upload'}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '13px' }}>PDF or image files accepted</div>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </label>

          <div style={{ marginTop: '12px' }}>
            <button
              className="primary btn-rocket"
              type="submit"
              disabled={statusType === 'loading'}
              style={{ fontSize: '15px', padding: '12px 24px' }}
            >
              {statusType === 'loading'
                ? <><span className="spinner" /> Uploading…</>
                : <><Rocket size={16} /> Apply Now</>}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {status && (
            <motion.div
              className={`status-msg ${statusType}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {statusType === 'success' && <CheckCircle2 size={16} />}
              {statusType === 'error' && <XCircle size={16} />}
              {statusType === 'loading' && <span className="spinner" />}
              {status}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
