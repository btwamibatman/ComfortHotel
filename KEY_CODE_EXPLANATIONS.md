# рџ”‘ РљР›Р®Р§Р•Р’Р«Р• Р§РђРЎРўР РљРћР”Рђ - РћР±СЉСЏСЃРЅРµРЅРёРµ РґР»СЏ РџСЂРµРїРѕРґР°РІР°С‚РµР»СЏ

## рџ“Ќ Р“РґРµ РќР°С…РѕРґРёС‚СЃСЏ РљРѕРґ

---

## 1пёЏвѓЈ COOKIE Р SESSION CONFIGURATION
**Р¤Р°Р№Р»:** [server.js](server.js) **СЃС‚СЂРѕРєРё 18-43**

### РљРѕРґ:
```javascript
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
    httpOnly: true,        // в†ђ Р—РђР©РРўРђ РћРў XSS
    secure: isProduction ? 'auto' : false,  // в†ђ Р—РђР©РРўРђ РћРў MITM
    maxAge: 24 * 60 * 60 * 1000,            // в†ђ 24 Р§РђРЎРђ
    sameSite: isProduction ? 'auto' : 'lax' // в†ђ Р—РђР©РРўРђ РћРў CSRF
  },
  name: 'sessionId'  // в†ђ РќРµ РёСЃРїРѕР»СЊР·СѓРµРј РґРµС„РѕР»С‚РЅРѕРµ РёРјСЏ 'connect.sid'
}));
```

### рџ“– РћР±СЉСЏСЃРЅРµРЅРёРµ РґР»СЏ РїСЂРµРїРѕРґР°РІР°С‚РµР»СЏ:

**1. `secret`** - СЃРµРєСЂРµС‚РЅС‹Р№ РєР»СЋС‡ РґР»СЏ РїРѕРґРїРёСЃРё session ID
   - РСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РґР»СЏ РєСЂРёРїС‚РѕРіСЂР°С„РёС‡РµСЃРєРѕР№ РїРѕРґРїРёСЃРё cookie
   - РџСЂРµРґРѕС‚РІСЂР°С‰Р°РµС‚ РїРѕРґРґРµР»РєСѓ session ID
   - РҐСЂР°РЅРёС‚СЃСЏ РІ .env С„Р°Р№Р»Рµ РґР»СЏ Р±РµР·РѕРїР°СЃРЅРѕСЃС‚Рё

**2. `resave: false`** - РЅРµ РїРµСЂРµСЃРѕС…СЂР°РЅСЏС‚СЊ СЃРµСЃСЃРёСЋ РµСЃР»Рё РЅРµ РёР·РјРµРЅРёР»Р°СЃСЊ
   - РћРїС‚РёРјРёР·Р°С†РёСЏ РїСЂРѕРёР·РІРѕРґРёС‚РµР»СЊРЅРѕСЃС‚Рё
   - РЈРјРµРЅСЊС€Р°РµС‚ РЅР°РіСЂСѓР·РєСѓ РЅР° MongoDB

**3. `saveUninitialized: false`** - РЅРµ СЃРѕР·РґР°РІР°С‚СЊ СЃРµСЃСЃРёСЋ РґР»СЏ РЅРµР·Р°Р»РѕРіРёРЅРµРЅС‹С…
   - Р­РєРѕРЅРѕРјРёСЏ РјРµСЃС‚Р° РІ Р‘Р”
   - GDPR compliance (РЅРµ С…СЂР°РЅРёРј РґР°РЅРЅС‹Рµ РґРѕ СЃРѕРіР»Р°СЃРёСЏ)

**4. `store: MongoStore`** - С…СЂР°РЅРµРЅРёРµ СЃРµСЃСЃРёР№ РІ MongoDB
   - РЎРµСЃСЃРёРё РїРµСЂРµР¶РёРІР°СЋС‚ РїРµСЂРµР·Р°РїСѓСЃРє СЃРµСЂРІРµСЂР°
   - РњР°СЃС€С‚Р°Р±РёСЂСѓРµРјРѕСЃС‚СЊ (РЅРµСЃРєРѕР»СЊРєРѕ СЃРµСЂРІРµСЂРѕРІ в†’ РѕРґРЅР° Р‘Р”)
   - TTL 24 С‡Р°СЃР° в†’ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРѕРµ СѓРґР°Р»РµРЅРёРµ СЃС‚Р°СЂС‹С… СЃРµСЃСЃРёР№

**5. `cookie.httpOnly: true`** - **РљР›Р®Р§Р•Р’РђРЇ Р‘Р•Р—РћРџРђРЎРќРћРЎРўР¬!**
   - JavaScript РќР• РјРѕР¶РµС‚ РїРѕР»СѓС‡РёС‚СЊ РґРѕСЃС‚СѓРї Рє cookie
   - `document.cookie` РІРµСЂРЅРµС‚ РїСѓСЃС‚СѓСЋ СЃС‚СЂРѕРєСѓ
   - Р—Р°С‰РёС‚Р° РѕС‚ XSS Р°С‚Р°Рє (cross-site scripting)
   - Р”Р°Р¶Рµ РµСЃР»Рё Р·Р»РѕСѓРјС‹С€Р»РµРЅРЅРёРє РІРЅРµРґСЂРёС‚ JS, РѕРЅ РЅРµ СѓРєСЂР°РґРµС‚ session ID

