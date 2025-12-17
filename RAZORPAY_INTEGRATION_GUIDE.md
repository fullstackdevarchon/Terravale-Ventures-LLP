# Razorpay Payment Integration Guide

## 🎯 Overview

Complete Razorpay payment gateway integration for your e-commerce platform. Users can now choose between **Cash on Delivery (COD)** or **Online Payment** via Razorpay.

---

## 📋 What Was Implemented

### **Backend Changes:**

1. **Payment Controller** (`backend/controllers/paymentController.js`)
   - `createRazorpayOrder()` - Creates Razorpay order
   - `verifyRazorpayPayment()` - Verifies payment signature
   - `getPaymentDetails()` - Fetches payment information

2. **Payment Routes** (`backend/routes/paymentRoutes.js`)
   - `POST /api/payment/create-order` - Create Razorpay order
   - `POST /api/payment/verify` - Verify payment
   - `GET /api/payment/:paymentId` - Get payment details

3. **Order Model Update** (`backend/models/Order.js`)
   - Added `paymentDetails` field to store Razorpay transaction info
   - Added `productName` and `productCategory` snapshots

4. **Order Controller Update** (`backend/controllers/orderController.js`)
   - Updated COD orders to store product snapshots

5. **Server Configuration** (`backend/server.js`)
   - Registered payment routes

6. **Environment Variables** (`backend/.env`)
   - Added Razorpay credentials

### **Frontend Changes:**

1. **Checkout Component** (`frontend/src/pages/BUYER/Checkout.jsx`)
   - Payment method selection (COD/Online)
   - Razorpay SDK integration
   - Payment handling and verification
   - Beautiful UI with payment icons

---

## 🔧 Setup Instructions

### **Step 1: Get Razorpay Credentials**

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in
3. Navigate to **Settings** → **API Keys**
4. Generate **Test Mode** keys (for development)
5. Copy your `Key ID` and `Key Secret`

### **Step 2: Update Backend .env**

Open `backend/.env` and replace the placeholders:

```bash
# 🔹 Razorpay Config
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
```

**Example:**
```bash
RAZORPAY_KEY_ID=rzp_test_1234567890abcdef
RAZORPAY_KEY_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

### **Step 3: Restart Backend Server**

```bash
cd backend
npm start
```

The server will now load Razorpay credentials.

---

## 🚀 How It Works

### **Payment Flow:**

```
1. User adds items to cart
   ↓
2. Goes to checkout page
   ↓
3. Fills billing address
   ↓
4. Selects payment method (COD or Online)
   ↓
5a. If COD:
    → Order created directly in database
    → Payment method: "Cash on Delivery"
   
5b. If Online Payment:
    → Frontend calls /api/payment/create-order
    → Backend creates Razorpay order
    → Razorpay checkout modal opens
    → User enters card/UPI/netbanking details
    → Payment processed by Razorpay
    → Frontend receives payment response
    → Frontend calls /api/payment/verify
    → Backend verifies signature
    → Order created in database
    → Payment method: "Online Payment"
   ↓
6. Cart cleared
   ↓
7. User redirected to orders page
```

---

## 💳 Payment Methods Supported

Razorpay supports:
- ✅ Credit/Debit Cards (Visa, Mastercard, RuPay, Amex)
- ✅ UPI (Google Pay, PhonePe, Paytm, etc.)
- ✅ Net Banking (All major banks)
- ✅ Wallets (Paytm, PhonePe, Mobikwik, etc.)
- ✅ EMI
- ✅ Cardless EMI

---

## 🎨 UI Features

### **Payment Method Selection:**

Two beautiful buttons:
1. **Cash on Delivery** 💵
   - Green button with money icon
   - Traditional COD flow

2. **Online Payment** 💳
   - Blue button with credit card icon
   - Opens Razorpay checkout

### **Visual Feedback:**

- Active payment method highlighted
- Loading states during processing
- Success animation with confetti
- Truck animation on order success

---

## 🔒 Security Features

### **1. Signature Verification**

Every payment is verified using HMAC SHA256:

```javascript
const body = razorpay_order_id + "|" + razorpay_payment_id;
const expectedSignature = crypto
  .createHmac("sha256", RAZORPAY_KEY_SECRET)
  .update(body.toString())
  .digest("hex");

