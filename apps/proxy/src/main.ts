import { NestFactory } from '@nestjs/core';
import { ProxyModule } from './proxy.module';

async function bootstrap() {
  const app = await NestFactory.create(ProxyModule);
  await app.listen(4399);
}
bootstrap();
