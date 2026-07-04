# Backend Code Examples & Integration Guide

## 📚 Quick Start: Code Examples

### 1. Frontend Integration Examples

#### React Component: Login with Backend API

```jsx
// WebApp/src/components/LoginForm.jsx
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

#### React Hook: Authenticated API Calls

```jsx
// WebApp/src/hooks/useApi.ts
import { useState, useEffect } from 'react';

export function useApi<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...((options?.headers as Record<string, string>) || {})
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(fullUrl, {
          ...options,
          headers
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// Usage in component:
function DatasetsView() {
  const { data: datasets, loading } = useApi('/api/datasets');
  
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      {datasets?.data?.map(ds => (
        <div key={ds.id}>{ds.name}</div>
      ))}
    </div>
  );
}
```

#### React Component: OAuth Login

```jsx
// WebApp/src/components/OAuthButtons.jsx
export function OAuthButtons() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const handleOAuthClick = (provider) => {
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  return (
    <div>
      <button onClick={() => handleOAuthClick('google')}>
        Sign in with Google
      </button>
      <button onClick={() => handleOAuthClick('facebook')}>
        Sign in with Facebook
      </button>
      <button onClick={() => handleOAuthClick('twitter')}>
        Sign in with Twitter
      </button>
      <button onClick={() => handleOAuthClick('github')}>
        Sign in with GitHub
      </button>
    </div>
  );
}
```

---

### 2. API Usage Examples

#### Get All Datasets

```bash
curl http://localhost:4000/api/datasets

# Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "agriculture",
      "key": "AG001",
      "name": "Agriculture Production",
      "description": "Agricultural statistics for Tunisia",
      "period": { "start": 2015, "end": 2024 },
      "dimensions": [...]
    }
  ]
}
```

#### Get Single Dataset

```bash
curl http://localhost:4000/api/datasets/agriculture

# Response:
{
  "success": true,
  "data": {
    "id": "agriculture",
    "key": "AG001",
    "name": "Agriculture Production",
    ...
  }
}
```

#### User Registration

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe"
  }'

# Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "viewer",
    "createdAt": "2026-03-12T14:07:30.123Z"
  }
}
```

#### User Login

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'

# Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### Authenticated Request: Get Settings

```bash
curl http://localhost:4000/api/settings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Response:
{
  "overrides": { ... },
  "config": { ... }
}
```

#### AI Assistant Request

```bash
curl -X POST http://localhost:4000/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What was Tunisia tourism revenue in 2023?",
    "history": [],
    "context": {
      "sector": "tourism",
      "year": 2023
    }
  }'

# Response:
{
  "text": "According to Tunisia's tourism statistics, the sector generated approximately..."
}
```

#### Geolocation

```bash
curl http://localhost:4000/api/geo

# Response (from ip-api.com or cache):
{
  "ip": "203.0.113.42",
  "country": "United States",
  "countryCode": "US",
  "city": "New York",
  "region": "NY",
  "isp": "Example ISP",
  "lat": 40.7128,
  "lon": -74.0060,
  "timezone": "America/New_York",
  "isLocal": false
}
```

---

### 3. Backend Usage Examples

#### Direct Backend Usage (Node.js)

```javascript
// Example: Make authenticated requests from your server
import fetch from 'node-fetch';

const API_URL = 'http://localhost:4000';
const token = 'your-jwt-token';

// Get datasets
const response = await fetch(`${API_URL}/api/datasets`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data);
```

#### Using Backend in Express Middleware

```javascript
// Example: Proxy requests through your own server
app.get('/api/data', async (req, res) => {
  try {
    const backendResponse = await fetch('http://localhost:4000/api/datasets');
    const data = await backendResponse.json();
    
    // Add additional processing here
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

### 4. Environment Configuration

#### Vite Configuration (.env.local)

```env
# API Configuration
VITE_API_URL=http://localhost:4000
VITE_APP_NAME=INS Statistics
VITE_APP_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_AI=true
VITE_ENABLE_EXPORT=true
VITE_ENABLE_OAUTH=true
```

#### Backend .env (api/.env)

```env
# Server Config
NODE_ENV=development
PORT=4000
HOST=0.0.0.0

