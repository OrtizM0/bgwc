// main.jsx
// Entry point for the React application

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'  // Enables client-side routing
import './index.css'  // Global CSS
import App from './App.jsx' // Main App Component

// Create a React root and render the application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter wraps the App to enable React Router functionality */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
