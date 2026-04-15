import "reflect-metadata";
import { DataSource } from "typeorm";

const getPort = (): number => {
  const port = parseInt(process.env.DB_PORT ?? "5432", 10);
  return isNaN(port) ? 5432 : port;
};

const typeormConfig = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: getPort(),
  username: process.env.DB_USERNAME ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
  database: process.env.DB_DATABASE ?? "grocery_booking",
  entities: [__dirname + "/../**/*.entity.js"],
  synchronize: false,
  migrations: [__dirname + "/../migrations/*.js"],
  migrationsTableName: "migrations",
});

export default typeormConfig;
