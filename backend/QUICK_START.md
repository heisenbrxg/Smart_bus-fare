# 🎯 Quick Start Guide - Fingerprint Scanner Integration

## ✅ System Status

**Backend Server**: ✅ Running on `http://localhost:3001`  
**MongoDB Database**: ✅ Connected to Atlas  
**Fingerprint Scanner**: ⚠️ Ready (requires physical device)  
**Test Interface**: ✅ Available

## 🚀 Getting Started in 3 Steps

### Step 1: Verify Server is Running
The server is already running! You should see:
```
==================================================
🚀 SmartBus Wallet System Backend
📡 Server running at http://localhost:3001
🔐 Fingerprint Scanner: https://pbrdms.precisionbiometric.co.in/rdms_Service/service.svc
💾 MongoDB: Connected
==================================================
```

### Step 2: Open Test Interface
Open this file in your browser:
```
c:\Users\Srinivasan\Downloads\wallet-system-pro\Wallet-pro\backend\test-interface.html
```

The interface will automatically check system health and show:
- ✅ System is healthy
- ✅ Database connected
- ✅ Fingerprint service configured

### Step 3: Test the System

#### A. Register a User
1. In the "User Registration" section
2. Fill in the details (default values provided)
3. Click "Register User"
4. You'll see: ✅ User registered successfully

#### B. Capture Fingerprint (Requires Scanner)
1. In the "Fingerprint Capture" section
2. Enter the User ID (e.g., 1001)
3. Click "Capture Fingerprint"
4. Place finger on scanner when prompted
5. You'll see: ✅ Fingerprint captured successfully

#### C. Verify Fingerprint (Requires Scanner)
1. In the "Fingerprint Verification" section
2. Enter the User ID
3. Click "Verify Fingerprint"
4. Place finger on scanner
5. You'll see: ✅ Fingerprint matched! (if same user)

#### D. Manage Wallet
1. In the "Wallet Operations" section
2. Enter User ID and amount
3. Click "Recharge Wallet" or "Deduct from Wallet"
4. Balance will be updated

## 📋 Complete Workflow Example

### Scenario: New User Enrollment

1. **Register User**
   ```
   POST http://localhost:3001/api/users/register
   {
     "userId": "1001",
     "name": "Rajesh Kumar",
     "phone": "9876543210",
     "balance": 500
   }
   ```

2. **Capture Fingerprint**
   ```
   POST http://localhost:3001/api/fingerprint/capture
   {
     "userId": "1001"
   }
   ```
   → User places finger on scanner
   → Fingerprint stored in database

3. **Verify User is Enrolled**
   ```
   GET http://localhost:3001/api/users/1001
   ```
   Response shows:
   ```json
   {
     "fingerprintRegistered": true,
     "balance": 500
   }
   ```

### Scenario: Bus Boarding with Fingerprint

1. **User boards bus and places finger on scanner**
   ```
   POST http://localhost:3001/api/fingerprint/verify
   {
     "userId": "1001"
   }
   ```
   Response:
   ```json
   {
     "matched": true,
     "score": 92,
     "user": {
       "userId": "1001",
       "name": "Rajesh Kumar",
       "balance": 500
     }
   }
   ```

2. **Deduct fare from wallet**
   ```
   POST http://localhost:3001/api/users/1001/deduct
   {
     "amount": 50
   }
   ```
   Response:
   ```json
   {
     "success": true,
     "newBalance": 450
   }
   ```

## 🧪 Testing Without Physical Scanner

You can test all user and wallet operations without a scanner:

### Test User Management
```bash
# Register user
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"TEST001","name":"Test User","phone":"9999999999","balance":1000}'

# Get user
curl http://localhost:3001/api/users/TEST001

# Recharge wallet
curl -X POST http://localhost:3001/api/users/TEST001/recharge \
  -H "Content-Type: application/json" \
  -d '{"amount":500}'
```

### Run Automated Tests
```bash
cd c:\Users\Srinivasan\Downloads\wallet-system-pro\Wallet-pro\backend
node test-api.js
```

This will test all endpoints and show which ones work without a scanner.

## 📁 Important Files

