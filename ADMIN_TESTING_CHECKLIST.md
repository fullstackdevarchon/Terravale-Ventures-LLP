# Admin Implementation Testing Checklist

## Pre-Testing Setup

### 1. Environment Check
- [ ] MongoDB is running
- [ ] Backend server can connect to MongoDB
- [ ] `.env` file has `JWT_SECRET` configured
- [ ] `.env` file has `MONGO_URI` configured
- [ ] Frontend `.env` has `VITE_API_URL` configured

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Admin Frontend
cd admin-frontend
npm install
```

### 3. Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Admin Frontend
cd admin-frontend
npm run dev
```

---

## Backend Testing

### Authentication Endpoints

#### Test 1: Admin Registration
**Endpoint:** `POST /api/admin/register`

**Test Case 1.1: Successful Registration**
```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "admin@test.com",
    "password": "admin123",
    "phone": "1234567890"
  }'
```
- [ ] Returns 201 status
- [ ] Returns success: true
- [ ] Returns admin object with _id, name, email, role
- [ ] Password is NOT in response
- [ ] Admin is created in MongoDB

**Test Case 1.2: Duplicate Email**
```bash
# Run same request again
```
- [ ] Returns 400 status
- [ ] Returns error message "Email already exists"

**Test Case 1.3: Missing Required Fields**
```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com"
  }'
```
- [ ] Returns 400 status
- [ ] Returns validation error

**Test Case 1.4: Invalid Email Format**
```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "invalid-email",
    "password": "test123"
  }'
```
- [ ] Returns 400 status
- [ ] Returns "Invalid email format" error

**Test Case 1.5: Weak Password**
```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@test.com",
    "password": "123"
  }'
```
- [ ] Returns 400 status
- [ ] Returns "Password must be at least 6 characters" error

---

#### Test 2: Admin Login
**Endpoint:** `POST /api/admin/login`

**Test Case 2.1: Successful Login**
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```
- [ ] Returns 200 status
- [ ] Returns success: true
- [ ] Returns user object with id, name, email, role
- [ ] Returns JWT token
- [ ] Cookie is set (check cookies.txt)
- [ ] Password is NOT in response

**Test Case 2.2: Wrong Password**
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "wrongpassword"
  }'
```
- [ ] Returns 401 status
- [ ] Returns "Invalid credentials" error

**Test Case 2.3: Non-existent Email**
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "notexist@test.com",
    "password": "test123"
  }'
```
- [ ] Returns 404 status
- [ ] Returns "Admin not found" error

---

### Admin Management Endpoints

#### Test 3: Get All Admins
**Endpoint:** `GET /api/admin/all`

**Test Case 3.1: Successful Fetch (with token)**
```bash
# First login and save token
TOKEN=$(curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' \
  | jq -r '.token')

# Then fetch all admins
curl -X GET http://localhost:5000/api/admin/all \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] Returns 200 status
- [ ] Returns success: true
- [ ] Returns array of admins
- [ ] Passwords are NOT in response
- [ ] All admin fields are present

**Test Case 3.2: Unauthorized Access (no token)**
```bash
curl -X GET http://localhost:5000/api/admin/all
```
- [ ] Returns 401 status
- [ ] Returns "Please login to access this resource" error

---

#### Test 4: Get Admin By ID
**Endpoint:** `GET /api/admin/:id`

**Test Case 4.1: Successful Fetch**
```bash
# Get admin ID from previous test
ADMIN_ID="<insert_admin_id_here>"

curl -X GET http://localhost:5000/api/admin/$ADMIN_ID \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] Returns 200 status
- [ ] Returns success: true
- [ ] Returns admin object
- [ ] Password is NOT in response

**Test Case 4.2: Invalid ID Format**
```bash
curl -X GET http://localhost:5000/api/admin/invalid-id \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] Returns 400 status
- [ ] Returns "Invalid admin ID format" error

**Test Case 4.3: Non-existent ID**
```bash
curl -X GET http://localhost:5000/api/admin/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] Returns 404 status
- [ ] Returns "Admin not found" error

---

#### Test 5: Update Admin
**Endpoint:** `PUT /api/admin/:id`

**Test Case 5.1: Successful Update**
```bash
curl -X PUT http://localhost:5000/api/admin/$ADMIN_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Admin Name",
    "phone": "9876543210"
  }'
