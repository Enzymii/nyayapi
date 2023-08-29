// eslint-disable-next-line @typescript-eslint/no-var-requires
const chalk = require('chalk');

export class MyError extends Error {
  public readonly code;
  private readonly scope;
  public readonly isCustomError = true;

  constructor(code: number, scope: string = 'api', message: string) {
    super(message);
    this.code = code;
    this.scope = scope;

    this.name = 'API Error';
  }

  static log(err: MyError) {
    console.log(
      `${chalk.white(`[${new Date().toLocaleString()}]`)}${chalk.redBright(
        `(${err.scope}|${err.code})`
      )}${chalk.yellow(` ${err.message}`)}`
    );
  }
}
