import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { setupAxiosInterceptors } from './app/auth/interceptors/setupAxios'
import './index.css'
import App from './App.tsx'

setupAxiosInterceptors()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)