import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext - Global authentication state management
 * Stores user, token, and auth methods
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('authUser');
        }
      }
      // Verify token is still valid
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (t) => {
    try {
      const res = await fetch('/auth/me', {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      
      if (!res.ok) {
        throw new Error('Token invalid');
      }

      const data = await res.json();
      setUser(data.user);
      setError(null);
    } catch (err) {
      // Token expired or invalid
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const isAdmin = user?.role === 'admin';
  const isEditor = ['admin', 'editor'].includes(user?.role);
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      isAuthenticated,
      isAdmin,
      isEditor,
      login,
      register,
      logout,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
