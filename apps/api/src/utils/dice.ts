export const MyDice = (l: number, r: number): number => {
  return Math.floor(Math.random() * (r - l + 1)) + l;
};

export const MyDiceD = (r: number): number => {
  return MyDice(1, r);
};

export interface ExpressionResult {
  isValid: boolean;
  result: number;
  dices?: number[][];
  message: string;
}
export const MyDiceExpression = (
  expression: string,
  simplified = false,
  isFinal = true
): ExpressionResult => {
  console.log(expression);
  const dices = [];

  expression = expression.toLocaleLowerCase();

  if (!expression) {
    return {
      isValid: false,
      result: NaN,
      message: '空表达式',
    };
  }

  const regex = /^[-+*/()d0-9]+$/;
  if (!regex.test(expression)) {
    return {
      isValid: false,
      result: NaN,
      message: '表达式包含非法字符',
    };
  }

  const stacks = {
    op: [] as string[],
    num: [] as number[],
    msg: [] as string[],
  };

  let cur = 0,
    curt = '',
    flag = false,
    isMinus = false,
    lastD = false;

  for (let i = 0; i < expression.length; ++i) {
    const ch = expression[i];
    if (ch === '(') {
      let cnt = 1;
      for (let j = i + 1; j < expression.length; ++j) {
        if (expression[j] === '(') {
          ++cnt;
        } else if (expression[j] === ')') {
          --cnt;
          if (cnt === 0) {
            const subExp = expression.slice(i + 1, j);
            const res = MyDiceExpression(subExp, simplified, false);
            // merge the result
            if (!res.isValid) {
              return res;
            } else {
              dices.push(...res.dices!);
              cur = res.result;
              curt = `(${res.message})`;
              flag = true;

              if (
                subExp.indexOf('d') >= 0 &&
                j < expression.length - 1 &&
                expression[j + 1] === 'd'
              ) {
                return {
                  isValid: false,
                  result: NaN,
                  message: '不可以嵌套掷骰',
                };
              }
            }
            i = j;
            break;
          }
        }
      }
      if (cnt !== 0) {
        return {
          isValid: false,
          result: NaN,
          message: '表达式中的括号不匹配',
        };
      }
    } else if (ch === ')') {
      return {
        isValid: false,
        result: NaN,
        message: '表达式中的括号不匹配',
      };
    } else if (ch >= '0' && ch <= '9') {
      if (curt) {
        return { isValid: false, result: NaN, message: '括号外不能直接跟数值' };
      }

      flag = true;
      cur = cur * 10 + Number(ch);
    } else {
      if (!flag) {
        if (!(ch === 'd' || (ch === '-' && i === 0))) {
          console.log(ch);
          return { isValid: false, result: NaN, message: '多余的运算符' };
        } else if (ch === 'd') {
          cur = 1;
        } else {
          isMinus = true;
        }
      }
      if (isMinus) {
        cur = -cur;
        isMinus = false;
      }
      flag = false;
      stacks.num.push(cur);
      if (curt) {
        stacks.msg.push(curt);
        curt = '';
      } else {
        stacks.msg.push(cur.toString());
      }
      cur = 0;

      if (ch === '+' || ch === '-') {
        while (
          stacks.op.length > 0 &&
          stacks.op[stacks.op.length - 1] !== '+' &&
          stacks.op[stacks.op.length - 1] !== '-'
        ) {
          if (stacks.num.length < 2) {
            return { isValid: false, result: NaN, message: '表达式错误' };
          }

          const op = stacks.op.pop();

          if (op === 'd') {
            if (lastD) {
              return { isValid: false, result: NaN, message: '不可以嵌套掷骰' };
            }
            const r = stacks.num.pop()!;
            const l = stacks.num.pop()!;
            stacks.msg.pop();
            stacks.msg.pop();
            const dice = [];
            for (let i = 0; i < l; ++i) {
              dice.push(MyDiceD(r));
            }
            dices.push(dice);
            const sum = dice.reduce((a, b) => a + b, 0);
            stacks.num.push(sum);
            if (simplified) {
              stacks.msg.push(`[${sum}]`);
            } else {
              stacks.msg.push(`[${dice.join(' + ')}]`);
            }
            lastD = true;
          } else if (op === '*') {
            const r = stacks.num.pop()!;
            const l = stacks.num.pop()!;
            const rt = stacks.msg.pop();
            const lt = stacks.msg.pop();
            stacks.num.push(l * r);
            stacks.msg.push(`${lt} * ${rt}`);
            lastD = false;
          } else if (op === '/') {
            const r = stacks.num.pop()!;
            const l = stacks.num.pop()!;
            const rt = stacks.msg.pop();
            const lt = stacks.msg.pop();
            stacks.num.push(l / r);
            stacks.msg.push(`${lt} / ${rt}`);
            lastD = false;
          }
        }
      } else if (ch === '*' || ch === '/') {
        while (
          stacks.op.length > 0 &&
          stacks.op[stacks.op.length - 1] === 'd'
        ) {
          if (stacks.num.length < 2) {
            return { isValid: false, result: NaN, message: '缺少运算数' };
          }
          if (lastD) {
            return { isValid: false, result: NaN, message: '不可以嵌套掷骰' };
          }

          stacks.op.pop();
          const r = stacks.num.pop()!;
          const l = stacks.num.pop()!;
          stacks.msg.pop();
          stacks.msg.pop();
          const dice = [];
          for (let i = 0; i < l; ++i) {
            dice.push(MyDiceD(r));
          }
          dices.push(dice);
          const sum = dice.reduce((a, b) => a + b, 0);
          stacks.num.push(sum);
          if (simplified) {
            stacks.msg.push(`[${sum}]`);
          } else {
            stacks.msg.push(`[${dice.join(' + ')}]`);
          }
          lastD = true;
        }
      }

      stacks.op.push(ch);
    }
  }

  stacks.num.push(cur);
  stacks.msg.push(cur.toString());

  while (stacks.op.length > 0) {
    if (stacks.num.length < 2) {
      return { isValid: false, result: NaN, message: '缺少运算数(总)' };
    }

    const op = stacks.op.pop();
    const r = stacks.num.pop()!;
    const l = stacks.num.pop()!;
    const rt = stacks.msg.pop();
    const lt = stacks.msg.pop();
    if (op === '+') {
      stacks.num.push(l + r);
      stacks.msg.push(`${lt} + ${rt}`);
    } else if (op === '-') {
      stacks.num.push(l - r);
      stacks.msg.push(`${lt} - ${rt}`);
    } else if (op === '*') {
      stacks.num.push(l * r);
      stacks.msg.push(`${lt} * ${rt}`);
    } else if (op === '/') {
      stacks.num.push(l / r);
      stacks.msg.push(`${lt} / ${rt}`);
    } else if (op === 'd') {
      if (lastD) {
        return { isValid: false, result: NaN, message: '不可以嵌套掷骰' };
      }

      const dice = [];
      for (let i = 0; i < l; ++i) {
        dice.push(MyDiceD(r));
      }
      dices.push(dice);
      const sum = dice.reduce((a, b) => a + b, 0);
      stacks.num.push(sum);
      if (simplified) {
        stacks.msg.push(`[${sum}]`);
      } else {
        stacks.msg.push(`[${dice.join(' + ')}]`);
      }
    }
    lastD = op === 'd';
  }

  if (stacks.num.length !== 1) {
    return {
      isValid: false,
      result: NaN,
      message: '多余的运算数',
    };
  }

  const resultMsg = isFinal
    ? `${stacks.msg[0]} = ${stacks.num[0]}`
    : stacks.msg[0];

  return {
    isValid: true,
    result: stacks.num[0],
    dices,
    message: resultMsg,
  };
};

const test = MyDiceExpression('(1d2+5)*3d6', true);
console.log(test);