# TaskForge – Freelance Project Marketplace

> **Internship Assignment Submission**  
> A production-ready freelance marketplace with clean backend architecture, JWT auth system, role-based access control, and a responsive React frontend.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Setup & Installation](#setup--installation)
7. [Environment Variables](#environment-variables)
8. [Design Decisions](#design-decisions)

---

## Project Overview

TaskForge is a marketplace where:
- **Clients** post projects and manage bids
- **Freelancers** browse projects and submit competitive proposals
- **Admins** oversee and moderate the entire platform

The complete user journey:
```
Client posts project → Freelancer bids → Client accepts bid →
Freelancer delivers → Client confirms → Both leave reviews
```

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Runtime     | Node.js v18+                        |
| Framework   | Express.js                          |
| Database    | PostgreSQL (via Prisma ORM)         |
| Auth        | JWT (Access + Refresh Tokens)       |
| Password    | bcryptjs (salt rounds = 10)         |
| Validation  | Zod (schema-first validation)       |
| Email       | Nodemailer (SMTP)                   |
| Security    | Helmet, CORS, express-rate-limit    |
| Frontend    | React (Vite), Vanilla CSS           |
| HTTP Client | Axios (with token refresh interceptor) |

---

## Folder Structure

```
Freelance Project Marketplace/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Full DB schema (7 tables)
│   │   └── seed.js             # Admin user seeder
│   ├── src/
│   │   ├── config/             # DB, JWT, Email configuration
│   │   ├── controllers/        # HTTP request handlers (thin layer)
│   │   ├── services/           # Business logic (ownership, rules)
│   │   ├── repositories/       # Data access (Prisma queries)
│   │   ├── routes/             # Express route definitions
│   │   ├── middleware/         # Auth, authorize, validate, errorHandler
│   │   ├── validators/         # Zod schemas for all request bodies
│   │   └── utils/              # ApiError, ApiResponse, jwt, password, email
│   ├── server.js               # HTTP server entry point
│   ├── .env.example            # Environment variable template
│   └── package.json
└── frontend/
    ├── src/
    │   ├── context/            # AuthContext (global auth state)
    │   ├── services/           # API client (Axios)
    │   ├── components/         # Navbar, ProjectCard, ProtectedRoute
    │   ├── pages/              # All page components
    │   └── index.css           # Complete CSS design system
    ├── .env                    # VITE_API_URL
    └── package.json
```

---

## Database Schema

### Entity Relationship Overview

```
users
  ├── projects (clientId → users.id)
  ├── bids (freelancerId → users.id)
  ├── reviews_given (reviewerId → users.id)
  └── reviews_received (targetId → users.id)

projects
  ├── bids (projectId → projects.id)
  ├── winning_bid (winningBidId → bids.id)
  └── reviews (projectId → projects.id)

bids
  └── UNIQUE(projectId, freelancerId) — one bid per freelancer per project

reviews
  └── UNIQUE(projectId, reviewerId) — one review per reviewer per project
```

### Tables

| Table              | Purpose                                          |
|--------------------|--------------------------------------------------|
| `users`            | All platform users (CLIENT, FREELANCER, ADMIN)  |
| `projects`         | Project listings created by clients              |
| `bids`             | Freelancer bids on projects                      |
| `reviews`          | Post-completion reviews                          |
| `refresh_tokens`   | Persisted refresh tokens for JWT rotation        |
| `verification_tokens` | Email verification & password reset tokens   |

---

## API Reference

All endpoints prefixed with `/api/v1`.

### Authentication

| Method | Endpoint                   | Description              | Auth     |
|--------|----------------------------|--------------------------|----------|
| POST   | `/auth/register`           | Register (CLIENT/FREELANCER) | Public |
| POST   | `/auth/login`              | Login, get JWT tokens    | Public   |
| POST   | `/auth/logout`             | Invalidate refresh token | Public   |
| POST   | `/auth/refresh-token`      | Get new access token     | Public   |
| POST   | `/auth/verify-email`       | Verify email address     | Public   |
| POST   | `/auth/forgot-password`    | Send reset email         | Public   |
| POST   | `/auth/reset-password`     | Reset with token         | Public   |

### Projects

| Method | Endpoint                   | Description              | Auth         |
|--------|----------------------------|--------------------------|--------------|
| POST   | `/projects`                | Create project           | CLIENT       |
| GET    | `/projects`                | List (paginate/filter)   | Public       |
| GET    | `/projects/:id`            | Get single project       | Public       |
| PUT    | `/projects/:id`            | Update (owner only)      | CLIENT       |
| DELETE | `/projects/:id`            | Delete (owner only)      | CLIENT       |
| POST   | `/projects/:id/deliver`    | Mark delivered           | FREELANCER   |
| POST   | `/projects/:id/complete`   | Mark completed           | CLIENT       |

### Bids

| Method | Endpoint                   | Description              | Auth         |
|--------|----------------------------|--------------------------|--------------|
| POST   | `/projects/:id/bids`       | Place bid                | FREELANCER   |
| GET    | `/projects/:id/bids`       | View bids (owner only)   | CLIENT       |
| PUT    | `/bids/:id`                | Update bid (owner only)  | FREELANCER   |
| DELETE | `/bids/:id`                | Withdraw bid             | FREELANCER   |
| POST   | `/bids/:id/accept`         | Accept bid               | CLIENT       |

### Reviews

| Method | Endpoint    | Description              | Auth               |
|--------|-------------|--------------------------|--------------------|
| POST   | `/reviews`  | Submit review            | CLIENT/FREELANCER  |

### Admin

| Method | Endpoint                      | Description     | Auth  |
|--------|-------------------------------|-----------------|-------|
| GET    | `/admin/users`                | List all users  | ADMIN |
| PATCH  | `/admin/users/:id/ban`        | Ban user        | ADMIN |
| PATCH  | `/admin/users/:id/unban`      | Unban user      | ADMIN |
| GET    | `/admin/projects`             | List all projects | ADMIN |

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL (local or cloud e.g. Supabase/Neon)
- A Mailtrap/SMTP account for emails

### 1. Clone & Navigate
```bash
cd "Freelance Project Marketplace"
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy and fill in environment variables
copy .env.example .env
# Edit .env with your PostgreSQL URL, JWT secrets, SMTP credentials

# Run Prisma migrations (creates all tables)
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed the admin user
npx prisma db seed

# Start the backend
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start the frontend
npm run dev
```

### 4. Access the App
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

---

## Environment Variables

### Backend (`.env`)

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="postgresql://USER:PASS@HOST:5432/taskforge_db"

# JWT (generate strong random strings)
JWT_ACCESS_SECRET=your_64_char_random_string
JWT_REFRESH_SECRET=another_64_char_random_string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL (for CORS + email links)
CLIENT_URL=http://localhost:5173

# SMTP (use Mailtrap for dev)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password
EMAIL_FROM="TaskForge <noreply@taskforge.com>"

# Admin Seed
ADMIN_EMAIL=admin@taskforge.com
ADMIN_PASSWORD=Admin@TaskForge123
```

> ⚠️ **Security:** Generate JWT secrets with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## Design Decisions

### Why Clean Architecture?
Each layer has a single responsibility:
- **Repository** → only knows about the database
- **Service** → only knows about business rules
- **Controller** → only knows about HTTP
- **Middleware** → cross-cutting concerns (auth, validation, errors)

This means you can swap Prisma for raw SQL or Express for Fastify by changing only the relevant layer.

### Why Zod for Validation?
- Schema-first approach makes the API contract explicit and self-documenting
- Zod's `parse()` strips unknown fields (prevents parameter pollution)
- Errors are automatically formatted into field-level messages by the global handler

### Why Prisma?
- Type-safe queries that catch errors at compile-time (in TypeScript) or are clear at runtime
- Migrations are version-controlled and reproducible
- The schema file is the single source of truth for the database structure

### Security Measures
1. **Anti-enumeration:** Login and forgot-password always return generic messages
2. **Token revocation:** Refresh tokens are stored in DB; logout deletes them
3. **Password resets revoke all sessions** (deleteAllRefreshTokensForUser)
4. **Banning checks** happen at login AND on every refresh token use
5. **Rate limiting** on auth routes (10 req/15min) and globally (200 req/15min)
6. **Helmet** sets 12 security headers including CSP, HSTS, X-Frame-Options

### Project Status Flow
```
OPEN → IN_PROGRESS → DELIVERED → COMPLETED
```
Each transition is validated server-side before allowing the next action.