**6. `cookie.secure`** - С‚РѕР»СЊРєРѕ HTTPS РІ production
   - Р’ production: cookie РїРµСЂРµРґР°РµС‚СЃСЏ С‚РѕР»СЊРєРѕ С‡РµСЂРµР· HTTPS
   - Р’ development: false (РјРѕР¶РЅРѕ С‚РµСЃС‚РёСЂРѕРІР°С‚СЊ С‡РµСЂРµР· HTTP)
   - Р—Р°С‰РёС‚Р° РѕС‚ MITM Р°С‚Р°Рє (man-in-the-middle)

**7. `cookie.sameSite`** - Р·Р°С‰РёС‚Р° РѕС‚ CSRF
   - Cookie РќР• РѕС‚РїСЂР°РІР»СЏРµС‚СЃСЏ РЅР° cross-site Р·Р°РїСЂРѕСЃС‹
   - Р—Р°С‰РёС‚Р° РѕС‚ CSRF Р°С‚Р°Рє (cross-site request forgery)
   - 'lax' РІ dev, 'auto' РІ production

**8. `name: 'sessionId'`** - РєР°СЃС‚РѕРјРЅРѕРµ РёРјСЏ
   - РќРµ РёСЃРїРѕР»СЊР·СѓРµРј РґРµС„РѕР»С‚РЅРѕРµ 'connect.sid'
   - Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅР°СЏ Р±РµР·РѕРїР°СЃРЅРѕСЃС‚СЊ С‡РµСЂРµР· obscurity

---

## 2пёЏвѓЈ AUTHENTICATION MIDDLEWARE (isAuthenticated)
**Р¤Р°Р№Р»:** [server.js](server.js) **СЃС‚СЂРѕРєРё 48-70**

### РљРѕРґ:
```javascript
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();  // вњ… РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ Р·Р°Р»РѕРіРёРЅРµРЅ в†’ РїСЂРѕРґРѕР»Р¶РёС‚СЊ
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
```

### рџ“– РћР±СЉСЏСЃРЅРµРЅРёРµ:

**Р§С‚Рѕ РїСЂРѕРІРµСЂСЏРµС‚:**
- `req.session` - СЃСѓС‰РµСЃС‚РІСѓРµС‚ Р»Рё СЃРµСЃСЃРёСЏ
- `req.session.user` - РµСЃС‚СЊ Р»Рё РёРЅС„РѕСЂРјР°С†РёСЏ Рѕ РїРѕР»СЊР·РѕРІР°С‚РµР»Рµ РІ СЃРµСЃСЃРёРё

**РљР°Рє СЂР°Р±РѕС‚Р°РµС‚:**
1. Express-session Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё РїСЂРѕРІРµСЂСЏРµС‚ cookie 'sessionId'
2. Р•СЃР»Рё cookie РІР°Р»РёРґРµРЅ в†’ Р·Р°РіСЂСѓР¶Р°РµС‚ РґР°РЅРЅС‹Рµ РёР· MongoDB РІ req.session
3. Р•СЃР»Рё req.session.user СЃСѓС‰РµСЃС‚РІСѓРµС‚ в†’ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ Р·Р°Р»РѕРіРёРЅРµРЅ
4. Р•СЃР»Рё РЅРµС‚ в†’ РІРѕР·РІСЂР°С‰Р°РµС‚ 401 (Unauthorized)

**Р—Р°С‡РµРј РґРІР° С‚РёРїР° РѕС‚РІРµС‚Р°:**
- API endpoints в†’ JSON (РґР»СЏ AJAX Р·Р°РїСЂРѕСЃРѕРІ)
- HTML pages в†’ redirect (РґР»СЏ Р±СЂР°СѓР·РµСЂР°)

---

## 3пёЏвѓЈ AUTHORIZATION MIDDLEWARE (isAdmin)
**Р¤Р°Р№Р»:** [server.js](server.js) **СЃС‚СЂРѕРєРё 72-85**

### РљРѕРґ:
```javascript
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();  // вњ… РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ Р°РґРјРёРЅ в†’ РїСЂРѕРґРѕР»Р¶РёС‚СЊ
  }
  
  if (req.path.startsWith('/api/')) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Admin privileges required'
    });
  }
  
  res.status(403).send('Access denied: Admin privileges required');
}
```

### рџ“– РћР±СЉСЏСЃРЅРµРЅРёРµ:

