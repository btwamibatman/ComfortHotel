require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const path = require('path');
const { ObjectId } = require('mongodb');
const connectDB = require('./database/mongo');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// MIDDLEWARE CONFIGURATION
// Body parsers
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (isProduction) {
  // Allow secure cookies when running behind a proxy (e.g., Render/Heroku/Nginx)
  app.set('trust proxy', 1);
}

// Session configuration 
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017',
    dbName: 'assignment3',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60 // 24 hours
  }),
  cookie: {
    httpOnly: true, //protects against XSS attacks
    secure: isProduction ? 'auto' : false, // auto-detect HTTPS in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: isProduction ? 'auto' : 'lax' // be less strict in dev
  },
  name: 'sessionId' // Not using the default name 'connect.sid'
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - User: ${req.session.user?.username || 'guest'}`);
  next();
});

// AUTHENTICATION MIDDLEWARE
/**
 * Middleware for authentication check
 * Checks if there is an active user session
 */
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  
  // Р”Р»СЏ API Р·Р°РїСЂРѕСЃРѕРІ РІРѕР·РІСЂР°С‰Р°РµРј JSON
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to perform this action'
    });
  }
  
  // Р”Р»СЏ РѕР±С‹С‡РЅС‹С… Р·Р°РїСЂРѕСЃРѕРІ РїРµСЂРµРЅР°РїСЂР°РІР»СЏРµРј РЅР° Р»РѕРіРёРЅ
  res.redirect('/admin?error=Please login first');
}

/**
 * Middleware РґР»СЏ РїСЂРѕРІРµСЂРєРё СЂРѕР»Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°
 * РСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РґР»СЏ РѕРїРµСЂР°С†РёР№, С‚СЂРµР±СѓСЋС‰РёС… РїРѕРІС‹С€РµРЅРЅС‹С… РїСЂРёРІРёР»РµРіРёР№
 */
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  
  if (req.path.startsWith('/api/')) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Admin privileges required'
    });
  }
  
  res.status(403).send('Access denied: Admin privileges required');
}


// UTILITY FUNCTIONS

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Р’Р°Р»РёРґР°С†РёСЏ С‚РµР»РµС„РѕРЅР°
 */
function isValidPhone(phone) {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
}

/**
 * Р’Р°Р»РёРґР°С†РёСЏ РґР°С‚ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёСЏ
 */
function validateBookingDates(checkIn, checkOut) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (checkInDate < today) {
    return { valid: false, error: 'Check-in date cannot be in the past' };
  }
  
  if (checkOutDate <= checkInDate) {
    return { valid: false, error: 'Check-out date must be after check-in date' };
  }
  
  return { valid: true };
}

// ====================================
// PUBLIC ROUTES (No authentication required)
// ====================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.get('/rooms', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'rooms.html'));
});

app.get('/booking', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'booking.html'));
});

// Serve room images
app.get('/1.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', '1.jpg'));
});

app.get('/2.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', '2.jpg'));
});

app.get('/3.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', '3.jpg'));
});

app.get('/item/:id', (req, res) => {
  const itemId = req.params.id;
  const imagePath = path.join(__dirname, 'views', `${itemId}.jpg`);
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).send('Image not found');
    }
  });
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.status(200).json({
    project: 'Comfort Hoetel - Assignment 4',
    description: 'Hotel Booking System with Session-based Authentication',
    version: '2.0.0',
    features: [
      'Session-based authentication',
      'Bcrypt password hashing',
      'HttpOnly & Secure cookies',
      'CRUD operations for bookings',
      'Protected write operations'
    ]
  });
});

// AUTHENTICATION ROUTES

// Admin login page
app.get('/admin', (req, res) => {
  // Р•СЃР»Рё СѓР¶Рµ Р·Р°Р»РѕРіРёРЅРµРЅ, РїРµСЂРµРЅР°РїСЂР°РІР»СЏРµРј РЅР° dashboard
  if (req.session && req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  res.sendFile(path.join(__dirname, 'views', 'admin-login.html'));
});

// User login page  
app.get('/user', (req, res) => {
  // Р•СЃР»Рё СѓР¶Рµ Р·Р°Р»РѕРіРёРЅРµРЅ, РїРµСЂРµРЅР°РїСЂР°РІР»СЏРµРј РЅР° dashboard
  if (req.session && req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  res.sendFile(path.join(__dirname, 'views', 'user-login.html'));
});

// Admin Login endpoint - РўРћР›Р¬РљРћ Р”Р›РЇ РђР”РњРРќРћР’
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Р’Р°Р»РёРґР°С†РёСЏ РґР°РЅРЅС‹С…
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ username });
    
    // РСЃРїРѕР»СЊР·СѓРµРј РѕР±С‰РµРµ СЃРѕРѕР±С‰РµРЅРёРµ РѕР± РѕС€РёР±РєРµ РґР»СЏ Р±РµР·РѕРїР°СЃРЅРѕСЃС‚Рё
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // РџР РћР’Р•Р РљРђ: РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ Р”РћР›Р–Р•Рќ Р±С‹С‚СЊ Р°РґРјРёРЅРѕРј
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.',
        hint: 'Please use the User Login page'
      });
    }
    
    // РџСЂРѕРІРµСЂСЏРµРј РїР°СЂРѕР»СЊ СЃ РїРѕРјРѕС‰СЊСЋ bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // РЎРѕР·РґР°РµРј СЃРµСЃСЃРёСЋ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°
    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      email: user.email,
      fullName: user.fullName
    };
    
    // РЎРѕС…СЂР°РЅСЏРµРј СЃРµСЃСЃРёСЋ Рё РѕС‚РїСЂР°РІР»СЏРµРј РѕС‚РІРµС‚
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Session error' });
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'Admin login successful',
        user: {
          username: user.username,
          role: user.role,
          fullName: user.fullName
        }
      });
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User Login endpoint - Р”Р›РЇ РќР•-РђР”РњРРќРћР’ (manager, staff Рё С‚.Рґ.)
app.post('/user/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Р’Р°Р»РёРґР°С†РёСЏ РґР°РЅРЅС‹С…
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ username });
    
    // РСЃРїРѕР»СЊР·СѓРµРј РѕР±С‰РµРµ СЃРѕРѕР±С‰РµРЅРёРµ РѕР± РѕС€РёР±РєРµ РґР»СЏ Р±РµР·РѕРїР°СЃРЅРѕСЃС‚Рё
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // РџР РћР’Р•Р РљРђ: РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РќР• РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ Р°РґРјРёРЅРѕРј
    if (user.role === 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. Please use Admin Login.',
        hint: 'Administrators must login through /admin'
      });
    }
    
    // РџСЂРѕРІРµСЂСЏРµРј РїР°СЂРѕР»СЊ СЃ РїРѕРјРѕС‰СЊСЋ bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // РЎРѕР·РґР°РµРј СЃРµСЃСЃРёСЋ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      email: user.email,
      fullName: user.fullName
    };
    
    // РЎРѕС…СЂР°РЅСЏРµРј СЃРµСЃСЃРёСЋ Рё РѕС‚РїСЂР°РІР»СЏРµРј РѕС‚РІРµС‚
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Session error' });
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'User login successful',
        user: {
          username: user.username,
          role: user.role,
          fullName: user.fullName
        }
      });
    });
    
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout endpoint
app.post('/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('sessionId');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
});

// Check session status
app.get('/api/auth/status', (req, res) => {
  if (req.session && req.session.user) {
    res.status(200).json({
      authenticated: true,
      user: req.session.user
    });
  } else {
    res.status(200).json({
      authenticated: false
    });
  }
});

// Admin dashboard (protected route)
app.get('/admin/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html'));
});


// CONTACT API ENDPOINTS (for backward compatibility)

/* GET ALL CONTACTS - READ operation (no auth required for demo) */
app.get('/api/contacts', async (req, res) => {
  try {
    const db = await connectDB();
    
    const filter = {};
    if (req.query.email) filter.email = req.query.email;
    if (req.query.name) filter.name = req.query.name;
    
    const sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      sort.created_at = -1;
    }
    
    const projection = {};
    if (req.query.fields) {
      req.query.fields.split(',').forEach(f => {
        const field = f.trim();
        if (field) projection[field] = 1;
      });
    }
    
    const contacts = await db
      .collection('contacts')
      .find(filter)
      .project(Object.keys(projection).length > 0 ? projection : null)
      .sort(sort)
      .toArray();
    
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/* GET CONTACT BY ID */
app.get('/api/contacts/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  try {
    const db = await connectDB();
    const contact = await db.collection('contacts').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.status(200).json(contact);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/* CREATE CONTACT - PROTECTED (requires authentication) */
app.post('/api/contacts', isAuthenticated, async (req, res) => {
  const { name, email, message } = req.body;
  
  // Р’Р°Р»РёРґР°С†РёСЏ
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'Name must be between 2 and 100 characters' });
  }
  
  try {
    const db = await connectDB();
    const result = await db.collection('contacts').insertOne({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      created_at: new Date(),
      created_by: req.session.user.username
    });
    
    res.status(201).json({
      message: 'Contact created successfully',
      id: result.insertedId
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/* UPDATE CONTACT - PROTECTED */
app.put('/api/contacts/:id', isAuthenticated, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  try {
    const db = await connectDB();
    const result = await db.collection('contacts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          name: name.trim(), 
          email: email.trim().toLowerCase(), 
          message: message.trim(),
          updated_at: new Date(),
          updated_by: req.session.user.username
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    const updatedContact = await db.collection('contacts').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    res.status(200).json(updatedContact);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/* DELETE CONTACT - PROTECTED */
app.delete('/api/contacts/:id', isAuthenticated, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  try {
    const db = await connectDB();
    const result = await db.collection('contacts').deleteOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Public contact form submission (for website visitors)
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).send('All fields are required');
  }
  
  if (!isValidEmail(email)) {
    return res.status(400).send('Invalid email format');
  }
  
  try {
    const db = await connectDB();
    await db.collection('contacts').insertOne({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      created_at: new Date(),
      source: 'public_form'
    });
    
    res.send(`<h2>Thanks, ${name}! Your message has been saved.</h2><a href="/">Back</a>`);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Error saving data');
  }
});


// BOOKING API ENDPOINTS (Main CRUD Operations)


/* GET ALL BOOKINGS - READ operation (no auth required to view) */
app.get('/api/bookings', async (req, res) => {
  try {
    const db = await connectDB();
    
    const filter = {};
    if (req.query.roomName) filter.roomName = req.query.roomName;
    if (req.query.guestEmail) filter.guestEmail = req.query.guestEmail;
    if (req.query.status) filter.status = req.query.status;
    
    const sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      sort.checkInDate = -1;
    }
    
    const projection = {};
    if (req.query.fields) {
      req.query.fields.split(',').forEach(f => {
        const field = f.trim();
        if (field) projection[field] = 1;
      });
    }
    
    const bookings = await db
      .collection('bookings')
      .find(filter)
      .project(Object.keys(projection).length > 0 ? projection : null)
      .sort(sort)
      .toArray();
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/* GET BOOKING BY ID */
app.get('/api/bookings/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  try {
    const db = await connectDB();
    const booking = await db.collection('bookings').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/* CREATE BOOKING - PROTECTED (requires authentication) */
app.post('/api/bookings', isAuthenticated, async (req, res) => {
  const { 
    roomName, roomType, guestName, guestEmail, guestPhone, 
    checkInDate, checkOutDate, numberOfGuests, totalPrice, specialRequests 
  } = req.body;
  
  // Р’Р°Р»РёРґР°С†РёСЏ РѕР±СЏР·Р°С‚РµР»СЊРЅС‹С… РїРѕР»РµР№
  if (!roomName || !roomType || !guestName || !guestEmail || 
      !checkInDate || !checkOutDate || !numberOfGuests || !totalPrice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Р’Р°Р»РёРґР°С†РёСЏ email
  if (!isValidEmail(guestEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Р’Р°Р»РёРґР°С†РёСЏ С‚РµР»РµС„РѕРЅР°
  if (guestPhone && !isValidPhone(guestPhone)) {
    return res.status(400).json({ error: 'Invalid phone format' });
  }
  
  // Р’Р°Р»РёРґР°С†РёСЏ РґР°С‚
  const dateValidation = validateBookingDates(checkInDate, checkOutDate);
  if (!dateValidation.valid) {
    return res.status(400).json({ error: dateValidation.error });
  }
  
  // Р’Р°Р»РёРґР°С†РёСЏ С‡РёСЃР»РѕРІС‹С… Р·РЅР°С‡РµРЅРёР№
  const guests = parseInt(numberOfGuests);
  const price = parseFloat(totalPrice);
  
  if (isNaN(guests) || guests < 1 || guests > 10) {
    return res.status(400).json({ error: 'Number of guests must be between 1 and 10' });
  }
  
  if (isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'Invalid price' });
  }
  
  // Р Р°СЃС‡РµС‚ РґР»РёС‚РµР»СЊРЅРѕСЃС‚Рё
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  try {
    const db = await connectDB();
    const result = await db.collection('bookings').insertOne({
      roomName: roomName.trim(),
      roomType: roomType.trim(),
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone ? guestPhone.trim() : '',
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      duration,
      numberOfGuests: guests,
      totalPrice: price,
      specialRequests: specialRequests ? specialRequests.trim() : '',
      status: 'pending',
      created_at: new Date(),
      created_by: req.session.user.username
    });
    
    res.status(201).json({
      message: 'Booking created successfully',
      id: result.insertedId
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/* UPDATE BOOKING - ADMIN ONLY */
app.put('/api/bookings/:id', isAdmin, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  const { 
    roomName, roomType, guestName, guestEmail, guestPhone, 
    checkInDate, checkOutDate, numberOfGuests, totalPrice, specialRequests, status 
  } = req.body;
  
  // Р’Р°Р»РёРґР°С†РёСЏ
  if (!roomName || !roomType || !guestName || !guestEmail || 
      !checkInDate || !checkOutDate || !numberOfGuests || !totalPrice) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (!isValidEmail(guestEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  if (guestPhone && !isValidPhone(guestPhone)) {
    return res.status(400).json({ error: 'Invalid phone format' });
  }
  
  const dateValidation = validateBookingDates(checkInDate, checkOutDate);
  if (!dateValidation.valid) {
    return res.status(400).json({ error: dateValidation.error });
  }
  
  const guests = parseInt(numberOfGuests);
  const price = parseFloat(totalPrice);
  
  if (isNaN(guests) || guests < 1 || guests > 10) {
    return res.status(400).json({ error: 'Number of guests must be between 1 and 10' });
  }
  
  if (isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'Invalid price' });
  }
  
  // Р’Р°Р»РёРґР°С†РёСЏ СЃС‚Р°С‚СѓСЃР°
  const validStatuses = ['pending', 'confirmed', 'checked-in', 'completed', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  try {
    const db = await connectDB();
    const updateData = {
      roomName: roomName.trim(),
      roomType: roomType.trim(),
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone ? guestPhone.trim() : '',
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      duration,
      numberOfGuests: guests,
      totalPrice: price,
      specialRequests: specialRequests ? specialRequests.trim() : '',
      updated_at: new Date(),
      updated_by: req.session.user.username
    };
    
    if (status) {
      updateData.status = status;
    }
    
    const result = await db.collection('bookings').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const updatedBooking = await db.collection('bookings').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/* DELETE BOOKING - ADMIN ONLY */
app.delete('/api/bookings/:id', isAdmin, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  try {
    const db = await connectDB();
    const result = await db.collection('bookings').deleteOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ====================================
// ERROR HANDLERS
// ====================================

// API 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// SERVER START

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  в•”в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•—
  в•‘         рџЏЁ Comfort Hoetel - Server Started           в•‘
  в• в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•Ј
  в•‘  Server:    http://localhost:${PORT}                    в•‘
  в•‘  Admin:     http://localhost:${PORT}/admin              в•‘
  в•‘  API Docs:  http://localhost:${PORT}/api/info           в•‘
  в• в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•Ј
  в•‘  Features:                                            в•‘
  в•‘  вњ“ Session-based authentication                       в•‘
  в•‘  вњ“ Bcrypt password hashing                            в•‘
  в•‘  вњ“ HttpOnly & Secure cookies                          в•‘
  в•‘  вњ“ Protected CRUD operations                          в•‘
  в•‘  вњ“ Input validation                                   в•‘
  в•љв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ќ
  `);
});
