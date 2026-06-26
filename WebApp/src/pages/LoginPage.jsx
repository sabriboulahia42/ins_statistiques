import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { theme } from '../../shared/core/theme.js'; // Import shared theme

export default function LoginPage() {
  const { login, error: authError } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fbSdkLoaded, setFbSdkLoaded] = useState(false);

  const getBackendUrl = () => {
    return window.location.hostname === 'localhost' 
      ? 'http://localhost:3080' 
      : 'https://ins-statistiques.onrender.com';
  };

  // Load Facebook SDK
  useEffect(() => {
    const appId = process.env.REACT_APP_FACEBOOK_APP_ID; 
    if (!appId) {
      console.warn('Facebook App ID missing.');
      return;
    }

    window.fbAsyncInit = function() {
      window.FB.init({ appId, cookie: true, xfbml: true, version: 'v18.0' });
      setFbSdkLoaded(true);
      window.FB.getLoginStatus((response) => {
        if (response.status === 'connected') console.log('FB Connected');
      });
    };

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);
    try {
      if (isLoginMode) {
        await login(email, password);
        window.location.href = '/dashboard';
      } else {
        setLocalError('Registration not implemented.');
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthRedirect = (provider) => {
    window.location.href = `${getBackendUrl()}/auth/${provider}`;
  };

  const handleFacebookLogin = () => {
    if (!window.FB || !fbSdkLoaded) {
      handleOAuthRedirect('facebook');
      return;
    }
    window.FB.login((response) => {
      if (response.authResponse) {
        window.location.href = `${getBackendUrl()}/auth/facebook/callback?access_token=${response.authResponse.accessToken}`;
      } else {
        setLocalError('Facebook login cancelled.');
      }
    }, { scope: 'public_profile,email' });
  };

  // --- Unified Styles using theme.js ---
  const containerStyle = {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  };

  const cardStyle = {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.border}`,
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: theme.typography.size.md,
    boxSizing: 'border-box',
  };

  const buttonPrimaryStyle = {
    width: '100%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.size.md,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: theme.spacing.md,
  };

  const socialContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  };

  const socialButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    cursor: 'pointer',
    fontSize: theme.typography.size.sm,
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: theme.spacing.lg }}>
          <h1 style={{ color: theme.colors.primary, margin: 0, fontSize: theme.typography.size.xl }}>
            🇹🇳 INS Statistics Portal
          </h1>
          <p style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>Administration Access</p>
        </div>

        {(localError || authError) && (
          <div style={{ 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            padding: theme.spacing.sm, 
            borderRadius: theme.borderRadius.sm, 
            marginBottom: theme.spacing.md,
            fontSize: theme.typography.size.sm
          }}>
            ⚠️ {localError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'left', marginBottom: theme.spacing.sm }}>
            <label style={{ fontSize: theme.typography.size.sm, fontWeight: 'bold' }}>Email</label>
          </div>
          <input
            type="email"
            placeholder="admin@ins.tn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <div style={{ textAlign: 'left', marginBottom: theme.spacing.sm }}>
            <label style={{ fontSize: theme.typography.size.sm, fontWeight: 'bold' }}>Password</label>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <button 
            type="submit" 
            style={{...buttonPrimaryStyle, opacity: isSubmitting ? 0.7 : 1}}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ 
          margin: `${theme.spacing.lg} 0`, 
          borderTop: `1px solid ${theme.colors.border}`, 
          position: 'relative' 
        }}>
          <span style={{ 
            position: 'absolute', 
            top: '-10px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            backgroundColor: theme.colors.surface, 
            padding: `0 ${theme.spacing.sm}`, 
            color: theme.colors.textMuted,
            fontSize: theme.typography.size.xs
          }}>
            OR CONNECT WITH
          </span>
        </div>

        <div style={socialContainerStyle}>
          <button type="button" style={socialButtonStyle} onClick={() => handleOAuthRedirect('google')}>
            <span>Google</span>
          </button>
          
          <button type="button" style={socialButtonStyle} onClick={handleFacebookLogin}>
            <span>Facebook</span>
          </button>

          <button type="button" style={socialButtonStyle} onClick={() => handleOAuthRedirect('github')}>
            <span>GitHub</span>
          </button>
        </div>

        <div style={{ marginTop: theme.spacing.xl, paddingTop: theme.spacing.md, borderTop: `1px solid ${theme.colors.border}` }}>
          <p style={{ fontSize: theme.typography.size.xs, color: theme.colors.textMuted }}>
            <strong>Demo:</strong> admin@ins.tn / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
