import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLog } from './entity/request-log.entity';
import { RequestLoggerMiddleware } from './middleware/request-log.middleware.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dbConfig = require('../config/db.js');

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dbConfig,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([RequestLog]),
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
