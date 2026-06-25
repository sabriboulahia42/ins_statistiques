import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// ── SECURITY GATE: Cooperates with Backend Middleware ──────────
const getToken = () => localStorage.getItem('token');
const getUser = () => {
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};

const currentPath = window.location.pathname;
const publicPaths = ['/', '/login', '/privacy', '/terms'];
const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));

// If accessing a protected route (like /dashboard) without token -> Redirect to Login
if (!isPublicPath) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    console.warn('[Security] No valid session. Redirecting to login.');
    window.location.href = '/login';
    // Stop rendering to prevent flash of protected content
    throw new Error('Redirecting to login...');
  }
  
  // Optional: Log successful auth check
  console.log('[Security] User authenticated:', user.email, 'Role:', user.role);
}
// ───────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