| File | Purpose |
|------|---------|
| `server.js` | Main server file |
| `.env` | Configuration (MongoDB, Scanner URL) |
| `test-interface.html` | Web-based test interface |
| `test-api.js` | Automated test script |
| `API_DOCUMENTATION.md` | Complete API reference |
| `README.md` | Setup and installation guide |
| `IMPLEMENTATION_SUMMARY.md` | What was built |

## 🔧 Configuration

### Environment Variables (.env)
```env
MONGODB_URI=mongodb+srv://srianu247_db_user:srini123@cluster0.ya5qme0.mongodb.net/test?retryWrites=true&w=majority
PORT=3001
FINGERPRINT_SCANNER_URL=https://pbrdms.precisionbiometric.co.in/rdms_Service/service.svc
```

### Change Port
Edit `.env` and change `PORT=3001` to your desired port.

### Change Database
Edit `.env` and update `MONGODB_URI` with your MongoDB connection string.

## 🎯 API Endpoints Quick Reference

### User Endpoints
- `POST /api/users/register` - Register user
- `GET /api/users/:userId` - Get user
- `GET /api/users` - Get all users
- `POST /api/users/:userId/recharge` - Add money
- `POST /api/users/:userId/deduct` - Deduct money

### Fingerprint Endpoints
- `POST /api/fingerprint/capture` - Capture fingerprint
- `POST /api/fingerprint/verify` - Verify fingerprint
- `GET /api/fingerprint/user/:userId` - Get fingerprints
- `GET /api/fingerprint/device-info` - Scanner info

### System Endpoints
- `GET /` - API info
- `GET /api/health` - Health check

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port is in use
netstat -ano | findstr :3001

# Kill the process if needed
taskkill /PID <PID> /F

# Restart server
npm start
```

### Can't connect to MongoDB
- Check internet connection
- Verify MongoDB URI in `.env`
- Check if IP is whitelisted in MongoDB Atlas

### Fingerprint scanner not working
- Verify scanner is connected
- Check scanner URL is accessible
- Ensure scanner service is running
- Test with: `GET /api/fingerprint/device-info`

### CORS errors in browser
- Server already has CORS enabled
- If issues persist, check browser console
- Verify API URL is correct

## 📊 Database Collections

### users
Stores user information and wallet balance
```javascript
{
  userId: "1001",
  name: "Rajesh Kumar",
  phone: "9876543210",
  balance: 500,
  fingerprintRegistered: true
}
```

### fingerprints
Stores fingerprint templates
```javascript
{
  userId: "1001",
  fingerprintTemplate: "ISO_template_data",
  quality: 85,
  captureTime: "2026-01-21T04:23:23.000Z"
}
```

## 🎓 Next Steps

1. **Test with Physical Scanner**
   - Connect fingerprint scanner device
   - Test capture and verify endpoints
   - Adjust quality thresholds if needed

2. **Integrate with Frontend**
   - Use the API endpoints in your frontend
   - Implement user authentication
   - Add transaction history

3. **Production Deployment**
   - Add authentication (JWT)
   - Enable HTTPS
   - Configure CORS for specific origins
   - Add rate limiting
   - Implement logging

4. **Enhance Security**
   - Encrypt fingerprint data
   - Add API key authentication
   - Implement audit trails
   - Add input validation

## 💡 Tips

- Use the test interface for quick testing
- Check `/api/health` to verify system status
- All fingerprint operations require a physical scanner
- User and wallet operations work without scanner
- Check server console for detailed logs
- Use MongoDB Compass to view database

## 📞 Support Resources

- **API Documentation**: `API_DOCUMENTATION.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Setup Guide**: `README.md`
- **Test Interface**: `test-interface.html`
- **Test Script**: `test-api.js`

## ✨ Features Available

✅ User registration and management  
✅ Wallet recharge and deduction  
✅ Fingerprint capture from scanner  
✅ Fingerprint verification  
✅ MongoDB data persistence  
✅ RESTful API  
✅ CORS enabled  
✅ Error handling  
✅ Request logging  
✅ Health monitoring  
✅ Device information  
✅ Test interface  
✅ Automated tests  
✅ Complete documentation  

---

**Ready to use!** 🎉

Open `test-interface.html` and start testing the system.
