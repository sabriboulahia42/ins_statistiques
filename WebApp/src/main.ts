import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Helper to get token (matches how you save it in LoginPage)
const getToken = () => localStorage.getItem('token');
const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Protected Route Logic
const currentPath = window.location.pathname;
const publicPaths = ['/', '/login', '/privacy', '/terms'];
const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));

if (!isPublicPath) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    // No token? Redirect to login immediately.
    // The backend middleware will also block any API calls if they try to bypass this.
    console.warn('[Security] No valid session found. Redirecting to login.');
    window.location.href = '/login';
  } else {
    // Optional: Role-based redirection could happen here too, 
    // but usually handled by the backend API responses or inside App.jsx
    console.log('[Security] User authenticated:', user.email);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
