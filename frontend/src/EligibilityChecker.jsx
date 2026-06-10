import React, { useState } from 'react'
import axios from 'axios'

const initialForm = {
  state: '',
  course: '',
  category: '',
  income: '',
  yearLevel: '',
  search: '',
}

const fieldLabels = {
  state: 'State',
  course: 'Course',
  category: 'Category',
  income: 'Annual family income',
  yearLevel: 'Year level',
  search: 'Keyword search',
}

const fieldOptions = {
  category: ['General', 'OBC', 'SC', 'ST', 'EBC'],
  yearLevel: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post Matric'],
  course: ['10+2', 'UG', 'PG', 'Diploma', 'PhD'],
}

export default function EligibilityChecker({ onSelectScholarship }) {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [count, setCount] = useState(0)
  const [error, setError] = useState('')

  async function findMatches(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      Object.entries(form).forEach(([key, value]) => value && params.set(key, value))
      const res = await axios.get(`/api/scholarships/eligibility?${params.toString()}`)
      setResults(res.data.scholarships || [])
      setCount(res.data.count || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not check eligibility')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Eligibility Checker</p>
          <h2>Find scholarships you can actually apply for</h2>
        </div>
      </div>

      <form className="grid-form" onSubmit={findMatches}>
        {Object.entries(form).map(([key, value]) => (
          <label key={key} className="field">
            <span>{fieldLabels[key] || key}</span>
            {fieldOptions[key] ? (
              <select value={value} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}>
                <option value="">Any</option>
                {fieldOptions[key].map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : (
              <input value={value} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))} placeholder={`Enter ${fieldLabels[key] || key}`} />
            )}
          </label>
        ))}
        <div className="field actions-row">
          <button className="primary" type="submit" disabled={loading}>{loading ? 'Checking...' : 'Check Eligibility'}</button>
          <button type="button" onClick={() => { setForm(initialForm); setResults([]); setCount(0); setError('') }}>Reset</button>
        </div>
      </form>

      {error && <p className="error-text">{error}</p>}
      {!!count && <p className="muted">{count} matches found</p>}

      <div className="cards-grid">
        {results.map((item) => (
          <article className="card" key={item._id}>
            <div className="card-top">
              <strong>{item.title}</strong>
              {item.featured ? <span className="pill">Featured</span> : null}
            </div>
            <p>{item.description}</p>
            <div className="meta-row">
              <span>{item.provider}</span>
              <span>{item.amount || 'Funding available'}</span>
            </div>
            <div className="chips-row">
              {(item.requiredDocuments || []).slice(0, 3).map((doc) => <span key={doc} className="pill">{doc}</span>)}
            </div>
            <button className="secondary" onClick={() => onSelectScholarship?.(item)}>View details</button>
          </article>
        ))}
      </div>
    </section>
  )
}