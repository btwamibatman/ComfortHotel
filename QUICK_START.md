# вљЎ QUICK START COMMANDS

## рџљЂ First Time Setup

```bash
# 1. Install all dependencies
npm install

# 2. Create admin users with hashed passwords
node init-users.js

# 3. Seed database with 25 realistic bookings
node seed-bookings.js

# 4. Start the server
npm start
```

**вњ… Done! Server running at http://localhost:3000**

---

## рџ”ђ Access Points

```
Public Website:
http://localhost:3000

Admin Login:
http://localhost:3000/admin

Admin Dashboard:
http://localhost:3000/admin/dashboard

API Info:
http://localhost:3000/api/info
```

---

## рџ‘¤ Default Credentials

```
Admin Account:
Username: admin
Password: REDACTED_ADMIN_PASSWORD

Manager Account:
Username: manager
Password: REDACTED_MANAGER_PASSWORD
```

---

## рџ“Љ Verify Installation

### Check Users
```bash
# Open MongoDB Compass or mongo shell
use assignment3
db.users.find().pretty()

# Should see 2 users with hashed passwords
```

### Check Bookings
```bash
db.bookings.count()
# Should return: 25

db.bookings.find().limit(3).pretty()
# Should see realistic booking data
```

### Check Server
```bash
# Open browser
http://localhost:3000/api/info

# Should see:
{
  "project": "Comfort Hoetel - Assignment 4",
  "description": "Hotel Booking System with Session-based Authentication",
  "features": [...]
}
```

---

## рџ§Є Test Authentication

### Test 1: Login
```bash
# 1. Open: http://localhost:3000/admin
# 2. Enter: admin / REDACTED_ADMIN_PASSWORD
# 3. Click: Sign In
# 4. Should redirect to dashboard
```

### Test 2: Session Persistence
```bash
# 1. Login to dashboard
# 2. Refresh page (F5)
# 3. Should still be logged in
# 4. User name should be displayed
```

### Test 3: Protection
```bash
# 1. Logout from dashboard
# 2. Try to access: http://localhost:3000/admin/dashboard
# 3. Should redirect to login
# 4. Login again to access
```

---

## рџЋЇ Test CRUD Operations

### CREATE
```bash
# 1. Login to dashboard
# 2. Click "Create New Booking"
# 3. Fill all fields
# 4. Click Save
# 5. Booking appears in table
```

### READ
```bash
# 1. See all 25+ bookings in table
# 2. Use search box: "John"
# 3. Use status filter: "Confirmed"
# 4. Click View icon on any booking
```

### UPDATE
```bash
# 1. Click Edit icon (pencil)
# 2. Change guest name
# 3. Change status
# 4. Click Save
# 5. Changes reflected in table
```

### DELETE
```bash
# 1. Click Delete icon (trash)
# 2. Confirm deletion
# 3. Booking removed from table
# 4. Count decreases
```

---

## рџ”Ќ Check Cookie Security

### Using Browser DevTools
```bash
# 1. Login to dashboard
# 2. Open DevTools (F12)
# 3. Go to: Application в†’ Cookies в†’ http://localhost:3000
# 4. Find: sessionId cookie
# 5. Verify flags:
#    - HttpOnly: вњ“
#    - Secure: вњ“ (in production)
#    - SameSite: Strict
```

### Try to Access Cookie
```bash
# 1. Open Console in DevTools
# 2. Type: document.cookie
# 3. Press Enter
# 4. Should be empty or not show sessionId (HttpOnly protection)
```

---

## рџ—„пёЏ Check Database

### MongoDB Compass
```
Connection String:
mongodb://localhost:27017

Database: assignment3

Collections:
вњ“ users (2 records)
вњ“ bookings (25+ records)
вњ“ sessions (dynamic)
```

### Verify Bcrypt Hashing
```bash
# 1. Open users collection
# 2. Look at password field
# 3. Should see: $2b$10$N9qo8uLO...
# 4. NOT plain text: REDACTED_ADMIN_PASSWORD
```

---

## рџ›‘ Stop Server

```bash
# In terminal where server is running:
Ctrl + C

# Or find process and kill:
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

---

## рџ”„ Reset Database

### Clear All Data
```bash
# MongoDB shell or Compass:
use assignment3
db.users.deleteMany({})
db.bookings.deleteMany({})
db.sessions.deleteMany({})
```

### Reinitialize
```bash
node init-users.js
node seed-bookings.js
npm start
```

---

## рџ“± Mobile Testing

```bash
# 1. Find your local IP:
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)

# 2. Update .env:
MONGO_URI=mongodb://192.168.1.100:27017

# 3. Access from phone:
http://192.168.1.100:3000

# Note: Phone and PC must be on same network
```

---

## рџђ› Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use:
netstat -ano | findstr :3000

# Kill process:
taskkill /PID <process_id> /F

# Or use different port in .env:
PORT=3001
```

### MongoDB connection error
```bash
# Check MongoDB is running:
# Windows Services в†’ MongoDB Server в†’ Start

# Or start manually:
net start MongoDB
```

### Users not found
```bash
# Run initialization:
node init-users.js

# Verify:
# Open MongoDB Compass
# Database: assignment3
# Collection: users
# Should see 2 records
```

### Empty bookings
```bash
# Run seed script:
node seed-bookings.js

# Verify:
# Open MongoDB Compass
# Collection: bookings
# Should see 25 records
```

### Login not working
```bash
# Check console for errors
# Verify MongoDB connection
# Check .env file exists
# Verify users were created (node init-users.js)
```

---

## рџ“љ Documentation Files

```bash
README.md                       # Main documentation
DEPLOYMENT_GUIDE.md             # Deployment instructions
IMPLEMENTATION_EXPLAINED.md     # Technical deep dive
DEFENSE_CHEATSHEET.md          # Quick reference
PROJECT_COMPLETION_SUMMARY.md   # Requirements checklist
CHANGELOG.md                    # All changes
QUICK_START.md                  # This file
```

---

## рџЋ“ For Defense Demo

### Preparation (5 minutes before)
```bash
# 1. Start MongoDB
net start MongoDB

# 2. Start server
npm start

# 3. Open browser tabs:
#    - http://localhost:3000 (home)
#    - http://localhost:3000/admin (login)
#    - Developer Tools (F12)
#    - MongoDB Compass

# 4. Have documents ready:
#    - DEFENSE_CHEATSHEET.md
#    - Project open in VS Code
```

### During Defense
```bash
# Show in this order:
1. Login & Sessions (/admin)
2. CRUD operations (dashboard)
3. Cookie security (DevTools)
4. Protection (logout в†’ try to create)
5. Database (MongoDB Compass)
6. Code (server.js)
```

---

## вњ… Health Check

### Everything Working?
```bash
вњ“ Server starts without errors
вњ“ Can access http://localhost:3000
вњ“ Can login with admin/REDACTED_ADMIN_PASSWORD
вњ“ Dashboard loads with 25+ bookings
вњ“ Can create new booking
вњ“ Can edit existing booking
вњ“ Can delete booking
вњ“ Logout works
вњ“ Unauthorized access blocked
вњ“ Cookie has HttpOnly flag
вњ“ MongoDB has users and bookings
```

**If all вњ“ - you're ready! рџЋ‰**

---

## рџљЂ One-Command Demo Reset

```bash
# Reset everything and start fresh:
npm run demo

# If not configured, create npm script in package.json:
"scripts": {
  "demo": "node init-users.js && node seed-bookings.js && npm start"
}


**Need help? Check DEFENSE_CHEATSHEET.md for answers!**
