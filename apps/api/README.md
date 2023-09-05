# 接口规范

## 接口格式

### 对于一些 GET 请求

```js
// GET /api/v1/

{
  from: `${user}@${platform}`.toBase64(),
  ...params
}
```

### 响应格式

```ts
// success
{
  code: 0,
  result: any,
  message?: 'ok'
}

// error
{
  code: number, // 错误代码见下方
  message: string
}
```

## 错误代码

### 未知错误

| 错误代码 | 错误说明 | 状态码 | 备注 |
| -------- | -------- | ------ | ---- |
| 1        | 未知错误 | 500    |      |

### 请求错误

API 错误代码中 scope = 'api'

| 错误代码 | 错误说明   | 状态码 | 备注 |
| -------- | ---------- | ------ | ---- |
| 1001     | 无来源请求 | 400    |      |
| 1002     | 不合法参数 | 400    |      |

### 系统错误

API 错误代码中 scope = 'internal'

| 错误代码 | 错误说明   | 状态码 | 备注 |
| -------- | ---------- | ------ | ---- |
| 2001     | 数据库错误 | 500    |      |

# 接口列表

> _from 被从参数列表中忽略了, 请记得添加_
> 响应格式中默认只显示 result 部分

### jrrp

获取今日人品

```js
// GET /v1/jrrp
req = {}

res = {
  jrrp: number;
  got: 0 | 1; // 0 代表今天第一次获取 1 代表返回已存储的结果
}
```

### d

计算掷骰表达式结果

```js
// GET /v1/d
req = {
  exp: string; // (1d8+2d6)*5
}

res = {
  isValid: boolean; // true
  result: number; // 55
  dices?: number[][]; // [[4], [4,3]]
  message: string; // ([4] + [4 + 3]) * 5 = 55
}
```
