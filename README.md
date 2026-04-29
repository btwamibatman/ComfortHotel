
# Comfort Hotel

A hotel booking system built with Node.js, Express, PostgreSQL, and session-based authentication.
The project provides a public booking interface together with protected admin and staff functionality for managing hotel reservations.

## Features

- Session-based authentication with `express-session` and PostgreSQL store
- Secure password hashing with `bcrypt`
- Cookie protection with `HttpOnly`, `Secure`, and `SameSite`
- Role-based authorization for protected actions
- Full booking CRUD through a web interface
- Validation for email, phone, dates, and guest count
- Realistic hotel booking domain model

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| Session Store | connect-pg-simple |
| Authentication | express-session + bcrypt |
| Frontend | HTML, Bootstrap, Vanilla JS |

## Getting Started

### 1. Install dependencies

```bash
npm install
```
Start server
npm start

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_URL=postgres://comforthotel:comforthotel@localhost:5432/comforthotel
SESSION_SECRET=your_session_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
ADMIN_EMAIL=admin@comforthotel.local
ADMIN_FULL_NAME=Administrator
MANAGER_USERNAME=manager
MANAGER_PASSWORD=your_password
MANAGER_EMAIL=manager@comforthotel.local
MANAGER_FULL_NAME=Hotel Manager
```

### 3. Start the server

```bash
npm start
```

## Application URLs

| Route | URL |
|---|---|
| Public site | `http://localhost:3000` |
| Admin login | `http://localhost:3000/admin/login` |
| Staff login | `http://localhost:3000/staff/login` |

## Authentication and Security

This project uses session-based authentication. User credentials are verified with `bcrypt`, sessions are stored in PostgreSQL, and session IDs are transmitted via secure cookies configured with `HttpOnly`, `Secure` (production only), and `SameSite=Strict`. This helps protect the application against common attacks such as XSS and CSRF.

## Booking Model

Each booking contains the following fields: room name, room type, guest name, guest email, guest phone, check-in date, check-out date, stay duration, number of guests, total price, special requests, and booking status.

## API Overview

**Authentication**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/admin/login` | Login as admin |
| POST | `/auth/logout` | Logout |
| GET | `/api/auth/status` | Check auth status |

**Bookings**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/bookings` | Get all bookings |
| GET | `/api/bookings/:id` | Get booking by ID |
| POST | `/api/bookings` | Create booking *(protected)* |
| PUT | `/api/bookings/:id` | Update booking *(protected)* |
| DELETE | `/api/bookings/:id` | Delete booking *(protected)* |

## Validation

The application validates email format, phone format, check-in and check-out date logic, and guest count range. It returns appropriate HTTP status codes: `200`, `201`, `400`, `401`, `403`, `404`, and `500`.

## Project Structure

```
ComfortHotel/
├── server.js
├── init-users.js
├── seed-bookings.js
├── package.json
├── .env
├── database/
│   └── postgres.js
├── views/
│   ├── index.html
│   ├── admin-login.html
│   ├── admin-dashboard.html
│   ├── rooms.html
│   ├── booking.html
│   ├── about.html
│   ├── contact.html
│   └── 404.html
└── public/
    └── style.css
```

## Production Notes

Before deploying to production, make sure to:

- Set a strong `SESSION_SECRET`
- Use a production PostgreSQL database
- Enable HTTPS
- Set `NODE_ENV=production`
