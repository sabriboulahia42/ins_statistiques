# 🚀 Complete Deployment Guide - INS Statistics Portal

## ✅ Social Authentication Already Implemented

Your application already has **Facebook, X (Twitter), and GitHub** authentication fully integrated!

### What's Already Working:

| Provider | Backend Strategy | Frontend Button | Routes | Status |
|----------|-----------------|-----------------|--------|--------|
| **Google** | ✅ Configured | ✅ Available | ✅ `/auth/google` | Ready |
| **Facebook** | ✅ Configured | ✅ Available | ✅ `/auth/facebook` | Ready |
| **X (Twitter)** | ✅ Configured | ✅ Available | ✅ `/auth/twitter` | Ready |
| **GitHub** | ✅ Configured | ✅ Available | ✅ `/auth/github` | Ready |

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Then edit `.env` with your production values:

```env
# Server Configuration
PORT=3080
NODE_ENV=production

# JWT Configuration (REQUIRED - Generate a strong secret!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback

# Facebook OAuth2
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=https://yourdomain.com/auth/facebook/callback

# X (Twitter) OAuth2
X_CLIENT_ID=your-x-client-id
X_CLIENT_SECRET=your-x-client-secret
TWITTER_CALLBACK_URL=https://yourdomain.com/auth/twitter/callback

# GitHub OAuth2
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://yourdomain.com/auth/github/callback

# CORS & Frontend
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

---

## 🔐 OAuth Provider Setup Instructions

### 1. Google OAuth2 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: **Web application**
6. Authorized redirect URIs:
   ```
   https://yourdomain.com/auth/google/callback
   ```
7. Copy **Client ID** and **Client Secret** to your `.env`

### 2. Facebook OAuth2 Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing
3. Add "Facebook Login" product
4. Go to Settings → Basic
5. Copy **App ID** and **App Secret** to your `.env`
6. In "Facebook Login" → Settings:
   - Valid OAuth Redirect URIs:
     ```
     https://yourdomain.com/auth/facebook/callback
     ```
7. Set App Domain: `yourdomain.com`

### 3. X (Twitter) OAuth2 Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new project and app
3. In App settings → Keys and tokens:
   - Enable "Sign in with Twitter"
   - Set Callback URL:
     ```
     https://yourdomain.com/auth/twitter/callback
     ```
4. Copy **API Key (Consumer Key)** and **API Key Secret** to `.env`:
   ```env
   X_CLIENT_ID=your-api-key
   X_CLIENT_SECRET=your-api-key-secret
   ```

### 4. GitHub OAuth2 Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: INS Statistics Portal
   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL:
     ```
     https://yourdomain.com/auth/github/callback
     ```
4. Copy **Client ID** and generate **Client Secret** to `.env`

---

## 🌐 FREE Deployment Options (No Credit Card Required!)

### 🥇 Option 1: Render (Best Free Tier - Recommended!)

**Why Render?** Completely free, auto-deploys from GitHub, includes SSL, no credit card needed.

**Limits:** 512MB RAM, web services sleep after 15min inactivity (wakes up on request)

#### Steps:

1. **Go to [Render.com](https://render.com/)** and sign up (free)

2. **Create a New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Or deploy directly from Git URL

3. **Configure:**
   ```
   Name: ins-statistics-portal
   Region: Choose closest to you
   Branch: main
   Root Directory: (leave blank)
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

4. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   JWT_SECRET=generate-random-string-here
   NODE_ENV=production
   PORT=3080
   # Add all your OAuth credentials here
   GOOGLE_CLIENT_ID=your-google-id
   GOOGLE_CLIENT_SECRET=your-google-secret
   FACEBOOK_APP_ID=your-facebook-id
   FACEBOOK_APP_SECRET=your-facebook-secret
   X_CLIENT_ID=your-twitter-id
   X_CLIENT_SECRET=your-twitter-secret
   GITHUB_CLIENT_ID=your-github-id
   GITHUB_CLIENT_SECRET=your-github-secret
   FRONTEND_URL=https://your-app-name.onrender.com
   CORS_ORIGIN=https://your-app-name.onrender.com
   ```

5. **Click "Create Web Service"** - Deploy starts automatically!

6. **Your app will be live at:** `https://your-app-name.onrender.com`