**Р Р°Р·РЅРёС†Р° СЃ isAuthenticated:**
- `isAuthenticated` в†’ РїСЂРѕРІРµСЂСЏРµС‚ РљРўРћ РІС‹ (Р·Р°Р»РѕРіРёРЅРµРЅ Р»Рё)
- `isAdmin` в†’ РїСЂРѕРІРµСЂСЏРµС‚ Р§РўРћ РІС‹ РјРѕР¶РµС‚Рµ (РµСЃС‚СЊ Р»Рё РїСЂР°РІР°)

**HTTP СЃС‚Р°С‚СѓСЃС‹:**
- 401 Unauthorized в†’ РЅСѓР¶РЅР° Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёСЏ (РЅРµ Р·Р°Р»РѕРіРёРЅРµРЅ)
- 403 Forbidden в†’ РµСЃС‚СЊ Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёСЏ, РЅРѕ РЅРµС‚ РїСЂР°РІ

**РСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ:**
```javascript
app.post('/api/bookings', isAuthenticated, ...);  // Р›СЋР±РѕР№ Р·Р°Р»РѕРіРёРЅРµРЅС‹Р№
app.put('/api/bookings/:id', isAdmin, ...);       // РўРѕР»СЊРєРѕ Р°РґРјРёРЅ
app.delete('/api/bookings/:id', isAdmin, ...);    // РўРѕР»СЊРєРѕ Р°РґРјРёРЅ
```

---

## 4пёЏвѓЈ BCRYPT - РЎРћР—Р”РђРќРР• РџРћР›Р¬Р—РћР’РђРўР•Р›РЇ
**Р¤Р°Р№Р»:** [init-users.js](init-users.js) **СЃС‚СЂРѕРєРё 24-34**

### РљРѕРґ:
```javascript
// Creating admin user
const adminPassword = await bcrypt.hash(
  process.env.ADMIN_PASSWORD || 'REDACTED_ADMIN_PASSWORD',  // в†ђ РСЃС…РѕРґРЅС‹Р№ РїР°СЂРѕР»СЊ
  10  // в†ђ РљРѕР»РёС‡РµСЃС‚РІРѕ СЂР°СѓРЅРґРѕРІ (2^10 = 1024 РёС‚РµСЂР°С†РёР№)
);

await usersCollection.insertOne({
  username: process.env.ADMIN_USERNAME || 'admin',
  password: adminPassword,  // в†ђ РЎРѕС…СЂР°РЅСЏРµРј РҐР•РЁ, РќР• РїР°СЂРѕР»СЊ!
  role: 'admin',
  email: 'admin@comforthoetel.com',
  fullName: 'Administrator',
  created_at: new Date()
});
```

### рџ“– РћР±СЉСЏСЃРЅРµРЅРёРµ:

**Р§С‚Рѕ РґРµР»Р°РµС‚ bcrypt.hash():**
1. Р“РµРЅРµСЂРёСЂСѓРµС‚ СЃР»СѓС‡Р°Р№РЅСѓСЋ СЃРѕР»СЊ (salt) - СѓРЅРёРєР°Р»СЊРЅР°СЏ РґР»СЏ РєР°Р¶РґРѕРіРѕ РїР°СЂРѕР»СЏ
2. РљРѕРјР±РёРЅРёСЂСѓРµС‚ РїР°СЂРѕР»СЊ + СЃРѕР»СЊ
3. РҐРµС€РёСЂСѓРµС‚ С‡РµСЂРµР· Blowfish Р°Р»РіРѕСЂРёС‚Рј
4. РџРѕРІС‚РѕСЂСЏРµС‚ 2^10 СЂР°Р· (1024 РёС‚РµСЂР°С†РёРё)
5. Р РµР·СѓР»СЊС‚Р°С‚: СЃС‚СЂРѕРєР° С‚РёРїР° `$2b$10$N9qo8uLO...` (60 СЃРёРјРІРѕР»РѕРІ)

**РЎС‚СЂСѓРєС‚СѓСЂР° С…РµС€Р°:**
```
$2b$10$N9qo8uLOXVOAkOdCfOYNueshI3SL0SqEhZzMNBxvl.hN2RBhqMfai
 в”‚  в”‚   в”‚                              в”‚
 в”‚  в”‚   в””в”Ђ Salt (22 СЃРёРјРІРѕР»Р°)           в””в”Ђ Hash (31 СЃРёРјРІРѕР»)
 в”‚  в””в”Ђв”Ђв”Ђв”Ђв”Ђ Rounds (10 = 2^10 РёС‚РµСЂР°С†РёР№)
 в””в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ РђР»РіРѕСЂРёС‚Рј (2b = bcrypt)
```

