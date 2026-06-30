import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
// Import SocialIcon directly for tree-shaking
import { SocialIcon } from 'react-social-icons/component';
import 'react-social-icons/google';
import 'react-social-icons/facebook';
import 'react-social-icons/github';
import 'react-social-icons/twitter';

export default function LoginPage() {
  const { login, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fbSdkLoaded, setFbSdkLoaded] = useState(false);

  // Get Config from Global Window object (Injected by main.tsx)
  const getBackendUrl = () => window.APP_CONFIG?.backendUrl || 'https://ins-statistiques.onrender.com';

  // Listen for FB SDK Ready Event (Injected by main.tsx)
  useEffect(() => {
    const handleFbReady = () => setFbSdkLoaded(true);
    
    if (window.FB && window.FB._sdkLoaded) {
      setFbSdkLoaded(true);
    }

    window.addEventListener('facebook-sdk-ready', handleFbReady);
    return () => window.removeEventListener('facebook-sdk-ready', handleFbReady);
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

          <div className="grid grid-cols-1 gap-3">
            {/* --- OFFICIAL GOOGLE BUTTON --- */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  const token = credentialResponse.credential;
                  window.location.href = `${getBackendUrl()}/auth/google/callback?token=${token}`;
                }}
                onError={() => {
                  setLocalError('Google Login Failed');
                }}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width={320}
              />
            </div>
            
            {/* Facebook Button */}
            <Button variant="outline" onClick={handleFacebookLogin} disabled={isSubmitting} className="h-12">
              <SocialIcon network="facebook" style={{ marginRight: '8px', height: 20, width: 20 }} />
              Continue with Facebook
            </Button>

            {/* Twitter Button */}
            <Button 
              variant="outline" 
              onClick={handleTwitterClick} 
              disabled={true}
              className="opacity-60 cursor-not-allowed h-12"
            >
              <SocialIcon network="twitter" style={{ marginRight: '8px', height: 20, width: 20 }} />
              X (Unavailable)
            </Button>

            {/* GitHub Button */}
            <Button variant="outline" onClick={() => handleOAuthRedirect('github')} disabled={isSubmitting} className="h-12">
              <SocialIcon network="github" style={{ marginRight: '8px', height: 20, width: 20 }} />
              Continue with GitHub
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
