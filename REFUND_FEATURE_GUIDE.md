# Razorpay Automatic Refund Feature

## 🎯 Overview

Automatic refund processing for online payments when orders are cancelled. COD (Cash on Delivery) orders are cancelled without refund processing.

---

## ✅ How It Works

### **Order Cancellation Flow:**

```
User Cancels Order
    ↓
Check Payment Method
    ↓
┌─────────────────────────────────────┐
│  COD Order              Online Payment│
│  ↓                      ↓            │
│  Cancel Order           Process Refund│
│  Restore Stock          ↓            │
│  ✅ Done                Cancel Order  │
│                         Restore Stock │
│                         ✅ Done       │
└─────────────────────────────────────┘
```

---

## 💰 Refund Processing

### **For Online Payments:**

When a user cancels an order paid via Razorpay:

1. **Automatic Refund Initiated**
   - Full order amount is refunded
   - Refund processed through Razorpay
   - Refund ID generated and stored

2. **Refund Timeline**
   - **Instant Refunds:** 5-7 business days (for most banks)
   - **Normal Refunds:** 5-7 business days
   - Depends on customer's bank

3. **Refund Details Stored**
   - Refund ID
   - Amount refunded
   - Refund status
   - Timestamp

### **For COD Orders:**

- No refund processing (no payment was made)
- Order simply cancelled
- Stock restored

---

## 🔧 Technical Implementation

### **1. Order Model Update**

Added `refundDetails` field to store refund information:

```javascript
refundDetails: {
  refund_id: String,        // Razorpay refund ID
  amount: Number,           // Amount refunded (in ₹)
  status: String,           // Refund status
  created_at: Number,       // Unix timestamp
  error: Boolean,           // If refund failed
  message: String,          // Error message
  error_details: String,    // Detailed error
}
```

### **2. Cancel Order Logic**

Updated `cancelOrder` function in `orderController.js`:

```javascript
// Check if online payment
if (order.paymentMethod === "Online Payment" && 
    order.paymentDetails?.razorpay_payment_id) {
  
  // Initialize Razorpay
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  // Create refund
  const refund = await razorpay.payments.refund(
    order.paymentDetails.razorpay_payment_id,
    {
      amount: Math.round(order.total * 100), // In paise
      speed: "normal",
      notes: {
        order_id: order._id.toString(),
        reason: "Order cancelled by customer",
      },
    }
  );

  // Store refund details
  order.refundDetails = {
    refund_id: refund.id,
    amount: refund.amount / 100,
    status: refund.status,
    created_at: refund.created_at,
  };
}
```

---

## 📊 Refund Statuses

### **Razorpay Refund Statuses:**

1. **`pending`** - Refund is being processed
2. **`processed`** - Refund has been processed by Razorpay
3. **`failed`** - Refund failed (rare)

### **Timeline:**

- **Initiated:** Immediately when order is cancelled
- **Processed:** Within minutes by Razorpay
- **Credited:** 5-7 business days to customer's account

---

## 🎨 User Experience

### **Success Messages:**

**For Online Payment:**
```
✅ Order cancelled successfully. Refund initiated.
Amount: ₹XXX will be refunded to your original payment method.
Refund ID: rfnd_XXXXXXXXXXXXX
Expected in: 5-7 business days
```

**For COD:**
```
✅ Order cancelled successfully
```

### **Error Handling:**

If automatic refund fails:
```
⚠️ Order cancelled. Refund will be processed manually.
Please contact support with Order ID: #XXXXX
```

---

## 🔍 Checking Refund Status

### **For Users:**

1. Go to "My Orders"
2. Click on cancelled order
3. View refund details:
   - Refund ID
   - Amount
   - Status
   - Expected credit date

### **For Admins:**

1. Login to Razorpay Dashboard
2. Go to **Transactions** → **Refunds**
3. Search by Refund ID or Order ID
4. View complete refund details

---

## 🛡️ Security & Validation

### **Checks Before Refund:**

1. ✅ Order exists
2. ✅ User owns the order
3. ✅ Order is not delivered
4. ✅ Order is not already cancelled
5. ✅ Payment method is "Online Payment"
6. ✅ Payment ID exists

### **Graceful Error Handling:**

- If refund fails, order is still cancelled
- Error details are stored in database
- Admin can process manual refund
- User is notified about manual processing

---

## 📝 API Response

### **Successful Cancellation (Online Payment):**

```json
{
  "success": true,
  "message": "Order cancelled successfully. Refund initiated.",
  "order": {
    "_id": "...",
    "status": "Cancelled",
    "paymentMethod": "Online Payment",
    "total": 100,
    "refundDetails": {
      "refund_id": "rfnd_XXXXXXXXXXXXX",
      "amount": 100,
      "status": "processed",
      "created_at": 1702345678
    }
  },
  "refund": {
    "refund_id": "rfnd_XXXXXXXXXXXXX",
    "amount": 100,
    "status": "processed",
    "created_at": 1702345678
  }
}
```

