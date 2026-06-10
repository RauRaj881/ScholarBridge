import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AdminPanel from './AdminPanel'
import ScholarshipDetail from './ScholarshipDetail'
import Chat from './Chat'
import EligibilityChecker from './EligibilityChecker'
import Applications from './Applications'
import NotificationsCenter from './NotificationsCenter'
import AdminDashboard from './AdminDashboard'
import AdminApplications from './AdminApplications'

export default function Scholarships({ user }) {
  const [list, setList] = useState([])
  const [showAdmin, setShowAdmin] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [selected, setSelected] = useState(null)
  const [activeView, setActiveView] = useState('overview')

  useEffect(() => {
    axios.get('/api/scholarships').then((r) => setList(r.data.scholarships || []))
  }, [])
  return (
    <main className="app-content">
      <section className="hero panel">
        <div>
          <p className="eyebrow">ScholarBridge Dashboard</p>
          <h1>Find, track, and win scholarships</h1>
          <p className="muted">Signed in as {user.name} ({user.email})</p>
        </div>
        <div className="hero-actions">
          <button className={activeView === 'overview' ? 'primary' : ''} onClick={() => setActiveView('overview')}>Overview</button>
          <button className={activeView === 'eligibility' ? 'primary' : ''} onClick={() => setActiveView('eligibility')}>Eligibility</button>
          <button className={activeView === 'applications' ? 'primary' : ''} onClick={() => setActiveView('applications')}>Applications</button>
          <button className={activeView === 'notifications' ? 'primary' : ''} onClick={() => setActiveView('notifications')}>Notifications</button>
          <button onClick={()=>setShowChat(s=>!s)}>{showChat ? 'Hide BHAROSA' : 'Open BHAROSA'}</button>
        </div>
      </section>

      {user.role === 'admin' && (
        <AdminDashboard onOpenScholarships={() => setShowAdmin((v) => !v)} />
      )}

      {showAdmin && <AdminPanel onDone={() => { setShowAdmin(false); axios.get('/api/scholarships').then((r) => setList(r.data.scholarships || [])) }} />}
      {showChat && <Chat />}

      {activeView === 'eligibility' ? <EligibilityChecker onSelectScholarship={setSelected} /> : null}
      {activeView === 'applications' ? (user.role === 'admin' ? <AdminApplications /> : <Applications />) : null}
      {activeView === 'notifications' ? <NotificationsCenter /> : null}

      {activeView === 'overview' && (
        <section className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Scholarship Catalog</p>
              <h2>Open opportunities</h2>
            </div>
          </div>
          <div className="cards-grid">
            {list.map((s) => (
              <article className="card" key={s._id} onClick={()=>setSelected(s)}>
                <div className="card-top">
                  <strong>{s.title || s.name || s.provider}</strong>
                  {s.featured ? <span className="pill">Featured</span> : null}
                </div>
                <p>{s.description || 'Click to view details and apply.'}</p>
                <div className="meta-row">
                  <span>{s.provider}</span>
                  <span>{s.amount || 'Funding available'}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {selected && <ScholarshipDetail scholarship={selected} onClose={()=>setSelected(null)} />}
    </main>
  )
}
