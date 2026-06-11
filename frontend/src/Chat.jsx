import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('local')
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'English')
  const windowEndRef = useRef(null)

  const quickQuestions = {
    English: [
      "Bihar Post-Matric Scholarship criteria?",
      "Best scholarships for Engineering students?",
      "Any private banking scholarships?",
      "What documents are generally required?"
    ],
    Hindi: [
      "बिहार पोस्ट-मैट्रिक स्कॉलरशिप के लिए क्या योग्यता चाहिए?",
      "इंजीनियरिंग छात्रों के लिए सबसे बेहतरीन स्कॉलरशिप कौन सी हैं?",
      "क्या कोई प्राइवेट बैंकिंग स्कॉलरशिप उपलब्ध हैं?",
      "सामान्य रूप से कौन से दस्तावेज़ आवश्यक होते हैं?"
    ],
    Hinglish: [
      "Bihar Post-Matric Scholarship criteria kya hai?",
      "Best scholarships for Engineering students?",
      "Any private banking scholarships available?",
      "Documents me kya kya lagta hai generally?"
    ]
  }

  const getQuickQuestions = () => {
    if (language === 'Hindi') return quickQuestions.Hindi
    if (language === 'Hinglish') return quickQuestions.Hinglish
    return quickQuestions.English
  }

  useEffect(() => {
  // Only auto-scroll if the very last message came from the assistant
  const lastMessage = messages[messages.length - 1];
  
  if (lastMessage && lastMessage.role === 'assistant') {
    windowEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
}, [messages]);

  useEffect(() => {
    const handleLangChange = () => {
      setLanguage(localStorage.getItem('language') || 'English')
    }
    window.addEventListener('languageChange', handleLangChange)
    return () => window.removeEventListener('languageChange', handleLangChange)
  }, [])

  function appendMessage(role, content, extra = {}) {
    setMessages((s) => [...s, { role, content, ...extra }])
  }

  async function send(textToSend) {
    const messageContent = textToSend || input
    if (!messageContent) return
    
    const m = { role: 'user', content: messageContent }
    setMessages((s) => [...s, m])
    if (!textToSend) setInput('')
    setLoading(true)
    
    try {
      const res = await axios.post('/api/ai/chat', { message: m.content, language })
      setMode(res.data.mode || 'local')
      appendMessage('assistant', res.data.reply, { recommendations: res.data.recommendations || [] })
    } catch (err) {
      const detail = err?.response?.data?.error || err?.message || ''
      const msg = detail.includes('quota') || detail.includes('QUOTA')
        ? '⚠️ Gemini quota limit reached. Please wait a minute and try again.'
        : '❌ Could not reach Open Bharosa. Please check your internet connection or try again.'
      appendMessage('assistant', msg)
    } finally {
      setLoading(false)
    }
  }

  async function recommend() {
    setLoading(true)
    try {
      const res = await axios.post('/api/ai/recommend')
      setMode(res.data.mode || 'local')
      const suggestions = Array.isArray(res.data.suggestions) ? res.data.suggestions : []
      appendMessage('assistant', suggestions.length ? 'Here are the best matches from the scholarship database.' : 'No recommendations found yet.', { recommendations: suggestions })
    } catch (err) {
      appendMessage('assistant', 'Recommendation search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel chat-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">ScholarBridge AI Assistant</p>
          <h2>Your Scholarship Assistant</h2>
        </div>
        <span className={`pill ${mode === 'gemini' ? 'mode-openai' : 'mode-local'}`}>
          {mode === 'gemini' ? 'Gemini AI active' : 'Local Search mode'}
        </span>
      </div>

      <div className="chat-window">
        {messages.length === 0 && (
          <div className="chat-placeholder">
            <p className="muted">नमस्ते! I am <strong>Open Bharosa</strong>. Ask me anything about scholarships, eligibility, or application processes!</p>
            <div className="quick-chips">
              {getQuickQuestions().map((q, idx) => (
                <button key={idx} className="quick-chip-btn" onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble-container ${m.role}`}>
            <div className="chat-bubble-author">{m.role === 'user' ? 'You' : 'Open Bharosa'}</div>
            <div className={`chat-bubble ${m.role}`}>
              <span className="chat-text">{m.content}</span>
              {m.recommendations?.length ? (
                <div className="chips-row chat-recommendations">
                  {m.recommendations.map((item) => (
                    <span key={item.id || item.title} className="pill recommendation-pill">
                      ⭐ {item.title}{item.amount ? ` · ${item.amount}` : ''}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble-container assistant">
            <div className="chat-bubble-author">Open Bharosa</div>
            <div className="chat-bubble assistant typing-indicator">
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={windowEndRef} />
      </div>

      <div className="chat-input-row">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type your message to Open Bharosa..." 
        />
        <button className="primary" onClick={() => send()} disabled={loading}>Send</button>
        <button className="secondary" onClick={recommend} disabled={loading}>Recommend</button>
      </div>
    </div>
  )
}
