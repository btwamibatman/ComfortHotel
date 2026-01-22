require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
const sqlite3 = require('sqlite3').verbose();

const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, process.env.DB_PATH || 'database.sqlite');
const db = new sqlite3.Database(dbPath);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )`,
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  });
}

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.get('/search', (req, res) => {
  const q = req.query.q;

  if (!q) {
    return res.status(400).send('Missing search query');
  }

  res.send(`<h1>Search results for: ${q}</h1><a href="/">Back</a>`);
});

app.get('/item/:id', (req, res) => {
  const id = req.params.id;

  if (isNaN(id)) { 
    return res.status(400).send('<h1>400 Bad Request</h1><p>Item ID must be a number.</p>');
  }

  res.send(`<h1>Item ID: ${id}</h1><a href="/">Back</a>`);
});

app.get('/api/info', (req, res) => {
  res.status(200).json({
    project: 'Assignment 2 Part 2',
    description: 'Server-side request handling in Express.js',
    author: 'Our Team'
  });
});

app.get('/api/contacts', (req, res) => {
  db.all(
    'SELECT id, name, email, message, created_at FROM contacts ORDER BY id ASC',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.status(200).json(rows);
    }
  );
});

function parseIdParam(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return null;
  }
  return id;
}

app.get('/api/contacts/:id', (req, res) => {
  const id = parseIdParam(req, res);
  if (id === null) return;

  db.get(
    'SELECT id, name, email, message, created_at FROM contacts WHERE id = ?',
    [id],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!row) return res.status(404).json({ error: 'Contact not found' });
      res.status(200).json(row);
    }
  );
});

app.post('/api/contacts', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
    [name, email, message],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });

      const createdId = this.lastID;
      db.get(
        'SELECT id, name, email, message, created_at FROM contacts WHERE id = ?',
        [createdId],
        (err2, row) => {
          if (err2) return res.status(500).json({ error: 'Database error' });
          res.status(201).json(row);
        }
      );
    }
  );
});

app.put('/api/contacts/:id', (req, res) => {
  const id = parseIdParam(req, res);
  if (id === null) return;

  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.get(
    'SELECT id, name, email, message, created_at FROM contacts WHERE id = ?',
    [id],
    (err, existing) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!existing) return res.status(404).json({ error: 'Contact not found' });

      db.run(
        'UPDATE contacts SET name = ?, email = ?, message = ? WHERE id = ?',
        [name, email, message, id],
        (err2) => {
          if (err2) return res.status(500).json({ error: 'Database error' });
          db.get(
            'SELECT id, name, email, message, created_at FROM contacts WHERE id = ?',
            [id],
            (err3, updated) => {
              if (err3) return res.status(500).json({ error: 'Database error' });
              res.status(200).json(updated);
            }
          );
        }
      );
    }
  );
});

app.delete('/api/contacts/:id', (req, res) => {
  const id = parseIdParam(req, res);
  if (id === null) return;

  db.run('DELETE FROM contacts WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Contact not found' });
    res.status(200).json({ success: true });
  });
});


app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send('All fields are required');
  }

  const newEntry = {
    name,
    email,
    message,
    date: new Date()
  };

  db.run(
    'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
    [newEntry.name, newEntry.email, newEntry.message],
    (err) => {
      if (err) return res.status(500).send('Error saving data');
      res.send(`<h2>Thanks, ${name}! Your message has been saved.</h2><a href="/">Back</a>`);
    }
  );
});



app.use((req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

process.on('SIGINT', () => {
  db.close(() => process.exit(0));
});