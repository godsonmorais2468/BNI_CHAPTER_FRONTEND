import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

/* Weak phones (little memory, few cores, data saver or reduced motion) get a lighter look: no blur, no animation. */
const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
if ((nav.deviceMemory ?? 8) <= 4 || (nav.hardwareConcurrency ?? 8) <= 4 || nav.connection?.saveData || matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('lite')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
