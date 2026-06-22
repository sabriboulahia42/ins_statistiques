/**
 * INTEGRATION_EXAMPLE.jsx
 * ──────────────────────────────────────────────────────────────
 * Example of how to integrate the authentication system
 * into your main React application
 * ──────────────────────────────────────────────────────────────
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import auth system
import { AuthProvider } from './src/auth/AuthContext';
import ProtectedRoute from './src/auth/ProtectedRoute';

// Import pages
import LoginPage from './src/pages/LoginPage';
import AdminDashboard from './src/pages/AdminDashboard';

// Import your existing pages
import App from './App';  // Your main public site

/**
 * Root application component with authentication
 */
export default function RootApp() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ─── Public Pages ───────────────────────────── */}
          <Route path="/" element={<App />} />
          
          {/* ─── Authentication Pages ───────────────────── */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* ─── Admin Dashboard (Protected) ───────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* ─── Catch-all redirect ───────────────────── */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

/**
 * USAGE IN YOUR MAIN APP.JSX:
 * 
 * Before: export default App;
 * After:  export default RootApp;
 * 
 * Or wrap your existing App:
 * 
 *   <AuthProvider>
 *     <App />
 *   </AuthProvider>
 */

/**
 * ──────────────────────────────────────────────────────────
 * USAGE IN COMPONENTS
 * ──────────────────────────────────────────────────────────
 */

// Example: Show content only for authenticated users
export function UserGreeting() {
  const { user, isAuthenticated } = require('./src/auth/AuthContext').useAuth();

  if (!isAuthenticated) {
    return <p><a href="/login">Please log in</a></p>;
  }

  return <h1>Welcome, {user.name}!</h1>;
}

// Example: Admin-only content
export function AdminPanel() {
  const { isAdmin, user } = require('./src/auth/AuthContext').useAuth();

  if (!isAdmin) {
    return <p>You don't have admin access</p>;
  }

  return (
    <div>
      <h2>Admin Panel</h2>
      <a href="/dashboard">Go to Dashboard</a>
    </div>
  );
}

// Example: API request with auth token
export function DataFetcher() {
  const { token } = require('./src/auth/AuthContext').useAuth();

  async function fetchUserData() {
    const response = await fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  }

  return (
    <button onClick={() => fetchUserData()}>
      Fetch User Data
    </button>
  );
}

/**
 * ──────────────────────────────────────────────────────────
 * PROTECTING API ENDPOINTS IN BACKEND
 * ──────────────────────────────────────────────────────────
 */

/*
// Example backend route protection in proxy.js:

const { verifyToken, requireAdmin } = require('./auth/middleware');

// Public endpoint
app.get('/api/public-data', (req, res) => {
  res.json({ data: 'Anyone can access this' });
});

// Authenticated users only
app.get('/api/user-data', verifyToken, (req, res) => {
  res.json({ 
    message: `Hello, user ${req.user.id}`,
    userId: req.user.id
  });
});

// Admin only
app.post('/api/admin/config', requireAdmin, (req, res) => {
  res.json({ success: true, message: 'Admin action completed' });
});

// Optional authentication (public, but enhanced for logged-in users)
const { optionalToken } = require('./auth/middleware');

app.get('/api/stats', optionalToken, (req, res) => {
  const response = { stats: { ... } };
  
  if (req.user) {
    // Add extra stats for authenticated users
    response.personalStats = { ... };
  }
  
  res.json(response);
});
*/
