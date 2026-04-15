# API Documentation

Base URL: `http://localhost:3000/api/v1`

---

## Authentication

All protected endpoints require `Authorization: Bearer <token>` header.

### Register User

**POST** `/auth/register`

Request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response (201):

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2026-04-12T10:00:00.000Z"
}
```

Errors:

- 400: Validation error (missing fields, invalid email)
- 409: Email already exists

---

### Login

**POST** `/auth/login`

Request:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response (200):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

Errors:

- 401: Invalid credentials

---

## Admin - User Management

### List All Users

**GET** `/admin/users`

Headers: `Authorization: Bearer <admin_token>`

Query Params:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |

Response (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2026-04-12T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

Errors:

- 401: Unauthorized (not logged in)
- 403: Forbidden (not admin)

---

### Update User Role

**PATCH** `/admin/users/:id/role`

Headers: `Authorization: Bearer <admin_token>`

Request:

```json
{
  "role": "admin"
}
```

Response (200):

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "updatedAt": "2026-04-12T11:00:00.000Z"
}
```

Errors:

- 401: Unauthorized
- 403: Forbidden (not admin)
- 404: User not found
- 409: Cannot demote last admin

---

## Admin - Grocery Management

### List All Items (Admin)

**GET** `/admin/items`

Headers: `Authorization: Bearer <admin_token>`

Query Params:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |

Response (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Organic Apples",
      "description": "Fresh organic apples from local farm",
      "price": 4.99,
      "inventory_count": 100,
      "is_active": true,
      "createdAt": "2026-04-10T10:00:00.000Z",
      "updatedAt": "2026-04-12T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### Create Grocery Item

**POST** `/admin/items`

Headers: `Authorization: Bearer <admin_token>`

Request:

```json
{
  "name": "Organic Apples",
  "description": "Fresh organic apples from local farm",
  "price": 4.99,
  "inventory_count": 100
}
```

Response (201):

```json
{
  "id": "uuid",
  "name": "Organic Apples",
  "description": "Fresh organic apples from local farm",
  "price": 4.99,
  "inventory_count": 100,
  "is_active": true,
  "createdAt": "2026-04-12T10:00:00.000Z",
  "updatedAt": "2026-04-12T10:00:00.000Z"
}
```

Errors:

- 400: Validation error

---

### Update Grocery Item

**PUT** `/admin/items/:id`

Headers: `Authorization: Bearer <admin_token>`

Request:

```json
{
  "name": "Organic Apples (Premium)",
  "description": "Updated description",
  "price": 5.99
}
```

Response (200):

```json
{
  "id": "uuid",
  "name": "Organic Apples (Premium)",
  "description": "Updated description",
  "price": 5.99,
  "inventory_count": 100,
  "is_active": true,
  "updatedAt": "2026-04-12T11:00:00.000Z"
}
```

Errors:

- 404: Item not found
- 422: Cannot reduce inventory below reserved quantity

---

### Delete Grocery Item (Soft Delete)

**DELETE** `/admin/items/:id`

Headers: `Authorization: Bearer <admin_token>`

Response (204): No content

Errors:

- 404: Item not found

---

### Adjust Inventory

**PATCH** `/admin/items/:id/inventory`

Headers: `Authorization: Bearer <admin_token>`

Request:

```json
{
  "inventory_count": 50
}
```

Response (200):

```json
{
  "id": "uuid",
  "name": "Organic Apples",
  "inventory_count": 50,
  "updatedAt": "2026-04-12T11:00:00.000Z"
}
```

Errors:

- 400: Invalid value (must be >= 0)
- 422: Cannot reduce below reserved quantity

---

## User - Browse & Order

### List Available Items

**GET** `/items`

Query Params:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| search | string | - | Search by name |

Response (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Organic Apples",
      "description": "Fresh organic apples from local farm",
      "price": 4.99,
      "inventory_count": 100
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

Note: Only items with `inventory_count > 0` and `is_active = true` are returned.

---

### Create Order

**POST** `/orders`

Headers: `Authorization: Bearer <user_token>`

Request:

```json
{
  "items": [
    {
      "grocery_item_id": "uuid-1",
      "quantity": 2
    },
    {
      "grocery_item_id": "uuid-2",
      "quantity": 1
    }
  ]
}
```

Response (201):

```json
{
  "id": "uuid",
  "status": "confirmed",
  "total_price": 14.97,
  "user_id": "uuid",
  "createdAt": "2026-04-12T10:00:00.000Z",
  "items": [
    {
      "id": "uuid",
      "grocery_item_id": "uuid-1",
      "grocery_item_name": "Organic Apples",
      "quantity": 2,
      "unit_price": 4.99
    },
    {
      "id": "uuid",
      "grocery_item_id": "uuid-2",
      "grocery_item_name": "Organic Milk",
      "quantity": 1,
      "unit_price": 4.99
    }
  ]
}
```

Errors:

- 400: Validation error (empty items, invalid quantity)
- 404: Grocery item not found
- 422: Insufficient inventory for item: Organic Apples (available: 1)

---

### Get My Orders

**GET** `/orders/my`

Headers: `Authorization: Bearer <user_token>`

Query Params:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| status | string | - | Filter by status (confirmed, cancelled) |

Response (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "status": "confirmed",
      "total_price": 14.97,
      "createdAt": "2026-04-12T10:00:00.000Z",
      "items": [
        {
          "grocery_item_name": "Organic Apples",
          "quantity": 2,
          "unit_price": 4.99
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### Cancel Order

**DELETE** `/orders/:id`

Headers: `Authorization: Bearer <user_token>`

Response (200):

```json
{
  "message": "Order cancelled successfully"
}
```

Errors:

- 401: Unauthorized
- 403: Not your order
- 404: Order not found
- 422: Order already cancelled

Note: Cancelled orders have their inventory restored automatically.

---

## Error Response Format

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## HTTP Status Codes

| Code | Description                          |
| ---- | ------------------------------------ |
| 200  | OK - Successful GET, PATCH           |
| 201  | Created - Successful POST            |
| 204  | No Content - Successful DELETE       |
| 400  | Bad Request - Validation error       |
| 401  | Unauthorized - Missing/invalid token |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist   |
| 409  | Conflict - Duplicate email, etc.     |
| 422  | Unprocessable - Business logic error |
| 500  | Internal Server Error                |

---

## Rate Limiting

- 100 requests per 15 minutes per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Pagination

All list endpoints support pagination:

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```
