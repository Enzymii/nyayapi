import Axios from 'axios';
import { apiConfig } from '../config/api-config';

export class MyRequest {
  private readonly req = Axios.create({
    baseURL: apiConfig.baseURL,
    headers: { Authorization: apiConfig.auth },
    timeout: 2000,
  });

  public async request({
    method,
    url,
    params = {},
    data = {},
    qq,
    group,
  }: {
    method: 'GET' | 'POST';
    url: string;
    params?: Record<string, unknown>;
    data?: unknown;
    qq?: number;
    group?: number;
  }) {
    try {
      const from = qq ? Buffer.from(qq + '@qq').toString('base64') : undefined;

      return await this.req.request({
        method,
        url,
        params: { ...params, from, group },
        data,
      });
    } catch (e) {
      console.log(e);
    }
  }
}
