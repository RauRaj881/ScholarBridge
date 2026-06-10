import React, { useState } from 'react'
import axios from 'axios'

export default function ScholarshipDetail({ scholarship, onClose }) {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')

  async function apply(e) {
    e.preventDefault()
    if (!file) return setStatus('Please attach a document')
    const fd = new FormData()
    fd.append('documents', file)
    try {
      setStatus('Uploading...')
      const res = await axios.post(`/api/scholarships/${scholarship._id}/apply`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setStatus('Application submitted')
    } catch (err) {
      setStatus(err.response?.data?.message || 'Apply failed')
    }
  }

  return (
    <div className="detail-panel">
      <button className="ghost-right" onClick={onClose}>Close</button>
      <div className="detail-header">
        <div>
          <p className="eyebrow">Scholarship Details</p>
          <h3>{scholarship.title}</h3>
          <p>{scholarship.description}</p>
        </div>
        <div className="detail-meta">
          <span>{scholarship.provider}</span>
          <strong>{scholarship.amount || 'Amount not listed'}</strong>
        </div>
      </div>
      <div className="meta-row wrap">
        <span>Deadline: {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'Open'}</span>
        <span>Status: {scholarship.status}</span>
      </div>
      <div className="chips-row">
        {(scholarship.states || []).map((item) => <span key={item} className="pill">{item}</span>)}
        {(scholarship.courses || []).map((item) => <span key={item} className="pill">{item}</span>)}
        {(scholarship.categories || []).map((item) => <span key={item} className="pill">{item}</span>)}
        {(scholarship.requiredDocuments || []).map((item) => <span key={item} className="pill">{item}</span>)}
      </div>
      {scholarship.applicationLink ? (
        <a className="primary-link" href={scholarship.applicationLink} target="_blank" rel="noreferrer">Open official application</a>
      ) : null}
      <div style={{marginTop:12}}>
        <form onSubmit={apply}>
          <div className="field">
            <label>Attach document (PDF): </label>
            <input type="file" accept="application/pdf,image/*" onChange={(e)=>setFile(e.target.files[0])} />
          </div>
          <div style={{marginTop:8}}>
            <button className="primary" type="submit">Apply now</button>
          </div>
        </form>
        {status && <div style={{marginTop:8}}>{status}</div>}
      </div>
    </div>
  )
}
