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
import { translations } from './translations'

export default function Scholarships({ user }) {
  const [list, setList] = useState([])
  const [showAdmin, setShowAdmin] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [selected, setSelected] = useState(null)
  const [activeView, setActiveView] = useState('overview')
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'English')

  useEffect(() => {
    const handleLangChange = () => {
      setLanguage(localStorage.getItem('language') || 'English')
    }
    window.addEventListener('languageChange', handleLangChange)
    return () => window.removeEventListener('languageChange', handleLangChange)
  }, [])

  useEffect(() => {
    axios.get('/api/scholarships').then((r) => setList(r.data.scholarships || []))
  }, [])

  const t = translations[language] || translations.English

  return (
    <main className="app-content">
      <section className="hero panel">
        <div>
          <p className="eyebrow">{t.dashboard}</p>
          <h1>{t.findTrackWin}</h1>
          <p className="muted">{t.signedInAs} {user.name} ({user.email})</p>
        </div>
        <div className="hero-actions">
          <button className={activeView === 'overview' ? 'primary' : ''} onClick={() => setActiveView('overview')}>{t.overview}</button>
          <button className={activeView === 'eligibility' ? 'primary' : ''} onClick={() => setActiveView('eligibility')}>{t.eligibility}</button>
          <button className={activeView === 'applications' ? 'primary' : ''} onClick={() => setActiveView('applications')}>{t.applications}</button>
          <button className={activeView === 'notifications' ? 'primary' : ''} onClick={() => setActiveView('notifications')}>{t.notifications}</button>
          <button onClick={()=>setShowChat(s=>!s)}>{showChat ? t.hideBharosa : t.openBharosa}</button>
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
              <p className="eyebrow">{t.catalog}</p>
              <h2>{t.openOpportunities}</h2>
            </div>
          </div>
          <div className="cards-grid">
            {list.map((s) => (
              <article className="card" key={s._id} onClick={()=>setSelected(s)}>
                <div className="card-top">
                  <strong>{s.title || s.name || s.provider}</strong>
                  {s.featured ? <span className="pill">{t.featured}</span> : null}
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
