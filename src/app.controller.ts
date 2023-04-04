import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // private userService: UsersService,
  ) {}

  @Get()
  getHello(): string {
    // this.userService.getUser('kawjdnkwjd');
    return this.appService.getHello();
  }
}
