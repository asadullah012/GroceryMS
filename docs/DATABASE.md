# Database Migrations & Seeds

## Migration Strategy

Using TypeORM's migration system with PostgreSQL.

### Running Migrations

```bash
# Generate migration from entities
npm run migration:generate -- src/migrations/CreateInitialSchema

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

---

## Migrations List

### 1. CreateInitialSchema

Creates all core tables with indexes.

```sql
-- Users table
CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "role" VARCHAR(10) NOT NULL DEFAULT 'user',
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_role" ON "users"("role");

-- Grocery items table
CREATE TABLE "grocery_items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(150) NOT NULL,
  "description" TEXT,
  "price" NUMERIC(10,2) NOT NULL CHECK ("price" > 0),
  "inventory_count" INTEGER NOT NULL CHECK ("inventory_count" >= 0),
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "idx_grocery_items_active" ON "grocery_items"("is_active");

-- Orders table
CREATE TABLE "orders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id"),
  "status" VARCHAR(20) NOT NULL DEFAULT 'confirmed',
  "total_price" NUMERIC(10,2) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "idx_orders_user_id" ON "orders"("user_id");
CREATE INDEX "idx_orders_status" ON "orders"("status");

-- Order items table
CREATE TABLE "order_items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" UUID NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "grocery_item_id" UUID NOT NULL REFERENCES "grocery_items"("id"),
  "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
  "unit_price" NUMERIC(10,2) NOT NULL
);

CREATE INDEX "idx_order_items_order_id" ON "order_items"("order_id");
CREATE INDEX "idx_order_items_grocery_item_id" ON "order_items"("grocery_item_id");
```

---

## Seed Data Strategy

### Admin User

Default admin credentials (change in production):

```json
{
  "name": "Admin User",
  "email": "admin@grocery.com",
  "password": "admin123"
}
```

Password: bcrypt hash with 12 rounds

### Sample Grocery Items

```json
[
  {
    "name": "Organic Apples",
    "description": "Fresh organic apples from local farm",
    "price": 4.99,
    "inventory_count": 100
  },
  {
    "name": "Organic Milk",
    "description": "Fresh organic whole milk, 1 gallon",
    "price": 6.49,
    "inventory_count": 50
  },
  {
    "name": "Whole Wheat Bread",
    "description": "Freshly baked whole wheat bread",
    "price": 3.99,
    "inventory_count": 30
  },
  {
    "name": "Free Range Eggs",
    "description": "Dozen free range eggs",
    "price": 5.99,
    "inventory_count": 40
  },
  {
    "name": "Bananas",
    "description": "Organic bananas, per bunch",
    "price": 2.49,
    "inventory_count": 80
  },
  {
    "name": "Carrots",
    "description": "Fresh organic carrots, 2lb bag",
    "price": 3.49,
    "inventory_count": 25
  },
  {
    "name": "Chicken Breast",
    "description": "Boneless skinless chicken breast, 1lb",
    "price": 8.99,
    "inventory_count": 20
  },
  {
    "name": "Orange Juice",
    "description": "Fresh squeezed orange juice, 64oz",
    "price": 5.49,
    "inventory_count": 35
  }
]
```

---

## Seeding Commands

```bash
# Run seeds
npm run seed

# Or run specific seeder
npm run seed:admin
npm run seed:items
```

---

## Rollback Strategy

- Migrations can be reverted with `npm run migration:revert`
- Seeds are not automatically reverted (manual cleanup required)
- Use transactions for multi-step operations

---

## Performance Considerations

| Optimization | Details |
|--------------|---------|
| Indexes | Created on foreign keys and frequently queried columns |
| UUIDs | Using `gen_random_uuid()` for PostgreSQL native generation |
| Soft Deletes | `is_active` flag instead of row deletion for performance |
| Batch Inserts | Use bulk inserts for seed data |