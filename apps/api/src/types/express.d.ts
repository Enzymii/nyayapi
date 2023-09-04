import type { Request } from 'express';

declare module 'express' {
  interface MyRequest extends Request {
    id: number | string;
    userId: string;
  }
}
