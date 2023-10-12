import { Bot, Logger, MakeMsg, recvIsMessage } from 'mirainya2';
import { botConfig } from './config/bot-config';

const main = async () => {
  try {
    const bot = new Bot(botConfig);

    await bot.login();

    bot.listen((recv) => {
      if (recvIsMessage(recv)) {
        Logger.log(JSON.stringify(recv));
        bot.api.sendFriendMessage(recv.sender.id, [
          MakeMsg.plain('hello world'),
        ]);
        console.log(recv);
      }
    });
  } catch (e) {
    Logger.log(e as string);
  }
};

main();