**РџРѕС‡РµРјСѓ Р±РµР·РѕРїР°СЃРЅРѕ:**
- **РќРµРѕР±СЂР°С‚РёРјРѕСЃС‚СЊ:** РЅРµРІРѕР·РјРѕР¶РЅРѕ РїРѕР»СѓС‡РёС‚СЊ 'REDACTED_ADMIN_PASSWORD' РёР· С…РµС€Р°
- **РЈРЅРёРєР°Р»СЊРЅРѕСЃС‚СЊ СЃРѕР»Рё:** РґР°Р¶Рµ РѕРґРёРЅР°РєРѕРІС‹Рµ РїР°СЂРѕР»Рё в†’ СЂР°Р·РЅС‹Рµ С…РµС€Рё
- **РњРµРґР»РµРЅРЅРѕСЃС‚СЊ:** 1024 РёС‚РµСЂР°С†РёРё РґРµР»Р°СЋС‚ Р±СЂСѓС‚С„РѕСЂСЃ РЅРµРїСЂР°РєС‚РёС‡РЅС‹Рј
- **РђРґР°РїС‚РёРІРЅРѕСЃС‚СЊ:** РјРѕР¶РЅРѕ СѓРІРµР»РёС‡РёС‚СЊ rounds РєРѕРіРґР° РєРѕРјРїСЊСЋС‚РµСЂС‹ СЃС‚Р°РЅСѓС‚ Р±С‹СЃС‚СЂРµРµ

---

## 5пёЏвѓЈ BCRYPT - РџР РћР’Р•Р РљРђ РџРђР РћР›РЇ РџР Р Р›РћР“РРќР•
**Р¤Р°Р№Р»:** [server.js](server.js) **СЃС‚СЂРѕРєРё 238-244**

### РљРѕРґ:
```javascript
// 1. РќР°С…РѕРґРёРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РІ Р‘Р”
const user = await db.collection('users').findOne({ username });

if (!user) {
  return res.status(401).json({ error: 'Invalid credentials' });
}

// 2. РџСЂРѕРІРµСЂСЏРµРј РїР°СЂРѕР»СЊ С‡РµСЂРµР· bcrypt
const passwordMatch = await bcrypt.compare(
  password,        // в†ђ РћС‚ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ (plain text): "REDACTED_ADMIN_PASSWORD"
  user.password    // в†ђ РР· Р‘Р” (hash): "$2b$10$N9qo..."
);

if (!passwordMatch) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```

### рџ“– РћР±СЉСЏСЃРЅРµРЅРёРµ:

**РљР°Рє СЂР°Р±РѕС‚Р°РµС‚ bcrypt.compare():**
1. РР·РІР»РµРєР°РµС‚ СЃРѕР»СЊ РёР· СЃРѕС…СЂР°РЅРµРЅРЅРѕРіРѕ С…РµС€Р°
2. РҐРµС€РёСЂСѓРµС‚ РІРІРµРґРµРЅРЅС‹Р№ РїР°СЂРѕР»СЊ СЃ СЌС‚РѕР№ Р¶Рµ СЃРѕР»СЊСЋ
3. РЎСЂР°РІРЅРёРІР°РµС‚ РїРѕР»СѓС‡РµРЅРЅС‹Р№ С…РµС€ СЃ СЃРѕС…СЂР°РЅРµРЅРЅС‹Рј
4. Р’РѕР·РІСЂР°С‰Р°РµС‚ `true` РµСЃР»Рё СЃРѕРІРїР°РґР°СЋС‚, `false` РµСЃР»Рё РЅРµС‚

**РџСЂРёРјРµСЂ:**
```javascript
// РЎРѕС…СЂР°РЅРµРЅРЅС‹Р№ hash
const storedHash = "$2b$10$N9qo8uLOXVOA...";

// РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РІРІРѕРґРёС‚
const inputPassword = "REDACTED_ADMIN_PASSWORD";

// bcrypt.compare РґРµР»Р°РµС‚:
1. РР·РІР»РµРєР°РµС‚ salt: "N9qo8uLOXVOA"
2. РҐРµС€РёСЂСѓРµС‚: hash("REDACTED_ADMIN_PASSWORD" + salt, 10 rounds)
3. РџРѕР»СѓС‡Р°РµС‚: "$2b$10$N9qo8uLOXVOA..."
4. РЎСЂР°РІРЅРёРІР°РµС‚: stored === computed в†’ true вњ…
```

**РџРѕС‡РµРјСѓ generic error message:**
```javascript
// вќЊ РџР›РћРҐРћ - СЂР°СЃРєСЂС‹РІР°РµРј РёРЅС„РѕСЂРјР°С†РёСЋ
if (!user) return res.json({ error: 'User not found' });
if (!passwordMatch) return res.json({ error: 'Wrong password' });

// вњ… РҐРћР РћРЁРћ - РѕРґРёРЅР°РєРѕРІРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ
if (!user || !passwordMatch) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```
Р—Р»РѕСѓРјС‹С€Р»РµРЅРЅРёРє РЅРµ СѓР·РЅР°РµС‚, СЃСѓС‰РµСЃС‚РІСѓРµС‚ Р»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РёР»Рё РїСЂРѕСЃС‚Рѕ РЅРµРІРµСЂРЅС‹Р№ РїР°СЂРѕР»СЊ.

---

## 6пёЏвѓЈ РЎРћР—Р”РђРќРР• РЎР•РЎРЎРР РџРћРЎР›Р• Р›РћР“РРќРђ
**Р¤Р°Р№Р»:** [server.js](server.js) **СЃС‚СЂРѕРєРё 245-265**

