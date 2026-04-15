# Contributing to Grocery Booking System

Thank you for your interest in contributing!

## Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd GroceryMS

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start with Docker
docker-compose up -d

# Or run locally (requires PostgreSQL)
npm run start:dev
```

## Code Style

- Use TypeScript with strict mode
- Follow NestJS conventions
- Run `npm run lint` before committing
- Run `npm run format` to format code

## Testing

```bash
# Unit tests
npm run test

# Unit tests with watch
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Git Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run tests and lint
4. Commit with clear messages
5. Push and create a Pull Request

## Commit Message Format

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Questions?

Open an issue for discussion before starting major changes.
