# ComfortHotel

A small hotel-style website built with **Node.js + Express**, with a **Contact** page that saves messages into a local **SQLite** database. It also includes a simple REST API to view/manage saved contacts.

## Features

- Static pages: Home, About, Contact
- Contact form submission (saves to SQLite)
- REST API (CRUD) for `contacts`
- Basic routes for query params and URL params (`/search`, `/item/:id`)
- 404 handling (HTML for normal routes, JSON for `/api/*`)

## Project Structure

```
.
в”њв”Ђв”Ђ public/          # Static files (CSS, images, etc.)
в”њв”Ђв”Ђ views/           # HTML pages
в”‚   в”њв”Ђв”Ђ index.html
в”‚   в”њв”Ђв”Ђ about.html
в”‚   в”њв”Ђв”Ђ contact.html
в”‚   в””в”Ђв”Ђ 404.html
в”њв”Ђв”Ђ server.js        # Express server + routes + SQLite setup
в”њв”Ђв”Ђ package.json
в””в”Ђв”Ђ database.sqlite  # Auto-created on first run
```

## Run Locally

1) Install dependencies:

```bash
npm install
```

2) Start the server:

```bash
npm start
```

3) Open in browser:

- `http://localhost:3000/`

## Pages (HTML)

- `GET /` вЂ” Home
- `GET /about` вЂ” About
- `GET /contact` вЂ” Contact form
- `POST /contact` вЂ” Save contact message to SQLite and return a thank-you message
- `GET /search?q=...` вЂ” Simple query param example
- `GET /item/:id` вЂ” Simple route param example (requires numeric `id`)

## REST API

Base entity: `contacts`

- `GET /api/contacts` вЂ” list all contacts (sorted by `id` ASC)
- `GET /api/contacts/:id` вЂ” get one contact
- `POST /api/contacts` вЂ” create contact (JSON)
- `PUT /api/contacts/:id` вЂ” update contact (JSON)
- `DELETE /api/contacts/:id` вЂ” delete contact

Validation behavior:

- Invalid `:id` в†’ `400` with `{ "error": "Invalid id" }`
- Missing required fields в†’ `400` with `{ "error": "Missing required fields" }`
- Not found в†’ `404` with `{ "error": "Contact not found" }`

## Database

This project uses a **local SQLite database** for development.

- The database file is created automatically when the server starts (if it doesnвЂ™t exist): `database.sqlite`
- It is intentionally **not committed** to git (see `.gitignore`) to avoid uploading personal/test data

### Setup

1) Install dependencies:

```bash
npm install
```

2) Start the server (this auto-creates the DB + `contacts` table):

```bash
npm start
```

ThatвЂ™s it вЂ” once the server starts, you can submit the contact form or use the API and records will be stored in `database.sqlite` locally.

### If you already committed the DB

If `database.sqlite` was previously added to git, remove it from tracking (without deleting your local file):

```bash
git rm --cached database.sqlite
```

Table: `contacts`

| Field | Type | Notes |
|---|---|---|
| id | INTEGER | Primary key, auto-increment |
| name | TEXT | required |
| email | TEXT | required |
| message | TEXT | required |
| created_at | TEXT | auto set by SQLite |

## Example API Requests

Create a contact:

```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Hamza\",\"email\":\"hamza@example.com\",\"message\":\"Hello!\"}"
```

List contacts:

```bash
curl http://localhost:3000/api/contacts
```
