import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

// ✅ IMPORTANT: Include .tsx and .ts extensions explicitly
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";

export default function LoginPage() {
  const { login, error: authError } = useAuth();
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
      await login(email, password);
      window.location.href = '/dashboard';
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Background Orbs */}
      <div className="absolute inset-0 bg-orb orb-1"></div>
      <div className="absolute inset-0 bg-orb orb-2"></div>
      <div className="absolute inset-0 bg-orb orb-3"></div>

      <Card className="w-full max-w-md z-10 shadow-xl animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            🇹🇳 INS Statistics Portal
          </CardTitle>
          <CardDescription>Administration Access</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {(localError || authError) && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
              ⚠️ {localError || authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ins.tn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or connect with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" onClick={() => handleOAuthRedirect('google')} disabled={isSubmitting}>
              Google
            </Button>
            
            <Button variant="outline" onClick={handleFacebookLogin} disabled={isSubmitting}>
              Facebook
            </Button>

            <Button 
              variant="outline" 
              onClick={handleTwitterClick} 
              disabled={true}
              className="opacity-60 cursor-not-allowed"
              title="Currently unavailable"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X
            </Button>

            <Button variant="outline" onClick={() => handleOAuthRedirect('github')} disabled={isSubmitting}>
              GitHub
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-xs text-muted-foreground">
            <strong>Demo:</strong> admin@ins.tn / admin123
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}