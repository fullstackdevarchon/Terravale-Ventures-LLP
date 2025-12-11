# Admin Setup - Quick Start Guide

## 🚀 What Was Created

You now have a **completely separate Admin system** with:

✅ **Backend:**
- Dedicated Admin model (`backend/models/Admin.js`)
- Full Admin controller (`backend/controllers/adminController.js`)
- Complete Admin routes (`backend/routes/adminRoutes.js`)
- Validation middleware (`backend/middleware/adminValidation.js`)
- Updated authentication middleware

✅ **Frontend:**
- Admin API module (`admin-frontend/src/api/adminApi.js`)
- Updated Login page
- Admin Register page
- Admin Management page (CRUD operations)

---

## 📋 Quick Start

### 1. Start the Backend
```bash
cd backend
npm start
```

The backend should start on `http://localhost:5000`

### 2. Start the Admin Frontend
```bash
cd admin-frontend
npm run dev
```

The frontend should start on `http://localhost:5173` (or similar)

---

## 🔑 Create Your First Admin

### Option 1: Using API (Postman/cURL)
```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "admin@yourcompany.com",
    "password": "admin123456",
    "phone": "1234567890"
  }'
```

### Option 2: Using Frontend
1. Navigate to the admin register page (if route is set up)
2. Fill in the form
3. Click "Register"

### Option 3: Using MongoDB Directly
```javascript
// In MongoDB shell or Compass
use your_database_name

db.admins.insertOne({
  name: "Super Admin",
  email: "admin@yourcompany.com",
  password: "$2a$10$...", // Use bcrypt to hash password first
  role: "admin",
  phone: "1234567890",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## 🔐 Login

### Using Frontend:
1. Go to `http://localhost:5173/login`
2. Enter email: `admin@yourcompany.com`
3. Enter password: `admin123456`
4. Click "Sign in"
5. You'll be redirected to the admin dashboard

### Using API:
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "admin123456"
  }'
```

Save the returned token for subsequent requests.

---

## 📚 Available Endpoints

### Public Endpoints (No Auth Required)
- `POST /api/admin/register` - Register new admin
- `POST /api/admin/login` - Login admin

### Protected Endpoints (Require Admin Auth)
- `GET /api/admin/all` - Get all admins
- `GET /api/admin/:id` - Get admin by ID
- `PUT /api/admin/:id` - Update admin
- `DELETE /api/admin/:id` - Delete admin
- `GET /api/admin/dashboard-stats` - Get dashboard statistics
- `POST /api/admin/notify` - Send notifications

---

## 🎯 Common Tasks

### View All Admins
```bash
# Get your token first from login
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:5000/api/admin/all \
  -H "Authorization: Bearer $TOKEN"
```

### Update Admin
```bash
curl -X PUT http://localhost:5000/api/admin/ADMIN_ID_HERE \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "phone": "9876543210"
  }'
```

### Delete Admin
```bash
curl -X DELETE http://localhost:5000/api/admin/ADMIN_ID_HERE \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔍 Verify Installation

### Check Backend
1. **Server Running:**
   ```bash
   curl http://localhost:5000
   ```
   Should return: "🚀 Terravale Backend API is running successfully!"

2. **Admin Routes Loaded:**
   Check server console for route registration

3. **MongoDB Connection:**
   Check server console for "✅ MongoDB Connected"

### Check Database
```javascript
// In MongoDB shell
use your_database_name

// Check if admins collection exists
show collections

// View admins
db.admins.find().pretty()
```

### Check Frontend
1. Open browser to `http://localhost:5173`
2. Open DevTools Console
3. Check for any errors
4. Navigate to Login page
5. Check Network tab for API calls

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: "Cannot find module 'Admin.js'"**
- Solution: Make sure `backend/models/Admin.js` exists
- Check import path in `auth.js` and `adminController.js`

**Problem: "JWT_SECRET is not defined"**
- Solution: Add `JWT_SECRET=your_secret_key` to `.env` file

**Problem: "MongoDB connection failed"**
- Solution: Check `MONGO_URI` in `.env` file
- Ensure MongoDB is running

**Problem: "Route not found"**
- Solution: Check `server.js` has `app.use("/api/admin", adminRoutes)`
- Verify import path is correct

### Frontend Issues

