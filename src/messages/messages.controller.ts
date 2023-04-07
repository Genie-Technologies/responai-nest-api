import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}
  // Get the messages from the psql database
  @Get()
  async getMessages() {
    return await this.messagesService.getMessages();
  }
}