### РљРѕРґ:
```javascript
// РЎРѕР·РґР°РµРј РѕР±СЉРµРєС‚ СЃРµСЃСЃРёРё
req.session.user = {
  id: user._id.toString(),
  username: user.username,
  role: user.role,
  email: user.email,
  fullName: user.fullName
  // вљ пёЏ РќР• РЎРћРҐР РђРќРЇР•Рњ PASSWORD!
};

// РЇРІРЅРѕ СЃРѕС…СЂР°РЅСЏРµРј СЃРµСЃСЃРёСЋ РІ MongoDB
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
```

### рџ“– РћР±СЉСЏСЃРЅРµРЅРёРµ:

**Р§С‚Рѕ РїСЂРѕРёСЃС…РѕРґРёС‚:**
1. РЎРѕР·РґР°РµС‚СЃСЏ РѕР±СЉРµРєС‚ `req.session.user` СЃ РґР°РЅРЅС‹РјРё РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
2. `req.session.save()` СЃРѕС…СЂР°РЅСЏРµС‚ РІ MongoDB (РєРѕР»Р»РµРєС†РёСЏ 'sessions')
3. Express-session РіРµРЅРµСЂРёСЂСѓРµС‚ СѓРЅРёРєР°Р»СЊРЅС‹Р№ session ID
4. Session ID РѕС‚РїСЂР°РІР»СЏРµС‚СЃСЏ РєР»РёРµРЅС‚Сѓ РІ HttpOnly cookie
5. РљР»РёРµРЅС‚ РїРѕР»СѓС‡Р°РµС‚ JSON СЃ СѓСЃРїРµС…РѕРј

**РЎС‚СЂСѓРєС‚СѓСЂР° РІ MongoDB:**
```javascript
{
  _id: "vF3k9mL2pQ1...",  // в†ђ Session ID (РѕС‚РїСЂР°РІР»СЏРµС‚СЃСЏ РІ cookie)
  expires: ISODate("2026-02-06T12:00:00Z"),
  session: {
    cookie: { 
      httpOnly: true, 
      secure: false, 
      maxAge: 86400000 
    },
    user: {
      id: "65abc123...",
      username: "admin",
      role: "admin",
      email: "admin@comforthoetel.com",
      fullName: "Administrator"
    }
  }
}
```

**Р’Р°Р¶РЅРѕ:**
- РџР°СЂРѕР»СЊ РќР• С…СЂР°РЅРёС‚СЃСЏ РІ СЃРµСЃСЃРёРё (С‚РѕР»СЊРєРѕ РІ users РєРѕР»Р»РµРєС†РёРё РІ С…РµС€РёСЂРѕРІР°РЅРЅРѕРј РІРёРґРµ)
- Session ID РґР»РёРЅРЅР°СЏ СЃР»СѓС‡Р°Р№РЅР°СЏ СЃС‚СЂРѕРєР° (РЅРµРІРѕР·РјРѕР¶РЅРѕ СѓРіР°РґР°С‚СЊ)
- TTL РІ MongoDB Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё СѓРґР°Р»РёС‚ С‡РµСЂРµР· 24 С‡Р°СЃР°

---

## 7пёЏвѓЈ LOGOUT - РЈРќРР§РўРћР–Р•РќРР• РЎР•РЎРЎРР
**Р¤Р°Р№Р»:** [server.js](server.js) **СЃС‚СЂРѕРєРё 341-350**

### РљРѕРґ:
```javascript
app.post('/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    // РЈРґР°Р»СЏРµРј cookie РёР· Р±СЂР°СѓР·РµСЂР°
    res.clearCookie('sessionId');
    
    res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
});
```

### рџ“– РћР±СЉСЏСЃРЅРµРЅРёРµ:

**Р§С‚Рѕ РґРµР»Р°РµС‚ `req.session.destroy()`:**
1. РЈРґР°Р»СЏРµС‚ СЃРµСЃСЃРёСЋ РёР· MongoDB (РїРѕ session ID)
2. РћС‡РёС‰Р°РµС‚ `req.session` РѕР±СЉРµРєС‚ РІ РїР°РјСЏС‚Рё
3. Session ID СЃС‚Р°РЅРѕРІРёС‚СЃСЏ РЅРµРІР°Р»РёРґРЅС‹Рј

**Р§С‚Рѕ РґРµР»Р°РµС‚ `res.clearCookie('sessionId')`:**
1. РћС‚РїСЂР°РІР»СЏРµС‚ Р±СЂР°СѓР·РµСЂСѓ РєРѕРјР°РЅРґСѓ СѓРґР°Р»РёС‚СЊ cookie
2. Set-Cookie: sessionId=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970
3. Р‘СЂР°СѓР·РµСЂ СѓРґР°Р»СЏРµС‚ cookie

