# SmartBus Wallet System Backend

## 🚀 Features

- **Fingerprint Scanner Integration**: Connect to Precision Biometric fingerprint scanner
- **MongoDB Database**: Store user data and fingerprint templates
- **User Management**: Register, update, and manage users
- **Wallet Operations**: Recharge and deduct wallet balance
- **Fingerprint Verification**: Verify users via fingerprint matching
- **RESTful API**: Complete REST API for all operations

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Fingerprint scanner device (Precision Biometric)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**

Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb+srv://srianu247_db_user:srini123@cluster0.ya5qme0.mongodb.net/test?retryWrites=true&w=majority
PORT=3001
FINGERPRINT_SCANNER_URL=https://pbrdms.precisionbiometric.co.in/rdms_Service/service.svc
```

## 🚀 Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3001`

## 🧪 Testing

Run the test suite to verify all endpoints:

```bash
node test-api.js
```

This will test:
- Health check
- User registration
- User retrieval
- Wallet operations
- Fingerprint capture (requires scanner)
- Fingerprint verification (requires scanner)

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick Examples

**Register a user:**
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"1001","name":"John Doe","phone":"9876543210","balance":500}'
```

**Capture fingerprint:**
```bash
curl -X POST http://localhost:3001/api/fingerprint/capture \
  -H "Content-Type: application/json" \
  -d '{"userId":"1001"}'
```

**Verify fingerprint:**
```bash
curl -X POST http://localhost:3001/api/fingerprint/verify \
  -H "Content-Type: application/json" \
  -d '{"userId":"1001"}'
```

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── User.js              # User schema
│   └── Fingerprint.js       # Fingerprint schema
├── routes/
│   ├── users.js             # User routes
│   └── fingerprint.js       # Fingerprint routes
├── services/
│   └── fingerprintScanner.js # Scanner service
├── .env                      # Environment variables
├── .gitignore               # Git ignore file
├── server.js                # Main server file
├── package.json             # Dependencies
├── test-api.js              # API test suite
├── API_DOCUMENTATION.md     # API documentation
└── README.md                # This file
```

## 🔌 API Endpoints

### User Management
- `POST /api/users/register` - Register new user
- `GET /api/users/:userId` - Get user by ID
- `GET /api/users` - Get all users
- `PUT /api/users/:userId` - Update user
- `POST /api/users/:userId/recharge` - Recharge wallet
- `POST /api/users/:userId/deduct` - Deduct from wallet

### Fingerprint Management
- `POST /api/fingerprint/capture` - Capture fingerprint
- `POST /api/fingerprint/verify` - Verify fingerprint
- `GET /api/fingerprint/user/:userId` - Get user fingerprints
- `GET /api/fingerprint/device-info` - Get scanner info
- `DELETE /api/fingerprint/:fingerprintId` - Delete fingerprint

### System
- `GET /` - API info
- `GET /api/health` - Health check

## 🗄️ Database Schema

### User Collection
```javascript
{
  userId: String,
  name: String,
  phone: String,
  email: String,
  balance: Number,
  fingerprintRegistered: Boolean,
  fingerprintId: ObjectId,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Fingerprint Collection
```javascript
{
  userId: String,
  fingerprintData: String,
  fingerprintTemplate: String,
  quality: Number,
  captureTime: Date,
  deviceInfo: Object,
  status: String,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Notes

**For Production:**
1. Enable authentication/authorization
2. Use HTTPS
3. Implement rate limiting
4. Encrypt fingerprint data
5. Validate all inputs
6. Configure CORS properly
7. Use environment-specific configs
8. Enable MongoDB authentication
9. Implement audit logging
10. Regular security updates

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB URI is correct
- Check network connectivity
- Ensure IP is whitelisted in MongoDB Atlas

### Fingerprint Scanner Issues
- Verify scanner URL is accessible
- Check scanner device is connected
- Ensure scanner service is running
- Check network firewall settings

### Port Already in Use
```bash
# Change PORT in .env file or kill the process
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

## 📝 License

ISC

## 👥 Support

For issues and questions, please refer to the API documentation or contact the development team.

---

**Version:** 2.0.0  
**Last Updated:** January 2026
