import React, { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, BookOpen, Users, IndianRupee, Layers, Search, SearchCheck } from 'lucide-react'

const initialForm = {
  state: '',
  course: '',
  category: '',
  income: '',
  yearLevel: '',
  search: '',
}

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
].sort();

const fieldLabels = {
  state: 'State',
  course: 'Course / Level',
  category: 'Category',
  income: 'Annual Family Income',
  yearLevel: 'Year Level',
  search: 'Keyword Search',
}

const fieldIcons = {
  state: <MapPin size={14} />,
  course: <BookOpen size={14} />,
  category: <Users size={14} />,
  income: <IndianRupee size={14} />,
  yearLevel: <Layers size={14} />,
  search: <Search size={14} />,
}

const fieldOptions = {
  state: indianStates,
  category: ['General', 'OBC', 'SC', 'ST', 'EBC'],
  yearLevel: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post Matric'],
  course: ['10+2', 'UG', 'PG', 'Diploma', 'PhD'],
}

const cardEmojis = ['🎓', '📚', '🏆', '💡', '🌟', '🎯', '📖', '🔬']

export default function EligibilityChecker({ onSelectScholarship }) {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [count, setCount] = useState(0)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  async function findMatches(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const res = await axios.post('/api/scholarships/eligibility', form)
      setResults(res.data || [])
      setCount(res.data.length || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not check eligibility')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.section
      className="panel panel-eligibility"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="section-head">
        <div>
          <p className="eyebrow"><SearchCheck size={12} /> Eligibility Checker</p>
          <h2>Find scholarships you can actually apply for</h2>
        </div>
      </div>

      <form className="grid-form" onSubmit={findMatches}>
        {Object.entries(form).map(([key, value]) => (
          <label key={key} className="field">
            <span>
              {fieldIcons[key]}
              {fieldLabels[key] || key}
            </span>
            {fieldOptions[key] ? (
              <select
                className="eligibility-select"
                value={value}
                onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
              >
                <option value="">Any</option>
                {fieldOptions[key].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                value={value}
                onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
                placeholder={`Enter ${fieldLabels[key] || key}`}
              />
            )}
          </label>
        ))}

        <div className="field actions-row">
          <button
            className="primary"
            type="submit"
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {loading
              ? <><span className="spinner" /> Checking…</>
              : <><SearchCheck size={15} /> Check Eligibility</>}
          </button>
          <button
            type="button"
            onClick={() => { setForm(initialForm); setResults([]); setCount(0); setError(''); setSearched(false) }}
          >
            ↺ Reset
          </button>
        </div>
      </form>

      {error && (
        <motion.p className="error-text" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          ⚠️ {error}
        </motion.p>
      )}

      {!!count && (
        <motion.p
          className="muted"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}
        >
          <span className="match-badge">✓ {count} matches found</span>
          Great news! These scholarships match your profile.
        </motion.p>
      )}

      {searched && !loading && results.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No matches found</h3>
          <p>Try adjusting your filters — there may be scholarships with broader criteria.</p>
        </div>
      )}

      <div className="cards-grid" style={{ marginTop: '16px' }}>
        <AnimatePresence>
          {results.map((item, index) => (
            <motion.article
              className="card"
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <div className="card-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="card-icon-badge">{cardEmojis[index % cardEmojis.length]}</div>
                  <strong>{item.title}</strong>
                </div>
                {item.featured ? (
                  <span className="pill">⭐ Featured</span>
                ) : (
                  <span className="match-badge">✓ Match</span>
                )}
              </div>
              <p>{item.description}</p>
              <div className="meta-row">
                <span className="muted" style={{ fontSize: '13px' }}>{item.provider}</span>
                <span className="pill" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
                  {item.amount || 'Funding available'}
                </span>
              </div>
              <div className="chips-row">
                {(item.requiredDocuments || []).slice(0, 3).map((doc) => (
                  <span key={doc} className="pill"><BookOpen size={10} /> {doc}</span>
                ))}
              </div>
              <button
                className="secondary"
                onClick={() => onSelectScholarship?.(item)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}
              >
                View details →
              </button>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}