**РџРѕСЃР»Рµ logout:**
- Cookie СѓРґР°Р»РµРЅ РёР· Р±СЂР°СѓР·РµСЂР°
- РЎРµСЃСЃРёСЏ СѓРґР°Р»РµРЅР° РёР· MongoDB
- РЎР»РµРґСѓСЋС‰РёР№ Р·Р°РїСЂРѕСЃ в†’ 401 Unauthorized

---

## 8пёЏвѓЈ РљРђРљ Р РђР‘РћРўРђР•Рў РђР’РўРћРњРђРўРР§Р•РЎРљРђРЇ РџР РћР’Р•Р РљРђ РЎР•РЎРЎРР

### РџРѕС‚РѕРє Р·Р°РїСЂРѕСЃР°:

```
1. Р‘СЂР°СѓР·РµСЂ РґРµР»Р°РµС‚ Р·Р°РїСЂРѕСЃ
   GET /api/bookings
   Cookie: sessionId=vF3k9mL2pQ1...
   
2. Express-session middleware РїРµСЂРµС…РІР°С‚С‹РІР°РµС‚
   - Р§РёС‚Р°РµС‚ session ID РёР· cookie
   - РС‰РµС‚ РІ MongoDB РїРѕ СЌС‚РѕРјСѓ ID
   - Р—Р°РіСЂСѓР¶Р°РµС‚ РґР°РЅРЅС‹Рµ РІ req.session
   
3. РќР°С€ middleware isAuthenticated РїСЂРѕРІРµСЂСЏРµС‚
   if (req.session && req.session.user) { ... }
   
4. Р•СЃР»Рё OK в†’ next() в†’ РѕР±СЂР°Р±РѕС‚С‡РёРє РјР°СЂС€СЂСѓС‚Р°
   Р•СЃР»Рё NOT OK в†’ 401 error
```

### Р’РёР·СѓР°Р»РёР·Р°С†РёСЏ:

```
в”Њв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”ђ                  в”Њв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”ђ                 в”Њв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”ђ
в”‚ Browser  в”‚                  в”‚  Server  в”‚                 в”‚ MongoDB  в”‚
в””в”Ђв”Ђв”Ђв”Ђв”¬в”Ђв”Ђв”Ђв”Ђв”Ђв”                  в””в”Ђв”Ђв”Ђв”Ђв”¬в”Ђв”Ђв”Ђв”Ђв”Ђв”                 в””в”Ђв”Ђв”Ђв”Ђв”¬в”Ђв”Ђв”Ђв”Ђв”Ђв”
     в”‚                             в”‚                            в”‚
     в”‚ POST /admin/login           в”‚                            в”‚
     в”њв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ>в”‚                            в”‚
     в”‚ {username, password}        в”‚                            в”‚
     в”‚                             в”‚ Find user                  в”‚
     в”‚                             в”њв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ>в”‚
     в”‚                             в”‚                            в”‚
     в”‚                             в”‚ bcrypt.compare()           в”‚
     в”‚                             в”‚ вњ… Match!                  в”‚
     в”‚                             в”‚                            в”‚
     в”‚                             в”‚ Save session               в”‚
     в”‚                             в”њв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ>в”‚
     в”‚                             в”‚ {user: {...}, cookie: {}}  в”‚
     в”‚                             в”‚                            в”‚
     в”‚ Set-Cookie: sessionId=abc   в”‚                            в”‚
     в”‚<в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”¤                            в”‚
     в”‚                             в”‚                            в”‚
     в”‚ GET /api/bookings           в”‚                            в”‚
     в”њв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ>в”‚                            в”‚
     в”‚ Cookie: sessionId=abc       в”‚                            в”‚
     в”‚                             в”‚ Find session by ID         в”‚
     в”‚                             в”њв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ>в”‚
     в”‚                             в”‚<в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”¤
     в”‚                             в”‚ {user: {role: "admin"}}    в”‚
     в”‚                             в”‚                            в”‚
     в”‚                             в”‚ isAuthenticated вњ…         в”‚
     в”‚                             в”‚ в†’ next()                   в”‚
     в”‚                             в”‚                            в”‚
     в”‚ 200 OK [{booking1}, ...]    в”‚                            в”‚
     в”‚<в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”¤                            в”‚
```

---

## 9пёЏвѓЈ PROTECTED ROUTES - РџР РРњР•Р Р« РРЎРџРћР›Р¬Р—РћР’РђРќРРЇ

**Р¤Р°Р№Р»:** [server.js](server.js) **СЃС‚СЂРѕРєРё 642, 717, 810**

### РљРѕРґ:
```javascript
// РЎРѕР·РґР°РЅРёРµ - Р»СЋР±РѕР№ Р·Р°Р»РѕРіРёРЅРµРЅРЅС‹Р№
app.post('/api/bookings', isAuthenticated, async (req, res) => {
  // created_by = req.session.user.username
  ...
});

// РћР±РЅРѕРІР»РµРЅРёРµ - С‚РѕР»СЊРєРѕ ADMIN
app.put('/api/bookings/:id', isAdmin, async (req, res) => {
  // updated_by = req.session.user.username
  ...
});

// РЈРґР°Р»РµРЅРёРµ - С‚РѕР»СЊРєРѕ ADMIN
app.delete('/api/bookings/:id', isAdmin, async (req, res) => {
  ...
});
```

