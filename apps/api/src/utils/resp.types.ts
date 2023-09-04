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

export const isResultSuccess = (
  result: ApiResult
): result is ApiResultSuccess<unknown> => result.code === 0;
