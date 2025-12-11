# Admin API Endpoints Reference

## Base URL
```
http://localhost:5000/api/admin
```

---

## Authentication Endpoints

### 1. Admin Register
**POST** `/api/admin/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "admin@example.com",
  "password": "securePassword123",
  "phone": "1234567890"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "admin": {
    "_id": "64abc123...",
    "name": "John Doe",
    "email": "admin@example.com",
    "role": "admin",
    "phone": "1234567890"
  }
}
```

---

### 2. Admin Login
**POST** `/api/admin/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "64abc123...",
    "name": "John Doe",
    "email": "admin@example.com",
    "role": "admin",
    "phone": "1234567890"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:** Token is also set as HTTP-only cookie

---

## Admin Management Endpoints
**All endpoints require authentication and admin role**

### 3. Get All Admins
**GET** `/api/admin/all`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true,
  "admins": [
    {
      "_id": "64abc123...",
      "name": "John Doe",
      "email": "admin@example.com",
      "role": "admin",
      "phone": "1234567890",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 4. Get Admin By ID
**GET** `/api/admin/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true,
  "admin": {
    "_id": "64abc123...",
    "name": "John Doe",
    "email": "admin@example.com",
    "role": "admin",
    "phone": "1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. Update Admin
**PUT** `/api/admin/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "9876543210",
  "password": "newPassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Admin updated successfully",
  "admin": {
    "_id": "64abc123...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "admin",
    "phone": "9876543210"
  }
}
```

---

### 6. Delete Admin
**DELETE** `/api/admin/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Admin deleted successfully"
}
```

---

## Dashboard & Utility Endpoints

### 7. Get Dashboard Stats
**GET** `/api/admin/dashboard-stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true,
  "stats": {
    "totalProducts": 150,
    "pendingSellers": 8,
    "totalRevenue": 45000,
    "inventoryItems": 180,
    "totalOrders": 45,
    "activeUsers": 250
  }
}
```

---

### 8. Send Notification
**POST** `/api/admin/notify`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role": "labour",
  "title": "New Order Available",
  "message": "A new order has been assigned to you"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Notification sent to labour"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Email and password required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Please login to access this resource"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden. Only admin allowed."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Admin not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server Error",
  "error": "Error details..."
}
```

---

## Frontend Usage Examples

### Using adminApi.js

```javascript
import { 
  adminLogin, 
  adminRegister, 
  getAllAdmins, 
  updateAdmin, 
  deleteAdmin 
} from '../api/adminApi';

// Login
const handleLogin = async () => {
  try {
    const data = await adminLogin('admin@example.com', 'password123');
    console.log('Logged in:', data.user);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};

// Register
const handleRegister = async () => {
  try {
    const data = await adminRegister(
      'John Doe',
      'john@example.com',
      'password123',
      '1234567890'
    );
    console.log('Registered:', data.admin);
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
};

// Get all admins
const fetchAdmins = async () => {
  try {
    const data = await getAllAdmins();
    console.log('Admins:', data.admins);
  } catch (error) {
    console.error('Failed to fetch:', error.message);
  }
};

// Update admin
const handleUpdate = async (id) => {
  try {
    const data = await updateAdmin(id, {
      name: 'Updated Name',
      phone: '9999999999'
    });
    console.log('Updated:', data.admin);
  } catch (error) {
    console.error('Update failed:', error.message);
  }
};

// Delete admin
const handleDelete = async (id) => {
  try {
    const data = await deleteAdmin(id);
    console.log('Deleted:', data.message);
  } catch (error) {
    console.error('Delete failed:', error.message);
  }
};
```

---

## Testing with Postman/cURL

### Register Admin
```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "test@admin.com",
    "password": "test123",
    "phone": "1234567890"
  }'
```

### Login Admin
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@admin.com",
    "password": "test123"
  }'
```

### Get All Admins (with token)
```bash
curl -X GET http://localhost:5000/api/admin/all \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Admin
```bash
curl -X PUT http://localhost:5000/api/admin/64abc123... \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "phone": "9999999999"
  }'
```

### Delete Admin
```bash
curl -X DELETE http://localhost:5000/api/admin/64abc123... \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Notes

- All protected endpoints require a valid JWT token
- Token can be sent via:
  - `Authorization: Bearer <token>` header
  - HTTP-only cookie (automatically set on login)
- Passwords are automatically hashed before storage
- Email must be unique across all admins
- Role is always set to "admin" (cannot be changed)
