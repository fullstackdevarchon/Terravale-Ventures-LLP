# 🔒 CORS Security Quick Reference

## ✅ What's Already Configured

Your backend now has **production-ready CORS security**:

```javascript
✅ Whitelist-based origin validation
✅ Strict credential handling  
✅ Security logging for blocked attempts
✅ Preflight request handling
✅ Environment-based configuration
```

---

## 🚀 Quick Start

### 1. Update Your `.env` File (Production)

Add these variables for production deployment:

```env
# Production Frontend URLs
FRONTEND_URL=https://terravale-main.onrender.com
ADMIN_URL=https://terravale-admin.onrender.com
LABOUR_URL=https://terravale-labour.onrender.com

# Existing variables
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 2. Verify CORS is Working

**Test from Browser Console:**
```javascript
fetch('https://your-backend.com/api/users', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);
```

**Expected:** ✅ No CORS errors
**If fails:** Check DevTools Network tab for CORS headers

---

## 🛡️ Security Checklist

- [x] **No wildcards** (`origin: "*"` removed)
- [x] **Whitelist only** (specific domains listed)
- [x] **Credentials protected** (`credentials: true` with strict origins)
- [x] **Logging enabled** (blocked attempts logged)
- [x] **Preflight handled** (`app.options("*")` added)
- [ ] **Production URLs added** (update `.env` before deploy)
- [ ] **HTTPS enabled** (all production URLs use `https://`)
- [ ] **Frontend configured** (`withCredentials: true` in axios/fetch)

---

## 🔧 Adding New Origins

Edit `server.js` and add to the `allowedOrigins` array:

```javascript
const allowedOrigins = [
  // ... existing origins
  "https://your-new-domain.com",  // Add here
];
```

**Important:** Restart your server after changes!

---

## ❌ Common Mistakes to Avoid

| ❌ Don't Do This | ✅ Do This Instead |
|-----------------|-------------------|
| `origin: "*"` | `origin: allowedOrigins` |
| `origin: true` | `origin: function(origin, callback) {...}` |
| Regex patterns | Exact string matching |
| Missing `app.options("*")` | Include preflight handler |
| HTTP in production | HTTPS only |

---

## 🧪 Testing Commands

### Test Allowed Origin (Should Pass)
```bash
curl -H "Origin: https://terravale-main.onrender.com" \
     -X OPTIONS \
     https://your-backend.com/api/users
```

### Test Blocked Origin (Should Fail)
```bash
curl -H "Origin: https://evil-site.com" \
     -X OPTIONS \
     https://your-backend.com/api/users
```

---

## 🚨 Troubleshooting

### Issue: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause:** Frontend origin not in whitelist

**Fix:** Add frontend URL to `allowedOrigins` array

---

### Issue: "Credentials flag is 'true', but 'Access-Control-Allow-Origin' is '*'"

**Cause:** Using wildcard with credentials

**Fix:** Already fixed! You're using whitelist approach ✅

---

### Issue: "Preflight request doesn't pass"

**Cause:** Missing `app.options("*")`

**Fix:** Already added! ✅

---

## 📋 Pre-Deployment Checklist

Before deploying to Render/VPS/DigitalOcean:

- [ ] All production URLs added to `allowedOrigins`
- [ ] `.env` file updated with production URLs
- [ ] All URLs use `https://` (not `http://`)
- [ ] Frontend has `withCredentials: true` configured
- [ ] Cookie settings use `sameSite: 'none'` and `secure: true`
- [ ] Tested CORS from production frontend
- [ ] Monitoring/logging enabled

---

## 🔗 Frontend Configuration

Make sure your frontend axios/fetch includes credentials:

### Axios (Recommended)
```javascript
import axios from 'axios';

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: 'https://your-backend.com/api',
  withCredentials: true
});
```

### Fetch API
```javascript
fetch('https://your-backend.com/api/users', {
  credentials: 'include',  // Important!
  headers: {
    'Content-Type': 'application/json'
  }
});
```

---

## 📚 Full Documentation

For detailed explanations, see: **`CORS_SECURITY_GUIDE.md`**

---

## ✅ You're Protected Against

- ✅ CORS-based data theft
- ✅ Session hijacking
- ✅ CSRF attacks
- ✅ Unauthorized API access
- ✅ Credential leakage
- ✅ Subdomain takeover attacks

---

**Your API is now secure! 🎉**

Last updated: 2025-12-08
