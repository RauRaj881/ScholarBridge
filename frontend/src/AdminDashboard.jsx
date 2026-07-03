import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'

export default function AdminDashboard({ onOpenScholarships, onLogout }) {
  const [metrics, setMetrics] = useState(null)
  const [auditData, setAuditData] = useState({ users: [], activities: [] })
  const [allScholarships, setAllScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const [showManager, setShowManager] = useState(false)

  // Floating Context Menu Control State
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Ingestion Form State Controls
  const [title, setTitle] = useState('')
  const [provider, setProvider] = useState('')
  const [amount, setAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [applicationLink, setApplicationLink] = useState('')

  useEffect(() => {
    refreshDashboardData()

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const refreshDashboardData = () => {
    Promise.all([
      axios.get('/api/admin/metrics'),
      axios.get('/api/admin/users-activity'),
      axios.get('/api/scholarships')
    ]).then(([mRes, aRes, sRes]) => {
      setMetrics(mRes.data)
      setAuditData(aRes.data)
      setAllScholarships(sRes.data.scholarships || [])
      setLoading(false)
    }).catch(err => {
      console.error('Data pipeline linkage failure:', err)
      setLoading(false)
    })
  }

  const handleAddScholarship = async (e) => {
    e.preventDefault()
    if (!title || !provider) return alert('Scheme Name and Provider are required!')
    try {
      const res = await axios.post('/api/admin/scholarships', { title, provider, amount, deadline, description, applicationLink })
      if (res.data.success) {
        setTitle(''); setProvider(''); setAmount(''); setDeadline(''); setDescription(''); setApplicationLink('')
        alert('🎉 Scholarship added to catalog successfully!')
        refreshDashboardData()
      }
    } catch (err) { alert(err.response?.data?.message || 'Execution fault') }
  }

  const handleMarkExpired = async (id) => {
    if (!window.confirm("Mark this scholarship scheme as expired?")) return
    try {
      const res = await axios.patch(`/api/admin/scholarships/${id}/expire`)
      if (res.data.success) refreshDashboardData()
    } catch (err) { console.error(err) }
  }

  const handleDeleteScholarship = async (id) => {
    if (!window.confirm("Permanently erase record from database?")) return
    try {
      const res = await axios.delete(`/api/admin/scholarships/${id}`)
      if (res.data.success) refreshDashboardData()
    } catch (err) { console.error(err) }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#09090b', color: '#cdd6f4' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid #1f1f2e', borderTopColor: '#ff007f', borderRadius: '50%', animation: 'spin 0.8s linear infinite', boxShadow: '0 0 15px rgba(255, 0, 127, 0.3)' }} />
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#a6adc8', letterSpacing: '1px', fontWeight: '500' }}>INITIALIZING SECURE ENGINE CORE...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', color: '#cdd6f4', fontFamily: 'system-ui, -apple-system, sans-serif', background: 'radial-gradient(circle at 50% -20%, #1e102f 0%, #09090b 70%)', minHeight: '100vh' }}>
      
      {/* GLOW BACKGROUND EFFECT BLOCKS */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'rgba(121, 40, 202, 0.08)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '40%', right: '5%', width: '350px', height: '350px', background: 'rgba(255, 0, 127, 0.05)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        
        {/* TOP CONTROL HEADER LAYOUT BLOCK */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px', background: 'rgba(17, 17, 27, 0.6)', padding: '20px 28px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '48px', height: '48px', background: 'linear-gradient(135deg, #ff007f 0%, #7928ca 100%)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(255, 0, 127, 0.4)' }}>
              <svg width="24" height="24" fill="#fff" viewBox="0 0 16 16">
                <path d="M11.5 4a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 .5-.5zm-3 2a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5zm-3 1.5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-1 0v-1.5a.5.5 0 0 1 .5-.5z"/>
                <path d="M14 0a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12zM2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2z"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>Live Platform Control Dashboard</h1>
              <p style={{ margin: '4px 0 0 0', color: '#a6adc8', fontSize: '13px', fontWeight: '500' }}>AI Matrix Verification & Operation Analytics Terminal</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} ref={menuRef}>
            <button 
              onClick={() => setShowManager(!showManager)}
              className="action-btn-glow"
              style={{ background: showManager ? '#181825' : 'linear-gradient(135deg, #7928ca 0%, #ff007f 100%)', border: showManager ? '1px solid #45475a' : 'none', color: '#fff', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: showManager ? 'none' : '0 4px 15px rgba(255, 0, 127, 0.3)' }}
            >
              {showManager ? "✕ Close System Editor" : "✏️ Ingest New Scholarship Scheme"}
            </button>

            {/* PROFILE MENU CORE TRIGGER */}
            <div 
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              style={{ position: 'relative', width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e1e2e 0%, #313244 100%)', border: profileMenuOpen ? '2px solid #ff007f' : '2px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            >
              <svg width="20" height="20" fill={profileMenuOpen ? "#ff007f" : "#cdd6f4"} viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </svg>
              <span style={{ position: 'absolute', top: '1px', right: '1px', width: '10px', height: '10px', background: '#f38ba8', borderRadius: '50%', border: '2px solid #09090b', boxShadow: '0 0 8px #f38ba8' }} />
            </div>

            {/* CONTEXT DROPDOWN BLOCK */}
            {profileMenuOpen && (
              <div style={{ position: 'absolute', top: '56px', right: '0', width: '250px', background: 'rgba(24, 24, 37, 0.95)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', boxShadow: '0 16px 40px rgba(0,0,0,0.6)', padding: '8px', zIndex: 1100, backdropFilter: 'blur(20px)', animation: 'fadeInDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '6px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Admin System Root</div>
                  <div style={{ fontSize: '11px', color: '#a6adc8', marginTop: '2px' }}>test2@gmail.com</div>
                </div>
                {[
                  ['👤', 'My Profile'],
                  ['⚙️', 'Account Settings'],
                  ['🐛', 'Buganizer', true],
                  ['📋', 'Active Sessions', true],
                  ['❓', 'Troubleshooting'],
                  ['✨', 'New Features', false, true],
                  ['🔔', 'Notifications']
                ].map(([icon, label, isLocked, hasBadge]) => (
                  <div key={label} className="menu-item-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '14px' }}>{icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#cdd6f4' }}>{label}</span>
                    </div>
                    {isLocked && <span style={{ fontSize: '12px', opacity: 0.4 }}>🔒</span>}
                    {hasBadge && <span style={{ background: 'rgba(255, 0, 127, 0.15)', color: '#ff007f', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>New</span>}
                  </div>
                ))}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />
                <div onClick={onLogout} className="menu-logout-hover" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: '14px', color: '#f38ba8' }}>➔</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#f38ba8' }}>Logout Account</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* METRICS INTERACTIVE COUNTERS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '36px' }}>
        {[
          ['Total Accounts', metrics?.users || 0, 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 'rgba(59, 130, 246, 0.15)'],
          ['Active Students', metrics?.students || 0, 'linear-gradient(135deg, #10b981 0%, #047857 100%)', 'rgba(16, 185, 129, 0.15)'],
          ['Active Schemes', metrics?.scholarships || 0, 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', 'rgba(245, 158, 11 0.15)'],
          ['Incoming Submissions', metrics?.applications || 0, 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', 'rgba(139, 92, 246, 0.15)']
        ].map(([label, value, gradient, shadowColor]) => (
          <div key={label} className="metric-card-hover" style={{ background: 'rgba(30, 30, 46, 0.4)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(8px)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ color: '#a6adc8', fontSize: '14px', fontWeight: '600', letterSpacing: '0.3px' }}>{label}</span>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: gradient, boxShadow: `0 0 10px ${shadowColor}` }} />
            </div>
            <h3 style={{ fontSize: '38px', margin: 0, fontWeight: '800', color: '#fff', letterSpacing: '-1px' }}>{value}</h3>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: gradient }} />
          </div>
        ))}
      </div>

      {/* EXPANDABLE PLUG MANAGER FORM DRAWER */}
      {showManager && (
        <div style={{ background: 'rgba(17, 17, 27, 0.8)', padding: '28px', borderRadius: '20px', border: '1px solid #ff007f', marginBottom: '36px', boxShadow: '0 0 30px rgba(255, 0, 127, 0.15)', backdropFilter: 'blur(12px)', animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{ fontSize: '20px' }}>⚙️</span>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '800' }}>Ingest & Configure Scholarship Catalog Matrix</h3>
          </div>
          <form onSubmit={handleAddScholarship} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <input type="text" placeholder="Scholarship Title *" value={title} onChange={e => setTitle(e.target.value)} style={{ padding: '14px 16px', background: '#09090b', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }} required />
            <input type="text" placeholder="Funding Provider / Ministry *" value={provider} onChange={e => setProvider(e.target.value)} style={{ padding: '14px 16px', background: '#09090b', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', borderRadius: '10px', fontSize: '14px', outline: 'none' }} required />
            <input type="text" placeholder="Grant Amount (e.g., ₹50,000)" value={amount} onChange={e => setAmount(e.target.value)} style={{ padding: '14px 16px', background: '#09090b', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ padding: '14px 16px', background: '#09090b', border: '1px solid rgba(255,255,255,0.06)', color: '#a6adc8', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
            <input type="url" placeholder="Application URL (official link)" value={applicationLink} onChange={e => setApplicationLink(e.target.value)} style={{ gridColumn: '1 / span 2', padding: '14px 16px', background: '#09090b', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
            <textarea placeholder="Brief description of eligibility criteria and documentation requirements..." value={description} onChange={e => setDescription(e.target.value)} rows="3" style={{ gridColumn: '1 / span 2', padding: '14px 16px', background: '#09090b', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'none' }} />
            <div style={{ gridColumn: '1 / span 2', textAlign: 'right' }}>
              <button type="submit" style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #7928ca 0%, #ff007f 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 20px rgba(255, 0, 127, 0.3)' }}>💾 Save & Publish Live Model</button>
            </div>
          </form>
        </div>
      )}

      {/* CORE CONTROL HUB MATRIX PANELS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* DATA BLOCK 1: STUDENT PROFILES */}
        <div style={{ background: 'rgba(17, 17, 27, 0.5)', padding: '28px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(10px)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{ fontSize: '18px', color: '#3b82f6' }}>👤</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#fff' }}>Student Base Record Directory</h3>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '400px', paddingRight: '4px' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#a6adc8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ paddingBottom: '14px', paddingLeft: '8px' }}>Student Profile</th>
                  <th style={{ paddingBottom: '14px' }}>Registered Course</th>
                  <th style={{ paddingBottom: '14px', paddingRight: '8px' }}>Domicile</th>
                </tr>
              </thead>
              <tbody>
                {auditData.users && auditData.users.map(u => (
                  <tr key={u._id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 8px' }}>
                      <span style={{ fontWeight: '700', color: '#fff', fontSize: '14px' }}>{u.name}</span>
                      <span style={{ display: 'block', color: '#a6adc8', fontSize: '12px', marginTop: '2px' }}>{u.email}</span>
                    </td>
                    <td>
                      <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                        {u.course || 'Unset'}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#cdd6f4', paddingRight: '8px', fontWeight: '500' }}>{u.state || 'Unset'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DATA BLOCK 2: OPPORTUNITIES SCHEMES */}
        <div style={{ background: 'rgba(17, 17, 27, 0.5)', padding: '28px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(10px)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{ fontSize: '18px', color: '#f59e0b' }}>📖</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#fff' }}>Active Opportunity Database Index ({allScholarships.length})</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
            {allScholarships.map(s => (
              <div key={s._id} className="scheme-item-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)', transition: 'all 0.2s ease' }}>
                <div>
                  <strong style={{ color: '#fff', fontSize: '15px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>{s.title}</strong>
                  <div style={{ fontSize: '13px', color: '#a6adc8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{s.provider}</span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#585b70' }} />
                    <span style={{ color: '#a6e3a1', fontWeight: '700' }}>{s.amount || 'Variable Fund'}</span>
                  </div>
                  {s.applicationLink && (
                    <a href={s.applicationLink} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '6px', color: '#89b4fa', fontSize: '12px', textDecoration: 'none' }}>
                      Open application link
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleMarkExpired(s._id)} style={{ padding: '8px 14px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', cursor: 'pointer', color: '#f59e0b', fontSize: '12px', fontWeight: '700', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = '#11111b'; }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.12)'; e.currentTarget.style.color = '#f59e0b'; }}>Expire</button>
                  <button onClick={() => handleDeleteScholarship(s._id)} style={{ padding: '8px 14px', background: 'rgba(243, 139, 168, 0.12)', border: '1px solid rgba(243, 139, 168, 0.2)', borderRadius: '8px', cursor: 'pointer', color: '#f38ba8', fontSize: '12px', fontWeight: '700', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.background = '#f38ba8'; e.currentTarget.style.color = '#11111b'; }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(243, 139, 168, 0.12)'; e.currentTarget.style.color = '#f38ba8'; }}>Delete</button>
                </div>
              </div>
            ))}
            
            {allScholarships.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📦</span>
                <p style={{ margin: 0, color: '#585b70', fontSize: '13px', fontWeight: '500' }}>No scholarships active in current database cluster registry.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* STYLES INTERACTION ENGINES */}
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        
        .metric-card-hover:hover { transform: translateY(-4px); border-color: rgba(255, 255, 255, 0.08) !important; background: rgba(30, 30, 46, 0.6) !important; box-shadow: 0 12px 30px rgba(0,0,0,0.25); }
        .action-btn-glow:hover { box-shadow: 0 0 25px rgba(255, 0, 127, 0.5) !important; transform: translateY(-1px); }
        .menu-item-hover:hover { background: rgba(255,255,255,0.05) !important; }
        .menu-logout-hover:hover { background: rgba(243, 139, 168, 0.1) !important; }
        .table-row-hover:hover { background: rgba(255,255,255,0.02) !important; }
        .scheme-item-card:hover { border-color: rgba(255,255,255,0.08) !important; background: rgba(255,255,255,0.04) !important; }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); borderRadius: '10px'; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}</style>
    </div>
  )
}