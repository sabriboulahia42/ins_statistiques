import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './style.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
// @ts-ignore – AuthProvider is consumed in JSX below; TS6133 is a false positive when module resolves to any
import { AuthProvider } from './auth/AuthContext.jsx';

// 1. Retrieve Env Vars
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://ins-statistiques-api.onrender.com';
// 2. Validate Critical Vars
if (!GOOGLE_CLIENT_ID) console.error("❌ Missing VITE_GOOGLE_CLIENT_ID");
if (!FACEBOOK_APP_ID) console.error("❌ Missing VITE_FACEBOOK_APP_ID");

// 3. Initialize Facebook SDK Globally
if (FACEBOOK_APP_ID) {
  window.fbAsyncInit = function() {
    window.FB.init({ 
      appId: FACEBOOK_APP_ID, 
      cookie: true, 
      xfbml: true, 
      version: 'v18.0' 
    });
    // Dispatch custom event so LoginPage knows FB is ready
    window.dispatchEvent(new Event('facebook-sdk-ready'));
  };

  // Load SDK Script
  (function(d, s, id) {
    let js: HTMLScriptElement, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    
    js = d.createElement(s) as HTMLScriptElement; 
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    
    // Fixed: Check if fjs and parentNode exist before inserting
    if (fjs && fjs.parentNode) {
      fjs.parentNode.insertBefore(js, fjs);
    } else {
      document.head.appendChild(js);
    }
  }(document, 'script', 'facebook-jssdk'));
}

// 4. Expose Backend URL globally for easy access in components
(window as any).APP_CONFIG = {
  backendUrl: BACKEND_URL,
  facebookAppId: FACEBOOK_APP_ID
};

// 5. Render App
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <App />
        </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)