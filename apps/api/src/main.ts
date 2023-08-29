import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  await app.listen(3399);
}
bootstrap();
