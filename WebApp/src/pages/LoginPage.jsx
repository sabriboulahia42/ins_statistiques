import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Github, Google, Facebook } from "lucide-react";

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

  return (
    <div className="flex h-screen w-full items-center justify-center px-4 bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            
            {/* Error Display */}
            {(localError || authError) && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                ⚠️ {localError || authError}
              </div>
            )}

            <div className="grid gap-2">
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
            
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                {/* Optional: Add Forgot Password link here later */}
              </div>
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
              {isSubmitting ? 'Signing in...' : 'Login'}
            </Button>
            
            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => handleOAuthRedirect('google')} disabled={isSubmitting}>
                <Google className="mr-2 h-4 w-4" />
                Google
              </Button>
              
              <Button variant="outline" onClick={handleFacebookLogin} disabled={isSubmitting}>
                <Facebook className="mr-2 h-4 w-4" />
                Facebook
              </Button>
            </div>

            <Button variant="outline" className="w-full opacity-60 cursor-not-allowed" disabled>
              <Github className="mr-2 h-4 w-4" />
              GitHub (Coming Soon)
            </Button>
          </form>
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