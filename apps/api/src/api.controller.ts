import { Controller, Get } from '@nestjs/common';
import { ApiService } from './api.service';

@Controller({
  version: '1',
})
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  getHello(): string {
    return this.apiService.getHello();
  }
}
