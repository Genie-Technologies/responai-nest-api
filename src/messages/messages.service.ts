import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
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
    const threads = await this.threadsRepository.findAndCount({
      where: { userId },
    });

    return threads;
  }

  // Create a new thread for the current user
  async createThread(newThread: Threads) {
    // Generate a new UUID for the id property
    const newUuid = randomUUID().toString();
    console.log('New UUID: ', newUuid);

    // Check if a thread already exists between the current user and the other user(s)
    const threadExists = await this.threadExistsBetweenUsers(
      newThread.userId,
      newThread.participants,
    );

    console.log('Thread Exists: ', threadExists);

    if (threadExists) {
      // Return the existing thread
      return await this.threadsRepository.findOne({
        where: { userId: newThread.userId },
      });
    }

    // Create a new Threads entity with the generated UUID
    const thread = this.threadsRepository.create({
      id: newUuid,
      userId: newThread.userId,
      participants: newThread.participants,
      messages: newThread.messages,
      createdAt: newThread.createdAt,
      isActive: newThread.isActive,
      lastMessage: newThread.lastMessage,
      threadName: newThread.threadName,
    });

    // Save the new thread to the database
    console.log('New thread: ', thread);
    return await this.threadsRepository.save(thread);
  }

  // Get the messages for a specific thread
  async getMessagesByThread(threadId: string) {
    // Reach out to the database and get the messages for the current thread
    const messages = await this.messagesRepository.find({
      where: { thread_id: threadId },
    });

    // Sort the messages by latest first
    messages.sort((a, b) => {
      return b.created_at.getTime() - a.created_at.getTime();
    });

    return messages;
  }

  async threadExistsBetweenUsers(
    currentUser: string,
    otherUser: string | string[],
  ): Promise<boolean> {
    const threads = await this.threadsRepository.find({
      where: { userId: currentUser },
    });

    // Convert the `otherUser` parameter to an array if it's a single string
    const otherUsers = Array.isArray(otherUser) ? otherUser : [otherUser];

    console.log('Existing threads: ', threads);

    for (const thread of threads) {
      if (
        thread.participants.includes(currentUser) &&
        otherUsers.every((user) => thread.participants.includes(user))
      ) {
        return true;
      }
    }

    return false;
  }
}