# Auth
JWT_SECRET=dev-very-long-secret-key-change-in-prod
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3080,http://localhost:5173
FRONTEND_URL=http://localhost:3080

# OAuth Credentials (add yours)
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# ... other OAuth providers ...

# AI
HF_API_KEY=your-hugging-face-api-key
```

---

### 5. TypeScript Types

#### User Type Definition

```typescript
// WebApp/src/types/auth.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  profilePicture?: string;
  provider: 'local' | 'google' | 'facebook' | 'twitter' | 'github' | 'hybrid';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  error?: string;
}
```

#### Dataset Type Definition

```typescript
// WebApp/src/types/data.ts
export interface Dimension {
  id: string;
  name: string;
  type: string;
}

export interface TimePeriod {
  start: number | null;
  end: number | null;
}

export interface Dataset {
  id: string;
  key: string;
  name: string;
  description: string;
  period: TimePeriod;
  dimensions: Dimension[];
}

export interface DatasetsResponse {
  success: boolean;
  count: number;
  data: Dataset[];
  error?: string;
}
```

#### API Response Wrapper

```typescript
// WebApp/src/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
}
```

---

### 6. Error Handling Patterns

#### Frontend Error Handler

```typescript
// WebApp/src/utils/apiError.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error || 'API request failed',
      new Error(JSON.stringify(data))
    );
  }
  
  return data;
}

// Usage:
try {
  const data = await fetch('/api/datasets')
    .then(r => handleApiResponse(r));
} catch (err) {
  if (err instanceof ApiError) {
    console.error(`API Error ${err.status}: ${err.message}`);
  }
}
```

#### Backend Error Handler

```javascript
// Already in api/server.js - Example:
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});
```

---

### 7. Security Best Practices

#### Frontend: Token Storage

```javascript
// ✅ GOOD: Store in memory or sessionStorage
const token = sessionStorage.getItem('token');

// ⚠️ RISKY: localStorage is vulnerable to XSS
// Use localStorage only with proper CSP headers

// ✅ BETTER: Use httpOnly cookies (set by backend)
// Server sets: Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict
```

#### Frontend: CSRF Protection

```javascript
// Get CSRF token from meta tag or header
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

// Include in requests
fetch('/api/settings', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ ... })
});
```

#### Backend: Password Requirements

```javascript
// From api/server.js - UserDB.hashPassword()
// Uses bcryptjs with 10 rounds of hashing
// Passwords should meet minimum requirements:
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
```

---

### 8. Testing Examples

#### Unit Test: Login Endpoint

```javascript
// Example test file
import { describe, it, expect } from 'vitest';
import fetch from 'node-fetch';

describe('Auth Endpoints', () => {
  const API_URL = 'http://localhost:4000';

  it('should register a new user', async () => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123!',
        name: 'Test User'
      })
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe('test@example.com');
  });

  it('should login with credentials', async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
  });
});
```

---

## 🔗 Integration Checklist

- [ ] Backend deployed to Render
- [ ] Environment variables configured
- [ ] Frontend API_URL set to backend URL
- [ ] CORS origin added to backend env
- [ ] OAuth credentials configured (if using)
- [ ] JWT secret set securely
- [ ] User database directory created (`data/`)
- [ ] Settings.json configured
- [ ] SSL certificates valid (production)
- [ ] Error logging configured
- [ ] Rate limiting configured (optional)
- [ ] API documentation generated
- [ ] Load testing performed
- [ ] Security audit completed

---

## 📞 Support & Debugging

### Common Issues

**Issue: "Module not found"**

```bash
cd api && npm install <missing-package>
```

**Issue: "Cannot find token"**
Check localStorage/sessionStorage in browser DevTools:

```javascript
localStorage.getItem('token')
```

**Issue: "CORS error"**
Update `CORS_ORIGIN` in backend .env:

```env
CORS_ORIGIN=https://your-frontend-domain.com
```

**Issue: "Geolocation returning Unknown"**
Might be a network issue. Check ip-api.com status.

---

**You now have everything you need to integrate and deploy!** 🚀
