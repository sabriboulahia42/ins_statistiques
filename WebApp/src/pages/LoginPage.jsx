import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import '../styles/LoginPage.css';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card.jsx";

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
  // Unified Light Theme Presentation Styles (Tailwind v4 handles the styling)
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50/60 p-4 font-sans antialiased selection:bg-red-500 selection:text-white">
      
      {/* Top Header Branding Banner matching Main Dashboard */}
      <div className="flex items-center gap-3 mb-8 text-center">
        <span className="text-2xl">🇹🇳</span>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
          المعهد الوطني للإحصاء <span className="text-slate-300 mx-1">|</span> INS Portal
        </h1>
        <span className="text-2xl">🇶🇦</span>
      </div>

      {/* Styled Card via Radix UI Nova architecture */}
      <Card className="w-full max-w-md border border-slate-200/80 shadow-xl bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden">
        <CardHeader className="space-y-1.5 text-center border-b border-slate-100 pb-6 pt-6">
          <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">
            Administration Access
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Sign in to access your administrative data workbench
          </CardDescription>
        </CardHeader>

        {/* Global Error Banner */}
        {(localError || authError) && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-center gap-2 font-medium">
            ⚠️ {localError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-5">
            {/* Email Field */}
            <div className="space-y-2 text-left">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="admin@ins.tn"
                className="h-11 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:border-transparent rounded-xl transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2 text-left">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="••••••••"
                className="h-11 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:border-transparent rounded-xl transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Sandbox Credentials Note */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center text-xs text-slate-500">
              <span className="font-bold text-slate-700">Demo Account:</span> admin@ins.tn <span className="text-slate-300 mx-0.5">/</span> admin123
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-slate-100 pt-5 pb-6">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* OAuth Divider Line */}
            <div className="relative w-full flex items-center justify-center my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-white px-3 text-[10px] uppercase text-slate-400 tracking-widest font-semibold">
                Or Connect With
              </span>
            </div>

            {/* OAuth Federated Button Grid */}
            <div className="grid grid-cols-2 gap-2.5 w-full">
              <Button 
                type="button" 
                variant="outline" 
                disabled={isSubmitting}
                onClick={() => handleOAuthRedirect('google')}
                className="h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-normal text-sm cursor-pointer"
              >
                Google
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                disabled={isSubmitting}
                onClick={() => handleOAuthRedirect('github')}
                className="h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-normal text-sm cursor-pointer"
              >
                GitHub
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                disabled={isSubmitting}
                onClick={handleFacebookLogin}
                className="h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-normal text-sm cursor-pointer"
              >
                Facebook
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                disabled={true}
                title="Currently unavailable"
                onClick={handleTwitterClick}
                className="h-10 rounded-xl border-slate-100 text-slate-400 bg-slate-50/50 cursor-not-allowed font-normal text-sm opacity-60"
              >
                X (Twitter)
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
