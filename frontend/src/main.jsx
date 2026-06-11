import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import "./styles.css";
import axios from 'axios'

axios.defaults.withCredentials = true
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || ''

// Removed React.StrictMode to prevent double-rendering animation bugs
createRoot(document.getElementById('root')).render(
  <App />
)