const isAuthentic = expectedSignature === razorpay_signature;
```

### **2. Authentication Required**

All payment endpoints require JWT authentication:
```javascript
router.post("/create-order", isAuthenticated, createRazorpayOrder);
```

### **3. Amount Validation**

Backend validates amount before creating order:
```javascript
if (!amount || amount <= 0) {
  return res.status(400).json({ message: "Invalid amount" });
}
```

### **4. Product Validation**

Checks product availability and stock before payment:
```javascript
if (product.quantity < item.qty) {
  return res.status(400).json({ message: `${product.name} is out of stock` });
}
```

---

## 📊 Database Schema

### **Order Model - Payment Details:**

```javascript
paymentDetails: {
  razorpay_order_id: String,    // Razorpay order ID
  razorpay_payment_id: String,  // Razorpay payment ID
  razorpay_signature: String,   // Payment signature
}
```

### **Order Model - Product Snapshots:**

```javascript
products: [{
  product: ObjectId,              // Product reference
  productName: String,            // Product name snapshot
  productCategory: String,        // Category snapshot
  qty: Number,                    // Quantity
  price: Number,                  // Price at time of order
}]
```

---

## 🧪 Testing

### **Test Mode:**

Razorpay provides test cards for development:

**Test Card Details:**
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
Name: Any name
```

**Test UPI:**
```
UPI ID: success@razorpay
```

**Test Net Banking:**
- Select any bank
- Use credentials: `test` / `test`

### **Test Scenarios:**

1. **Successful Payment:**
   - Use test card above
   - Payment should succeed
   - Order should be created

2. **Failed Payment:**
   - Card: `4000 0000 0000 0002`
   - Payment should fail
   - Order should NOT be created

3. **COD Order:**
   - Select "Cash on Delivery"
   - Order should be created immediately

---

## 📝 API Endpoints

### **1. Create Razorpay Order**

**POST** `/api/payment/create-order`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Request Body:**
```json
{
  "amount": 1000,
  "currency": "INR",
  "receipt": "receipt_123"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_xyz123",
    "amount": 100000,
    "currency": "INR",
    "receipt": "receipt_123"
  },
  "key_id": "rzp_test_..."
}
```

---

### **2. Verify Payment**

**POST** `/api/payment/verify`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Request Body:**
```json
{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash",
  "orderData": {
    "products": [...],
    "address": {...}
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and order placed successfully",
  "order": {...}
}
```

---

### **3. Get Payment Details**

**GET** `/api/payment/:paymentId`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "pay_abc456",
    "amount": 100000,
    "currency": "INR",
    "status": "captured",
    "method": "card"
  }
}
```

---

## 🐛 Troubleshooting

### **Issue 1: "Razorpay SDK failed to load"**

**Solution:**
- Check internet connection
- Ensure `https://checkout.razorpay.com/v1/checkout.js` is accessible
- Check browser console for errors

---

### **Issue 2: "Payment verification failed"**

**Solution:**
- Verify `RAZORPAY_KEY_SECRET` in `.env` is correct
- Check backend logs for signature mismatch
- Ensure no spaces in environment variables

---

### **Issue 3: "Invalid key_id"**

**Solution:**
- Verify `RAZORPAY_KEY_ID` in `.env` is correct
- Ensure you're using Test Mode keys for development
- Check Razorpay dashboard for active keys

---

### **Issue 4: Order created but payment not recorded**

**Solution:**
- Check `paymentDetails` field in Order model
- Verify payment verification endpoint is called
- Check backend logs for errors

---

## 🎯 Production Checklist

Before going live:

- [ ] Replace Test Mode keys with Live Mode keys
- [ ] Update `RAZORPAY_KEY_ID` in `.env`
- [ ] Update `RAZORPAY_KEY_SECRET` in `.env`
- [ ] Test with real payment methods
- [ ] Enable webhook for payment notifications
- [ ] Set up refund policy
- [ ] Configure payment failure handling
- [ ] Add payment receipt emails
- [ ] Set up payment analytics

---

## 📧 Webhooks (Optional)

To receive payment notifications:

1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payment/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Create webhook handler in backend

---

## 💡 Best Practices

1. **Always verify payment on backend** - Never trust frontend
2. **Store payment details** - For refunds and disputes
3. **Handle failures gracefully** - Show clear error messages
4. **Test thoroughly** - Use all test scenarios
5. **Monitor transactions** - Check Razorpay dashboard regularly
6. **Keep keys secure** - Never commit to Git
7. **Use HTTPS** - Required for production
8. **Implement retry logic** - For network failures

---

## 📚 Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Razorpay Webhooks](https://razorpay.com/docs/webhooks/)

---

## ✅ Summary

Your e-commerce platform now supports:
- ✅ Cash on Delivery (COD)
- ✅ Online Payment via Razorpay
- ✅ Multiple payment methods (Cards, UPI, Net Banking, Wallets)
- ✅ Secure payment verification
- ✅ Order tracking with payment details
- ✅ Beautiful payment UI
- ✅ Product snapshot storage for analytics

**Ready to accept payments!** 🎉
