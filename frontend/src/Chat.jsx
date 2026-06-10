import React, { useState } from 'react'
import axios from 'axios'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('local')

  function appendMessage(role, content, extra = {}) {
    setMessages((s) => [...s, { role, content, ...extra }])
  }

  async function send() {
    if (!input) return
    const m = { role: 'user', content: input }
    setMessages((s)=>[...s, m])
    setInput('')
    setLoading(true)
    try {
      const res = await axios.post('/api/ai/chat', { message: m.content })
      setMode(res.data.mode || 'local')
      appendMessage('assistant', res.data.reply, { recommendations: res.data.recommendations || [] })
    } catch (err) {
      appendMessage('assistant', 'I could not reach the assistant right now. Try the Eligibility tab or ask for recommendations.')
    } finally { setLoading(false) }
  }

  async function recommend() {
    setLoading(true)
    try {
      const res = await axios.post('/api/ai/recommend')
      setMode(res.data.mode || 'local')
      const suggestions = Array.isArray(res.data.suggestions) ? res.data.suggestions : []
      appendMessage('assistant', suggestions.length ? 'Here are the best current matches from the catalog.' : 'No recommendations found yet.', { recommendations: suggestions })
    } catch (err) {
      appendMessage('assistant', 'Recommendation search failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="panel chat-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">BHAROSA AI</p>
          <h2>Scholarship assistant</h2>
        </div>
        <span className={`pill ${mode === 'openai' ? 'mode-openai' : 'mode-local'}`}>
          {mode === 'openai' ? 'Online AI enabled' : 'Local catalog mode'}
        </span>
      </div>
      <div className="chat-window">
        {messages.map((m, i)=>(
          <div key={i} className={`chat-bubble ${m.role}`}>
            <strong>{m.role}:</strong> <span className="chat-text">{m.content}</span>
            {m.recommendations?.length ? (
              <div className="chips-row chat-recommendations">
                {m.recommendations.map((item) => (
                  <span key={item.id || item.title} className="pill">
                    {item.title}{item.amount ? ` · ${item.amount}` : ''}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div style={{marginTop:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask BHAROSA..." style={{width:'70%'}} />
        <button className="primary" onClick={send} disabled={loading}>Send</button>
        <button onClick={recommend} style={{marginLeft:8}} disabled={loading}>Recommend</button>
      </div>
    </div>
  )
}