### **Successful Cancellation (COD):**

```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    "_id": "...",
    "status": "Cancelled",
    "paymentMethod": "Cash on Delivery",
    "total": 100
  },
  "refund": null
}
```

### **Refund Failed (Manual Processing Required):**

```json
{
  "success": true,
  "message": "Order cancelled. Refund will be processed manually.",
  "order": {
    "_id": "...",
    "status": "Cancelled",
    "refundDetails": {
      "error": true,
      "message": "Automatic refund failed. Manual refund required.",
      "error_details": "Payment already refunded"
    }
  },
  "refund": {
    "error": true,
    "message": "Automatic refund failed. Manual refund required."
  }
}
```

---

## 🧪 Testing

### **Test Refund Flow:**

1. **Create Test Order:**
   - Use test card: `4111 1111 1111 1111`
   - Complete payment
   - Order created with payment details

2. **Cancel Order:**
   - Go to "My Orders"
   - Click "Cancel Order"
   - Confirm cancellation

3. **Verify Refund:**
   - Check response for refund details
   - Login to Razorpay Dashboard
   - Verify refund in "Refunds" section

### **Test Cases:**

1. ✅ **Cancel COD order** - No refund processed
2. ✅ **Cancel online payment order** - Refund initiated
3. ✅ **Cancel delivered order** - Should fail
4. ✅ **Cancel already cancelled order** - Should fail
5. ✅ **Cancel with invalid payment ID** - Graceful error

---

## 💡 Best Practices

### **For Developers:**

1. **Always check payment method** before processing refund
2. **Store refund details** in database for tracking
3. **Handle errors gracefully** - don't fail cancellation if refund fails
4. **Log refund attempts** for debugging
5. **Notify users** about refund status

### **For Admins:**

1. **Monitor refunds** in Razorpay Dashboard
2. **Process manual refunds** if automatic fails
3. **Check refund status** regularly
4. **Contact Razorpay support** for failed refunds

---

## 🔔 Notifications (Future Enhancement)

### **Recommended Notifications:**

1. **Order Cancelled:**
   - Email to user
   - SMS notification
   - In-app notification

2. **Refund Initiated:**
   - Email with refund details
   - Expected credit date
   - Refund ID for tracking

3. **Refund Processed:**
   - Email confirmation
   - Amount credited
   - Transaction ID

---

## 📊 Refund Analytics

### **Track in Admin Dashboard:**

1. **Total Refunds:**
   - Count of refunds
   - Total amount refunded
   - Success rate

2. **Refund Reasons:**
   - Customer cancellation
   - Out of stock
   - Delivery issues

3. **Refund Timeline:**
   - Average processing time
   - Pending refunds
   - Failed refunds

---

## 🚨 Troubleshooting

### **Issue 1: Refund Not Initiated**

**Possible Causes:**
- Payment ID missing
- Invalid Razorpay credentials
- Network error

**Solution:**
- Check `order.paymentDetails.razorpay_payment_id`
- Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- Check backend logs

---

### **Issue 2: Refund Failed**

**Possible Causes:**
- Payment already refunded
- Insufficient balance
- Payment not captured

**Solution:**
- Check Razorpay Dashboard
- Process manual refund
- Contact Razorpay support

---

### **Issue 3: Refund Status Not Updated**

**Possible Causes:**
- Webhook not configured
- Database not updated

**Solution:**
- Check `order.refundDetails` in database
- Manually update status if needed
- Set up Razorpay webhooks

---

## 📚 Additional Resources

- [Razorpay Refunds API](https://razorpay.com/docs/api/refunds/)
- [Refund Speed](https://razorpay.com/docs/payments/refunds/speed/)
- [Refund Status](https://razorpay.com/docs/api/refunds/#refund-status)
- [Webhooks](https://razorpay.com/docs/webhooks/)

---

## ✅ Summary

### **What Was Implemented:**

1. ✅ Automatic refund for online payments
2. ✅ No refund for COD orders
3. ✅ Refund details stored in database
4. ✅ Graceful error handling
5. ✅ User-friendly messages
6. ✅ Full refund amount
7. ✅ Stock restoration on cancellation

### **Key Features:**

- **Automatic:** No manual intervention needed
- **Secure:** Uses Razorpay's secure API
- **Tracked:** All refunds logged in database
- **User-Friendly:** Clear status messages
- **Reliable:** Graceful error handling

---

**Your refund system is now live!** 🎉

Users can cancel orders and receive automatic refunds for online payments!
