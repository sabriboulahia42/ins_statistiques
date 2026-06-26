import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

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
        setLocalError('Registration not implemented yet.');
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

  const handleTwitterClick = () => {
    alert('Twitter (X) login is currently unavailable.');
  };

  // Original Dark Theme Styles
  const styles = {
    wrapper: {
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    },
    card: {
      backgroundColor: '#1e293b',
      padding: '32px',
      borderRadius: '12px',
      border: '1px solid #334155',
      width: '100%',
      maxWidth: '450px',
      boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px',
      textAlign: 'center',
    },
    header: { marginBottom: '24px' },
    title: { color: '#0056b3', margin: '0px', fontSize: '28px' },
    subtitle: { color: '#94a3b8', marginTop: '4px' },
    formGroup: { textAlign: 'left', marginBottom: '8px' },
    label: { fontSize: '14px', fontWeight: 'bold' },
    input: {
      width: '100%',
      padding: '16px',
      marginBottom: '16px',
      borderRadius: '8px',
      border: '1px solid #334155',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontSize: '16px',
      boxSizing: 'border-box',
    },
    button: {
      width: '100%',
      padding: '16px',
      backgroundColor: '#0056b3',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '16px',
      opacity: 1,
    },
    divider: {
      borderTop: '1px solid #334155',
      position: 'relative',
      marginTop: '24px',
      marginBottom: '24px',
    },
    dividerText: {
      position: 'absolute',
      top: '-10px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#1e293b',
      color: '#94a3b8',
      fontSize: '12px',
      padding: '0 8px',
    },
    socialContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    socialButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      padding: '8px',
      borderRadius: '8px',
      border: '1px solid #334155',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      cursor: 'pointer',
      fontSize: '14px',
    },
    footer: {
      marginTop: '32px',
      paddingTop: '16px',
      borderTop: '1px solid #334155',
    },
    muted: { fontSize: '12px', color: '#94a3b8' },
    error: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '16px',
      textAlign: 'left',
      fontSize: '14px',
    },
    icon: { width: '16px', height: '16px' }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🇹🇳 INS Statistics Portal</h1>
          <p style={styles.subtitle}>Administration Access</p>
        </div>

        {(localError || authError) && (
          <div style={styles.error}>⚠️ {localError || authError}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="admin@ins.tn" 
              style={styles.input}
              disabled={isSubmitting}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••" 
              style={styles.input}
              disabled={isSubmitting}
            />
          </div>
          <button 
            type="submit" 
            style={{...styles.button, opacity: isSubmitting ? 0.6 : 1}}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>OR CONNECT WITH</span>
        </div>

        <div style={styles.socialContainer}>
          <button 
            type="button" 
            style={styles.socialButton} 
            onClick={() => handleOAuthRedirect('google')}
            disabled={isSubmitting}
          >
            Google
          </button>
          
          <button 
            type="button" 
            style={styles.socialButton} 
            onClick={handleFacebookLogin}
            disabled={isSubmitting}
          >
            Facebook
          </button>

          <button 
            type="button" 
            style={{...styles.socialButton, opacity: 0.6, cursor: 'not-allowed'}} 
            title="Currently unavailable"
            onClick={handleTwitterClick}
            disabled={true}
          >
            <svg style={styles.icon} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            X
          </button>

          <button 
            type="button" 
            style={styles.socialButton} 
            onClick={() => handleOAuthRedirect('github')}
            disabled={isSubmitting}
          >
            GitHub
          </button>
        </div>

        <div style={styles.footer}>
          <p style={styles.muted}><strong>Demo:</strong> admin@ins.tn / admin123</p>
        </div>
      </div>
    </div>
  );
}
