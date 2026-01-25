# Fingerprint Scanner Integration API Documentation

## Overview
This backend system integrates fingerprint scanner functionality with MongoDB database for the SmartBus Wallet System.

## Base URL
```
http://localhost:3001
```

## Environment Variables
Create a `.env` file in the backend directory with:
```env
MONGODB_URI=mongodb+srv://srianu247_db_user:srini123@cluster0.ya5qme0.mongodb.net/test?retryWrites=true&w=majority
PORT=3001
FINGERPRINT_SCANNER_URL=https://pbrdms.precisionbiometric.co.in/rdms_Service/service.svc
```

## API Endpoints

### Health Check
**GET** `/api/health`

Check system health and connectivity.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-01-21T04:23:23.000Z",
  "database": "connected",
  "services": {
    "fingerprintScanner": "https://pbrdms.precisionbiometric.co.in/rdms_Service/service.svc"
  }
}
```

---

## User Management APIs

### 1. Register New User
**POST** `/api/users/register`

Register a new user in the system.

**Request Body:**
```json
{
  "userId": "1001",
  "name": "Rajesh Kumar",
  "phone": "9876543210",
  "email": "rajesh@example.com",
  "balance": 500
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "1001",
    "name": "Rajesh Kumar",
    "phone": "9876543210",
    "balance": 500
  }
}
```

### 2. Get User by ID
**GET** `/api/users/:userId`

Retrieve user information including fingerprint status.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "1001",
    "name": "Rajesh Kumar",
    "phone": "9876543210",
    "email": "rajesh@example.com",
    "balance": 500,
    "fingerprintRegistered": true,
    "fingerprintId": "65abc123...",
    "status": "active",
    "createdAt": "2026-01-21T04:23:23.000Z"
  }
}
```

### 3. Get All Users
**GET** `/api/users`

Retrieve all active users.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

### 4. Update User
**PUT** `/api/users/:userId`

Update user information.

**Request Body:**
```json
{
  "name": "Rajesh Kumar Updated",
  "email": "newemail@example.com"
}
```

### 5. Recharge Wallet
**POST** `/api/users/:userId/recharge`

Add money to user's wallet.

**Request Body:**
```json
{
  "amount": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet recharged successfully",
  "data": {
    "userId": "1001",
    "newBalance": 600,
    "amountAdded": 100
  }
}
```

### 6. Deduct from Wallet
**POST** `/api/users/:userId/deduct`

Deduct money from user's wallet.

**Request Body:**
```json
{
  "amount": 50
}
```

**Response:**
```json
{
  "success": true,
  "message": "Amount deducted successfully",
  "data": {
    "userId": "1001",
    "newBalance": 550,
    "amountDeducted": 50
  }
}
```

---

## Fingerprint Management APIs

### 1. Capture Fingerprint
**POST** `/api/fingerprint/capture`

Capture fingerprint from scanner and store in database.

**Request Body:**
```json
{
  "userId": "1001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fingerprint captured and stored successfully",
  "data": {
    "fingerprintId": "65abc123def456...",
    "quality": 85,
    "captureTime": "2026-01-21T04:23:23.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to capture fingerprint",
  "error": "Scanner not responding"
}
```

### 2. Verify Fingerprint
**POST** `/api/fingerprint/verify`

Verify captured fingerprint against stored fingerprint.

**Request Body:**
```json
{
  "userId": "1001"
}
```

**Response (Match):**
```json
{
  "success": true,
  "matched": true,
  "score": 92,
  "user": {
    "userId": "1001",
    "name": "Rajesh Kumar",
    "balance": 500
  }
}
```

**Response (No Match):**
```json
{
  "success": true,
  "matched": false,
  "score": 45,
  "user": {
    "userId": "1001",
    "name": "Rajesh Kumar",
    "balance": 500
  }
}
```

### 3. Get User Fingerprints
**GET** `/api/fingerprint/user/:userId`

Retrieve all fingerprints for a specific user.

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "65abc123...",
      "userId": "1001",
      "quality": 85,
      "captureTime": "2026-01-21T04:23:23.000Z",
      "status": "active",
      "deviceInfo": {
        "deviceId": "FP001",
        "deviceName": "Precision Biometric Scanner"
      }
    }
  ]
}
```

### 4. Get Device Info
**GET** `/api/fingerprint/device-info`

Get fingerprint scanner device information.

**Response:**
```json
{
  "success": true,
  "data": {
    "deviceId": "FP001",
    "deviceName": "Precision Biometric Scanner",
    "status": "Ready"
  }
}
```

### 5. Delete Fingerprint
**DELETE** `/api/fingerprint/:fingerprintId`

Delete (soft delete) a fingerprint record.

**Response:**
```json
{
  "success": true,
  "message": "Fingerprint deleted successfully"
}
```

---

## Database Models

### User Schema
```javascript
{
  userId: String (unique, required),
  name: String (required),
  phone: String (unique, required),
  email: String,
  balance: Number (default: 0),
  fingerprintRegistered: Boolean (default: false),
  fingerprintId: ObjectId (ref: 'Fingerprint'),
  status: String (enum: ['active', 'inactive', 'suspended']),
  createdAt: Date,
  updatedAt: Date
}
```

### Fingerprint Schema
```javascript
{
  userId: String (required, indexed),
  fingerprintData: String (required),
  fingerprintTemplate: String,
  quality: Number (default: 0),
  captureTime: Date (default: now),
  deviceInfo: Object,
  status: String (enum: ['active', 'inactive', 'deleted']),
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Usage Flow

### 1. User Registration & Fingerprint Enrollment
```
1. POST /api/users/register - Register new user
2. POST /api/fingerprint/capture - Capture and store fingerprint
3. User is now enrolled with fingerprint
```

### 2. Fingerprint Verification for Bus Boarding
```
1. POST /api/fingerprint/verify - Verify user's fingerprint
2. If matched, get user details and balance
3. POST /api/users/:userId/deduct - Deduct fare from wallet
```

### 3. Wallet Recharge
```
1. POST /api/users/:userId/recharge - Add money to wallet
2. GET /api/users/:userId - Check updated balance
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request (Invalid input) |
| 404  | Not Found (User/Fingerprint not found) |
| 500  | Internal Server Error |

---

## Testing

### Using cURL

**Register User:**
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"1001","name":"Rajesh Kumar","phone":"9876543210","balance":500}'
```

**Capture Fingerprint:**
```bash
curl -X POST http://localhost:3001/api/fingerprint/capture \
  -H "Content-Type: application/json" \
  -d '{"userId":"1001"}'
```

**Verify Fingerprint:**
```bash
curl -X POST http://localhost:3001/api/fingerprint/verify \
  -H "Content-Type: application/json" \
  -d '{"userId":"1001"}'
```

**Recharge Wallet:**
```bash
curl -X POST http://localhost:3001/api/users/1001/recharge \
  -H "Content-Type: application/json" \
  -d '{"amount":100}'
```

---

## Running the Server

```bash
# Install dependencies
npm install

# Start server
npm start

# Start with nodemon (development)
npm run dev
```

---

## Notes

1. **Fingerprint Data Size**: The API supports large fingerprint data (up to 50MB) due to bitmap images.

2. **Security**: In production, implement:
   - Authentication/Authorization
   - HTTPS
   - Rate limiting
   - Input validation
   - Encrypted fingerprint storage

3. **Scanner Integration**: The fingerprint scanner service URL must be accessible from the backend server.

4. **Database**: Ensure MongoDB connection string is correct and database is accessible.

5. **CORS**: Currently configured to allow all origins (`*`). Update for production.
