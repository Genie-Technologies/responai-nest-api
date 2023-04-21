import { Controller, Get, Post, Param } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { Messages } from "src/db/models/messages.entity";

export type MessageBody = {
  message: string;
};

@Controller("messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}
  // Get the messages from the psql database
  @Get()
  async getMessages() {
    return await this.messagesService.getMessages();
  }

  @Get(":id")
  async getMessage(@Param("id") id: string) {
    try {
      return await this.messagesService.getMessage(id);
    } catch (error) {
      // Return a 400 if the message is not found or the id is not UUID
      return { error: error.message, status: 400 };
    }
  }

  @Get("sender/:sender_id")
  async getMessagesForUserThread(sender_id: string) {
    try {
      return await this.messagesService.getMessagesForUserThread(sender_id);
    } catch (error) {
      return { error: error.message, status: 400 };
    }
  }

  @Post("create")
  async createMessage(req) {
    const messageBody: Messages = req.body as any;
    return await this.messagesService.saveMessage(messageBody);
  }
}