### рџ“– РћР±СЉСЏСЃРЅРµРЅРёРµ:

**Р Р°Р·РіСЂР°РЅРёС‡РµРЅРёРµ РїСЂР°РІ:**
- `POST` (СЃРѕР·РґР°РЅРёРµ) в†’ `isAuthenticated` в†’ admin Р manager
- `PUT` (СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ) в†’ `isAdmin` в†’ С‚РѕР»СЊРєРѕ admin
- `DELETE` (СѓРґР°Р»РµРЅРёРµ) в†’ `isAdmin` в†’ С‚РѕР»СЊРєРѕ admin
- `GET` (С‡С‚РµРЅРёРµ) в†’ Р±РµР· middleware в†’ РІСЃРµ (РґР»СЏ РґРµРјРѕРЅСЃС‚СЂР°С†РёРё)

**Audit trail:**
```javascript
{
  ...bookingData,
  created_at: new Date(),
  created_by: req.session.user.username,  // в†ђ РљС‚Рѕ СЃРѕР·РґР°Р»
  updated_at: new Date(),
  updated_by: req.session.user.username   // в†ђ РљС‚Рѕ РѕР±РЅРѕРІРёР»
}
```

---

## рџ”џ РџР РћР’Р•Р РљРђ Р РћР›Р РџР Р Р РђР—Р”Р•Р›Р•РќРќРћРњ Р›РћР“РРќР•

**Р¤Р°Р№Р»:** [server.js](server.js) **СЃС‚СЂРѕРєРё 228-235 Рё 298-305**

### РљРѕРґ:
```javascript
// Admin Login
app.post('/admin/login', async (req, res) => {
  ...
  // РџР РћР’Р•Р РљРђ: РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ Р”РћР›Р–Р•Рќ Р±С‹С‚СЊ Р°РґРјРёРЅРѕРј
  if (user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin privileges required.',
      hint: 'Please use the User Login page'
    });
  }
  ...
});

// User Login
app.post('/user/login', async (req, res) => {
  ...
  // РџР РћР’Р•Р РљРђ: РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РќР• РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ Р°РґРјРёРЅРѕРј
  if (user.role === 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Please use Admin Login.',
      hint: 'Administrators must login through /admin'
    });
  }
  ...
});
```

### рџ“– РћР±СЉСЏСЃРЅРµРЅРёРµ:

**Р—Р°С‡РµРј СЂР°Р·РґРµР»РµРЅРёРµ:**
- Р§РµС‚РєРѕРµ СЂР°Р·РіСЂР°РЅРёС‡РµРЅРёРµ С‚РѕС‡РµРє РІС…РѕРґР°
- Р Р°Р·РЅС‹Рµ СЃС‚СЂР°РЅРёС†С‹ РґР»СЏ СЂР°Р·РЅС‹С… СЂРѕР»РµР№
- Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅР°СЏ РїСЂРѕРІРµСЂРєР° РЅР° СѓСЂРѕРІРЅРµ РІС…РѕРґР°
- Р›СѓС‡С€РёР№ UX (РїРѕРЅСЏС‚РЅРѕ РєСѓРґР° Р·Р°С…РѕРґРёС‚СЊ)

**Р§С‚Рѕ РїСЂРѕРёСЃС…РѕРґРёС‚:**
1. Manager РїС‹С‚Р°РµС‚СЃСЏ Р·Р°Р№С‚Рё С‡РµСЂРµР· `/admin` в†’ 403 + РїРѕРґСЃРєР°Р·РєР°
2. Admin РїС‹С‚Р°РµС‚СЃСЏ Р·Р°Р№С‚Рё С‡РµСЂРµР· `/user` в†’ 403 + РїРѕРґСЃРєР°Р·РєР°
3. РљР°Р¶РґС‹Р№ РґРѕР»Р¶РµРЅ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ СЃРІРѕР№ endpoint

---

## вњ… РљР›Р®Р§Р•Р’Р«Р• РњРћРњР•РќРўР« Р”Р›РЇ Р”Р•РњРћРќРЎРўР РђР¦РР

### 1. РџРѕРєР°Р·Р°С‚СЊ Cookie РІ DevTools:
```
Application в†’ Cookies в†’ http://localhost:3000
- Name: sessionId
- Value: vF3k9mL2pQ1... (РґР»РёРЅРЅР°СЏ СЃС‚СЂРѕРєР°)
- HttpOnly: вњ… (РіР°Р»РѕС‡РєР°)
- Secure: depends on environment
- SameSite: Lax/Strict
```

### 2. РџРѕРєР°Р·Р°С‚СЊ Session РІ MongoDB:
```
use assignment3
db.sessions.findOne()

Р РµР·СѓР»СЊС‚Р°С‚:
{
  _id: "vF3k9mL2pQ1...",
  session: {
    cookie: {...},
    user: {username: "admin", role: "admin"}
  },
  expires: ISODate(...)
}
```