---

### 🥈 Option 2: Koyeb (Excellent Free Alternative)

**Why Koyeb?** Generous free tier, global edge network, no sleep on free tier!

**Limits:** 512MB RAM, 0.1 CPU, 2GB storage, 100GB bandwidth/month

#### Steps:

1. **Go to [Koyeb.com](https://www.koyeb.com/)** and sign up (free)

2. **Deploy from GitHub:**
   - Click "Create Service"
   - Select "Git" → Connect GitHub
   - Choose your repository

3. **Configure:**
   ```
   Service name: ins-portal
   Branch: main
   Build command: npm install
   Run command: npm start
   Instance type: nano (free)
   ```

4. **Add Environment Variables:**
   - Go to "Configuration" → "Environment variables"
   - Add all variables from the `.env` example

5. **Deploy!** Auto-deploys on every git push

6. **Your app will be live at:** `https://your-app-name.koyeb.app`

---

### 🥉 Option 3: Fly.io (Free with Credit Card)

**Why Fly.io?** Fast global deployment, 3 shared-cpu-1x VMs free

**Limits:** Requires credit card, but $0 cost if staying within free limits

#### Steps:

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up and login:**
   ```bash
   fly auth signup
   fly auth login
   ```

3. **Initialize and deploy:**
   ```bash
   # Create fly.toml configuration
   fly launch --no-deploy
   
   # Set environment variables
   fly secrets set JWT_SECRET=$(openssl rand -base64 32)
   fly secrets set GOOGLE_CLIENT_ID=your-google-id
   fly secrets set GOOGLE_CLIENT_SECRET=your-google-secret
   fly secrets set FACEBOOK_APP_ID=your-facebook-id
   fly secrets set FACEBOOK_APP_SECRET=your-facebook-secret
   fly secrets set X_CLIENT_ID=your-twitter-id
   fly secrets set X_CLIENT_SECRET=your-twitter-secret
   fly secrets set GITHUB_CLIENT_ID=your-github-id
   fly secrets set GITHUB_CLIENT_SECRET=your-github-secret
   fly secrets set FRONTEND_URL=https://your-app-name.fly.dev
   fly secrets set CORS_ORIGIN=https://your-app-name.fly.dev
   
   # Deploy
   fly deploy
   ```

4. **Your app will be live at:** `https://your-app-name.fly.dev`

---

### 🏆 Option 4: Oracle Cloud Always Free (Most Powerful!)

**Why Oracle Cloud?** 4 ARM CPUs, 24GB RAM, 200GB storage - completely free forever!

**Limits:** Requires credit card for verification, but truly free

#### Quick Setup:

1. **Sign up at** [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)

2. **Create VM Instance:**
   - Go to Compute → Instances
   - Create instance: Ampere A1 shape (4 OCPU, 24GB RAM)
   - OS: Ubuntu 22.04

3. **Deploy your app** (same as VPS instructions below)

---

### Option 5: Deploy to VPS (Free Tier Options)

Several providers offer free VPS tiers:

| Provider | Free Tier | Requirements |
|----------|-----------|--------------|
| **Google Cloud** | e2-micro (0.25 vCPU, 1GB RAM) | Credit card |
| **AWS** | t2.micro (1 vCPU, 1GB RAM, 12 months) | Credit card |
| **Azure** | B1S (1 vCPU, 1GB RAM, 12 months) | Credit card |
| **Oracle Cloud** | 4 vCPU, 24GB RAM (always free) | Credit card |

---

### Option 6: Deploy to VPS (Ubuntu/Debian) - Using Free Tier VMs

```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs npm

# Clone your repository
cd /var/www
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Install dependencies
npm install --production

# Install PM2 process manager
sudo npm install -g pm2

# Start application with PM2
pm2 start proxy.js --name ins-portal

# Setup PM2 to start on boot
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/ins-portal
```

Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site and get SSL certificate:

```bash
sudo ln -s /etc/nginx/sites-available/ins-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install Certbot for HTTPS
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option 7: Deploy to AWS (Free Tier - 12 Months)

#### Using Elastic Beanstalk:

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB
eb init

# Create environment
eb create ins-portal-production

# Deploy
eb deploy
```

#### Using EC2:

Follow the VPS deployment steps above on an EC2 instance.

---

## 🔒 Security Hardening

### 1. Generate Strong JWT Secret

```bash
openssl rand -base64 32
```

### 2. Update Admin Password

After first login, change the default admin password immediately.

### 3. Enable HTTPS Only

- Use Let's Encrypt (free SSL certificates)
- Force HTTPS redirects
- Update all callback URLs to use `https://`

### 4. Configure Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 5. Set Up Monitoring

```bash
# Install PM2 for process management
npm install -g pm2

# Monitor logs
pm2 logs ins-portal

# View status
pm2 status
```

---

## 🧪 Testing Before Deployment

### Local Testing:

```bash
# Install dependencies
npm install

# Start server
npm start

# Test endpoints
curl http://localhost:3080/auth/google
curl http://localhost:3080/auth/facebook
curl http://localhost:3080/auth/twitter
curl http://localhost:3080/auth/github

# Test login
curl -X POST http://localhost:3080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ins.tn","password":"admin123"}'
```

### Production Testing Checklist:

- [ ] All OAuth providers working
- [ ] HTTPS enabled
- [ ] Admin login works
- [ ] User registration via OAuth works
- [ ] Protected routes require authentication
- [ ] CORS configured correctly
- [ ] Database backups configured
- [ ] Error logging enabled
- [ ] Rate limiting active

---

## 📊 Post-Deployment Monitoring

### Logs:

```bash
# PM2 logs
pm2 logs ins-portal --lines 100

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Health Check Endpoint:

Add to `proxy.js`:

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Uptime Monitoring:

Use services like:
- [UptimeRobot](https://uptimerobot.com/) (free)
- [Pingdom](https://www.pingdom.com/)
- [StatusCake](https://www.statuscake.com/)

---

## 🔄 Continuous Deployment

### GitHub Actions Example:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to Render (Example)
      run: |
        # Install Render CLI or use their API
        # Or configure auto-deploy from GitHub in Render dashboard
        echo "Deploy to Render via GitHub integration"
```

---

## 📞 Troubleshooting

### Common Issues:

**OAuth Callback Errors:**
- Verify callback URLs match exactly (including `https://`)
- Check environment variables are set correctly
- Ensure OAuth apps are configured for production domain

**CORS Errors:**
- Update `CORS_ORIGIN` in `.env` to include your domain
- Restart server after changing environment variables

**Authentication Not Working:**
- Check JWT_SECRET is set and consistent
- Verify database permissions (if using file-based storage)
- Check browser console for errors

**Server Won't Start:**
- Check port 3080 is not in use
- Verify all dependencies installed: `npm install`
- Check Node.js version: `node --version` (should be >= 16)

---

## 📚 Additional Resources

- [Passport.js Documentation](http://www.passportjs.org/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Let's Encrypt SSL Setup](https://letsencrypt.org/)
- [PM2 Process Manager](https://pm2.keymetrics.io/)

---

## ✅ Quick Start Commands

```bash
# 1. Setup
cp .env.example .env
# Edit .env with your credentials

# 2. Install
npm install

# 3. Test locally
npm start
# Visit http://localhost:3080

# 4. Deploy (choose one FREE option above)
# Render: Best free tier - https://render.com
# Koyeb: No sleep, generous limits - https://koyeb.com
# Fly.io: Fast global deployment - https://fly.io
# Oracle Cloud: Most powerful free tier - https://oracle.com/cloud/free

# 5. Verify
# Test all OAuth buttons (Google, Facebook, X, GitHub)
# Check admin dashboard access
# Verify HTTPS is working
```

---

**Version**: 1.0.0  
**Last Updated**: 2026-06-23  
**Status**: Production Ready with Full OAuth Support ✅

***Your application is ready to deploy with Facebook, X, and GitHub authentication!*** 🎉
