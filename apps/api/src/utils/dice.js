"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyDiceExpression = exports.MyDiceD = exports.MyDice = void 0;
var MyDice = function (l, r) {
    return Math.floor(Math.random() * (r - l + 1)) + l;
};
exports.MyDice = MyDice;
var MyDiceD = function (r) {
    return (0, exports.MyDice)(1, r);
};
exports.MyDiceD = MyDiceD;
var MyDiceExpression = function (expression, simplified, isFinal) {
    if (simplified === void 0) { simplified = false; }
    if (isFinal === void 0) { isFinal = true; }
    var dices = [];
    expression = expression.toLocaleLowerCase();
    if (!expression) {
        return {
            isValid: false,
            result: NaN,
            message: '空表达式',
        };
    }
    var regex = /^[-+*/()d0-9]+$/;
    if (!regex.test(expression)) {
        return {
            isValid: false,
            result: NaN,
            message: '表达式包含非法字符',
        };
    }
    var stacks = {
        op: [],
        num: [],
        msg: [],
    };
    var cur = 0, curt = '', flag = false, isMinus = false, lastD = false;
    for (var i = 0; i < expression.length; ++i) {
        var ch = expression[i];
        if (ch === '(') {
            var cnt = 1;
            for (var j = i + 1; j < expression.length; ++j) {
                if (expression[j] === '(') {
                    ++cnt;
                }
                else if (expression[j] === ')') {
                    --cnt;
                    if (cnt === 0) {
                        var subExp = expression.slice(i + 1, j);
                        var res = (0, exports.MyDiceExpression)(subExp, simplified, false);
                        // merge the result
                        if (!res.isValid) {
                            return res;
                        }
                        else {
                            dices.push.apply(dices, res.dices);
                            cur = res.result;
                            curt = "(".concat(res.message, ")");
                            flag = true;
                            if (subExp.indexOf('d') >= 0 &&
                                j < expression.length - 1 &&
                                expression[j + 1] === 'd') {
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
        }
        else if (ch === ')') {
            return {
                isValid: false,
                result: NaN,
                message: '表达式中的括号不匹配',
            };
        }
        else if (ch > '0' && ch <= '9') {
            if (curt) {
                return { isValid: false, result: NaN, message: '表达式错误' };
            }
            flag = true;
            cur = cur * 10 + Number(ch);
        }
        else {
            if (!flag) {
                if (!(ch === 'd' || (ch === '-' && i === 0))) {
                    return { isValid: false, result: NaN, message: '表达式错误' };
                }
                else if (ch === 'd') {
                    cur = 1;
                }
                else {
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
            }
            else {
                stacks.msg.push(cur.toString());
            }
            cur = 0;
            if (ch === '+' || ch === '-') {
                while (stacks.op.length > 0 &&
                    stacks.op[stacks.op.length - 1] !== '+' &&
                    stacks.op[stacks.op.length - 1] !== '-') {
                    if (stacks.num.length < 2) {
                        return { isValid: false, result: NaN, message: '表达式错误' };
                    }
                    var op = stacks.op.pop();
                    if (op === 'd') {
                        if (lastD) {
                            return { isValid: false, result: NaN, message: '不可以嵌套掷骰' };
                        }
                        var r = stacks.num.pop();
                        var l = stacks.num.pop();
                        stacks.msg.pop();
                        stacks.msg.pop();
                        var dice = [];
                        for (var i_1 = 0; i_1 < l; ++i_1) {
                            dice.push((0, exports.MyDiceD)(r));
                        }
                        dices.push(dice);
                        var sum = dice.reduce(function (a, b) { return a + b; }, 0);
                        stacks.num.push(sum);
                        if (simplified) {
                            stacks.msg.push("[".concat(sum, "]"));
                        }
                        else {
                            stacks.msg.push("[".concat(dice.join(' + '), "]"));
                        }
                        lastD = true;
                    }
                    else if (op === '*') {
                        var r = stacks.num.pop();
                        var l = stacks.num.pop();
                        var rt = stacks.msg.pop();
                        var lt = stacks.msg.pop();
                        stacks.num.push(l * r);
                        stacks.msg.push("".concat(lt, " * ").concat(rt));
                        lastD = false;
                    }
                    else if (op === '/') {
                        var r = stacks.num.pop();
                        var l = stacks.num.pop();
                        var rt = stacks.msg.pop();
                        var lt = stacks.msg.pop();
                        stacks.num.push(l / r);
                        stacks.msg.push("".concat(lt, " / ").concat(rt));
                        lastD = false;
                    }
                }
            }
            else if (ch === '*' || ch === '/') {
                while (stacks.op.length > 0 &&
                    stacks.op[stacks.op.length - 1] === 'd') {
                    if (stacks.num.length < 2) {
                        return { isValid: false, result: NaN, message: '表达式错误' };
                    }
                    if (lastD) {
                        return { isValid: false, result: NaN, message: '不可以嵌套掷骰' };
                    }
                    stacks.op.pop();
                    var r = stacks.num.pop();
                    var l = stacks.num.pop();
                    stacks.msg.pop();
                    stacks.msg.pop();
                    var dice = [];
                    for (var i_2 = 0; i_2 < l; ++i_2) {
                        dice.push((0, exports.MyDiceD)(r));
                    }
                    dices.push(dice);
                    var sum = dice.reduce(function (a, b) { return a + b; }, 0);
                    stacks.num.push(sum);
                    if (simplified) {
                        stacks.msg.push("[".concat(sum, "]"));
                    }
                    else {
                        stacks.msg.push("[".concat(dice.join(' + '), "]"));
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
            return { isValid: false, result: NaN, message: '表达式错误' };
        }
        var op = stacks.op.pop();
        var r = stacks.num.pop();
        var l = stacks.num.pop();
        var rt = stacks.msg.pop();
        var lt = stacks.msg.pop();
        if (op === '+') {
            stacks.num.push(l + r);
            stacks.msg.push("".concat(lt, " + ").concat(rt));
        }
        else if (op === '-') {
            stacks.num.push(l - r);
            stacks.msg.push("".concat(lt, " - ").concat(rt));
        }
        else if (op === '*') {
            stacks.num.push(l * r);
            stacks.msg.push("".concat(lt, " * ").concat(rt));
        }
        else if (op === '/') {
            stacks.num.push(l / r);
            stacks.msg.push("".concat(lt, " / ").concat(rt));
        }
        else if (op === 'd') {
            if (lastD) {
                return { isValid: false, result: NaN, message: '不可以嵌套掷骰' };
            }
            var dice = [];
            for (var i = 0; i < l; ++i) {
                dice.push((0, exports.MyDiceD)(r));
            }
            dices.push(dice);
            var sum = dice.reduce(function (a, b) { return a + b; }, 0);
            stacks.num.push(sum);
            if (simplified) {
                stacks.msg.push("[".concat(sum, "]"));
            }
            else {
                stacks.msg.push("[".concat(dice.join(' + '), "]"));
            }
        }
        lastD = op === 'd';
    }
    if (stacks.num.length !== 1) {
        return {
            isValid: false,
            result: NaN,
            message: '表达式错误',
        };
    }
    var resultMsg = isFinal
        ? "".concat(stacks.msg[0], " = ").concat(stacks.num[0])
        : stacks.msg[0];
    return {
        isValid: true,
        result: stacks.num[0],
        dices: dices,
        message: resultMsg,
    };
};
exports.MyDiceExpression = MyDiceExpression;
var test = (0, exports.MyDiceExpression)('(1d2+5)*3d6', true);
console.log(test);
