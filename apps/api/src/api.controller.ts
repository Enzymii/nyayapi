import { Controller, Get, Req } from '@nestjs/common';
import { ApiService } from './api.service';
import { MyError } from 'utils';
import { MyRequest } from 'express';
import { JrrpResult, MyExpressionResult } from './utils/resp.types';
import { MyDiceExpression } from './utils/dice';

@Controller({
  version: '1',
})
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  getHello(): string {
    return this.apiService.getHello();
  }

  @Get('jrrp')
  async getJrrp(@Req() req: MyRequest): Promise<JrrpResult> {
    try {
      const oldJrrp = await this.apiService.checkJrrp(req);
      if (oldJrrp > 0) {
        return {
          code: 0,
          result: { jrrp: oldJrrp, got: 1 },
        };
      } else {
        const result = this.apiService.newJrrp(req);
        return {
          code: 0,
          result: { jrrp: await result, got: 0 },
        };
      }
    } catch (error) {
      const err = new MyError(2001, 'internal', '数据库异常');
      MyError.log(err);

      return {
        code: err.code,
        message: err.message,
      };
    }
  }

  @Get('d')
  async calcExpression(@Req() req: MyRequest): Promise<MyExpressionResult> {
    const { exp, s } = req.query;

    const res = MyDiceExpression((exp as string) ?? 'd100', s === '1');

    if (res.isValid) {
      return { code: 0, result: res };
    } else {
      const { message } = res;
      return { code: 1002, message: message ?? '表达式错误' };
    }
  }
}
