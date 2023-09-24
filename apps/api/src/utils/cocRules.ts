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

export class CocCheckResult {
  constructor(
    public success: CocSuccessType,
    public result: number,
    public value: number
  ) {}

  get isSuccess() {
    return (
      this.success === 'critical' ||
      this.success === 'extreme' ||
      this.success === 'hard' ||
      this.success === 'normal'
    );
  }
}
