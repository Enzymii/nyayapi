import { Bot, Logger, recvIsMessage } from 'mirainya2';
import { QQMessageHandler } from 'qq-message-handler';
import { botConfig } from './config/bot-config';

const main = async () => {
  try {
    const bot = new Bot(botConfig);

    await bot.login();

    const handler = new QQMessageHandler(bot);

    bot.listen((recv) => {
      if (recvIsMessage(recv)) {
        Logger.log(JSON.stringify(recv));
        handler.handle(recv);
      }
    });
  } catch (e) {
    Logger.log(e as string);
  }
};

main();
