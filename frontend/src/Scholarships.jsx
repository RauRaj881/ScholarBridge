import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, CheckCircle, ExternalLink, Sparkles,
  LayoutDashboard, CheckSquare, FileText, Bell, MessageCircle,
  Star, Users, TrendingUp
} from 'lucide-react'
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
  { id: 1, content: "Get Registered → Verify → Get Paid", title: "ScholarBridge Workflow" },
  { id: 2, content: "Empowering students across India to excel.", title: "Our Mission" },
  { id: 3, content: "Join thousands of successful applicants.", title: "Join Today" }
];

const cardEmojis = ['🎓', '📚', '🏆', '💡', '🌟', '🎯', '📖', '🔬', '🎨', '⚽']

function getEmoji(index) {
  return cardEmojis[index % cardEmojis.length]
}

const navTabs = [
  { id: 'overview', icon: <LayoutDashboard size={15} />, labelKey: 'overview' },
  { id: 'eligibility', icon: <CheckSquare size={15} />, labelKey: 'eligibility' },
  { id: 'applications', icon: <FileText size={15} />, labelKey: 'applications' },
  { id: 'notifications', icon: <Bell size={15} />, labelKey: 'notifications' },
]

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

  useEffect(() => {
    const handler = () => setLanguage(localStorage.getItem('language') || 'English')
    window.addEventListener('languageChange', handler)
    return () => window.removeEventListener('languageChange', handler)
  }, [])

  const t = translations[language] || translations.English
  const featuredCount = list.filter(s => s.featured).length

  return (
    <main className="app-content">
      {/* Hero Section */}
      <motion.section
        className="hero panel"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}
      >
        <div style={{ flex: '1 1 450px' }}>
          <p className="eyebrow">
            <Sparkles size={14} style={{ verticalAlign: 'middle' }} /> {t.dashboard}
          </p>
          <h1 style={{
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '2.4rem',
            fontWeight: 800,
            margin: '8px 0'
          }}>
            {t.findTrackWin}
          </h1>
          <p className="muted">
            {t.signedInAs} <strong>{user.name}</strong> ({user.email})
          </p>

          {/* Nav tabs */}
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-tab-btn ${activeView === tab.id ? 'primary' : ''}`}
                onClick={() => { setActiveView(tab.id); setSelected(null); }}
              >
                {tab.icon}
                {t[tab.labelKey] || tab.id}
              </button>
            ))}
            <button
              className={`nav-tab-btn ${showChat ? 'primary' : ''}`}
              onClick={() => setShowChat(s => !s)}
            >
              <MessageCircle size={15} />
              {showChat ? t.hideBharosa : t.openBharosa}
            </button>
          </div>
        </div>

        {/* Hero banner */}
        <div style={{
          flex: '0 0 320px', height: '160px', borderRadius: '16px', overflow: 'hidden',
          border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
        }}>
          <img src="/banner.png" alt="ScholarBridge Portal Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </motion.section>

      {/* Carousel */}
      <motion.div
        style={{ marginBottom: '20px' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Carousel slide={slides[slideIndex]} slideIndex={slideIndex} totalSlides={slides.length} />
      </motion.div>

      {/* Stats row */}
      {activeView === 'overview' && list.length > 0 && (
        <motion.div
          className="stats-grid"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '20px' }}
        >
          <div className="stat-card">
            <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🎓</div>
            <div className="stat-number">{list.length}</div>
            <div className="stat-label"><GraduationCap size={13} /> Total Scholarships</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '2rem', marginBottom: '6px' }}>⭐</div>
            <div className="stat-number">{featuredCount}</div>
            <div className="stat-label"><Star size={13} /> Featured</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🏆</div>
            <div className="stat-number">10K+</div>
            <div className="stat-label"><Users size={13} /> Students Helped</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '2rem', marginBottom: '6px' }}>📈</div>
            <div className="stat-number">₹5Cr+</div>
            <div className="stat-label"><TrendingUp size={13} /> Disbursed</div>
          </div>
        </motion.div>
      )}

      {/* Admin */}
      {user.role === 'admin' && <AdminDashboard onOpenScholarships={() => setShowAdmin((v) => !v)} />}
      {showAdmin && <AdminPanel onDone={() => { setShowAdmin(false); axios.get('/api/scholarships').then((r) => setList(r.data.scholarships || [])) }} />}
      {showChat && <Chat />}

      {/* Sub-views */}
      {activeView === 'eligibility' ? <EligibilityChecker onSelectScholarship={setSelected} /> : null}
      {activeView === 'applications' ? (user.role === 'admin' ? <AdminApplications /> : <Applications />) : null}
      {activeView === 'notifications' ? <NotificationsCenter /> : null}

      {/* Overview: Scholarship cards */}
      {activeView === 'overview' && (
        <section className="panel panel-overview">
          <div className="section-head">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={20} color="var(--accent)" />
              {t.openOpportunities}
            </h2>
          </div>

          {list.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No scholarships found</h3>
              <p>Check back soon — new opportunities are added regularly.</p>
            </div>
          ) : (
            <div className="cards-grid">
              <AnimatePresence>
                {list.map((s, index) => (
                  <motion.article
                    key={s._id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="card"
                    onClick={() => setSelected(s)}
                  >
                    <div className="card-top">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="card-icon-badge">{getEmoji(index)}</div>
                        <strong>{s.title || s.name || s.provider}</strong>
                      </div>
                      {s.featured ? (
                        <span className="pill">
                          <Star size={10} /> {t.featured}
                        </span>
                      ) : null}
                    </div>
                    <p>{s.description || 'Click to view details and apply.'}</p>
                    <div className="meta-row" style={{ marginTop: '12px' }}>
                      <span className="muted" style={{ fontSize: '13px' }}>{s.provider}</span>
                      <span className="pill" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
                        {s.amount || 'Funding available'}
                      </span>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      )}

      {selected && (
        <AnimatePresence>
          <ScholarshipDetail scholarship={selected} onClose={() => setSelected(null)} />
        </AnimatePresence>
      )}
    </main>
  )
}