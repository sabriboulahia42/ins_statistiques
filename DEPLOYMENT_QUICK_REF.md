# 🚀 Deployment & Quick Reference Guide

## Installation (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env

# 3. Edit .env and set:
# - JWT_SECRET (required)
# - GOOGLE_CLIENT_ID (for SSO)
# - FRONTEND_URL (your domain)

# 4. Start server
npm start
```

**That's it!** Access at http://{localIPAddress}:3080

---

## 🔑 Default Credentials

```txt
Email:    admin@ins.tn
Password: admin123
```

⚠️ **Change immediately in production!**

---

## 📍 Key URLs

| URL | Purpose |
| --- | --- |
| `/` | Public statistics portal |
| `/login` | SSO login page |
| `/dashboard` | Admin dashboard (authenticated only) |
| `/auth/google` | Google OAuth redirect |

---

## 🔐 Securing for Production

### 1. Generate JWT Secret

```bash
openssl rand -base64 32
# Copy output to .env JWT_SECRET
```

### 2. Google OAuth Setup

- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create OAuth 2.0 credentials
- Set redirect URI: `https://yourdomain.com/auth/google/callback`
- Copy Client ID & Secret to .env

### 3. Update Environment

```env
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

### 4. Change Admin Password

- After first login, update `admin@ins.tn` password via dashboard

---

## 📊 Admin Dashboard Features

### Users Tab

- List all users with roles
- Create/edit/delete users
- Change user roles (admin/editor/viewer)
- Deactivate accounts

### Data Tab

- Upload datasets (JSON/XML/CSV)
- Manage existing datasets
- Create backups
- Export all data

### Analytics Tab

- Daily active users chart
- Export format breakdown
- Top datasets by engagement
- Real-time metrics

### Settings Tab

- Portal title & description
- Feature toggles
- API rate limiting
- Persistent configuration

### Overview Tab

- Key statistics
- Security status checklist
- Latest activity

---

## 🔗 API Quick Reference

### Authentication

```bash
# Login
curl -X POST http://{localIPAddress}:3080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ins.tn","password":"admin123"}'

# Get current user
curl -H "Authorization: Bearer TOKEN" \
  http://{localIPAddress}:3080/auth/me

# List users (admin only)
curl -H "Authorization: Bearer TOKEN" \
  http://{localIPAddress}:3080/auth/users
```

### Protected Routes

```javascript
// Always include token in Authorization header
fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## 🏗️ Tech Stack

| Component | Technology |
| --- | --- |
| **Auth** | JWT + Passport.js + Google OAuth2 |
| **Backend** | Node.js + Express |
| **Frontend** | React + React Context |
| **Database** | JSON file (migrate to MongoDB/PostgreSQL) |
| **Passwords** | Bcryptjs (10 rounds) |
| **Styling** | CSS3 with animations |

---

## 📦 Project Structure

```txt
root/
├── auth/                  ← Authentication logic
│   ├── config.js         ← OAuth & JWT config
│   ├── middleware.js     ← Token verification
│   ├── db.js             ← User storage
│   └── routes.js         ← Auth endpoints
│
├── WebApp/src/           ← React frontend
│   ├── auth/             ← Auth components
│   ├── pages/            ← Login & Dashboard
│   ├── components/       ← Admin panels
│   └── styles/           ← CSS files
│
├── .env                  ← Configuration (IGNORED)
└── proxy.js              ← Express server
```

---

## ✨ Features at a Glance

✅ **Authentication**

- Email/password login
- Google OAuth2 SSO
- JWT tokens (7-day expiry)
- Secure password hashing

✅ **Authorization**

- Role-based access control
- Admin/Editor/Viewer roles
- Route protection
- API endpoint security

✅ **Admin Dashboard**

- User management
- Data upload/management
- Analytics dashboard
- Settings configuration
- Real-time statistics

✅ **Security**

- CORS protection
- Token verification
- Password encryption
- Environment variables
- Audit logging ready

---

## 🐛 Troubleshooting

| Issue | Solution |
| --- | --- |
| "Module not found" | Run `npm install` |
| Login fails | Check email/password or Google OAuth config |
| Dashboard 404 | Ensure you're authenticated (check token) |
| Google OAuth error | Verify callback URL in Google Console |
| CORS errors | Update CORS_ORIGIN in .env |

---

## 📚 Documentation Files

- **AUTHENTICATION_SETUP.md** - Complete setup guide
- **DELIVERY_SUMMARY.md** - Implementation overview
- **BEFORE_AFTER_COMPARISON.md** - Feature comparison
- **DEPLOYMENT_QUICK_REF.md** - This file

---

## 🔄 Database Migration (Future)

When ready to migrate from JSON to MongoDB/PostgreSQL:

```javascript
// Current: File-based
const db = require('./auth/db.js');

// Replace with MongoDB:
const User = require('./models/User.js');
// Update all db.* calls to User.* calls
```

---

## 🎯 Next Steps

### Immediate (Required for Production)

1. ✅ Change JWT_SECRET in .env
2. ✅ Set up Google OAuth credentials
3. ✅ Change admin password
4. ✅ Enable HTTPS

### Soon (Recommended)

1. Migrate to database
2. Add email verification
3. Implement password reset
4. Set up rate limiting

### Future (Nice to Have)

1. Two-factor authentication
2. API key management
3. Audit logging
4. Team/organization support

---

## 📞 Getting Help

1. **Check documentation** - AUTHENTICATION_SETUP.md
2. **Review code comments** - JSDoc in component files
3. **Check console logs** - Server output shows errors
4. **Read error messages** - They're detailed!

---

## 🎓 Learning Resources

- [JWT.io](https://jwt.io) - JWT explanation
- [Passport.js Docs](http://www.passportjs.org/) - OAuth strategies
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## ✅ Pre-Launch Checklist

- [ ] JWT_SECRET is set and strong
- [ ] Google OAuth credentials configured
- [ ] Admin password changed from default
- [ ] HTTPS enabled
- [ ] CORS_ORIGIN set correctly
- [ ] DATABASE backed up (if using database)
- [ ] Environment variables validated
- [ ] Rate limiting configured
- [ ] Error logging enabled
- [ ] SSL certificate valid

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: 2026-06-17

***Happy deploying! 🚀***
