# Grocery Booking System

**BACKEND ENGINEER ASSESSMENT**  
Analysis, Clarifications & Design Decisions | v3

---

> **Status: All decisions resolved**
>
> This document was used during the assessment phase to track design decisions. All questions (Q1-Q7) have been resolved and implemented. This serves as a historical record of the decision-making process.

---

## 1. Scope Summary

The spec defines a grocery booking system with Admin and User roles. All design decisions have been resolved (see Section 2).

| Implemented Features                                  | Status  |
| ----------------------------------------------------- | ------- |
| Admin: add, view, update, delete grocery items        | ✅ Done |
| Admin: manage inventory levels                        | ✅ Done |
| Admin: promote users to admin role                    | ✅ Done |
| User: view available grocery items                    | ✅ Done |
| User: book multiple items in a single order           | ✅ Done |
| User: cancel orders (restores inventory)              | ✅ Done |
| JWT authentication with role-based access             | ✅ Done |
| Single-step booking (book = confirm)                  | ✅ Done |
| Inventory protection (block reduction below reserved) | ✅ Done |
| Relational database (PostgreSQL)                      | ✅ Done |
| Docker containerization                               | ✅ Done |

---

## 2. Questions & Decisions

All design decisions have been confirmed and implemented.

| #      | Question                                                | Decision                                                                                    | Status       |
| ------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------ |
| **Q1** | _Who can create an Admin user?_                         | Self-registration creates User role only. Admin promotes via `PATCH /admin/users/:id/role`. | **Resolved** |
| **Q2** | _Authentication: how are roles assigned and verified?_  | JWT with role embedded in token. Server-side validation on every request.                   | **Resolved** |
| **Q3** | _Is Order Cancellation in scope?_                       | Yes. `DELETE /orders/:id` cancels order and restores inventory.                             | **Resolved** |
| **Q4** | _Book and Confirm as separate steps?_                   | No. Single-step flow: booking immediately confirms order.                                   | **Resolved** |
| **Q5** | _Inventory conflict when admin reduces below reserved?_ | Block admin. `PATCH /admin/items/:id/inventory` returns 422 if below reserved.              | **Resolved** |
| **Q6** | _Out-of-stock visibility?_                              | Hidden from users (`inventory > 0` and `is_active = true`), visible to admin.               | **Resolved** |
| **Q7** | _Pricing model?_                                        | Per-unit only. Price snapshotted at booking time.                                           | **Resolved** |

---

## 3. Technology Choices

Chosen for industry alignment, type safety, and suitability for a senior-level assessment.

| Layer      | Choice                                  | Why                                                                                                            |
| ---------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Runtime    | **Node.js + TypeScript**                | Type-safe, industry standard for REST APIs                                                                     |
| Framework  | **NestJS + Fastify**                    | Opinionated, decorator-based Node.js framework with Fastify adapter for high performance                       |
| Database   | **PostgreSQL**                          | Strong transaction support — critical for inventory safety                                                     |
| ORM        | **TypeORM**                             | Decorator-based entities, native NestJS integration, migrations support                                        |
| Auth       | **JWT + bcrypt**                        | Stateless auth; bcrypt (rounds: 12) for password hashing                                                       |
| Validation | **NestJS Validation (class-validator)** | Built-in DTO validation using class-validator decorators and ValidationPipe, no external schema library needed |
| Containers | **Docker + Compose**                    | Addresses advanced challenge; single-command local setup                                                       |

---

## 4. Database Schema

4 core tables. All order creation and inventory deduction runs inside a single PostgreSQL transaction.

### users

| Field           | Type         | Constraints        | Notes                      |
| --------------- | ------------ | ------------------ | -------------------------- |
| `id`            | UUID         | PK, auto-generated |                            |
| `name`          | VARCHAR(100) | NOT NULL           |                            |
| `email`         | VARCHAR(255) | NOT NULL, UNIQUE   | Login credential           |
| `password_hash` | TEXT         | NOT NULL           | bcrypt — never plaintext   |
| `role`          | ENUM         | DEFAULT `'user'`   | `'admin'` or `'user'` only |
| `created_at`    | TIMESTAMP    | DEFAULT NOW()      |                            |

### grocery_items

| Field             | Type          | Constraints    | Notes                                |
| ----------------- | ------------- | -------------- | ------------------------------------ |
| `id`              | UUID          | PK             |                                      |
| `name`            | VARCHAR(150)  | NOT NULL       |                                      |
| `description`     | TEXT          | NULLABLE       |                                      |
| `price`           | NUMERIC(10,2) | NOT NULL, > 0  |                                      |
| `inventory_count` | INTEGER       | NOT NULL, >= 0 | Available stock only                 |
| `is_active`       | BOOLEAN       | DEFAULT TRUE   | Soft-delete — false hides from users |
| `updated_at`      | TIMESTAMP     | DEFAULT NOW()  | Auto-updates on change               |

### orders

