# Comfort Hotel - Hotel Booking System

### рџ“Њ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Initialize users with hashed passwords
node init-users.js

# 3. Seed database with 25+ bookings
node seed-bookings.js

# 4. Start server
npm start
```

**рџљЂ Access the application:**
- Public Site: http://localhost:3000
- Admin Login: http://localhost:3000/admin
- Credentials: `admin / REDACTED_ADMIN_PASSWORD`

---

##  Implementations

### рџ”ђ 1. Session-Based Authentication
-  Express-session with MongoDB store
-  Session persists between requests
-  Session ID stored in secure cookie
-  Login via Web UI
-  Sessions expire after 24 hours

### рџ”’ 2. Password Security
-  Bcrypt hashing (salt rounds: 10)
-  NO plain-text password storage
-  Generic error messages ("Invalid credentials")
-  Passwords never sent to client

### рџЌЄ 3. Cookie Security
-  **HttpOnly flag** - prevents XSS attacks
-  **Secure flag** - HTTPS in production
-  **SameSite: strict** - CSRF protection
-  NO sensitive data in cookies

### рџ›ЎпёЏ 4. Authentication & Authorization
-  Middleware-based authentication (`isAuthenticated`)
-  Protected write operations (POST, PUT, DELETE)
-  Unauthorized users CANNOT modify data
-  Authorization based on user roles

### рџ“Љ 5. Production Web Interface
-  Full CRUD via Web UI (no Postman needed)
-  Data displayed in responsive table
-  CREATE bookings via modal form
-  UPDATE bookings with inline editing
-  DELETE with confirmation
-  Dynamic data loading from API

### рџЏ·пёЏ 6. Domain Data (Bookings)
-  NOT generic "items" - specific to hotel domain
-  **12 meaningful fields** per booking:
  1. `roomName` - Room name
  2. `roomType` - Room category
  3. `guestName` - Guest full name
  4. `guestEmail` - Guest email
  5. `guestPhone` - Contact phone
  6. `checkInDate` - Arrival date
  7. `checkOutDate` - Departure date
  8. `duration` - Nights (auto-calculated)
  9. `numberOfGuests` - Guest count
  10. `totalPrice` - Booking cost
  11. `specialRequests` - Special notes
  12. `status` - Booking status
-  **25 realistic records** in database
-  Logically structured data

### вњ”пёЏ 7. Validation & Error Handling
-  Email format validation
-  Phone format validation
-  Date logic validation (check-out > check-in)
-  Number range validation (guests: 1-10)
-  Correct HTTP status codes (200, 201, 400, 401, 403, 404, 500)
-  Application never crashes on invalid requests

---

## рџЏ—пёЏ Architecture & Security

### Middleware Stack
```javascript
1. express.static() - Serve static files
2. express.json() - Parse JSON bodies
3. express-session - Session management
4. isAuthenticated() - Auth guard
5. Route handlers
6. Error handlers
```

### Session Flow
```
1. User submits login form
   в†“
2. Server validates credentials with bcrypt
   в†“
3. Server creates session in MongoDB
   в†“
4. Server sends session ID as HttpOnly cookie
   в†“
5. Client automatically sends cookie with requests
   в†“
6. Server validates session on each request
   в†“
7. Session destroyed on logout or expiry
```

### Cookie Configuration
```javascript
cookie: {
  httpOnly: true,        // XSS protection
  secure: NODE_ENV === 'production',  // HTTPS only
  maxAge: 24 * 60 * 60 * 1000,  // 24 hours
  sameSite: 'strict'     // CSRF protection
}
```

---

## рџЊђ API Documentation

### Authentication Endpoints

#### POST `/admin/login`
Login with credentials
```json
Request:
{
  "username": "admin",
  "password": "REDACTED_ADMIN_PASSWORD"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "user": {
    "username": "admin",
    "role": "admin",
    "fullName": "Administrator"
  }
}

Error (401):
{
  "error": "Invalid credentials"
}
```

#### POST `/admin/logout`
Destroy session
```json
Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET `/api/auth/status`
Check authentication status
```json
Response (authenticated):
{
  "authenticated": true,
  "user": {
    "username": "admin",
    "role": "admin"
  }
}

Response (not authenticated):
{
  "authenticated": false
}
```

### Bookings CRUD

