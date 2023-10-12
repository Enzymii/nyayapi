import { Bot, MakeMsg, RecvType, recvIsMessage } from 'mirainya2';
import type {
  GroupInfo,
  GroupMessageChain,
  Message,
  MessageChain,
  PlainMessage,
} from 'mirainya2';
import { responseTranslator } from './response/response';
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

      textMsgs.forEach((text) =>
        this.handleText(text as PlainMessage, {
          qq: recv.sender.id,
          group: (recv as GroupMessageChain).sender.group,
        })
      );
    } else {
      // handle events here...
    }
  }

  private async handleText(
    msg: PlainMessage,
    sender: { qq: number; group?: GroupInfo }
  ): Promise<Message | MessageChain | null> {
    // TODO: do something to text, should be returned by a MakeMsg function
    const { text } = msg;
    const text2 = text
      .trim()
      .replace(/^。/, '.')
      .replaceAll(/\s/, ' ')
      .toLocaleLowerCase();

    if (/^\.\s*[a-z0-9]+/.test(text2)) {
      // order messages
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [order, ...args] = text2.split(' ');

      switch (order) {
        case '.ping':
        case '。ping': {
          return MakeMsg.plain(responseTranslator('pong'));
        }
        case '.jrrp': {
          const data = (
            await this.req.request({
              method: 'GET',
              url: '/jrrp',
              qq: sender.qq,
            })
          )?.data;

          return MakeMsg.plain(responseTranslator('jrrp', data.jrrp));
        }
        default:
          return MakeMsg.plain('unknown command');
      }
    }

    return null;
  }
}
