import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { MyRequest } from 'express';
import { Observable, map } from 'rxjs';
import { EntityManager } from 'typeorm';
import { ApiResult, isResultSuccess } from '../utils/resp.types';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Promise<ApiResult>> {
    return next.handle().pipe(
      map(async (data: ApiResult) => {
        const reqId = (context.switchToHttp().getRequest() as MyRequest).id;

        const stringifyResult = (value: ApiResult) => {
          if (isResultSuccess(value)) {
            try {
              return JSON.stringify(value.result);
            } catch (error) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return (value.result as any).toString();
            }
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { code, ...rest } = data;
            return JSON.stringify(rest);
          }
        };

        await this.entityManager.update(
          'request_log',
          { id: reqId },
          {
            resultCode: data.code,
            resultMessage: stringifyResult(data).slice(200),
          }
        );

        return data;
      })
    );
  }
}
