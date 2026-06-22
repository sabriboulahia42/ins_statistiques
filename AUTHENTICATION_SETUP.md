# SSO Login & Admin Dashboard Setup Guide

This document explains how to set up and use the new SSO login system and admin dashboard for the INS Statistics Portal.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure:

- `JWT_SECRET` - Change to a strong secret for production
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - Get from Google Cloud Console
- `FRONTEND_URL` - Your application URL

### 3. Run the Server

```bash
npm start
```

The server will start at `http://localhost:3080`

### 4. Default Admin Credentials

- **Email**: `admin@ins.tn`
- **Password**: `admin123`

⚠️ **Change this password in production!**

---

## 🔐 Authentication System

### JWT-Based Authentication

- All requests to protected endpoints require a Bearer token in the Authorization header
- Tokens expire after 7 days (configurable via `JWT_EXPIRES_IN`)
- Tokens are issued after successful login/registration

### OAuth2 / Google SSO

- Users can sign in with Google
- First-time Google signups automatically create a new user with "viewer" role
- Subsequent logins with the same Google account log in existing users

### Authentication Endpoints

#### Login with Email/Password

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    "isActive": true
  }
}
```

#### Get Current User

```bash
GET /auth/me
Authorization: Bearer <token>
```

#### Logout

```bash
POST /auth/logout
Authorization: Bearer <token>
```

---

## 👥 User Management & Roles

### Three Role Levels

| Role | Permissions |
| --- | --- |
| **Admin** | Full access - manage users, datasets, settings, analytics |
| **Editor** | Edit datasets, view analytics, export data |
| **Viewer** | View public data, export (if enabled) |

### User Management API (Admin Only)

#### List All Users

```bash
GET /auth/users
Authorization: Bearer <admin_token>
```

#### Update User

```bash
PUT /auth/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Name",
  "role": "editor",
  "isActive": true
}
```

#### Delete User

```bash
DELETE /auth/users/:id
Authorization: Bearer <admin_token>
```

---

## 🎛️ Admin Dashboard Features

### Overview Tab

- Display key statistics (total users, active users, exports, API requests)
- System security status
- Latest updates and activity

### Users & Roles Tab

- View all users with their roles and status
- Edit user information and change roles
- Deactivate/delete users
- See last login timestamps

### Data Management Tab

- Upload new datasets (JSON, XML, CSV)
- View all active datasets with metadata
- Delete datasets
- Create backups and exports

### Analytics Tab

- Daily active users chart
- Export format breakdown
- Top datasets by views and engagement
- Real-time usage metrics

### Settings Tab

- Configure portal title and description
- Enable/disable features (exports, analytics, SSO)
- API rate limiting
- Persistent configuration

---

## 🔒 Securing Your Application

### Important for Production

1. **Change JWT_SECRET**

   ```bash
   # Generate a strong secret
   openssl rand -base64 32
   ```

2. **Set Strong Admin Password**

   - Change the default `admin@ins.tn` password immediately
   - Use strong, unique passwords

3. **Enable Google OAuth2**

   - Get credentials from [Google Cloud Console](https://console.cloud.google.com)
   - Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
   - Configure authorized redirect URI: `https://yourdomain.com/auth/google/callback`

4. **HTTPS Only**

   - Always use HTTPS in production
   - Set `FRONTEND_URL` to HTTPS

5. **CORS Configuration**

   - Update `CORS_ORIGIN` to only allow your domain

---

## 📂 File Structure

```txt
auth/
├── config.js          # OAuth2 & JWT configuration
├── middleware.js      # JWT verification & role checks
├── db.js             # User database (file-based)
└── routes.js         # Authentication endpoints

WebApp/src/
├── auth/
│   ├── AuthContext.jsx    # Global auth state management
│   └── ProtectedRoute.jsx # Route protection component
├── pages/
│   ├── LoginPage.jsx      # SSO login page
│   └── AdminDashboard.jsx # Admin dashboard
├── components/
│   ├── DashboardSidebar.jsx
│   └── admin/
│       ├── UsersPanel.jsx
│       ├── SettingsPanel.jsx
│       ├── AnalyticsPanel.jsx
│       └── DataManagementPanel.jsx
└── styles/
    ├── LoginPage.css
    ├── Dashboard.css
    └── AdminPanels.css

data/
└── users.json  # User database (auto-created)
```

---

## 🛠️ Integration with Your App

### 1. Update Main App Component

```jsx
import { AuthProvider } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        {/* Your other routes */}
      </Routes>
    </AuthProvider>
  );
}
```

### 2. Use Auth Context in Components

```jsx
import { useAuth } from './auth/AuthContext';

function MyComponent() {
  const { user, token, isAdmin, logout } = useAuth();
  
  if (!user) return <p>Not logged in</p>;
  
  return (
    <div>
      Welcome, {user.name}!
      {isAdmin && <button>Admin Panel</button>}
    </div>
  );
}
```

### 3. Protect Backend Routes

```javascript
// In your Express route
const { requireAdmin, verifyToken } = require('./auth/middleware');

// Admin-only route
app.get('/api/sensitive', requireAdmin, (req, res) => {
  res.json({ data: 'Only admins can see this' });
});

// Authenticated users only
app.get('/api/data', verifyToken, (req, res) => {
  res.json({ userId: req.user.id });
});
```

---

## 🐛 Troubleshooting

### "Invalid token" Error

- Check that the token is not expired (valid for 7 days by default)
- Verify the token is being sent in the `Authorization: Bearer <token>` header

### Google OAuth Not Working

- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check that authorized redirect URI matches exactly: `{FRONTEND_URL}/auth/google/callback`
- Ensure Google OAuth API is enabled in Cloud Console

### Users Not Saving

- Check that `data/` directory exists and is writable
- Verify filesystem permissions
- Check server console for error messages

### CORS Errors

- Update `CORS_ORIGIN` in `.env` to include your frontend URL
- Ensure `FRONTEND_URL` is configured correctly

---

## 📚 Next Steps

1. **Database Migration** - Replace file-based users.json with MongoDB/PostgreSQL
2. **Email Verification** - Add email confirmation for new accounts
3. **Two-Factor Authentication** - Implement 2FA for admin accounts
4. **Audit Logging** - Log all admin actions
5. **Password Reset** - Add forgot password flow
6. **API Rate Limiting** - Implement per-user rate limiting
7. **Refresh Tokens** - Add token refresh mechanism

---

## 📖 Additional Resources

- [JWT Documentation](https://jwt.io)
- [Passport.js](http://www.passportjs.org/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Version**: 1.0.0  
**Last Updated**: 2026-06-17  
**Author**: INS Statistics Portal Team
