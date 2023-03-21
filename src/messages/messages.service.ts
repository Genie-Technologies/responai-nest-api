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
}
