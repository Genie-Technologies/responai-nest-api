import { Controller, Get } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}
  // Get the messages from the psql database
  @Get()
  async getMessages() {
    return await this.messagesService.getMessages();
  }
}
