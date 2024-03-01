import { Bot, Logger, MakeMsg, RecvType, recvIsMessage } from 'mirainya2';
import type {
  FriendInfo,
  MemberProfile,
  Message,
  MessageChain,
  PlainMessage,
} from 'mirainya2';
import { responseTranslator } from './response';
import { MyRequest } from './requests';

export class QQMessageHandler {
  private req;

  constructor(private readonly bot: Bot) {
    this.req = new MyRequest();
  }

  public handle(recv: RecvType) {
    if (recvIsMessage(recv)) {
      const { messageChain } = recv;

      const textMsgs = messageChain.filter((msg) => msg.type === 'Plain');

      Promise.all(
        textMsgs.map(async (text) => {
          const nickname =
            (recv.sender as MemberProfile).memberName ||
            (recv.sender as FriendInfo).nickname ||
            `[${recv.sender.id}]`;

          const replyMsg = await this.handleText(text as PlainMessage, {
            qq: recv.sender.id,
            group: (recv.sender as MemberProfile).group?.id,
            nickname,
          });

          if (replyMsg) {
            const reply = replyMsg instanceof Array ? replyMsg : [replyMsg];
            if (recv.type === 'GroupMessage') {
              this.bot.api.sendGroupMessage(recv.sender.group.id, reply);
            } else if (recv.type === 'FriendMessage') {
              this.bot.api.sendFriendMessage(recv.sender.id, reply);
            } else if (recv.type === 'TempMessage') {
              this.bot.api.sendTempMessage(
                recv.sender.group.id,
                recv.sender.id,
                reply
              );
            } else {
              throw new Error('unsupported message type');
            }
          }
        })
      );
    } else {
      // handle events here...
    }
  }

  private async handleText(
    msg: PlainMessage,
    sender: { qq: number; group?: number; nickname: string }
  ): Promise<Message | MessageChain | null> {
    // TODO: do something to text, should be returned by a MakeMsg function
    const { text } = msg;
    const text2 = text
      .trim()
      .replace(/^。/, '.')
      .replaceAll(/\s/g, ' ')
      .toLocaleLowerCase();

    if (/^\.\s*[a-z0-9]+/.test(text2)) {
      // order messages
      const [order, ...args] = text2.split(' ');

      switch (order) {
        case '.ping': {
          return MakeMsg.plain(responseTranslator('pong'));
        }
        case '.jrrp': {
          try {
            const res = await this.req.request({
              method: 'GET',
              url: '/jrrp',
              qq: sender.qq,
            });
            if (!res) {
              throw new Error('获取jrrp值失败');
            }
            return MakeMsg.plain(
              responseTranslator(
                'jrrp',
                sender.nickname,
                res.data.result.jrrp,
                ''
              )
            );
          } catch (e) {
            Logger.log('获取jrrp值失败');
            console.log(e);
            return MakeMsg.plain(responseTranslator('internal-error'));
          }
        }
        case '.r':
        case '.rs': {
          try {
            const res = await this.req.request({
              method: 'GET',
              url: '/d',
              qq: sender.qq,
              params: { exp: args[0], s: order === '.rs' },
            });
            if (!res) {
              throw new Error('掷骰请求失败');
            }
            const { result } = res.data;
            if (!result || !result.isValid) {
              return MakeMsg.plain(
                responseTranslator(
                  'dice-error',
                  result ? result.message : res.data.message
                )
              );
            }
            return MakeMsg.plain(
              responseTranslator('dice', sender.nickname, result.message)
            );
          } catch (e) {
            Logger.log('掷骰请求失败');
            console.log(e);
            return MakeMsg.plain(responseTranslator('internal-error'));
          }
        }
        case '.coc':
        case '.coc7': {
          try {
            const res = await this.req.request({
              method: 'GET',
              url: '/coc7',
              qq: sender.qq,
              params: { num: args[0] },
            });
            if (!res) {
              throw new Error('coc检定请求失败');
            }
            if (res.data.code !== 0) {
              Logger.log('coc检定请求失败');
              console.log(res.data.message);
              return MakeMsg.plain(
                responseTranslator('param-error', res.data.message)
              );
            }
            const { result } = res.data;
            const text = result.map((res: Record<string, number | string>) => {
              let t = '';
              for (const k in res) {
                t += `${k}: ${res[k]} `;
              }
              return t;
            });

            return MakeMsg.plain(
              responseTranslator('coc', sender.nickname, text.join('\n'))
            );
          } catch (e) {
            Logger.log('coc检定请求失败');
            console.log(e);
            return MakeMsg.plain(responseTranslator('internal-error'));
          }
        }
        case '.dnd':
        case '.dnd+': {
          try {
            const res = await this.req.request({
              method: 'GET',
              url: '/dnd',
              qq: sender.qq,
              params: { num: args[0] },
            });

            if (!res) {
              throw new Error('dnd检定请求失败');
            }
            if (res.data.code !== 0) {
              Logger.log('dnd检定请求失败');
              console.log(res.data.message);
              return MakeMsg.plain(
                responseTranslator('param-error', res.data.message)
              );
            }

            const { result } = res.data;
            const text = result
              .map(
                (dndResult: { sum: number }[]) =>
                  '[' + dndResult.map(({ sum }) => sum).join(', ') + ']'
              )
              .join('\n');

            return MakeMsg.plain(
              responseTranslator('dnd', sender.nickname, text)
            );
          } catch (e) {
            Logger.log('dnd检定请求失败');
            console.log(e);
            return MakeMsg.plain(responseTranslator('internal-error'));
          }
        }
        case '.choice': {
          let choices, count;
          if (isNaN(Number(args[0]))) {
            choices = args;
            count = 1;
          } else {
            count = Number(args[0]);
            choices = args.slice(1);
          }
          if (choices.length < 2) {
            return MakeMsg.plain(
              responseTranslator('param-error', '请至少给出两个选项')
            );
          }
          try {
            const res = await this.req.request({
              method: 'GET',
              url: '/choice',
              qq: sender.qq,
              data: { options: choices.join(','), count },
            });
            if (!res) {
              throw new Error('选择请求失败');
            }
            if (res.data.code !== 0) {
              Logger.log('选择请求失败');
              console.log(res.data.message);
              return MakeMsg.plain(
                responseTranslator('internal-error', res.data.message)
              );
            }
            return MakeMsg.plain(
              responseTranslator(
                'choice',
                sender.nickname,
                res.data.result.join(', ')
              )
            );
          } catch (e) {
            Logger.log('选择请求失败');
            console.log(e);
            return MakeMsg.plain(responseTranslator('internal-error'));
          }
        }
        default:
          Logger.log('未知的指令：' + order);
      }
    }

    return null;
  }
}
