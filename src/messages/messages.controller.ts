import { Controller, Get, Post, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';

export type MessageBody = {
  message: string;
};

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}
  // Get the messages from the psql database
  @Get()
  async getMessages() {
    return await this.messagesService.getMessages();
  }

  @Get()
  async getMessagesForUser(sender_id: number) {
    return await this.messagesService.getMessage(sender_id);
  }

  @Post('create')
  async createUser(@Req() req) {
    const userBody: MessageBody = req.body as any;
    return await this.messagesService.saveMessage(userBody);
  }
}
