import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import '../styles/LoginPage.css';

export default function LoginPage() {
  const { login, error: authError } = useAuth();
  const [isLoginMode, useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fbSdkLoaded, setFbSdkLoaded] = useState(false);

  // Determine backend URL based on environment
  const getBackendUrl = () => {
    return window.location.hostname === 'localhost' 
      ? 'http://localhost:3080' 
      : 'https://ins-statistiques.onrender.com';
  };

  // Load Facebook SDK
  useEffect(() => {
    const appId = process.env.REACT_APP_FACEBOOK_APP_ID; 
    
    if (!appId) {
      console.warn('Facebook App ID not found. Social login may not work.');
      return;
    }

    window.fbAsyncInit = function() {
      window.FB.init({
        appId      : appId,
        cookie     : true,
        xfbml      : true,
        version    : 'v18.0'
      });

      setFbSdkLoaded(true);

      // Check login status immediately after load
      window.FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
          console.log('User already logged in to Facebook and App');
          // Optionally auto-login or show dashboard button here
        }
      });
    };

    // Load the SDK asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
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
        setLocalError('Registration not implemented yet. Use login with admin@ins.tn / admin123');
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Standard Redirect Method (Works without SDK)
  const handleOAuthRedirect = (provider) => {
    window.location.href = `${getBackendUrl()}/auth/${provider}`;
  };

  // Facebook Popup Method (Uses SDK)
  const handleFacebookLogin = () => {
    if (!window.FB || !fbSdkLoaded) {
      // Fallback to redirect if SDK isn't ready
      console.log('FB SDK not ready, falling back to redirect');
      handleOAuthRedirect('facebook');
      return;
    }

    window.FB.login((response) => {
      if (response.authResponse) {
        // User logged in successfully via Popup
        // Now send token to backend or redirect to callback to finish session
        // For this app architecture, we redirect to our backend callback to create the session
        window.location.href = `${getBackendUrl()}/auth/facebook/callback?access_token=${response.authResponse.accessToken}`;
      } else {
        console.log('User cancelled login or did not fully authorize.');
        setLocalError('Facebook login cancelled.');
      }
    }, { scope: 'public_profile,email' });
  };

  return (
    <div className="login-container">
      <div className="login-card animate-fade-in">
        <div className="login-header">
          <h1>🇹🇳 INS Statistics Portal</h1>
          <p>Administration Access</p>
        </div>

        {(localError || authError) && (
          <div className="error-message">
            ⚠️ {localError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="admin@ins.tn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="divider">OR CONNECT WITH</div>

        <div className="social-login-container">
          <button 
            type="button"
            className="btn btn-social btn-google"
            onClick={() => handleOAuthRedirect('google')}
          >
            <svg className="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.355-2.846-6.355-6.355s2.846-6.355 6.355-6.355c1.621 0 3.093.613 4.225 1.623l3.123-3.123C19.168 2.38 15.938 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.894 0 10.963-4.225 10.963-11.24 0-.768-.068-1.513-.197-2.225H12.24z"/>
            </svg>
            Google
          </button>
          
          {/* Facebook Button with Popup Logic */}
          <button 
            type="button"
            className="btn btn-social btn-facebook"
            onClick={handleFacebookLogin}
          >
            <svg className="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
            </svg>
            Facebook
          </button>

          <button 
            type="button"
            className="btn btn-social btn-x"
            onClick={() => handleOAuthRedirect('twitter')}
          >
            <svg className="social-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X
          </button>

          <button 
            type="button"
            className="btn btn-social btn-github"
            onClick={() => handleOAuthRedirect('github')}
          >
            <svg className="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GitHub
          </button>
        </div>

        <div className="login-footer">
          <p className="text-muted">
            <strong>Demo Credentials:</strong><br />
            Email: admin@ins.tn<br />
            Password: admin123
          </p>
        </div>
      </div>
    </div>
  );
}
