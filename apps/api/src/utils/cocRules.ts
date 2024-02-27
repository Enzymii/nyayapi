import { MyError } from 'utils';
import { MyDiceD } from './dice';

export const attributeDices = {
  APP: '3d6*5',
  STR: '3d6*5',
  CON: '3d6*5',
  POW: '3d6*5',
  DEX: '3d6*5',
  SIZ: '(2d6+6)*5',
  INT: '(2d6+6)*5',
  EDU: '(2d6+6)*5',
  LUK: '3d6*5',
};

export const isAttribute = (
  key: string
): key is keyof typeof attributeDices => {
  return key in attributeDices;
};

type CocSuccessType =
  | 'critical'
  | 'extreme'
  | 'hard'
  | 'normal'
  | 'fail'
  | 'fumble';

export type CocCheckResult = {
  success: CocSuccessType;
  result: number;
  value: number;
};

export type CocSuccessResult = {
  success: 'critical' | 'extreme' | 'hard' | 'normal';
} & CocCheckResult;

export const isSuccessResult = (
  result: CocCheckResult
): result is CocSuccessResult => {
  return (
    result.success === 'critical' ||
    result.success === 'extreme' ||
    result.success === 'hard' ||
    result.success === 'normal'
  );
};

type CheckType = {
  target: number;
  bonus: number;
  saver?: (v: number, m: number) => void;
};

abstract class CocRuleCheck {
  protected getValue(bonus: number, saveDice?: (v: number, m: number) => void) {
    let result = MyDiceD(100);
    let bd: number[] = [];
    if (saveDice) {
      saveDice(result, 100);
    }
    const t = result % 10;

    if (bonus) {
      const bLen = Math.floor(Math.abs(bonus));
      if (bLen > 3) {
        throw new MyError(1002, 'api', '奖励骰数量过多');
      }
      bd = new Array(bLen).fill(0).map(() => MyDiceD(10));
      if (saveDice) {
        bd.forEach((v) => saveDice(v, 10));
      }
      result = bd.reduce((a, b) => {
        if (bonus > 0) {
          return Math.min((a - 1) * 10 + t, (b - 1) * 10 + t);
        } else {
          return Math.max((a - 1) * 10 + t, (b - 1) * 10 + t);
        }
      }, result);
    }

    return result;
  }

  abstract check({ target, bonus, saver }: CheckType): CocCheckResult;
}

export class CocRuleBookCheck extends CocRuleCheck {
  check({ target, bonus, saver }: CheckType): CocCheckResult {
    const value = this.getValue(bonus, saver);

    let successType: CocSuccessType;
    if (value === 1) {
      successType = 'critical';
    } else if (value <= target / 5) {
      successType = 'extreme';
    } else if (value <= target / 2) {
      successType = 'hard';
    } else if (value <= target) {
      successType = 'normal';
    } else if (value < 95 || (target >= 50 && value <= 99)) {
      successType = 'fail';
    } else {
      successType = 'fumble';
    }

    return {
      success: successType,
      result: value,
      value: target,
    };
  }
}
