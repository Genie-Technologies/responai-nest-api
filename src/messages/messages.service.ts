import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messages } from 'src/db/models/messages.entity';
import { Threads } from 'src/db/models/threads.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Messages)
    private readonly messagesRepository: Repository<Messages>,
    @InjectRepository(Threads)
    private readonly threadsRepository: Repository<Threads>,
  ) {}
  // Get the messages from the psql database
  async getMessages() {
    // Reach out to the database and get the messages
    return await this.messagesRepository.find();
  }

  // Get threads for the current user
  async getThreads(userId: string) {
    console.log(
      'Reaching out to the API to get threads for this user: ',
      userId,
    );
    // Reach out to the database and get the threads for the current user
    const threads = await this.threadsRepository.findOne({
      where: { userId },
    });

    return threads;
  }

  // Create a new thread for the current user
  async createThread(userId: string) {
    // Reach out to the database and create a new thread for the current user
    const newThread = this.threadsRepository.create({
      userId,
    });

    return await this.threadsRepository.save(newThread);
  }
}
