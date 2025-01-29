/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import ScaleHorizontally from './scale-horizontally';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  ScaleHorizontally.scaleHorizontally(
    null,
    listenFunction.bind(this, app, port)
  );
}

async function listenFunction(
  app: NestApplication,
  port: number
): Promise<void> {
  await app.listen(port);
  Logger.log(`Worker with id: ${process.pid} started`);
}

bootstrap();