| Field         | Type          | Constraints           | Notes                        |
| ------------- | ------------- | --------------------- | ---------------------------- |
| `id`          | UUID          | PK                    |                              |
| `user_id`     | UUID          | FK → users.id         |                              |
| `status`      | ENUM          | DEFAULT `'confirmed'` | Status: confirmed, cancelled |
| `total_price` | NUMERIC(10,2) | NOT NULL              | Calculated at booking time   |
| `created_at`  | TIMESTAMP     | DEFAULT NOW()         |                              |

### order_items

| Field             | Type          | Constraints           | Notes                                                  |
| ----------------- | ------------- | --------------------- | ------------------------------------------------------ |
| `id`              | UUID          | PK                    |                                                        |
| `order_id`        | UUID          | FK → orders.id        |                                                        |
| `grocery_item_id` | UUID          | FK → grocery_items.id |                                                        |
| `quantity`        | INTEGER       | NOT NULL, > 0         |                                                        |
| `unit_price`      | NUMERIC(10,2) | NOT NULL              | Price snapshot at booking — preserved if price changes |

---

## 5. API Endpoints

All routes prefixed `/api/v1`. Auth via Bearer token.

### Auth (Public)

| Method | Endpoint                | Role   | Description                         |
| ------ | ----------------------- | ------ | ----------------------------------- |
| `POST` | `/api/v1/auth/register` | Public | Register — always creates User role |
| `POST` | `/api/v1/auth/login`    | Public | Returns signed JWT with role        |

### Admin — User Management

| Method  | Endpoint                       | Role  | Description                   |
| ------- | ------------------------------ | ----- | ----------------------------- |
| `GET`   | `/api/v1/admin/users`          | Admin | List all users                |
| `PATCH` | `/api/v1/admin/users/:id/role` | Admin | Promote or demote a user role |

### Admin — Grocery Management

| Method   | Endpoint                            | Role  | Description                              |
| -------- | ----------------------------------- | ----- | ---------------------------------------- |
| `GET`    | `/api/v1/admin/items`               | Admin | All items including zero-stock           |
| `POST`   | `/api/v1/admin/items`               | Admin | Add new grocery item                     |
| `PUT`    | `/api/v1/admin/items/:id`           | Admin | Update name, price, description          |
| `DELETE` | `/api/v1/admin/items/:id`           | Admin | Soft-delete (`is_active = false`)        |
| `PATCH`  | `/api/v1/admin/items/:id/inventory` | Admin | Adjust stock (blocked if below reserved) |

### User — Browse & Order

| Method   | Endpoint             | Role | Description                            |
| -------- | -------------------- | ---- | -------------------------------------- |
| `GET`    | `/api/v1/items`      | User | Available items (stock > 0, is_active) |
| `POST`   | `/api/v1/orders`     | User | Book order with multiple items         |
| `DELETE` | `/api/v1/orders/:id` | User | Cancel order (restores inventory)      |
| `GET`    | `/api/v1/orders/my`  | User | Own order history                      |

---

## 6. Order Booking Flow

Critical logic — atomic transaction prevents overselling regardless of concurrent requests.

| Step | Action                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------ |
| 1    | `POST /api/v1/orders` received with `{ items: [{ grocery_item_id, quantity }] }`                 |
| 2    | JWT validated → `user_id` and `role` extracted                                                   |
| 3    | NestJS ValidationPipe validates DTO → rejects empty arrays or non-positive quantities (HTTP 400) |
| 4    | `BEGIN TRANSACTION`                                                                              |
| 5    | `SELECT inventory_count FOR UPDATE` on each item (row-lock → prevents race conditions)           |
| 6    | If any item is understocked → `ROLLBACK`, return HTTP 422 with item name + available qty         |
| 7    | Deduct quantities from `inventory_count`                                                         |
| 8    | Calculate `total_price` = sum(`unit_price × quantity`) per line item                             |
| 9    | `INSERT` into `orders` + `INSERT` into `order_items` with price snapshot                         |
| 10   | `COMMIT` → return HTTP 201 with full order details                                               |

---

## 7. Out of Scope

Excluded to keep the assessment focused.

- Inventory conflict resolution for booked orders (policy implemented: block reduction)
- Payment gateway (Stripe, PayPal, etc.)
- Email / SMS notifications
- Product categories and image uploads
- Frontend / admin dashboard UI
- CI/CD pipeline and cloud deployment

---

## 8. Summary

All design decisions (Q1-Q7) have been resolved and implemented:

| Feature                 | Implementation                                                               |
| ----------------------- | ---------------------------------------------------------------------------- |
| Admin creation          | Self-register creates User; admin promotes via `PATCH /admin/users/:id/role` |
| Authentication          | JWT with role embedded in token                                              |
| Order cancellation      | `DELETE /orders/:id` cancels order and restores inventory                    |
| Book = Confirm          | Single-step flow with atomic transaction                                     |
| Inventory protection    | `SELECT FOR UPDATE` prevents overselling                                     |
| Out-of-stock visibility | Hidden from users, visible to admin                                          |
| Pricing                 | Per-unit with price snapshot on order                                        |
| Docker                  | Multi-stage build + Compose for local setup                                  |

---

_Analysis document — decisions resolved and implemented in v1.0.0_
