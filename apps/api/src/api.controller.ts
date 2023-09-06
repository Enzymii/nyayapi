import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiService } from './api.service';
import { MyError } from 'utils';
import { MyRequest } from 'express';
import { ApiResult, JrrpResult, MyExpressionResult } from './utils/resp.types';
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

    const res = MyDiceExpression((exp as string) ?? 'd100', s === '1', (v, m) =>
      this.apiService.saveDiceRecord(req, v, m)
    );

    if (res.isValid) {
      return { code: 0, result: res };
    } else {
      const { message } = res;
      return { code: 1002, message: message ?? '表达式错误' };
    }
  }

  // @Post('set')
  @Post('set/:characterId?')
  async setCharacterAttribute(
    @Req() req: MyRequest,
    // eslint-disable-next-line @typescript-eslint/indent
    @Param() param: { characterId: number }
  ): Promise<ApiResult> {
    const { values } = req.body;

    return Promise.allSettled<number>(
      values.map(([name, value]: [string, number]) =>
        this.apiService.setCharacterAttribute(
          req,
          { name, value },
          param.characterId
        )
      )
    ).then((results) => {
      if (results[0].status === 'rejected' && results[0].reason === -1) {
        return { code: 1003, message: '角色不存在' };
      }

      const successIdList = results
        .filter((r) => r.status === 'fulfilled')
        .map((_, i) => i);

      if (successIdList.length === 0) {
        return { code: 2001, message: '数据库异常' };
      }

      const charaId =
        param.characterId ??
        (results[successIdList[0]] as PromiseFulfilledResult<number>).value;
      const resp = {
        code: 0,
        result: {
          ok: results.filter((r) => r.status === 'fulfilled').length,
          error: results.filter((r) => r.status === 'rejected').length,
          list: successIdList.map((i) => values[i][0]),
        },
        characterId: charaId,
        message: 'ok',
      };
      return resp;
    });
  }
}