#### GET `/api/bookings`
Get all bookings (no auth required)
```
Query parameters:
- status: Filter by status
- roomName: Filter by room
- sortBy: Sort field
- sortOrder: asc/desc

Response (200): Array of bookings
```

#### GET `/api/bookings/:id`
Get single booking
```
Response (200): Booking object
Response (404): { "error": "Booking not found" }
```

#### POST `/api/bookings` рџ”’ Protected
Create new booking
```json
Request:
{
  "roomName": "Deluxe Suite",
  "roomType": "suite",
  "guestName": "John Smith",
  "guestEmail": "john@example.com",
  "guestPhone": "+1-555-123-4567",
  "checkInDate": "2026-03-15",
  "checkOutDate": "2026-03-18",
  "numberOfGuests": 2,
  "totalPrice": 750.00,
  "specialRequests": "Late check-in"
}

Response (201):
{
  "message": "Booking created successfully",
  "id": "65f1a2b3c4d5e6f7g8h9i0j1"
}

Error (401):
{
  "error": "Authentication required",
  "message": "Please log in to perform this action"
}
```

#### PUT `/api/bookings/:id` рџ”’ Protected
Update existing booking
```json
Request: Same as POST + status field

Response (200): Updated booking object
Response (404): { "error": "Booking not found" }
```

#### DELETE `/api/bookings/:id` рџ”’ Protected
Delete booking
```json
Response (200):
{
  "message": "Booking deleted successfully"
}

Response (404):
{
  "error": "Booking not found"
}
```

---

## рџЋ“ Defense Preparation

### Key Concepts to Explain

#### 1. How Sessions Work
**Student Answer:**
"When a user logs in, the server validates their credentials using bcrypt. If valid, the server creates a session object containing user information and stores it in MongoDB. The server generates a unique session ID and sends it to the client as an HttpOnly cookie. On subsequent requests, the client automatically sends this cookie. The server validates the session ID, retrieves the session data from MongoDB, and authorizes the request. Sessions expire after 24 hours or when the user logs out."

#### 2. Purpose of HttpOnly and Secure Flags
**Student Answer:**
- **HttpOnly**: Prevents JavaScript from accessing cookies via `document.cookie`. This protects against XSS (Cross-Site Scripting) attacks where malicious scripts try to steal session cookies.
- **Secure**: Ensures cookies are only sent over HTTPS connections. This prevents man-in-the-middle attacks where attackers intercept HTTP traffic to steal cookies.
- **SameSite**: Prevents CSRF (Cross-Site Request Forgery) by not sending cookies on cross-origin requests.

#### 3. Authentication vs Authorization
**Student Answer:**
- **Authentication**: Verifying WHO the user is. Example: Login with username/password proves identity.
- **Authorization**: Verifying WHAT the user can do. Example: Checking if user has permission to delete bookings.

In our app:
- `isAuthenticated()` middleware handles authentication
- `isAdmin()` middleware handles authorization based on user role

#### 4. Password Security with Bcrypt
**Student Answer:**
"We use bcrypt to hash passwords with 10 salt rounds. When a user is created, we hash their password before storing it. During login, we use `bcrypt.compare()` to verify the password against the hash. We NEVER store plain-text passwords. Even if the database is compromised, attackers cannot retrieve original passwords due to bcrypt's one-way hashing algorithm."

#### 5. Why Generic Error Messages?
**Student Answer:**
"We use generic messages like 'Invalid credentials' instead of 'Username not found' or 'Wrong password' to prevent attackers from enumerating valid usernames. If we say 'Username not found', attackers know that username doesn't exist. Generic messages provide no information about which part of the login failed."

---

## рџЋЇ Demo Scenarios for Defense

### Scenario 1: Demonstrate Full CRUD
1. Open http://localhost:3000/admin
2. Login with `admin / REDACTED_ADMIN_PASSWORD`
3. **CREATE**: Click "Create New Booking" в†’ Fill form в†’ Save
4. **READ**: View booking in table with all details
5. **UPDATE**: Click edit icon в†’ Modify fields в†’ Save
6. **DELETE**: Click delete icon в†’ Confirm deletion

### Scenario 2: Show Unauthorized Access Prevention
1. Open browser DevTools в†’ Application в†’ Cookies
2. Delete session cookie
3. Try to create/update/delete booking
4. Show 401 Unauthorized error
5. Re-login to regain access

### Scenario 3: Session Persistence
1. Login to dashboard
2. Refresh page multiple times
3. Show session persists (user still logged in)
4. Check MongoDB sessions collection
5. Logout and show session destroyed

