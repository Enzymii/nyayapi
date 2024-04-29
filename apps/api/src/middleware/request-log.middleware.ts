import { Injectable, NestMiddleware } from '@nestjs/common';
import { MyRequest, Response } from 'express';
import { InjectEntityManager } from '@nestjs/typeorm';
import { RequestLog } from '../entity/request-log.entity.js';
import { EntityManager } from 'typeorm';
import { MyError } from 'utils';
import { allowed_origins } from '../entity/auth.entity.js';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {}

  async use(req: MyRequest, res: Response, next: () => void) {
    const requestLog = new RequestLog();
    requestLog.method = req.method;
    requestLog.path = '/' + req.params[0];

    try {
      const { authorization } = req.headers;

      if (!authorization) {
        throw new MyError(1004, 'api', '未知来源请求');
      } else {
        await this.entityManager.findOneOrFail(allowed_origins, {
          where: { uuid: authorization },
        });
      }
    } catch (e) {
      const err = new MyError(1004, 'api', '验证请求来源失败');
      MyError.log(err);
      res.status(401).json({
        code: err.code,
        message: err.message,
      });
      return;
    }

    try {
      const { from, ...data } = req.query;

      if (from) {
        const parsed = Buffer.from(from as string, 'base64').toString('utf8');

        if (!/^(\d+@qq)|(\w+@webui)$/.test(parsed)) {
          console.log(parsed);
          throw new MyError(1001, 'api', '无效的 from 参数');
        }

        requestLog.from = parsed;
      } else {
        throw new MyError(1001, 'api', '请求中没有 from 参数');
      }
      requestLog.params = JSON.stringify({ ...data, ...req.body });

      req.userId = requestLog.from;
      requestLog.origin = req.headers.authorization as string;

      await this.entityManager.save(RequestLog, requestLog);

      req.id = requestLog.id;
      next();
    } catch (error) {
      if ((error as MyError).isCustomError) {
        MyError.log(error as MyError);
        res.status(400).json({
          code: (error as MyError).code,
          message: (error as MyError).message,
        });
      } else {
        const customError = new MyError(1, 'api', `未知错误: ${error}`);
        MyError.log(customError);
        res.status(500).json({
          code: customError.code,
          message: '我也不知道发生了什么反正是发生了什么',
        });
      }
    }
  }
}
