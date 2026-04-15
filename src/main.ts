import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { DataSource } from "typeorm";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./infra/filters/global-exception.filter";
import { LoggingInterceptor } from "./infra/interceptors/logging.interceptor";
import { RequestIdInterceptor } from "./infra/interceptors/request-id.interceptor";

async function bootstrap() {
  const adapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );

  app.setGlobalPrefix("api/v1");

  app.use(helmet());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new RequestIdInterceptor(),
  );

  const dataSource = app.get(DataSource);

  const fastify = app.getHttpAdapter().getInstance();
  fastify.get("/health", async (req: any, reply: any) => {
    let dbStatus = "ok";
    try {
      await dataSource.query("SELECT 1");
    } catch {
      dbStatus = "error";
    }
    reply.send({
      status: dbStatus,
      timestamp: new Date().toISOString(),
    });
  });

  const config = new DocumentBuilder()
    .setTitle("Grocery Booking System API")
    .setDescription(
      `
## Overview
REST API for a grocery booking system with user and admin roles.

## Authentication
All protected endpoints require a JWT Bearer token in the Authorization header.

## User Roles
- **user**: Can browse items, create orders, cancel own orders
- **admin**: All user permissions + manage users and grocery items

## Rate Limiting
- 100 requests per 15 minutes per IP

## Base URL
\`http://localhost:3000/api/v1\`
    `.trim(),
    )
    .setVersion("1.0.0")
    .addBearerAuth()
    .addTag("Auth", "Authentication (public)")
    .addTag("Grocery", "Browse grocery items (authenticated)")
    .addTag("Orders", "Order management (authenticated)")
    .addTag("Admin - Users", "User management (admin only)")
    .addTag("Admin - Grocery", "Grocery management (admin only)")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, "0.0.0.0");
  console.log(`Application is running on: http://localhost:${port}/api/v1`);

  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`Received ${signal}, shutting down gracefully...`);
      await app.close();
      process.exit(0);
    });
  });
}
bootstrap();
