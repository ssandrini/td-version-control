import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import "@fontsource/montserrat"
import "@fontsource/montserrat/700.css"
import log from 'electron-log/renderer';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  log.info(message)
})
