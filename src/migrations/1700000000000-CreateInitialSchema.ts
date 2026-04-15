import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialSchema1700000000000 implements MigrationInterface {
  name = "CreateInitialSchema1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(100) NOT NULL,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password_hash" TEXT NOT NULL,
        "role" VARCHAR(10) NOT NULL DEFAULT 'user',
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_users_email" ON "users"("email")`,
    );
    await queryRunner.query(`CREATE INDEX "idx_users_role" ON "users"("role")`);

    await queryRunner.query(`
      CREATE TABLE "grocery_items" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(150) NOT NULL,
        "description" TEXT,
        "price" NUMERIC(10,2) NOT NULL CHECK ("price" > 0),
        "inventory_count" INTEGER NOT NULL DEFAULT 0 CHECK ("inventory_count" >= 0),
        "is_active" BOOLEAN DEFAULT TRUE,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_grocery_items_active" ON "grocery_items"("is_active")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_grocery_items_name" ON "grocery_items"("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_grocery_items_inventory" ON "grocery_items"("inventory_count")`,
    );

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id"),
        "status" VARCHAR(20) NOT NULL DEFAULT 'confirmed',
        "total_price" NUMERIC(10,2) NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_orders_user_id" ON "orders"("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_status" ON "orders"("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_user_status" ON "orders"("user_id", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_created_at" ON "orders"("created_at" DESC)`,
    );

    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "order_id" UUID NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
        "grocery_item_id" UUID NOT NULL REFERENCES "grocery_items"("id"),
        "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
        "unit_price" NUMERIC(10,2) NOT NULL
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_order_items_order_id" ON "order_items"("order_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_order_items_grocery_item_id" ON "order_items"("grocery_item_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "grocery_items"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
