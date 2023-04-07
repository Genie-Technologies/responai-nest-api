import { Controller, Get, Param, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('threads')
export class ThreadsController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('health')
  health() {
    return 'OK';
  }

  // @UseGuards(AuthGuard('jwt'))
  @Get(':userId')
  async getThreads(@Param('userId') userId: string) {
    return await this.messagesService.getThreads(userId);
  }

  @Post('threads')
  async createThread(@Param('userId') userId: string) {
    return await this.messagesService.createThread(userId);
  }
}
