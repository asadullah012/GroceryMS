# Error Handling & Security Configuration

---

## Error Handling

### HTTP Status Codes

| Status | Usage                                   |
| ------ | --------------------------------------- |
| 200    | Successful GET, PATCH                   |
| 201    | Successful POST (created)               |
| 204    | Successful DELETE                       |
| 400    | Validation error - invalid input        |
| 401    | Unauthorized - missing/invalid JWT      |
| 403    | Forbidden - insufficient role           |
| 404    | Not found - resource doesn't exist      |
| 409    | Conflict - duplicate email, etc.        |
| 422    | Unprocessable - business logic error    |
| 429    | Too Many Requests - rate limit exceeded |
| 500    | Internal Server Error                   |

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [{ "field": "email", "message": "Invalid email format" }]
}
```

### Exception Types

| Exception             | HTTP Code | Message               |
| --------------------- | --------- | --------------------- |
| BadRequestException   | 400       | Validation/DTO errors |
| UnauthorizedException | 401       | Missing/invalid token |
| ForbiddenException    | 403       | Role insufficient     |
| NotFoundException     | 404       | Resource not found    |
| ConflictException     | 409       | Duplicate entry       |
| HttpException         | 422       | Business logic errors |

### Global Exception Filter

All unhandled exceptions are caught by a global filter that:

- Logs error details (stack trace in development)
- Returns standardized error response
- Masks internal details in production

---

## Security Configuration

### Authentication

- **JWT-based** stateless authentication
- Token embedded: `userId`, `email`, `role`
- Expiry: 7 days (configurable via `JWT_EXPIRES_IN`)
- Algorithm: HS256
- Password hashing: bcrypt with 12 rounds

### Authorization (RBAC)

| Endpoint            | Required Role |
| ------------------- | ------------- |
| POST /auth/register | Public        |
| POST /auth/login    | Public        |
| GET /admin/\*       | Admin         |
| POST /admin/\*      | Admin         |
| PUT /admin/\*       | Admin         |
| PATCH /admin/\*     | Admin         |
| DELETE /admin/\*    | Admin         |
| GET /items          | User/Admin    |
| POST /orders        | User          |
| GET /orders/my      | User          |
| DELETE /orders/:id  | User (owner)  |

### Role Middleware

```typescript
// Guard checks token validity
// Role decorator checks authorization
@Roles("admin")
@Controller("admin")
export class AdminController {}
```

### Input Validation

Using class-validator decorators:

| Decorator       | Validation           |
| --------------- | -------------------- |
| @IsString()     | Must be string       |
| @IsEmail()      | Valid email format   |
| @IsUUID()       | Valid UUID format    |
| @IsInt()        | Integer only         |
| @Min(), @Max()  | Number range         |
| @IsEnum()       | Enum value           |
| @IsArray()      | Array type           |
| @ArrayMinSize() | Minimum array length |

### CORS Configuration

```typescript
// Allowed origins (set via CORS_ORIGIN env)
cors: {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}
```

### Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers returned**:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1713004800
- **Response on exceeded**: 429 Too Many Requests

### Helmet Headers

Security headers applied:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

### SQL Injection Prevention

- Parameterized queries via TypeORM
- No raw SQL with user input
- Input sanitization via class-validator

### Password Requirements

- Minimum 8 characters
- Store as bcrypt hash (never plaintext)
- No password in response payloads

### Default Credentials

The seed script creates a default admin account for initial setup:

| Field    | Value               |
| -------- | ------------------- |
| Email    | `admin@grocery.com` |
| Password | `admin123`          |
| Role     | `admin`             |

**Change these in production!** Remove or modify the seed data after initial setup.

---

## Environment-Specific Security

### Development

- Verbose error messages
- Stack traces visible
- CORS: all origins allowed

### Production

- Generic error messages
- Stack traces hidden
- CORS: specific origin only
- Rate limiting enabled
- Request logging enabled
