import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import ServerWakeGate from './Components/ServerWakeGate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ServerWakeGate>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ServerWakeGate>
  </StrictMode>
)