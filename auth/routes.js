/**
 * auth/routes.js
 * ──────────────────────────────────────────────────────────────
 * Authentication routes: Login, OAuth, Token generation, User management
 * ──────────────────────────────────────────────────────────────
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

const { JWT_SECRET, JWT_EXPIRES_IN, GOOGLE_CONFIG, FACEBOOK_CONFIG, TWITTER_CONFIG, GITHUB_CONFIG, ROLES } = require('./config');
const { verifyToken, requireAdmin } = require('./middleware');
const db = require('./db');

const router = express.Router();

/**
 * Configure Passport Google OAuth2
 */
if (GOOGLE_CONFIG.clientID && GOOGLE_CONFIG.clientSecret) {
  passport.use(new GoogleStrategy(
    GOOGLE_CONFIG,
    (accessToken, refreshToken, profile, done) => {
      try {
        let user = db.findUserByEmail(profile.emails[0].value);
        
        if (!user) {
          user = db.createUser({
            email: profile.emails[0].value,
            name: profile.displayName,
            googleId: profile.id,
            profilePicture: profile.photos[0]?.value,
            provider: 'google',
            role: ROLES.VIEWER
          });
        } else {
          db.updateUser(user.id, {
            googleId: profile.id,
            profilePicture: profile.photos[0]?.value || user.profilePicture,
            provider: user.provider === 'google' ? 'google' : 'hybrid'
          });
          user = db.findUserById(user.id);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
}

/**
 * Configure Passport Facebook Strategy
 */
if (FACEBOOK_CONFIG.clientID && FACEBOOK_CONFIG.clientSecret) {
  passport.use(new FacebookStrategy(
    FACEBOOK_CONFIG,
    (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `facebook-${profile.id}@ins.tn`;
        let user = db.findUserByEmail(email);

        if (!user) {
          user = db.createUser({
            email,
            name: profile.displayName,
            facebookId: profile.id,
            profilePicture: profile.photos?.[0]?.value,
            provider: 'facebook',
            role: ROLES.VIEWER
          });
        } else {
          db.updateUser(user.id, {
            facebookId: profile.id,
            profilePicture: profile.photos?.[0]?.value || user.profilePicture,
            provider: user.provider === 'facebook' ? 'facebook' : 'hybrid'
          });
          user = db.findUserById(user.id);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
}

/**
 * Configure Passport Twitter (X) Strategy
 */
if (TWITTER_CONFIG.consumerKey && TWITTER_CONFIG.consumerSecret) {
  passport.use(new TwitterStrategy(
    TWITTER_CONFIG,
    (token, tokenSecret, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `twitter-${profile.id}@ins.tn`;
        let user = db.findUserByEmail(email);

        if (!user) {
          user = db.createUser({
            email,
            name: profile.displayName || profile.username,
            twitterId: profile.id,
            profilePicture: profile.photos?.[0]?.value,
            provider: 'twitter',
            role: ROLES.VIEWER
          });
        } else {
          db.updateUser(user.id, {
            twitterId: profile.id,
            profilePicture: profile.photos?.[0]?.value || user.profilePicture,
            provider: user.provider === 'twitter' ? 'twitter' : 'hybrid'
          });
          user = db.findUserById(user.id);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
}

/**
 * Configure Passport GitHub Strategy
 */
if (GITHUB_CONFIG.clientID && GITHUB_CONFIG.clientSecret) {
  passport.use(new GitHubStrategy(
    GITHUB_CONFIG,
    (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `github-${profile.id}@ins.tn`;
        let user = db.findUserByEmail(email);

        if (!user) {
          user = db.createUser({
            email,
            name: profile.displayName || profile.username,
            githubId: profile.id,
            profilePicture: profile.photos?.[0]?.value,
            provider: 'github',
            role: ROLES.VIEWER
          });
        } else {
          db.updateUser(user.id, {
            githubId: profile.id,
            profilePicture: profile.photos?.[0]?.value || user.profilePicture,
            provider: user.provider === 'github' ? 'github' : 'hybrid'
          });
          user = db.findUserById(user.id);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = db.findUserById(id);
  done(null, user);
});

/**
 * POST /auth/login
 * Local login with email/password
 */
router.post('/login', express.json(), (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const user = db.findUserByEmail(email);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Account is inactive' });
    }

    if (!db.verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Update last login
    db.updateLastLogin(user.id);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

/**
 * Helper to handle successful OAuth authentication
 */
function handleOAuthCallback(req, res) {
  try {
    const user = req.user;

    if (!user || !user.isActive) {
      return res.redirect('/login?error=account_inactive');
    }

    // Update last login
    db.updateLastLogin(user.id);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3080';
    res.redirect(`${frontendUrl}/dashboard?token=${token}`);
  } catch (err) {
    console.error('[Auth] OAuth callback error:', err.message);
    res.redirect('/login?error=callback_failed');
  }
}

/**
 * Mock OAuth flow for local development when credentials are missing
 */
function mockOAuthRedirect(providerName) {
  return (req, res) => {
    console.log(`[Auth] Credentials missing for ${providerName}. Redirecting with mock token.`);
    const mockEmail = `mock-${providerName}-user@ins.tn`;
    let user = db.findUserByEmail(mockEmail);
    
    if (!user) {
      user = db.createUser({
        email: mockEmail,
        name: `Mock ${providerName.charAt(0).toUpperCase() + providerName.slice(1)} User`,
        [`${providerName}Id`]: `mock-${providerName}-id`,
        provider: providerName,
        role: ROLES.VIEWER
      });
    } else {
      db.updateLastLogin(user.id);
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3080';
    res.redirect(`${frontendUrl}/dashboard?token=${token}`);
  };
}

/**
 * GET /auth/google
 * Redirect to Google OAuth
 */
router.get('/google', (req, res, next) => {
  if (GOOGLE_CONFIG.clientID && GOOGLE_CONFIG.clientSecret) {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  } else {
    mockOAuthRedirect('google')(req, res);
  }
});

/**
 * GET /auth/google/callback
 * Google OAuth callback
 */
router.get('/google/callback', (req, res, next) => {
  if (GOOGLE_CONFIG.clientID && GOOGLE_CONFIG.clientSecret) {
    passport.authenticate('google', {
      failureRedirect: '/login?error=auth_failed',
      session: false
    })(req, res, next);
  } else {
    res.redirect('/login?error=config_missing');
  }
}, handleOAuthCallback);

/**
 * GET /auth/facebook
 * Redirect to Facebook OAuth
 */
router.get('/facebook', (req, res, next) => {
  if (FACEBOOK_CONFIG.clientID && FACEBOOK_CONFIG.clientSecret) {
    passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
  } else {
    mockOAuthRedirect('facebook')(req, res);
  }
});

/**
 * GET /auth/facebook/callback
 * Facebook OAuth callback
 */
router.get('/facebook/callback', (req, res, next) => {
  if (FACEBOOK_CONFIG.clientID && FACEBOOK_CONFIG.clientSecret) {
    passport.authenticate('facebook', {
      failureRedirect: '/login?error=auth_failed',
      session: false
    })(req, res, next);
  } else {
    res.redirect('/login?error=config_missing');
  }
}, handleOAuthCallback);

/**
 * GET /auth/twitter
 * Redirect to Twitter/X OAuth
 */
router.get('/twitter', (req, res, next) => {
  if (TWITTER_CONFIG.consumerKey && TWITTER_CONFIG.consumerSecret) {
    passport.authenticate('twitter')(req, res, next);
  } else {
    mockOAuthRedirect('twitter')(req, res);
  }
});

/**
 * GET /auth/twitter/callback
 * Twitter/X OAuth callback
 */
router.get('/twitter/callback', (req, res, next) => {
  if (TWITTER_CONFIG.consumerKey && TWITTER_CONFIG.consumerSecret) {
    passport.authenticate('twitter', {
      failureRedirect: '/login?error=auth_failed',
      session: false
    })(req, res, next);
  } else {
    res.redirect('/login?error=config_missing');
  }
}, handleOAuthCallback);

/**
 * GET /auth/github
 * Redirect to GitHub OAuth
 */
router.get('/github', (req, res, next) => {
  if (GITHUB_CONFIG.clientID && GITHUB_CONFIG.clientSecret) {
    passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
  } else {
    mockOAuthRedirect('github')(req, res);
  }
});

/**
 * GET /auth/github/callback
 * GitHub OAuth callback
 */
router.get('/github/callback', (req, res, next) => {
  if (GITHUB_CONFIG.clientID && GITHUB_CONFIG.clientSecret) {
    passport.authenticate('github', {
      failureRedirect: '/login?error=auth_failed',
      session: false
    })(req, res, next);
  } else {
    res.redirect('/login?error=config_missing');
  }
}, handleOAuthCallback);

/**
 * POST /auth/logout
 * Logout (client-side token removal)
 */
router.post('/logout', verifyToken, (req, res) => {
  // JWT logout is handled by client-side token removal
  // Server doesn't maintain a session
  res.json({ success: true, message: 'Logged out' });
});

/**
 * GET /auth/me
 * Get current authenticated user
 */
router.get('/me', verifyToken, (req, res) => {
  try {
    const user = db.findUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /auth/users
 * List all users (admin only)
 */
router.get('/users', verifyToken, requireAdmin, (req, res) => {
  try {
    const users = db.getAllUsers().map(u => {
      const { passwordHash, ...user } = u;
      return user;
    });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /auth/users/:id
 * Update user (admin only)
 */
router.put('/users/:id', verifyToken, requireAdmin, express.json(), (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const user = db.updateUser(req.params.id, updateData);
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.json({ success: true, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /auth/users/:id
 * Delete user (admin only)
 */
router.delete('/users/:id', verifyToken, requireAdmin, (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot delete yourself' });
    }
    db.deleteUser(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /auth/register
 * Register new user (admin only, or allow self-registration based on policy)
 */
router.post('/register', express.json(), (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Email, password, and name required' });
    }

    const user = db.createUser({
      email,
      password,
      name,
      role: ROLES.VIEWER
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
