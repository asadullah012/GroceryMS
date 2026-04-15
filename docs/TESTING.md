# Testing Strategy

---

## Test Pyramid

```
        /\
       /  \      E2E Tests (10%)
      /----\    (Full flow testing)
     /      \
    /--------\   Integration Tests (30%)
   /          \  (Module interaction)
  /------------\ Unit Tests (60%)
 /              \(Service logic, DTOs)
```

---

## Test Tools

| Type | Tool | Purpose |
|------|------|---------|
| Unit | Jest | Service methods, DTOs |
| Integration | Jest + TestDatabase | Repository, module integration |
| E2E | Jest + Supertest | Full HTTP request/response |

---

## Running Tests

```bash
# Unit tests
npm run test

# Unit tests with watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov

# Coverage threshold (CI)
npm run test:coverage
```

---

## Unit Tests

### Coverage Targets

- Services: 80%+
- Controllers: 70%+
- Overall: 75%+

### Test Structure

```typescript
describe('OrderService', () => {
  let service: OrderService;
  let mockRepository: Partial<OrderRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useValue: mockRepository },
      ],
    }).compile();
    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### What to Test

| Component | Test Cases |
|-----------|------------|
| **AuthService** | Register, login, validate, token generation |
| **OrderService** | Create order, calculate total, cancel order |
| **GroceryService** | CRUD operations, inventory adjustment |
| **UserService** | Role updates, user creation |
| **DTOs** | Validation rules, transform logic |

---

## Integration Tests

Using a test database (PostgreSQL in Docker).

```typescript
describe('OrdersModule (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### Test Database Setup

```yaml
# docker-compose.test.yml
services:
  test-db:
    image: postgres:latest
    environment:
      POSTGRES_DB: grocery_test
```

---

## E2E Tests

Full HTTP flow testing with authentication.

```typescript
describe('POST /api/v1/orders (E2E)', () => {
  let token: string;

  beforeAll(async () => {
    const user = await createTestUser();
    token = generateToken(user);
  });

  it('should create order successfully', async () => {
    return request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ grocery_item_id: 'uuid', quantity: 2 }],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.status).toBe('confirmed');
        expect(res.body.total_price).toBeDefined();
      });
  });

  it('should fail with insufficient inventory', async () => {
    return request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ grocery_item_id: 'uuid', quantity: 999 }],
      })
      .expect(422);
  });
});
```

---

## Mocking Strategy

| Resource | Mock | Tool |
|----------|------|------|
| Database | TypeORM repositories | jest.fn() |
| External APIs | HTTP client | nock, msw |
| File System | fs operations | mock-fs |
| Time | Date.now() | jest.useFakeTimers() |

---

## Test Fixtures

```typescript
// tests/fixtures/users.ts
export const testUser = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'user' as const,
};

// tests/fixtures/grocery-items.ts
export const testGroceryItem = {
  id: '00000000-0000-0000-0000-000000000002',
  name: 'Test Apple',
  price: 4.99,
  inventory_count: 100,
  is_active: true,
};
```

---

## CI Pipeline

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:latest
        env:
          POSTGRES_DB: grocery_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:cov
      - run: npm run test:e2e
```

---

## Test Coverage Report

| Module | Unit | Integration | E2E |
|--------|------|-------------|-----|
| Auth | ✓ | ✓ | ✓ |
| Users | ✓ | ✓ | ✓ |
| Admin | ✓ | ✓ | ✓ |
| Orders | ✓ | ✓ | ✓ |
| Grocery | ✓ | ✓ | ✓ |

---

## Best Practices

1. **AAA Pattern**: Arrange, Act, Assert
2. **One assertion per test**
3. **Descriptive test names**: `should_return_401_when_token_invalid`
4. **Isolate tests**: Each test independent
5. **Clean up**: Reset state between tests
6. **Fast tests**: Target < 100ms per unit test