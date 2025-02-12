/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import ScaleUtil from './scale-util';
import { Logger, ValidationPipe } from '@nestjs/common';
import { CacheModelUtil } from './app/prediction/cache-model.util';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:9090',
      package: 'prediction',
      protoPath: join(__dirname, '/.proto/prediction.proto'),
    },
  });
  await app.startAllMicroservices();

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;

  ScaleUtil.scaleHorizontally(async () => {
    Logger.log('Generation of models started');
    await CacheModelUtil.createAndCacheTfModels();
    Logger.log('Generation completed');
  }, listenFunction.bind(this, app, port));
}

async function listenFunction(
  app: NestApplication,
  port: number
): Promise<void> {
  await app.listen(port);
  Logger.log(`Worker with id: ${process.pid} started`);
}

bootstrap();
