import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { UserRole } from "../modules/users/entities/user.entity";

const getPort = (): number => {
  const port = parseInt(process.env.DB_PORT ?? "5432", 10);
  return isNaN(port) ? 5432 : port;
};

const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: getPort(),
  username: process.env.DB_USERNAME ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
  database: process.env.DB_DATABASE ?? "grocery_booking",
  synchronize: false,
});

const seedData = async () => {
  await dataSource.initialize();

  const adminPassword = await bcrypt.hash("admin123", 12);
  const userPassword = await bcrypt.hash("user123", 12);

  // Check and insert admin user
  const adminExists = await dataSource.query(
    `SELECT id FROM users WHERE email = $1`,
    ["admin@grocery.com"],
  );
  if (adminExists.length === 0) {
    await dataSource.query(
      `INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
       VALUES (gen_random_uuid(), 'Admin User', 'admin@grocery.com', $1, $2, NOW(), NOW())`,
      [adminPassword, UserRole.ADMIN],
    );
    console.log("Admin user created: admin@grocery.com / admin123");
  }

  // Check and insert test user
  const userExists = await dataSource.query(
    `SELECT id FROM users WHERE email = $1`,
    ["user@example.com"],
  );
  if (userExists.length === 0) {
    await dataSource.query(
      `INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
       VALUES (gen_random_uuid(), 'Test User', 'user@example.com', $1, $2, NOW(), NOW())`,
      [userPassword, UserRole.USER],
    );
    console.log("Test user created: user@example.com / user123");
  }

  const groceryItems = [
    {
      name: "Organic Apples",
      description: "Fresh organic apples from local farm",
      price: 4.99,
      inventory_count: 100,
    },
    {
      name: "Organic Milk",
      description: "Fresh organic whole milk, 1 gallon",
      price: 6.49,
      inventory_count: 50,
    },
    {
      name: "Whole Wheat Bread",
      description: "Freshly baked whole wheat bread",
      price: 3.99,
      inventory_count: 30,
    },
    {
      name: "Free Range Eggs",
      description: "Dozen free range eggs",
      price: 5.99,
      inventory_count: 40,
    },
    {
      name: "Bananas",
      description: "Organic bananas, per bunch",
      price: 2.49,
      inventory_count: 80,
    },
    {
      name: "Carrots",
      description: "Fresh organic carrots, 2lb bag",
      price: 3.49,
      inventory_count: 25,
    },
    {
      name: "Chicken Breast",
      description: "Boneless skinless chicken breast, 1lb",
      price: 8.99,
      inventory_count: 20,
    },
    {
      name: "Orange Juice",
      description: "Fresh squeezed orange juice, 64oz",
      price: 5.49,
      inventory_count: 35,
    },
  ];

  let insertedCount = 0;
  for (const item of groceryItems) {
    const exists = await dataSource.query(
      `SELECT id FROM grocery_items WHERE name = $1`,
      [item.name],
    );
    if (exists.length === 0) {
      await dataSource.query(
        `INSERT INTO grocery_items (id, name, description, price, inventory_count, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW())`,
        [item.name, item.description, item.price, item.inventory_count],
      );
      insertedCount++;
    }
  }

  console.log(`Seed data inserted: ${insertedCount} new items`);
  console.log("Seed completed successfully");
  await dataSource.destroy();
};

seedData().catch(console.error);
