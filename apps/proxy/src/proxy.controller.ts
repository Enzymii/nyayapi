import { Controller, Post, Req } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('../config/config.js');

interface MyProxyRequest {
  path: string;
  method: string;
  params: Record<string, string>;
  data: Record<string, string>;
}

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post()
  async proxy(@Req() req: Request) {
    const { path, method, params, data } =
      req.body as unknown as MyProxyRequest;
    console.log({
      path,
      method,
      params,
      data,
    });
    const res = await axios.request({
      url: `http://${config.targetHost}:${config.targetPort}/${config.pathPrefix}/${path}`,
      method,
      headers: {
        ...config.headers,
      },
      params,
      data,
    });
    return JSON.stringify(res.data);
  }
}