### Scenario 4: Cookie Security
1. Open DevTools в†’ Application в†’ Cookies
2. Show `sessionId` cookie
3. Point out `HttpOnly` flag (вњ“)
4. Point out `Secure` flag (вњ“ in production)
5. Try to access cookie via console: `document.cookie`
6. Show it's not accessible (HttpOnly protection)

---

## рџ“Ѓ Project Structure

```
Comfort-Hoetel/
в”њв”Ђв”Ђ рџ“„ server.js                    # Main Express server
в”њв”Ђв”Ђ рџ“„ init-users.js                # User initialization script
в”њв”Ђв”Ђ рџ“„ seed-bookings.js             # Database seeding script
в”њв”Ђв”Ђ рџ“„ package.json                 # Dependencies
в”њв”Ђв”Ђ рџ“„ .env                         # Environment variables
в”њв”Ђв”Ђ рџ“„ DEPLOYMENT_GUIDE.md          # Comprehensive guide
в”њв”Ђв”Ђ рџ“‚ database/
в”‚   в””в”Ђв”Ђ рџ“„ mongo.js                # MongoDB connection
в”њв”Ђв”Ђ рџ“‚ views/
в”‚   в”њв”Ђв”Ђ рџ“„ index.html              # Home page
в”‚   в”њв”Ђв”Ђ рџ“„ admin-login.html        # Secure login page
в”‚   в”њв”Ђв”Ђ рџ“„ admin-dashboard.html    # CRUD dashboard
в”‚   в”њв”Ђв”Ђ рџ“„ rooms.html              # Rooms catalog
в”‚   в”њв”Ђв”Ђ рџ“„ booking.html            # Public booking
в”‚   в”њв”Ђв”Ђ рџ“„ about.html              # About page
в”‚   в”њв”Ђв”Ђ рџ“„ contact.html            # Contact page
в”‚   в””в”Ђв”Ђ рџ“„ 404.html                # Error page
в””в”Ђв”Ђ рџ“‚ public/
    в””в”Ђв”Ђ рџ“„ style.css               # Styles
```

---

## рџ”§ Technologies

| Category | Technology |
|----------|-----------|
| Runtime | Node.js v14+ |
| Framework | Express.js 5.x |
| Database | MongoDB 6.x |
| Session Store | connect-mongo |
| Authentication | bcrypt + express-session |
| Frontend | HTML5, Bootstrap 5, Vanilla JS |
| Security | HttpOnly cookies, CSRF protection |

---

## рџљЂ Deployment Checklist

Before deploying to production (Render, Railway, etc.):

- [ ] Update `SESSION_SECRET` to strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Update MongoDB URI to production database
- [ ] Run `node init-users.js` on production DB
- [ ] Run `node seed-bookings.js` on production DB
- [ ] Ensure HTTPS is enabled (Secure cookies)
- [ ] Test all CRUD operations
- [ ] Test authentication flow
- [ ] Verify cookie security flags

---

## рџђ› Common Issues & Solutions

### Issue: Session not saving
**Solution:** Check MongoDB connection and ensure `connect-mongo` is properly configured.

### Issue: 401 on CRUD operations
**Solution:** Login first. Sessions require authentication for write operations.

### Issue: Users not found
**Solution:** Run `node init-users.js`

### Issue: Empty bookings
**Solution:** Run `node seed-bookings.js`

---

## рџ“Љ Database Schema

### users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  password: String (bcrypt hashed),
  role: String (admin/manager),
  email: String,
  fullName: String,
  created_at: Date
}
```

### bookings Collection
```javascript
{
  _id: ObjectId,
  roomName: String,
  roomType: String,
  guestName: String,
  guestEmail: String,
  guestPhone: String,
  checkInDate: Date,
  checkOutDate: Date,
  duration: Number (auto-calculated),
  numberOfGuests: Number,
  totalPrice: Number,
  specialRequests: String,
  status: String (pending/confirmed/checked-in/completed/cancelled),
  created_at: Date,
  created_by: String (username),
  updated_at: Date,
  updated_by: String (username)
}
```

### sessions Collection
```javascript
{
  _id: String (session ID),
  expires: Date,
  session: {
    cookie: {...},
    user: {
      id: String,
      username: String,
      role: String,
      email: String,
      fullName: String
    }
  }
}

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
