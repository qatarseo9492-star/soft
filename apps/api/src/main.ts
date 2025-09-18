import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // optional: use env LOG_LEVEL if you want
  });

  // CORS from env (comma-separated origins)
  const origins =
    (process.env.CORS_ORIGIN ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

  app.enableCors({
    origin: origins.length ? origins : true,
    methods: process.env.CORS_METHODS ?? 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    allowedHeaders: process.env.CORS_HEADERS ?? 'Content-Type,Authorization'
  });

  const port = parseInt(process.env.PORT ?? '3011', 10);
  const host = process.env.HOST ?? '0.0.0.0';

  await app.listen(port, host);
  Logger.log(`API (Express) listening on http://${host}:${port}`);
}

bootstrap();
