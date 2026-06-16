import React, { useState, useRef, useEffect } from 'react'

export default function Nav({ user, onLogout, onViewChange }) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Hardcoded student application history to match your project aesthetics
  const appliedHistory = [
    { id: 'app_01', name: 'Bihar Post Matric Scholarship (PMS)', status: 'Under Review', date: '12-06-2026' },
    { id: 'app_02', name: 'Central Sector Scheme of Scholarship', status: 'Approved', date: '04-05-2026' }
  ]

  useEffect(() => {
    // Close dropdown if clicking outside of the menu container
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      background: '#11111b', 
      padding: '14px 24px', 
      borderRadius: '14px', 
      border: '1px solid #313244', 
      boxShadow: '0 4px 24px rgba(0,0,0,0.2)', 
      margin: '24px 24px 0 24px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      
      {/* Brand Logo Segment */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #ff007f, #7928ca)', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <svg width="20" height="20" fill="#fff" viewBox="0 0 16 16">
            <path d="M8.21 13.893a.25.25 0 0 1-.42 0L5.21 8.814a.25.25 0 0 1 .21-.377h5.16a.25.25 0 0 1 .21.377l-2.58 5.079zM8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1z"/>
          </svg>
        </div>
        <div>
          <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '800', color: '#fff', letterSpacing: '-0.3px' }}>ScholarBridge</h2>
          <span style={{ fontSize: '10px', color: '#a6e3a1', fontWeight: '700', letterSpacing: '0.5px' }}>STUDENT PORTAL</span>
        </div>
      </div>

      {/* Right Side Navigation & Trigger Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }} ref={menuRef}>
        
        {/* Admin Quick Link Switcher (Only visible if an admin switches views) */}
        {user?.role === 'admin' && (
          <button 
            onClick={() => onViewChange('metrics')}
            style={{ background: '#313244', border: 'none', color: '#cba6f7', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            🎛️ Back to Admin Panel
          </button>
        )}

        {/* INTERACTIVE USER AVATAR TRIGGER */}
        <div 
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          style={{ 
            position: 'relative', 
            width: '42px', 
            height: '42px', 
            borderRadius: '50%', 
            background: '#313244', 
            border: profileMenuOpen ? '2px solid #ff007f' : '2px solid transparent', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            cursor: 'pointer', 
            transition: 'all 0.2s', 
            userSelect: 'none' 
          }}
        >
          <svg width="20" height="20" fill="#a6adc8" viewBox="0 0 16 16">
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          </svg>
          {/* Unread Alert Notification dot matching layout references */}
          <span style={{ position: 'absolute', top: '2px', right: '2px', width: '10px', height: '10px', background: '#f38ba8', borderRadius: '50%', border: '2px solid #11111b' }} />
        </div>

        {/* FLOATING GLASS CONTEXT POPUP CARD MENU */}
        {profileMenuOpen && (
          <div style={{ 
            position: 'absolute', 
            top: '52px', 
            right: '0', 
            width: '260px', 
            background: '#181825', 
            border: '1px solid #313244', 
            borderRadius: '12px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', 
            padding: '6px', 
            zIndex: 1100, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '2px' 
          }}>
            
            {/* Context Header Credentials */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #313244', marginBottom: '4px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{user?.name || 'Student User'}</div>
              <div style={{ fontSize: '11px', color: '#a6adc8', marginTop: '2px' }}>{user?.email || 'student@domain.com'}</div>
            </div>

            {/* Standard Dropdown Items */}
            {[
              ['👤', 'My Profile'],
              ['⚙️', 'Account Settings'],
              ['🐛', 'Buganizer', true], 
              ['📋', 'Active Sessions', true],
              ['❓', 'Troubleshooting'],
              ['✨', 'New Features', false, true], 
              ['🔔', 'Notifications']
            ].map(([icon, label, isLocked, hasBadge]) => (
              <div 
                key={label}
                className="nav-dropdown-item-hover"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px' }}>{icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#cdd6f4' }}>{label}</span>
                </div>
                
                {isLocked && <span style={{ fontSize: '12px', opacity: 0.5 }}>🔒</span>}
                {hasBadge && (
                  <span style={{ background: 'rgba(137, 180, 250, 0.15)', color: '#89b4fa', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>New</span>
                )}
              </div>
            ))}

            {/* INTEGRATED APPLICATION TRACKING SUB-DRAWER */}
            <div style={{ height: '1px', background: '#313244', margin: '4px 0' }} />
            <div style={{ padding: '6px 12px' }}>
              <span style={{ fontSize: '10px', color: '#cba6f7', fontWeight: '700', display: 'block', marginBottom: '6px', letterSpacing: '0.3px' }}>MY APPLICATION STATUSES</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '100px', overflowY: 'auto' }}>
                {appliedHistory.map(app => (
                  <div key={app.id} style={{ background: '#11111b', padding: '6px 8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#cdd6f4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{app.name}</span>
                    <span style={{ 
                      fontSize: '9px', 
                      fontWeight: '700', 
                      padding: '2px 4px', 
                      borderRadius: '4px', 
                      color: app.status === 'Approved' ? '#a6e3a1' : '#f9e2af',
                      background: app.status === 'Approved' ? 'rgba(166,227,161,0.1)' : 'rgba(249,226,175,0.1)'
                    }}>{app.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SIGN OUT OPERATION INTERFACE */}
            <div style={{ height: '1px', background: '#313244', margin: '4px 0' }} />
            <div 
              onClick={onLogout}
              className="nav-dropdown-logout-hover"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              <span style={{ fontSize: '14px', color: '#f38ba8' }}>➔</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#f38ba8' }}>Logout</span>
            </div>

          </div>
        )}
      </div>

      {/* Global Embedded Pseudo-Classes Hover Rules Injection */}
      <style>{`
        .nav-dropdown-item-hover:hover { background: #1e1e2e !important; }
        .nav-dropdown-logout-hover:hover { background: rgba(243, 139, 168, 0.1) !important; }
      `}</style>
    </nav>
  )
}