```
- [ ] Returns 200 status
- [ ] Returns success: true
- [ ] Returns updated admin object
- [ ] Changes are reflected in database

**Test Case 5.2: Update Email**
```bash
curl -X PUT http://localhost:5000/api/admin/$ADMIN_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@test.com"
  }'
```
- [ ] Returns 200 status
- [ ] Email is updated

**Test Case 5.3: Update Password**
```bash
curl -X PUT http://localhost:5000/api/admin/$ADMIN_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newpassword123"
  }'
```
- [ ] Returns 200 status
- [ ] Password is hashed in database
- [ ] Can login with new password

**Test Case 5.4: Invalid Email Format**
```bash
curl -X PUT http://localhost:5000/api/admin/$ADMIN_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email"
  }'
```
- [ ] Returns 400 status
- [ ] Returns validation error

---

#### Test 6: Delete Admin
**Endpoint:** `DELETE /api/admin/:id`

**Test Case 6.1: Successful Delete**
```bash
# Create a new admin first
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "To Delete",
    "email": "delete@test.com",
    "password": "delete123"
  }'

# Get the ID and delete
curl -X DELETE http://localhost:5000/api/admin/$DELETE_ADMIN_ID \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] Returns 200 status
- [ ] Returns success: true
- [ ] Returns "Admin deleted successfully" message
- [ ] Admin is removed from database

**Test Case 6.2: Delete Non-existent Admin**
```bash
curl -X DELETE http://localhost:5000/api/admin/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] Returns 200 status (or 404 if you add check in controller)

---

### Dashboard Endpoints

#### Test 7: Get Dashboard Stats
**Endpoint:** `GET /api/admin/dashboard-stats`

```bash
curl -X GET http://localhost:5000/api/admin/dashboard-stats \
  -H "Authorization: Bearer $TOKEN"
```
- [ ] Returns 200 status
- [ ] Returns success: true
- [ ] Returns stats object with all fields

---

#### Test 8: Send Notification
**Endpoint:** `POST /api/admin/notify`

```bash
curl -X POST http://localhost:5000/api/admin/notify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "labour",
    "title": "Test Notification",
    "message": "This is a test message"
  }'
```
- [ ] Returns 200 status
- [ ] Returns success: true
- [ ] Notification is logged in console

---

## Frontend Testing

### Admin Login Page

#### Test 9: Login UI
- [ ] Navigate to `http://localhost:5173/login` (or your port)
- [ ] Login form is displayed
- [ ] Email and password fields are present
- [ ] Submit button is present

#### Test 10: Login Functionality
**Test Case 10.1: Successful Login**
- [ ] Enter valid email and password
- [ ] Click "Sign in"
- [ ] Loading state is shown
- [ ] Success toast is displayed
- [ ] Redirected to `/admin-dashboard`
- [ ] Token is stored in localStorage
- [ ] User data is stored in localStorage

**Test Case 10.2: Invalid Credentials**
- [ ] Enter invalid email/password
- [ ] Click "Sign in"
- [ ] Error toast is displayed
- [ ] Stays on login page

**Test Case 10.3: Empty Fields**
- [ ] Leave fields empty
- [ ] Click "Sign in"
- [ ] Browser validation prevents submission

---

### Admin Register Page

#### Test 11: Register UI
- [ ] Navigate to `/admin/register` (if route is set up)
- [ ] Registration form is displayed
- [ ] All fields are present (name, email, phone, password, confirm password)
- [ ] Submit button is present

#### Test 12: Register Functionality
**Test Case 12.1: Successful Registration**
- [ ] Fill all fields correctly
- [ ] Passwords match
- [ ] Click "Register"
- [ ] Success toast is displayed
- [ ] Redirected to login page

**Test Case 12.2: Password Mismatch**
- [ ] Enter different passwords
- [ ] Click "Register"
- [ ] Error toast: "Passwords do not match"

**Test Case 12.3: Duplicate Email**
- [ ] Use existing email
- [ ] Click "Register"
- [ ] Error toast: "Email already exists"

---

### Admin Management Page

#### Test 13: Admin List UI
- [ ] Navigate to admin management page
- [ ] All admins are displayed in grid
- [ ] Each card shows: name, email, phone, role
- [ ] Edit and Delete buttons are present

#### Test 14: Edit Admin
**Test Case 14.1: Inline Edit**
- [ ] Click "Edit" button
- [ ] Form fields appear
- [ ] Current values are pre-filled
- [ ] Update name/email/phone
- [ ] Click "Save"
- [ ] Success toast is displayed
- [ ] Changes are reflected immediately

