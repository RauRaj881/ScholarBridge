import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function AdminPanel({ onDone }) {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [applicationLink, setApplicationLink] = useState('')
  const [csvFile, setCsvFile] = useState(null)
  const [importing, setImporting] = useState(false)

  useEffect(() => { load() }, [])
  function load() { axios.get('/api/scholarships').then(r=>setItems(r.data.scholarships || [])) }

  async function create() {
    try {
      await axios.post('/api/admin/scholarships', { title, provider: 'Manual Entry', applicationLink })
      setTitle('')
      setApplicationLink('')
      load()
    } catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  async function remove(id) {
    if (!confirm('Delete?')) return
    try {
      await axios.delete('/api/admin/scholarships/' + id)
      load()
    } catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  async function uploadCsv() {
    if (!csvFile) return alert('Select a CSV file first')
    const fd = new FormData()
    fd.append('file', csvFile)
    setImporting(true)
    try {
      const res = await axios.post('/api/import/scholarships', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      alert(`Imported ${res.data.created} scholarships`) 
      setCsvFile(null)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Import failed')
    } finally { setImporting(false) }
  }

  return (
    <div className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Scholarship Manager</p>
          <h2>Admin create and delete</h2>
        </div>
      </div>
      <div>
        <input placeholder="title" value={title} onChange={e=>setTitle(e.target.value)} />
        <input placeholder="application url" value={applicationLink} onChange={e=>setApplicationLink(e.target.value)} style={{marginLeft:8}} />
        <button className="primary" onClick={create}>Create</button>
        <button onClick={onDone} style={{marginLeft:8}}>Done</button>
      </div>
      <div style={{marginTop:12}}>
        <p className="muted">Bulk import (CSV):</p>
        <input type="file" accept="text/csv" onChange={(e) => setCsvFile(e.target.files[0])} />
        <button onClick={uploadCsv} disabled={importing}>{importing ? 'Importing...' : 'Import CSV'}</button>
        <a href="/uploads/sample_scholarships_template.csv" style={{marginLeft:12}}>Download template</a>
      </div>
      <ul className="simple-list">
        {items.map(i => (
          <li key={i._id}>{i.title} <button onClick={()=>remove(i._id)}>Delete</button></li>
        ))}
      </ul>
    </div>
  )
}
