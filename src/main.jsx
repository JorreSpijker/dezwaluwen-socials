import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@fontsource/archivo/latin-500.css'
import '@fontsource/archivo/latin-600.css'
import '@fontsource/archivo/latin-700.css'
import '@fontsource/archivo/latin-800.css'
import '@fontsource/archivo/latin-900.css'
import '@fontsource/barlow-semi-condensed/latin-400.css'
import '@fontsource/barlow-semi-condensed/latin-500.css'
import '@fontsource/barlow-semi-condensed/latin-600.css'
import '@fontsource/barlow-semi-condensed/latin-700.css'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
