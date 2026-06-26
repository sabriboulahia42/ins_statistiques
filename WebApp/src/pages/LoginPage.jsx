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

  // ── Load Facebook SDK ──────────────────────────────────────
  useEffect(() => {
    const appId = process.env.REACT_APP_FACEBOOK_APP_ID; // Ensure this is set in your .env
    
    if (!appId) {
      console.warn('Facebook App ID missing. Social login may fail.');
      return;
    }

    // Initialize FB SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId      : appId,
        cookie     : true,
        xfbml      : true,
        version    : 'v18.0'
      });
      setFbSdkLoaded(true);
      
      // Check existing login status
      window.FB.getLoginStatus((response) => {
        if (response.status === 'connected') {
          console.log('User already logged in via Facebook');
        }
      });
    };

    // Load the SDK asynchronously
    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "https://connect.facebook.net/en_US/sdk.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
  }, []);
  // ───────────────────────────────────────────────────────────

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
      console.warn('FB SDK not loaded yet, falling back to redirect...');
      handleOAuthRedirect('facebook');
      return;
    }

    window.FB.login((response) => {
      if (response.authResponse) {
        // Send token to backend for verification
        window.location.href = `${getBackendUrl()}/auth/facebook/callback?access_token=${response.authResponse.accessToken}`;
      } else {
        setLocalError('Facebook login cancelled by user.');
      }
    }, { scope: 'public_profile,email' });
  };

  return (
    <div className="login-page-wrapper">
      {/* Background Orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      <div className="login-card animate-fade-in">
        <div className="login-header">
          <h1>🇹🇳 INS Statistics Portal</h1>
          <p>Administration Access</p>
        </div>

        {(localError || authError) && (
          <div className="error-message">⚠️ {localError || authError}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="admin@ins.tn" 
              className="global-input"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••" 
              className="global-input"
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary global-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="divider">OR CONNECT WITH</div>

        <div className="social-login-container">
          <button type="button" className="btn btn-social btn-google global-btn" onClick={() => handleOAuthRedirect('google')}>
            Google
          </button>
          
          <button type="button" className="btn btn-social btn-facebook global-btn" onClick={handleFacebookLogin}>
            Facebook
          </button>

          <button type="button" className="btn btn-social btn-github global-btn" onClick={() => handleOAuthRedirect('github')}>
            GitHub
          </button>
        </div>

        <div className="login-footer">
          <p className="text-muted"><strong>Demo:</strong> admin@ins.tn / admin123</p>
        </div>
      </div>
    </div>
  );
}