**Problem: "adminApi is not defined"**
- Solution: Check import path in Login.jsx
- Ensure `admin-frontend/src/api/adminApi.js` exists

**Problem: "Network Error"**
- Solution: Check backend is running
- Verify `VITE_API_URL` in `.env` points to correct backend URL
- Check CORS settings in backend

**Problem: "Token not stored"**
- Solution: Check browser localStorage
- Verify `adminLogin()` function saves token
- Check browser console for errors

### Authentication Issues

**Problem: "401 Unauthorized"**
- Solution: Ensure you're logged in
- Check token is in localStorage
- Verify token is sent in Authorization header
- Check token hasn't expired (24h default)

**Problem: "403 Forbidden"**
- Solution: Ensure user has admin role
- Check `authorizeRoles(["admin"])` middleware

---

## 📖 Documentation

- **Full Implementation Summary:** `ADMIN_SEPARATION_SUMMARY.md`
- **API Reference:** `ADMIN_API_REFERENCE.md`
- **Testing Checklist:** `ADMIN_TESTING_CHECKLIST.md`

---

## 🎨 Frontend Pages

### Login Page
**Path:** `/login`
**File:** `admin-frontend/src/pages/Login.jsx`
**Features:**
- Email/password login
- JWT token storage
- Redirect to dashboard on success

### Register Page
**Path:** `/admin/register` (or configure your own)
**File:** `admin-frontend/src/pages/Admin/AdminRegister.jsx`
**Features:**
- Full registration form
- Password confirmation
- Validation

### Admin Management
**Path:** Configure in your router
**File:** `admin-frontend/src/pages/Admin/AdminManagement.jsx`
**Features:**
- View all admins
- Inline editing
- Delete with confirmation
- Beautiful glassmorphism UI

---

## 🔒 Security Notes

1. **Passwords are hashed** using bcryptjs (10 salt rounds)
2. **JWT tokens expire** after 24 hours
3. **HTTP-only cookies** are set for additional security
4. **Validation middleware** prevents invalid data
5. **Role-based access** ensures only admins can manage admins

---

## 🚦 Next Steps

### Immediate:
1. ✅ Test admin registration
2. ✅ Test admin login
3. ✅ Test CRUD operations
4. ✅ Verify database entries

### Optional Enhancements:
1. Add admin profile page
2. Add password reset functionality
3. Add email verification
4. Add 2FA (Two-Factor Authentication)
5. Add admin activity logs
6. Add role hierarchy (super admin vs admin)
7. Add admin permissions system

### Production Preparation:
1. Change default passwords
2. Update JWT_SECRET to strong random string
3. Enable HTTPS
4. Set up proper CORS origins
5. Add rate limiting
6. Add request logging
7. Set up monitoring

---

## 📞 Support

If you encounter any issues:

1. **Check the logs:**
   - Backend console output
   - Browser console (DevTools)
   - MongoDB logs

2. **Verify files exist:**
   ```bash
   # Backend
   ls backend/models/Admin.js
   ls backend/controllers/adminController.js
   ls backend/routes/adminRoutes.js
   ls backend/middleware/adminValidation.js
   
   # Frontend
   ls admin-frontend/src/api/adminApi.js
   ls admin-frontend/src/pages/Admin/AdminRegister.jsx
   ls admin-frontend/src/pages/Admin/AdminManagement.jsx
   ```

3. **Check imports:**
   - Ensure all imports use correct paths
   - Check for typos in file names

4. **Test endpoints individually:**
   - Use Postman or cURL
   - Test one endpoint at a time
   - Verify responses

---

## ✅ Success Indicators

You'll know everything is working when:

- ✅ Backend starts without errors
- ✅ Admin routes are registered
- ✅ MongoDB connection is successful
- ✅ You can register a new admin
- ✅ You can login and receive a token
- ✅ Token is stored in localStorage
- ✅ You can access protected routes
- ✅ You can view/edit/delete admins
- ✅ Frontend pages load without errors
- ✅ API calls succeed

---

## 🎉 You're All Set!

Your Admin system is now completely separate from User and Labour, with:
- ✅ Dedicated model, controller, and routes
- ✅ Full CRUD operations
- ✅ JWT authentication
- ✅ Frontend integration
- ✅ Validation middleware
- ✅ Beautiful UI components

Happy coding! 🚀
