import { ExpressionResult } from '../utils/dice';

interface ApiResultSuccess<T> {
  code: 0;
  message?: string;
  result: T;
}

interface ApiResultError {
  code: number;
  message: string;
}

export type ApiResult<T = unknown> = ApiResultSuccess<T> | ApiResultError;

export type JrrpResult = ApiResult<{ jrrp: number; got: 0 | 1 }>;

export type MyExpressionResult = ApiResult<ExpressionResult>;

export type CocAttributeResult = ApiResult<Record<string, number>[]>;

interface DndAttributeResultSingle {
  sum: number;
  dices: number[];
}

export type DndAttributeResult = ApiResult<DndAttributeResultSingle[][]>;

export const isResultSuccess = (
  result: ApiResult
): result is ApiResultSuccess<unknown> => result.code === 0;
