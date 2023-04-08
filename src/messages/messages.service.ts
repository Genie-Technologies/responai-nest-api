import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messages } from 'src/db/models/messages.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Messages)
    private readonly messagesRepository: Repository<Messages>,
  ) {}
  // Get the messages from the psql database
  async getMessages() {
    // Reach out to the database and get the messages
    return await this.messagesRepository.find();
  }
  async getMessage(id: string) {
    return await this.messagesRepository.findOne({ where: { sender_id: id } });
  }
  async getMessageByReceiver(id: string) {
    return await this.messagesRepository.find({ where: { receiver_id: id } });
  }
  async getMessagesForThread(sender_id: string, receiver_id: string) {
    return await this.messagesRepository.find({
      where: { sender_id, receiver_id },
    });
  }
  async saveMessage(message: unknown) {
    return await this.messagesRepository.save(message);
  }
}
