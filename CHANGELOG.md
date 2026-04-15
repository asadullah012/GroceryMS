# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-13

### Added

- User authentication with JWT (register, login)
- Admin and User role-based access control
- Grocery item management (CRUD for admin)
- Order creation with inventory management
- Order cancellation with inventory restoration
- Swagger API documentation
- Health check endpoint
- Rate limiting (100 requests per 15 minutes)
- Helmet security headers
- Request ID tracking for logging
- Graceful shutdown handling
- Docker and docker-compose support
- GitHub Actions CI/CD pipeline

### Security

- JWT secret validation (no fallback in production)
- Password hashing with bcrypt (12 rounds)
- Input validation with class-validator
- CORS configuration
- Helmet.js security headers

### Database

- PostgreSQL with TypeORM
- UUID primary keys
- Soft delete for grocery items
- Transaction support for orders
- Proper indexes for query optimization
