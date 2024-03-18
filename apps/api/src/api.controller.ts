import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiService } from './api.service';
import { MyError } from 'utils';
import { MyRequest } from 'express';
import {
  ApiResult,
  CocAttributeResult,
  DndAttributeResult,
  JrrpResult,
  MyExpressionResult,
} from './types/resp.types';
import { MyDiceExpression } from './utils/dice';
import { randomSample } from './utils/choice';
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
      const { test } = req.query;

      if (test === '1') {
        return { code: 0, result: { jrrp: -1, got: 0 } };
      }

      const oldJrrp = await this.apiService.checkJrrp(req);
      let val = 0,
        got: 0 | 1 = 0;
      if (oldJrrp > 0) {
        val = oldJrrp;
        got = 1;
      } else {
        const result = await this.apiService.newJrrp(req);
        val = result;
      }
      if (new Date().getMonth() === 3 && new Date().getDate() === 1) {
        val = -1;
      }
      return {
        code: 0,
        result: { jrrp: val, got },
      };
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

  @Get('dnd')
  async getDndAttribute(@Req() req: MyRequest): Promise<DndAttributeResult> {
    const { num } = req.query;

    try {
      if ((num && isNaN(Number(num))) || Number(num) > 5) {
        throw new MyError(1002, 'api', '生成的属性数不合法');
      }

      const result = new Array(Number(num) || 1).fill(0).map(() => {
        const res = new Array(6).fill(0).map(() => {
          const dices = MyDiceExpression('4d6', true, (v, m) => {
            this.apiService.saveDiceRecord(req, v, m);
          });

          if (!dices.isValid) {
            throw new MyError(1002, 'api', '生成属性值失败');
          } else {
            const resDices = dices.dices![0];

            const sum = [...resDices]
              .sort((a, b) => a - b)
              .slice(1)
              .reduce((a, b) => a + b, 0);

            return { sum, dices: resDices };
          }
        });

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

  @Get('choice')
  async getChoice(@Req() req: MyRequest): Promise<ApiResult> {
    const { options: o, count } = req.query;
    try {
      const options = (o as string).split(',');
      const m = Number(count);
      if (isNaN(m) || m <= 0 || m > options.length) {
        throw new MyError(1002, 'api', '参数不合法');
      }
      const indices = options.map((_, i) => i);
      const res = randomSample(indices, m);
      this.apiService.saveChoiceRecord(req, options, res, m);
      const result = options.filter((_, i) => res.includes(i));
      return { code: 0, result };
    } catch (e) {
      if ((e as MyError).isCustomError) {
        MyError.log(e as MyError);
        return { code: (e as MyError).code, message: (e as MyError).message };
      } else {
        console.log(e);
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

  @Post('jrrp') // April Fool 2024 Only!
  async setJrrp(@Req() req: MyRequest): Promise<ApiResult> {
    const { val: rawVal, force } = req.body;
    const val = Number(rawVal);

    if (!force && (new Date().getMonth() !== 3 || new Date().getDate() !== 1)) {
      return { code: 1, message: '@deprecated' };
    }
    if (isNaN(val)) {
      this.apiService.tryAF2024Record(req, rawVal, false);
      return { code: 1002, message: '请填一个数字' };
    }

    if (val < 0 || val > 100) {
      this.apiService.tryAF2024Record(req, rawVal, false);
      return { code: 1002, message: '数字超过范围' };
    }

    const jrrp = await this.apiService.checkJrrp(req);
    if (jrrp < 0) {
      return { code: 1003, message: 'jrrp未生成' };
    }

    const ans = [
      Math.floor(jrrp / 64),
      Math.floor(jrrp / 16) % 4,
      Math.floor(jrrp / 4) % 4,
      jrrp % 4,
    ]; // 四进制表示
    const userVal = [
      Math.floor(val / 64),
      Math.floor(val / 16) % 4,
      Math.floor(val / 4) % 4,
      val % 4,
    ];

    let matchCount = 0,
      includeCount = 0;
    for (let i = 0; i < 4; i++) {
      if (ans[i] === userVal[i]) {
        matchCount++;
        ans[i] = userVal[i] = -1;
      }
    }
    for (let i = 0; i < 4; i++) {
      if (userVal[i] >= 0 && ans.includes(userVal[i])) {
        includeCount++;
        ans[ans.indexOf(userVal[i])] = -1;
      }
    }

    const success = this.apiService.tryAF2024Record(
      req,
      rawVal,
      matchCount === 4
    );

    return {
      code: 0,
      result: { match: matchCount, include: includeCount, success },
    };
  }
}
