import axios from 'axios';
// import config from './config/config';

class MyRequest {
  axiosInstance = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async requestToProxy({
    path,
    method,
    params,
    data,
  }: Record<string, unknown>) {
    return this.axiosInstance.request({
      url: '/',
      method: 'POST',
      data: {
        path,
        method,
        params,
        data,
      },
    });
  }
}

const myRequest = new MyRequest();

export default myRequest;
