import { UserRole } from "../../src/modules/users/entities/user.entity";

export const testUser = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  role: UserRole.USER,
};

export const adminUser = {
  id: "00000000-0000-0000-0000-000000000002",
  name: "Admin User",
  email: "admin@example.com",
  password: "admin123",
  role: UserRole.ADMIN,
};

export const testUserCredentials = {
  email: "test@example.com",
  password: "password123",
};

export const adminCredentials = {
  email: "admin@example.com",
  password: "admin123",
};
