# 🔒 CORS Security Configuration Guide

## Table of Contents
1. [Overview](#overview)
2. [Secure CORS Implementation](#secure-cors-implementation)
3. [Why This Configuration is Secure](#why-this-configuration-is-secure)
4. [Security Vulnerabilities Prevented](#security-vulnerabilities-prevented)
5. [Verification Checklist](#verification-checklist)
6. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
7. [Testing Your CORS Configuration](#testing-your-cors-configuration)
8. [Production Deployment Checklist](#production-deployment-checklist)

---

## Overview

**CORS (Cross-Origin Resource Sharing)** is a security mechanism that controls which domains can access your API. A misconfigured CORS policy can expose your users to serious security vulnerabilities, including:

- **Data theft** through malicious websites
- **Session hijacking** via stolen cookies
- **CSRF attacks** (Cross-Site Request Forgery)
- **Unauthorized API access** from untrusted domains

This guide provides a **production-ready, secure CORS configuration** for your Node.js/Express backend.

---

## Secure CORS Implementation

### ✅ Current Implementation (Already Applied)

Your `server.js` now includes a secure CORS configuration:

```javascript
const allowedOrigins = [
  // Local development
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  
  // Production
  "https://terravale-main.onrender.com",
  "https://terravale-admin.onrender.com",
  "https://terravale-labour.onrender.com",
  
  // Environment variables (optional)
  process.env.FRONTEND_URL?.replace(/\/+$/, ""),
  process.env.ADMIN_URL?.replace(/\/+$/, ""),
  process.env.LABOUR_URL?.replace(/\/+$/, ""),
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      // Allow no-origin requests (Postman, mobile apps)
      // ⚠️ In strict production, block these
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚨 CORS BLOCKED: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed`), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
```

---

## Why This Configuration is Secure

### 1. **Whitelist-Based Origin Validation** ✅
- **What it does**: Only allows requests from explicitly listed domains
- **Why it's secure**: Prevents malicious websites from accessing your API
- **Implementation**: `allowedOrigins` array with strict matching

### 2. **Dynamic Origin Checking** ✅
- **What it does**: Validates each request's origin against the whitelist
- **Why it's secure**: Blocks unknown origins in real-time
- **Implementation**: Custom `origin` function in `corsOptions`

### 3. **Credentials Support with Strict Origins** ✅
- **What it does**: Allows cookies/auth headers ONLY from whitelisted origins
- **Why it's secure**: Prevents session theft from malicious sites
- **Implementation**: `credentials: true` + strict origin validation

### 4. **Explicit Method Whitelisting** ✅
- **What it does**: Only allows specific HTTP methods
- **Why it's secure**: Prevents unexpected API operations
- **Implementation**: `methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]`

### 5. **Header Whitelisting** ✅
- **What it does**: Only allows specific request headers
- **Why it's secure**: Prevents header injection attacks
- **Implementation**: `allowedHeaders` array

### 6. **Preflight Caching** ✅
- **What it does**: Caches CORS preflight responses for 24 hours
- **Why it's secure**: Reduces attack surface by minimizing OPTIONS requests
- **Implementation**: `maxAge: 86400`

### 7. **Security Logging** ✅
- **What it does**: Logs all blocked CORS attempts
- **Why it's secure**: Helps detect and monitor attacks
- **Implementation**: `console.warn()` for unauthorized origins

---

## Security Vulnerabilities Prevented

### ❌ Vulnerability 1: Wildcard Origin with Credentials
**Insecure Code:**
```javascript
app.use(cors({
  origin: "*",  // ⚠️ DANGEROUS!
  credentials: true
}));
```

**Why it's dangerous:**
- Allows ANY website to access your API with user credentials
- Enables session hijacking and data theft
- Violates browser security policies (will fail)

**✅ Our Solution:**
- Strict whitelist of allowed origins
- Dynamic validation function
- Credentials only work with whitelisted domains

---

### ❌ Vulnerability 2: Regex-Based Origin Matching
**Insecure Code:**
```javascript
app.use(cors({
  origin: /\.example\.com$/,  // ⚠️ Can be bypassed!
  credentials: true
}));
```

**Why it's dangerous:**
- Attackers can register domains like `evil.example.com`
- Subdomain takeover attacks
- Regex bypass techniques

**✅ Our Solution:**
- Exact string matching with `includes()`
- No regex patterns
- Explicit domain listing

---

### ❌ Vulnerability 3: Trusting Origin Header
**Insecure Code:**
```javascript
app.use(cors({
  origin: true,  // ⚠️ Trusts all origins!
  credentials: true
}));
```

**Why it's dangerous:**
- Reflects any origin back to the client
- Allows credential-based attacks from any domain

**✅ Our Solution:**
- Never trust the origin header
- Validate against a hardcoded whitelist
- Log suspicious attempts

---

### ❌ Vulnerability 4: No Preflight Handling
**Insecure Code:**
```javascript
app.use(cors(corsOptions));
// Missing: app.options("*", cors(corsOptions));
```

**Why it's dangerous:**
- Preflight requests may fail
- Inconsistent CORS behavior
- Potential security bypass

**✅ Our Solution:**
- Explicit preflight handling with `app.options("*")`
- Consistent CORS headers on all requests

---

## Verification Checklist

### ✅ Pre-Deployment Checklist

- [ ] **Whitelist is complete**: All production domains are listed
- [ ] **No wildcards**: No `*` in origin, methods, or headers
- [ ] **Credentials enabled**: `credentials: true` is set
- [ ] **HTTPS in production**: All production URLs use `https://`
- [ ] **Environment variables**: `.env` file has correct URLs
- [ ] **Logging enabled**: Blocked origins are logged
- [ ] **Preflight handling**: `app.options("*")` is present
- [ ] **No regex origins**: Only exact string matching
- [ ] **Headers whitelisted**: Only necessary headers allowed
- [ ] **Methods whitelisted**: Only required HTTP methods allowed

### ✅ Runtime Verification

Run these tests after deployment:

#### Test 1: Allowed Origin (Should Succeed)
```bash
curl -H "Origin: https://terravale-main.onrender.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://your-backend.com/api/users
```

**Expected Response:**
```
Access-Control-Allow-Origin: https://terravale-main.onrender.com
Access-Control-Allow-Credentials: true
```

#### Test 2: Blocked Origin (Should Fail)
```bash
curl -H "Origin: https://evil-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://your-backend.com/api/users
```

**Expected Response:**
```
CORS policy: Origin https://evil-site.com is not allowed
```

#### Test 3: Credentials Test
```bash
curl -H "Origin: https://terravale-main.onrender.com" \
     -H "Cookie: buyer_token=test123" \
     https://your-backend.com/api/profile
```

**Expected Response:**
- Should include `Access-Control-Allow-Credentials: true`
- Should process the cookie

---

## Common Mistakes to Avoid

### 🚫 Mistake 1: Using `origin: "*"` with Credentials
```javascript
// ❌ NEVER DO THIS
app.use(cors({
  origin: "*",
  credentials: true  // This will FAIL in browsers!
}));
```

**Why it fails:**
- Browsers block `Access-Control-Allow-Origin: *` when credentials are used
- Security violation per CORS specification

**✅ Correct approach:**
```javascript
app.use(cors({
  origin: allowedOrigins,  // Specific domains
  credentials: true
}));
```

---

### 🚫 Mistake 2: Forgetting to Update Production URLs
```javascript
// ❌ Forgot to add production domain
const allowedOrigins = [
  "http://localhost:5173",
  // Missing: "https://terravale-main.onrender.com"
];
```

**Impact:**
- Production frontend can't access API
- Users see CORS errors

**✅ Correct approach:**
- Maintain separate dev and prod origins
- Use environment variables for flexibility

---

### 🚫 Mistake 3: Not Handling Preflight Requests
```javascript
// ❌ Missing preflight handler
app.use(cors(corsOptions));
// Should also have: app.options("*", cors(corsOptions));
```

**Impact:**
- POST/PUT/DELETE requests may fail
- Inconsistent CORS behavior

**✅ Correct approach:**
```javascript
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));  // Handle preflight
```

---

### 🚫 Mistake 4: Allowing Subdomains with Regex
```javascript
// ❌ Vulnerable to subdomain attacks
app.use(cors({
  origin: /\.terravale\.com$/
}));
```

**Impact:**
- Attacker registers `evil.terravale.com`
- Gains API access

**✅ Correct approach:**
```javascript
const allowedOrigins = [
  "https://www.terravale.com",
  "https://admin.terravale.com",
  // Explicitly list each subdomain
];
```

---

### 🚫 Mistake 5: Exposing Sensitive Headers
```javascript
// ❌ Exposing internal headers
app.use(cors({
  exposedHeaders: ["*"]  // Too permissive!
}));
```

**Impact:**
- Leaks internal server information
- Potential security disclosure

**✅ Correct approach:**
```javascript
exposedHeaders: ["Set-Cookie"]  // Only what's needed
```

---

## Testing Your CORS Configuration

### Manual Testing with Browser DevTools

1. **Open your frontend** (e.g., `https://terravale-main.onrender.com`)
2. **Open DevTools** (F12) → Console tab
3. **Make an API request:**
   ```javascript
   fetch('https://your-backend.com/api/users', {
     credentials: 'include'
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error);
   ```
4. **Check Network tab:**
   - Look for `Access-Control-Allow-Origin` header
   - Should match your frontend domain
   - Should NOT be `*`

### Automated Testing Script

Create `test-cors.js`:

```javascript
const axios = require('axios');

const tests = [
  {
    name: "Allowed Origin Test",
    origin: "https://terravale-main.onrender.com",
    shouldPass: true
  },
  {
    name: "Blocked Origin Test",
    origin: "https://evil-site.com",
    shouldPass: false
  }
];

tests.forEach(async (test) => {
  try {
    const response = await axios.options('https://your-backend.com/api/users', {
      headers: { Origin: test.origin }
    });
    
    const allowed = response.headers['access-control-allow-origin'] === test.origin;
    console.log(`${test.name}: ${allowed === test.shouldPass ? '✅ PASS' : '❌ FAIL'}`);
  } catch (error) {
    console.log(`${test.name}: ${!test.shouldPass ? '✅ PASS (blocked)' : '❌ FAIL'}`);
  }
});
```

---

## Production Deployment Checklist

### Before Deploying to VPS/Render/DigitalOcean

- [ ] **Update `.env` file** with production URLs:
  ```env
  FRONTEND_URL=https://terravale-main.onrender.com
  ADMIN_URL=https://terravale-admin.onrender.com
  LABOUR_URL=https://terravale-labour.onrender.com
  ```

- [ ] **Remove development origins** (optional):
  ```javascript
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        "https://terravale-main.onrender.com",
        "https://terravale-admin.onrender.com",
        "https://terravale-labour.onrender.com",
      ]
    : [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
      ];
  ```

- [ ] **Enable strict no-origin blocking**:
  ```javascript
  if (!origin) {
    return callback(new Error('Origin not allowed by CORS'), false);
  }
  ```

- [ ] **Set up monitoring** for CORS errors:
  ```javascript
  console.warn(`🚨 CORS BLOCKED: ${origin}`);
  // Send to logging service (e.g., Sentry, LogRocket)
  ```

- [ ] **Test from production frontend** before going live

- [ ] **Verify HTTPS** is used for all production URLs

- [ ] **Check cookie settings** match CORS configuration:
  ```javascript
  res.cookie('buyer_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // HTTPS only
    sameSite: 'none',  // Required for cross-origin cookies
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  ```

---

## Additional Security Recommendations

### 1. **Implement Rate Limiting**
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // Limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 2. **Add Security Headers**
```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", ...allowedOrigins]
    }
  }
}));
```

### 3. **Enable HTTPS Redirect**
```javascript
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});
```

### 4. **Validate JWT Tokens**
Ensure your authentication middleware properly validates tokens:
```javascript
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.buyer_token || req.cookies.admin_token;
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
```

---

## Summary

### ✅ What Your Secure CORS Configuration Does

1. **Blocks malicious websites** from accessing your API
2. **Protects user credentials** (cookies, tokens) from theft
3. **Prevents CSRF attacks** through strict origin validation
4. **Logs security incidents** for monitoring
5. **Supports multiple frontends** (admin, customer, labour)
6. **Works in development and production** with environment variables
7. **Follows security best practices** recommended by OWASP

### 🔒 Security Guarantees

- ✅ No wildcard origins
- ✅ No regex-based matching
- ✅ Credentials only for whitelisted domains
- ✅ Explicit method and header whitelisting
- ✅ Preflight request handling
- ✅ Security logging and monitoring

### 📚 Additional Resources

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [OWASP CORS Security](https://owasp.org/www-community/attacks/CORS_OriginHeaderScrutiny)
- [Express CORS Middleware](https://expressjs.com/en/resources/middleware/cors.html)

---

**Your API is now secure! 🎉**

If you have questions or need to add more origins, update the `allowedOrigins` array in `server.js`.
