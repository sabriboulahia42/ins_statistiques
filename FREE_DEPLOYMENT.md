# 🚀 FREE Deployment Guide - INS Statistics Portal

## ✅ Social Authentication Ready

Your application has **Facebook, X (Twitter), GitHub, and Google** authentication fully integrated and ready to deploy!

---

## 🏆 Top 3 FREE Deployment Recommendations

### 🥇 #1 Render.com (BEST - No Credit Card!)

**Perfect for:** Quick deployment, zero cost, no credit card required

**Free Tier Limits:**

- 512MB RAM
- Web services sleep after 15 minutes of inactivity
- Wakes up automatically on next request (~30 seconds)
- Unlimited bandwidth

**Steps to Deploy:**

1. **Sign Up**: Go to [render.com](https://render.com) and create a free account

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select your repository

3. **Configure Settings**:

   ```
   Name: ins-statistics-portal
   Region: Choose closest to your users
   Branch: main
   Root Directory: (leave blank)
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   Auto-Deploy: Yes
   ```

4. **Add Environment Variables** (click "Advanced" tab):

   ```env
   NODE_ENV=production
   PORT=3080
   JWT_SECRET=generate-a-random-string-here-use-openssl-rand-base64-32
   
   # OAuth Credentials (get these from each provider)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-secret
   FACEBOOK_APP_ID=your-facebook-app-id
   FACEBOOK_APP_SECRET=your-facebook-secret
   X_CLIENT_ID=your-twitter-api-key
   X_CLIENT_SECRET=your-twitter-api-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-secret
   
   # URLs (Render will provide your app URL after deployment)
   FRONTEND_URL=https://your-app-name.onrender.com
   CORS_ORIGIN=https://your-app-name.onrender.com
   ```

5. **Click "Create Web Service"** - That's it! 🎉

**Your live URL:** `https://your-app-name.onrender.com`

**Pro Tips:**

- Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your app every 14 minutes to prevent sleep
- First load after sleep takes ~30 seconds, subsequent loads are instant
- Render provides automatic HTTPS/SSL

---

### 🥈 #2 Koyeb (Excellent - No Sleep!)

**Perfect for:** Apps that need to stay awake 24/7

**Free Tier Limits:**

- 512MB RAM
- 0.1 CPU
- 2GB storage
- 100GB bandwidth/month
- **NO SLEEP** - stays running 24/7!

**Steps to Deploy:**

1. **Sign Up**: Go to [koyeb.com](https://www.koyeb.com) and create a free account

2. **Deploy from GitHub**:
   - Click "Create Service"
   - Select "Git" → Connect GitHub
   - Choose your repository and branch

3. **Configure**:

   ```
   Service name: ins-portal
   Branch: main
   Build command: npm install
   Run command: npm start
   Instance type: nano (free)
   Region: Choose closest to users
   ```

4. **Add Environment Variables**:
   - Go to "Configuration" → "Environment variables"
   - Add all variables from the `.env` example above

5. **Deploy!** - Auto-deploys on every git push

**Your live URL:** `https://your-app-name.koyeb.app`

**Why Koyeb is Great:**

- No sleep on free tier
- Global edge network
- Automatic SSL/HTTPS
- Built-in DDoS protection

---

### 🥉 #3 Fly.io (Fast & Global)

**Perfect for:** Low-latency global apps

**Free Tier Limits:**

- 3 shared-cpu-1x VMs (256MB RAM each)
- 3GB persistent volume storage
- 160GB outbound data transfer/month
- Requires credit card for verification (but $0 if within limits)

**Steps to Deploy:**

1. **Install Fly CLI**:

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign Up & Login**:

   ```bash
   fly auth signup
   fly auth login
   ```

3. **Initialize Your App**:

   ```bash
   cd /workspace
   fly launch --no-deploy
   ```

4. **Set Environment Variables**:

   ```bash
   fly secrets set NODE_ENV=production
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
   ```

5. **Deploy**:

   ```bash
   fly deploy
   ```

**Your live URL:** `https://your-app-name.fly.dev`

---

## 💪 Most Powerful: Oracle Cloud Always Free

**Perfect for:** Production apps needing serious resources

**Free Tier Limits:**

- **4 ARM CPUs**
- **24GB RAM** (Yes, really!)
- 200GB block storage
- 10TB outbound bandwidth/month
- Always free (not just 12 months)
- Requires credit card for verification

**Quick Setup:**

1. Sign up at [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
2. Create VM instance: Ampere A1 shape (4 OCPU, 24GB RAM)
3. OS: Ubuntu 22.04
4. Follow VPS deployment instructions in main DEPLOYMENT_GUIDE.md

This is the most generous free tier available anywhere!

---

## 📋 Pre-Deployment Checklist

### 1. Get OAuth Credentials

Before deploying, you MUST get API credentials from each provider:

#### Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API
3. Credentials → Create OAuth 2.0 Client ID
4. Authorized redirect URI: `https://yourdomain.com/auth/google/callback`
5. Copy Client ID and Secret

#### Facebook OAuth2

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create app → Add "Facebook Login" product
3. Settings → Basic: Copy App ID and App Secret
4. Facebook Login → Settings: Add redirect URI
   `https://yourdomain.com/auth/facebook/callback`

#### X (Twitter) OAuth2

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create project and app
3. Enable "Sign in with Twitter"
4. Callback URL: `https://yourdomain.com/auth/twitter/callback`
5. Copy API Key and API Key Secret

#### GitHub OAuth2

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. New OAuth App
3. Homepage URL: `https://yourdomain.com`
4. Callback URL: `https://yourdomain.com/auth/github/callback`
5. Copy Client ID and generate Client Secret

### 2. Generate JWT Secret

```bash
openssl rand -base64 32
```

Copy the output to your `.env` as `JWT_SECRET`

### 3. Test Locally First

```bash
cd /workspace
npm install
npm start
```

Visit `http://localhost:3080` and test all login buttons!

---

## 🔒 Security Best Practices

1. **Never commit `.env` to Git** - Add to `.gitignore`:

   ```
   .env
   *.pem
   *.key
   ```

2. **Use strong passwords** for admin account

3. **Enable HTTPS** - All platforms above provide free SSL

4. **Update callback URLs** to use `https://` in production

5. **Monitor logs** regularly for suspicious activity

---

## 🧪 Testing After Deployment

1. **Test all OAuth providers**:
   - Click each social login button
   - Verify redirect works
   - Check user is created in database

2. **Test admin login**:
   - Login with admin credentials
   - Verify dashboard access

3. **Check HTTPS**:
   - Ensure URL shows padlock icon
   - All resources load over HTTPS

4. **Test API endpoints**:

   ```bash
   curl https://your-app-name.onrender.com/health
   ```

---

## 📊 Comparison Table

| Platform | RAM | CPU | Sleep? | Credit Card? | Best For |
| ---------- | ----- | ----- | -------- | -------------- | ---------- |
| **Render** | 512MB | Shared | Yes (15min) | ❌ No | Quick projects |
| **Koyeb** | 512MB | 0.1 | ❌ No | ❌ No | 24/7 apps |
| **Fly.io** | 256MB | Shared | ❌ No | ✅ Yes | Global apps |
| **Oracle** | 24GB | 4 ARM | ❌ No | ✅ Yes | Production |

---

## 🆘 Troubleshooting

### "App won't start"

- Check logs in platform dashboard
- Verify all environment variables are set
- Ensure `npm start` works locally

### "OAuth callback error"

- Verify callback URLs match exactly (including `https://`)
- Check OAuth app is configured for production domain
- Ensure environment variables are correct

### "CORS errors"

- Update `CORS_ORIGIN` to your production URL
- Restart app after changing env vars

### "App sleeps too often" (Render)

- Use [UptimeRobot](https://uptimerobot.com/) free tier
- Set monitor to ping your app every 14 minutes
- Or upgrade to Render paid plan ($7/month)

---

## 🎯 Recommended Path

**For testing/demo:**

1. Deploy to **Render** (fastest, no credit card)
2. Get OAuth credentials from providers
3. Test all features

**For production:**

1. Deploy to **Oracle Cloud** (most powerful free tier)
2. Or use **Koyeb** for simplicity
3. Set up custom domain
4. Configure proper monitoring

---

## 📚 Resources

- [Render Documentation](https://render.com/docs)
- [Koyeb Documentation](https://www.koyeb.com/docs)
- [Fly.io Documentation](https://fly.io/docs)
- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
- [Passport.js OAuth Strategies](http://www.passportjs.org/)

---

**Ready to deploy?** Start with Render.com - you'll be live in under 10 minutes! 🚀

**Questions?** Check the full [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for more details.
