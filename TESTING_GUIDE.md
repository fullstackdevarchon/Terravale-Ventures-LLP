# Quick Test Guide - Authentication Fixes

## What Was Fixed

### ✅ Issues Resolved
1. **Google login** now sets cookie AND returns token
2. **Email/password login** now returns token in response body
3. **Admin axios** now includes Authorization header
4. **Seller navigation** fixed from `/seller/dashboard` to `/seller`

## How to Test

### 1. Test Admin Login

#### Email/Password Login
```
URL: http://localhost:5173/login (admin frontend)
Email: [admin email]
Password: [admin password]

Expected:
✅ Login successful message
✅ Redirect to /admin-dashboard
✅ Dashboard loads without errors
✅ No 401 errors in console
```

#### Google Login
```
URL: http://localhost:5173/login (admin frontend)
Click: Google Sign-In button
Select: Admin Google account

Expected:
✅ "Welcome back, Admin!" message
✅ Redirect to /admin-dashboard
✅ Dashboard loads without errors
✅ No 401 errors in console
```

### 2. Test Buyer Login

#### Email/Password Login
```
URL: http://localhost:5173/login/buyer (main frontend)
Email: [buyer email]
Password: [buyer password]

Expected:
✅ "Login successful!" alert
✅ Redirect to /buyer-dashboard
✅ Dashboard loads without errors
✅ No 401 or 404 errors in console
```

#### Google Login
```
URL: http://localhost:5173/login/buyer (main frontend)
Click: Google Sign-In button
Select: Buyer Google account

Expected:
✅ "Google Login Successful!" alert
✅ Redirect to /buyer-dashboard
✅ Dashboard loads without errors
✅ No 401 or 404 errors in console
```

### 3. Test Seller Login

#### Email/Password Login
```
URL: http://localhost:5173/login/seller (main frontend)
Email: [seller email]
Password: [seller password]

Expected:
✅ "Login successful!" alert
✅ Redirect to /seller (NOT /seller/dashboard)
✅ Dashboard loads without errors
✅ No 401 or 404 errors in console
```

#### Google Login
```
URL: http://localhost:5173/login/seller (main frontend)
Click: Google Sign-In button
Select: Seller Google account

Expected:
✅ "Google Login Successful!" alert
✅ Redirect to /seller (NOT /seller/dashboard)
✅ Dashboard loads without errors
✅ No 401 or 404 errors in console
```

## Console Checks

### ✅ What You Should See
```
✅ Google Login Success: {credential: "..."}
✅ 200 status for login requests
✅ 200 status for dashboard API calls
✅ Token stored in localStorage
✅ Token stored in cookies
```

### ❌ What You Should NOT See
```
❌ 401 Unauthorized errors
❌ 404 Not Found errors
❌ "Please login to access this resource"
❌ "Authentication failed: No token received"
❌ Cross-Origin-Opener-Policy errors (these are warnings, not errors)
```

## Network Tab Checks

### Login Request
```
Request URL: http://localhost:5000/api/users/login
Method: POST
Status: 200 OK

Response Body:
{
  "message": "Login successful",
  "user": {
    "id": "...",
    "fullName": "...",
    "email": "...",
    "role": "buyer/seller/admin"
  },
  "token": "eyJhbGc..." ✅ Token present
}

Response Headers:
Set-Cookie: token=eyJhbGc...; HttpOnly; Secure; SameSite=None ✅ Cookie set
```

### Dashboard API Request
```
Request URL: http://localhost:5000/api/v1/products/all
Method: GET
Status: 200 OK

Request Headers:
Authorization: Bearer eyJhbGc... ✅ Token included
Cookie: token=eyJhbGc... ✅ Cookie included
```

## LocalStorage Checks

Open DevTools → Application → Local Storage → http://localhost:5173

Should contain:
```
token: "eyJhbGc..."
role: "buyer" / "seller" / "admin"
user: {"id":"...","fullName":"...","email":"...","role":"...","token":"..."}
```

## Cookie Checks

Open DevTools → Application → Cookies → http://localhost:5173

Should contain:
```
Name: token
Value: eyJhbGc...
Domain: localhost
Path: /
Expires: (1 day from now)
HttpOnly: ✓
Secure: ✓
SameSite: None
```

## Troubleshooting

### If you still see 401 errors:
1. Clear browser cache and cookies
2. Clear localStorage: `localStorage.clear()`
3. Restart frontend dev server
4. Restart backend server
5. Try incognito/private browsing mode

### If you see 404 errors:
1. Check the URL in browser address bar
2. Verify routes in App.jsx match navigation paths
3. Check browser console for navigation errors

### If Google login fails:
1. Check GOOGLE_CLIENT_ID in .env
2. Verify Google OAuth credentials
3. Check browser console for Google errors
4. Ensure frontend URL is whitelisted in Google Console

## Success Criteria

### All tests pass when:
- ✅ All login methods work (email/password + Google)
- ✅ All roles can access their dashboards (admin, buyer, seller)
- ✅ No 401 or 404 errors in console
- ✅ Token persists on page refresh
- ✅ All protected routes load correctly
- ✅ Logout clears all auth data

## Files to Monitor

### Backend Logs
```bash
cd backend
npm run dev

Watch for:
✅ MongoDB Connected
✅ Server running on port 5000
✅ No JWT errors
✅ No authentication errors
```

### Frontend Logs
```bash
cd frontend
npm run dev

Watch for:
✅ No 401 errors
✅ No 404 errors
✅ Successful API responses
```

### Admin Frontend Logs
```bash
cd admin-frontend
npm run dev

Watch for:
✅ No 401 errors
✅ Successful API responses
✅ Dashboard data loads
```
