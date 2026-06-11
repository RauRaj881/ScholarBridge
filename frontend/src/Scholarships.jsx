import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, CheckCircle, ExternalLink, Sparkles } from 'lucide-react'
import AdminPanel from './AdminPanel'
import ScholarshipDetail from './ScholarshipDetail'
import Chat from './Chat'
import EligibilityChecker from './EligibilityChecker'
import Applications from './Applications'
import NotificationsCenter from './NotificationsCenter'
import AdminDashboard from './AdminDashboard'
import AdminApplications from './AdminApplications'
import Carousel from './Carousel'
import { translations } from './translations'

const slides = [
  { id: 1, content: "Get Registered -> Verify -> Get Paid", title: "ScholarBridge Workflow" },
  { id: 2, content: "Empowering students to excel.", title: "Our Mission" },
  { id: 3, content: "Join thousands of successful applicants.", title: "Join Today" }
];

export default function Scholarships({ user }) {
  const [list, setList] = useState([])
  const [slideIndex, setSlideIndex] = useState(0)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [selected, setSelected] = useState(null)
  const [activeView, setActiveView] = useState('overview')
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'English')

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    axios.get('/api/scholarships').then((r) => setList(r.data.scholarships || []))
  }, [])

  const t = translations[language] || translations.English

  return (
    <main className="app-content">
      <motion.section 
        className="hero panel"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}
      >
        <div style={{ flex: '1 1 450px' }}>
          <p className="eyebrow"><Sparkles size={14} style={{verticalAlign: 'middle', marginRight: '4px'}}/> {t.dashboard}</p>
          <h1 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.4rem', fontWeight: 800, margin: '8px 0' }}>{t.findTrackWin}</h1>
          <p className="muted">{t.signedInAs} <strong>{user.name}</strong> ({user.email})</p>
          <div className="hero-actions" style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            <button className={activeView === 'overview' ? 'primary' : ''} onClick={() => { setActiveView('overview'); setSelected(null); }}>{t.overview}</button>
            <button className={activeView === 'eligibility' ? 'primary' : ''} onClick={() => { setActiveView('eligibility'); setSelected(null); }}>{t.eligibility}</button>
            <button className={activeView === 'applications' ? 'primary' : ''} onClick={() => { setActiveView('applications'); setSelected(null); }}>{t.applications}</button>
            <button className={activeView === 'notifications' ? 'primary' : ''} onClick={() => { setActiveView('notifications'); setSelected(null); }}>{t.notifications}</button>
            <button onClick={() => setShowChat(s => !s)}>{showChat ? t.hideBharosa : t.openBharosa}</button>
          </div>
        </div>
        <div className="hero-banner-wrapper" style={{ flex: '0 0 320px', height: '160px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          <img src="/banner.png" alt="ScholarBridge Portal Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </motion.section>

      <div style={{ marginBottom: '20px' }}>
        <Carousel slide={slides[slideIndex]} />
      </div>

      {user.role === 'admin' && <AdminDashboard onOpenScholarships={() => setShowAdmin((v) => !v)} />}
      {showAdmin && <AdminPanel onDone={() => { setShowAdmin(false); axios.get('/api/scholarships').then((r) => setList(r.data.scholarships || [])) }} />}
      {showChat && <Chat />}

      {activeView === 'eligibility' ? <EligibilityChecker onSelectScholarship={setSelected} /> : null}
      {activeView === 'applications' ? (user.role === 'admin' ? <AdminApplications /> : <Applications />) : null}
      {activeView === 'notifications' ? <NotificationsCenter /> : null}

      {activeView === 'overview' && (
        <section className="panel panel-overview">
          <div className="section-head"><h2>{t.openOpportunities}</h2></div>
          <div className="cards-grid">
            <AnimatePresence>
              {list.map((s, index) => (
                <motion.article 
                  key={s._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="card" 
                  onClick={() => setSelected(s)}
                >
                  <div className="card-top">
                    <strong>{s.title || s.name || s.provider}</strong>
                    {s.featured ? <span className="pill">{t.featured}</span> : null}
                  </div>
                  <p>{s.description || 'Click to view details and apply.'}</p>
                  <div className="meta-row">
                    <span>{s.provider}</span>
                    <span>{s.amount || 'Funding available'}</span>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {selected && <ScholarshipDetail scholarship={selected} onClose={() => setSelected(null)} />}
    </main>
  )
}