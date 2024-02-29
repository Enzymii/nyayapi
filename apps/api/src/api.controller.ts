import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiService } from './api.service';
import { MyError } from 'utils';
import { MyRequest } from 'express';
import {
  ApiResult,
  CocAttributeResult,
  JrrpResult,
  MyExpressionResult,
} from './types/resp.types';
import { MyDiceExpression } from './utils/dice';
import { CocCheckResult, attributeDices, isAttribute } from './utils/cocRules';
import { CocSkill } from './entity/coc/skill.entity';

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

  @Get('coc7')
  async getCocAttribute(@Req() req: MyRequest): Promise<CocAttributeResult> {
    const { num } = req.query;

    try {
      if ((num && isNaN(Number(num))) || Number(num) > 5) {
        throw new MyError(1002, 'api', '生成的属性数不合法');
      }

      const result = new Array(Number(num) || 1).fill(0).map(() => {
        const res: Record<string, number> = {};

        for (const key in attributeDices) {
          res[key] = MyDiceExpression(
            attributeDices[key as keyof typeof attributeDices],
            true,
            (v, m) => {
              this.apiService.saveDiceRecord(req, v, m);
            }
          ).result;
        }

        return res;
      });

      return { code: 0, result };
    } catch (e) {
      if ((e as MyError).isCustomError) {
        const err = e as MyError;
        return { code: err.code, message: err.message };
      } else {
        console.log(e);
        return { code: 2001, message: '数据库异常' };
      }
    }
  }

  @Get('check')
  async checkCharacterAttribute(
    @Req() req: MyRequest
  ): Promise<ApiResult<CocCheckResult>> {
    const { name, value, bonus } = req.query;
    try {
      const res = await this.apiService.cocCheck(req, {
        name: name as string,
        value: Number(value),
        bonus: Number(bonus),
      });
      return { code: 0, result: res };
    } catch (e) {
      if ((e as MyError).isCustomError) {
        MyError.log(e as MyError);
        return { code: (e as MyError).code, message: (e as MyError).message };
      } else {
        return { code: 2001, message: '数据库异常' };
      }
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
      values.map(
        (value: { name: string } & Record<string, number | string>) => {
          if (isAttribute(value.name)) {
            return this.apiService.setCharacterAttribute(
              req,
              { name: value.name, value: value.value as number },
              param.characterId
            );
          } else {
            return this.apiService.setCharacterSkill(
              req,
              value as unknown as CocSkill,
              param.characterId
            );
          }
        }
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
          list: successIdList.map((i) => values[i].name),
        },
        characterId: charaId,
        message: 'ok',
      };
      return resp;
    });
  }
}
