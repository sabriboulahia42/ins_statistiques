import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// ── SECURITY GATE: Check Auth BEFORE rendering React ──────────
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
// Define public paths that do NOT require auth
const publicPaths = ['/', '/login', '/privacy', '/terms'];
const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));

if (!isPublicPath) {
  const token = getToken();
  const user = getUser();

  // If no token or no user found on a protected route, redirect to login
  if (!token || !user) {
    console.warn('[Security] No valid session found. Redirecting to login.');
    window.location.href = '/login';
    // Stop rendering React to prevent flash of content
    throw new Error('Redirecting to login...');
  } else {
    console.log('[Security] User authenticated:', user.email, 'Role:', user.role);
  }
}
// ───────────────────────────────────────────────────────────────

// Use React.createElement to avoid JSX in .ts files
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    React.StrictMode,
    null,
    React.createElement(
      BrowserRouter,
      null,
      React.createElement(App)
    )
  );
} else {
  console.error('Failed to find the root element');
}