**Test Case 14.2: Cancel Edit**
- [ ] Click "Edit"
- [ ] Click "Cancel"
- [ ] Returns to view mode
- [ ] No changes are saved

#### Test 15: Delete Admin
- [ ] Click "Delete" button
- [ ] Confirmation dialog appears
- [ ] Click "OK"
- [ ] Success toast is displayed
- [ ] Admin is removed from list

---

### Admin Dashboard

#### Test 16: Dashboard Stats
- [ ] Navigate to `/admin-dashboard`
- [ ] All stat cards are displayed
- [ ] Stats show correct data
- [ ] Cards are clickable
- [ ] Hover effects work

---

## Integration Testing

### Test 17: Full User Flow
1. **Register New Admin**
   - [ ] Register via frontend
   - [ ] Verify in MongoDB

2. **Login**
   - [ ] Login with new admin
   - [ ] Token is set
   - [ ] Redirected to dashboard

3. **View Admins**
   - [ ] Navigate to admin management
   - [ ] See all admins including newly created

4. **Update Admin**
   - [ ] Edit admin details
   - [ ] Verify changes in database

5. **Logout & Login Again**
   - [ ] Logout (clear localStorage)
   - [ ] Login again
   - [ ] Session persists

6. **Delete Admin**
   - [ ] Delete an admin
   - [ ] Verify removal from database

---

## Database Verification

### Test 18: MongoDB Checks
```javascript
// In MongoDB shell or Compass
use your_database_name

// Check Admin collection exists
show collections

// View all admins
db.admins.find().pretty()

// Verify password is hashed
db.admins.findOne({ email: "admin@test.com" })
// Password should be a bcrypt hash, not plain text

// Check timestamps
db.admins.findOne()
// Should have createdAt and updatedAt fields
```

- [ ] Admin collection exists
- [ ] Passwords are hashed
- [ ] Timestamps are present
- [ ] All fields are correct

---

## Security Testing

### Test 19: Authorization Checks
**Test Case 19.1: Access Protected Route Without Token**
```bash
curl -X GET http://localhost:5000/api/admin/all
```
- [ ] Returns 401 Unauthorized

**Test Case 19.2: Access with Invalid Token**
```bash
curl -X GET http://localhost:5000/api/admin/all \
  -H "Authorization: Bearer invalid_token"
```
- [ ] Returns 401 Unauthorized

**Test Case 19.3: Access with Expired Token**
- [ ] Generate token
- [ ] Wait for expiration (or modify JWT_SECRET)
- [ ] Try to access protected route
- [ ] Returns 401 Unauthorized

---

## Performance Testing

### Test 20: Load Testing (Optional)
- [ ] Create 100+ admins
- [ ] Fetch all admins
- [ ] Response time is acceptable
- [ ] No memory leaks
- [ ] Database queries are optimized

---

## Cross-Browser Testing (Frontend)

### Test 21: Browser Compatibility
- [ ] Chrome - All features work
- [ ] Firefox - All features work
- [ ] Safari - All features work
- [ ] Edge - All features work

---

## Mobile Responsiveness

### Test 22: Mobile View
- [ ] Login page is responsive
- [ ] Register page is responsive
- [ ] Admin management page is responsive
- [ ] Dashboard is responsive
- [ ] All buttons are clickable on mobile

---

## Error Handling

### Test 23: Network Errors
- [ ] Stop backend server
- [ ] Try to login from frontend
- [ ] Error toast is displayed
- [ ] User-friendly error message

### Test 24: Server Errors
- [ ] Cause a server error (e.g., disconnect MongoDB)
- [ ] Try to fetch admins
- [ ] 500 error is handled gracefully
- [ ] Error message is displayed

---

## Final Checklist

- [ ] All backend tests pass
- [ ] All frontend tests pass
- [ ] No console errors
- [ ] No console warnings
- [ ] Code is properly formatted
- [ ] Comments are clear
- [ ] Documentation is complete
- [ ] Ready for production

---

## Notes

- Save test results in a separate document
- Report any bugs or issues
- Document any edge cases discovered
- Update tests as features are added

---

## Test Results Template

```
Test Date: ___________
Tester: ___________

Backend Tests: ___/24 passed
Frontend Tests: ___/22 passed
Integration Tests: ___/18 passed

Issues Found:
1. _____________________
2. _____________________
3. _____________________

Notes:
_____________________
_____________________
```
