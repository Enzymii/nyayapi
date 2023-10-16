import { apiConfig } from '../config/api-config';
import { official as responseMap } from './response/response.json';

export const responseTranslator = (respName: string, ...respArgs: string[]) => {
  const res = responseMap.find((resp) => resp.name === respName);
  if (!res) {
    throw new Error(`Invalid response name: ${respName}`);
  } else {
    let resp = res.content.replaceAll(/\$\$/g, apiConfig.botName);
    respArgs.forEach((arg, index) => {
      resp = resp.replace(`$${index}`, arg);
    });
    return resp;
  }
};
