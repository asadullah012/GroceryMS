# Grocery Booking System

A production-ready REST API for a grocery booking platform built with NestJS and PostgreSQL.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Security Features](#security-features)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- JWT-based user authentication
- Role-based access control (User/Admin)
- Order management with inventory tracking
- Soft-delete for grocery items
- Pagination on all list endpoints
- Rate limiting (100 req/15 min)
- Interactive API documentation (Swagger)

---

## Quick Start

### Docker (Recommended)

```bash
git clone <repo-url>
cd GroceryMS
docker-compose up -d
curl http://localhost:3000/health
```

### Local Development

```bash
npm install
cp .env.example .env
# Configure .env with your database credentials
npm run migration:run
npm run seed
npm run start:dev
```

---

## Tech Stack

| Category  | Technology       |
| --------- | ---------------- |
| Language  | TypeScript       |
| Runtime   | Node.js 18+      |
| Framework | NestJS + Fastify |
| Database  | PostgreSQL       |
| ORM       | TypeORM          |
| Auth      | JWT + bcrypt     |
| Testing   | Jest             |

---

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+ (or Docker)

---

## Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts          # Root module
├── config/               # TypeORM configuration
├── migrations/           # Database migrations
├── seeds/              # Seed data
└── modules/
    ├── auth/           # Authentication
    ├── users/          # User entity
    ├── admin/          # Admin endpoints
    ├── grocery/        # Grocery items
    ├── orders/        # Order management
    └── infra/         # Filters, interceptors, guards
```

---

## Environment Setup

Create `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=grocery_booking
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

---

## Running the Application

### Docker Compose

```bash
docker-compose up -d
docker-compose logs -f app
docker-compose down
```

### Local

```bash
npm run start:dev      # Development
npm run build        # Production build
npm run start:prod   # Production start
```

### Database Commands

```bash
npm run migration:run   # Run migrations
npm run migration:generate -- -n MigrationName  # Create migration
npm run seed         # Seed data
```

### Default Credentials

| Role  | Email             | Password |
| ----- | ----------------- | -------- |
| Admin | admin@grocery.com | admin123 |
| User  | user@example.com  | user123  |

---

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Authentication (Public)

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| POST   | `/auth/register` | Register new user |
| POST   | `/auth/login`    | Login             |

### Grocery Items (Authenticated)

| Method | Endpoint | Description          |
| ------ | -------- | -------------------- |
| GET    | `/items` | List available items |

### Orders (Authenticated)

| Method | Endpoint      | Description   |
| ------ | ------------- | ------------- |
| POST   | `/orders`     | Create order  |
| GET    | `/orders/my`  | Order history |
| DELETE | `/orders/:id` | Cancel order  |

### Admin - Users

| Method | Endpoint                | Description |
| ------ | ----------------------- | ----------- |
| GET    | `/admin/users`          | List users  |
| PATCH  | `/admin/users/:id/role` | Update role |

### Admin - Grocery

| Method | Endpoint                     | Description    |
| ------ | ---------------------------- | -------------- |
| GET    | `/admin/items`               | List all items |
| POST   | `/admin/items`               | Create item    |
| PUT    | `/admin/items/:id`           | Update item    |
| DELETE | `/admin/items/:id`           | Soft-delete    |
| PATCH  | `/admin/items/:id/inventory` | Update stock   |

### Utilities

| Method | Endpoint    | Description  |
| ------ | ----------- | ------------ |
| GET    | `/health`   | Health check |
| GET    | `/api/docs` | Swagger UI   |

---

## Testing

```bash
npm test           # Unit tests
npm run test:cov  # With coverage
```

**42 tests passing**

---

## Security Features

- JWT authentication with role-based access
- bcrypt password hashing (12 rounds)
- Rate limiting (100 req/15 min)
- CORS configuration
- Helmet security headers
- Input validation with class-validator

---

## Database Schema

### users

| Column        | Type         | Constraints      |
| ------------- | ------------ | ---------------- |
| id            | UUID         | PRIMARY KEY      |
| name          | VARCHAR(100) | NOT NULL         |
| email         | VARCHAR(255) | NOT NULL, UNIQUE |
| password_hash | TEXT         | NOT NULL         |
| role          | ENUM         | DEFAULT 'user'   |
| created_at    | TIMESTAMP    | DEFAULT NOW()    |

### grocery_items

| Column          | Type          | Constraints  |
| --------------- | ------------- | ------------ |
| id              | UUID          | PRIMARY KEY  |
| name            | VARCHAR(150)  | NOT NULL     |
| price           | NUMERIC(10,2) | NOT NULL     |
| inventory_count | INTEGER       | DEFAULT 0    |
| is_active       | BOOLEAN       | DEFAULT TRUE |

### orders

| Column      | Type          | Constraints         |
| ----------- | ------------- | ------------------- |
| id          | UUID          | PRIMARY KEY         |
| user_id     | UUID          | FOREIGN KEY         |
| status      | ENUM          | DEFAULT 'confirmed' |
| total_price | NUMERIC(10,2) | NOT NULL            |

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

---

## License

MIT