### 3. РџРѕРєР°Р·Р°С‚СЊ Hashed Password:
```
db.users.findOne({username: "admin"})

password: "$2b$10$N9qo8uLOXVOAkOdCfOYNueshI3SL0SqEhZzMNBxvl.hN2RBhqMfai"
          в†‘ РќРµРІРѕР·РјРѕР¶РЅРѕ РїРѕР»СѓС‡РёС‚СЊ "REDACTED_ADMIN_PASSWORD" РѕР±СЂР°С‚РЅРѕ!
```

### 4. РџРѕРєР°Р·Р°С‚СЊ Protected Route:
```
1. Logout (session destroyed)
2. Try: POST /api/bookings
3. Result: 401 Unauthorized
4. Login again
5. Try: POST /api/bookings
6. Result: 201 Created вњ…
```

---

## рџЋЇ Р‘Р«РЎРўР Р«Р• РћРўР’Р•РўР« РќРђ Р’РћРџР РћРЎР«

**Q: Р“РґРµ С…СЂР°РЅСЏС‚СЃСЏ СЃРµСЃСЃРёРё?**
A: Р’ MongoDB, РєРѕР»Р»РµРєС†РёСЏ 'sessions', TTL 24 С‡Р°СЃР°

**Q: Р§С‚Рѕ РІ cookie?**
A: РўРѕР»СЊРєРѕ session ID (РґР»РёРЅРЅР°СЏ СЃР»СѓС‡Р°Р№РЅР°СЏ СЃС‚СЂРѕРєР°), РќР• РґР°РЅРЅС‹Рµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ

**Q: РџРѕС‡РµРјСѓ HttpOnly?**
A: JavaScript РЅРµ РјРѕР¶РµС‚ СѓРєСЂР°СЃС‚СЊ cookie С‡РµСЂРµР· XSS Р°С‚Р°РєСѓ

**Q: РљР°Рє РїСЂРѕРІРµСЂСЏРµС‚СЃСЏ РїР°СЂРѕР»СЊ?**
A: bcrypt.compare() С…РµС€РёСЂСѓРµС‚ РІРІРµРґРµРЅРЅС‹Р№ РїР°СЂРѕР»СЊ Рё СЃСЂР°РІРЅРёРІР°РµС‚ СЃ СЃРѕС…СЂР°РЅРµРЅРЅС‹Рј С…РµС€РµРј

**Q: РњРѕР¶РЅРѕ Р»Рё РїРѕР»СѓС‡РёС‚СЊ РїР°СЂРѕР»СЊ РёР· С…РµС€Р°?**
A: РќРµС‚, bcrypt - РѕРґРЅРѕСЃС‚РѕСЂРѕРЅРЅСЏСЏ С„СѓРЅРєС†РёСЏ, РЅРµРѕР±СЂР°С‚РёРјР°СЏ

**Q: Р Р°Р·РЅРёС†Р° isAuthenticated Рё isAdmin?**
A: isAuthenticated РїСЂРѕРІРµСЂСЏРµС‚ Р·Р°Р»РѕРіРёРЅРµРЅ Р»Рё, isAdmin РїСЂРѕРІРµСЂСЏРµС‚ СЂРѕР»СЊ

**Q: Р§С‚Рѕ РїСЂРѕРёСЃС…РѕРґРёС‚ РїСЂРё logout?**
A: РЎРµСЃСЃРёСЏ СѓРґР°Р»СЏРµС‚СЃСЏ РёР· MongoDB, cookie СѓРґР°Р»СЏРµС‚СЃСЏ РёР· Р±СЂР°СѓР·РµСЂР°

---

## рџ“љ Р¤РђР™Р›Р« Р”Р›РЇ РР—РЈР§Р•РќРРЇ

1. **[server.js](server.js)** - РѕСЃРЅРѕРІРЅР°СЏ Р»РѕРіРёРєР° (СЃС‚СЂРѕРєРё 18-43, 48-85, 203-350)
2. **[init-users.js](init-users.js)** - СЃРѕР·РґР°РЅРёРµ РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№ СЃ bcrypt
3. **[admin-dashboard.html](views/admin-dashboard.html)** - РїСЂРѕРІРµСЂРєР° СЂРѕР»Рё РЅР° РєР»РёРµРЅС‚Рµ (СЃС‚СЂРѕРєРё 337-355, 435-445)

---

**рџЋ“ РЈРґР°С‡Рё РЅР° Р·Р°С‰РёС‚Рµ! Р­С‚РѕС‚ РґРѕРєСѓРјРµРЅС‚ СЃРѕРґРµСЂР¶РёС‚ РІСЃРµ РєР»СЋС‡РµРІС‹Рµ РјРѕРјРµРЅС‚С‹ РґР»СЏ РѕР±СЉСЏСЃРЅРµРЅРёСЏ РїСЂРµРїРѕРґР°РІР°С‚РµР»СЋ.**
