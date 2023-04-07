import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Threads } from 'src/db/models/threads.entity';

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

  @Post('create')
  // The body of the request will be the new thread
  async createThread(@Body() newThread: Threads) {
    console.log('Controller: --> createThread: ', newThread, ' <--');
    return await this.messagesService.createThread(newThread);
  }
}
