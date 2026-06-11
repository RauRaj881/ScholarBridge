import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Nav({ user, onLogout }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'indigo')
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'English')

  useEffect(() => {
    if (theme === 'indigo') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('language', language)
    // Dispatch a custom event to notify other components (like Chat) of the language change
    window.dispatchEvent(new Event('languageChange'))
  }, [language])

  async function logout() {
    await axios.post('/api/auth/logout')
    onLogout()
  }

  return (
    <div className="topbar">
      <div>
        <strong>ScholarBridge</strong>
        <div className="muted">Open Bharosa Scholarship Hub</div>
      </div>
      <div className="topbar-actions">
        <select 
          className="theme-switcher" 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="English">🇬🇧 English</option>
          <option value="Hindi">🇮🇳 Hindi (हिन्दी)</option>
          <option value="Hinglish">🇮🇳 Hinglish</option>
          <option value="Bengali">🇮🇳 Bengali (বাংলা)</option>
          <option value="Marathi">🇮🇳 Marathi (मराठी)</option>
          <option value="Telugu">🇮🇳 Telugu (తెలుగు)</option>
          <option value="Tamil">🇮🇳 Tamil (தமிழ்)</option>
          <option value="Gujarati">🇮🇳 Gujarati (ગુજરાતી)</option>
          <option value="Kannada">🇮🇳 Kannada (ಕನ್ನಡ)</option>
          <option value="Odia">🇮🇳 Odia (ଓଡ଼ିଆ)</option>
          <option value="Punjabi">🇮🇳 Punjabi (ਪੰਜਾਬੀ)</option>
        </select>
        
        <select 
          className="theme-switcher" 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="indigo">🌌 Indigo Nebula</option>
          <option value="emerald">🌲 Emerald Aurora</option>
          <option value="sunset">🌅 Sunset Rose</option>
          <option value="cyberpunk">⚡ Cyberpunk Gold</option>
          <option value="amethyst">🔮 Amethyst Glow</option>
        </select>
        <span>{user.name} ({user.role})</span>
        <button onClick={logout}>Sign out</button>
      </div>
    </div>
  )
}
