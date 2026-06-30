import React from 'react';
import { useAuth } from '../auth/AuthContext';

/**
 * ProtectedRoute - Restricts access to authenticated admins only
 */
export default function ProtectedRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7fafc',
        fontSize: '18px',
        color: '#718096'
      }}>
        Loading...
      </div>
    );
  }

  if (!user || !isAdmin) {
    window.location.href = '/login';
    return null;
  }

  return children;
}
