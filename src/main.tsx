import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './style.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

// 1. Retrieve Env Vars
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://ins-statistiques.onrender.com';

// 2. Validate Critical Vars
if (!GOOGLE_CLIENT_ID) {
  console.error("❌ Missing VITE_GOOGLE_CLIENT_ID. Build will fail or Google Login will crash.");
}
if (!FACEBOOK_APP_ID) {
  console.error("❌ Missing VITE_FACEBOOK_APP_ID");
}

// 3. Initialize Facebook SDK Globally
if (FACEBOOK_APP_ID) {
  window.fbAsyncInit = function() {
    if (window.FB) {
      window.FB.init({ 
        appId: FACEBOOK_APP_ID, 
        cookie: true, 
        xfbml: true, 
        version: 'v18.0' 
      });
      window.dispatchEvent(new Event('facebook-sdk-ready'));
    }
  };

  (function(d, s, id) {
    let js: HTMLScriptElement; 
    const fjs = d.getElementsByTagName(s)[0];
    
    if (d.getElementById(id)) return;
    
    js = d.createElement(s) as HTMLScriptElement; 
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    
    if (fjs && fjs.parentNode) {
      fjs.parentNode.insertBefore(js, fjs);
    } else {
      document.head.appendChild(js);
    }
  }(document, 'script', 'facebook-jssdk'));
}

// 4. Render App
// We pass the clientId directly to the Provider here.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {GOOGLE_CLIENT_ID ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <div style={{padding: 20, color: 'red'}}>
        <h1>Configuration Error</h1>
        <p>VITE_GOOGLE_CLIENT_ID is missing in Environment Variables.</p>
      </div>
    )}
  </React.StrictMode>
);