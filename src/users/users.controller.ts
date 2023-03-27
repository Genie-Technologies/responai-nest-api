import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UserBody, UsersService } from './users.service';
import { MessagesService } from 'src/messages/messages.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  healthCheck() {
    return this.usersService.healthCheck();
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    console.log('id: ', id);
    try {
      return await this.usersService.getUser(id);
    } catch (error) {
      // Return a 400 if the user is not found or the id is not UUID
      return { error: error.message, status: 400 };
    }
  }

  @Post('create')
  async createUser(@Req() req: Request) {
    const userBody: UserBody = req.body as any;
    return await this.usersService.createUser(userBody);
  }
}
