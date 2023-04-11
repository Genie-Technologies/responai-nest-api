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
    return await this.messagesRepository.findOne({ where: { id } });
  }
  async getMessageBySender(senderId: string) {
    return await this.messagesRepository.findOne({
      where: { senderId },
      order: { createdAt: 'ASC' },
    });
  }
  async getMessagesBySender(senderId: string) {
    return await this.messagesRepository.find({
      where: { senderId },
      order: { createdAt: 'ASC' },
    });
  }
  async getMessageByReceiver(recieverId: string) {
    return await this.messagesRepository.find({ where: { recieverId } });
  }
  async getMessagesForUserThread(user_id: string) {
    const allMessagesForUser = await this.getMessagesBySender(user_id);
    console.log('allMessagesForUser: ', allMessagesForUser);
    const other_user_id = allMessagesForUser[0].recieverId;
    console.log('other_user_id: ', other_user_id);
    return await this.getAllMessagesBetweenUsers(user_id, other_user_id);
  }
  async getAllMessagesBetweenUsers(senderId: string, recieverId: string) {
    return await this.messagesRepository.find({
      where: [{ senderId }, { recieverId }],
    });
  }
  async saveMessage(message: Messages) {
    return await this.messagesRepository.save(message);
  }

  async checkIfThreadExists(userIds: string[]) {
    // Check if the thread exists
    // If the thread exists, return the thread id
    // If the thread does not exist, return false

    // Get all the threads

    const obj = {};
    let exists = false;
    const allParticipants = await this.participantsRepository.find({
      // where: userIds.map((userId) => ({ user_id: userId })),
    });

    if (allParticipants.length === 0) {
      return false;
    }

    allParticipants.map((participant) => {
      obj[participant.threadId] = [
        ...(obj[participant.threadId] || []),
        // participant.user_id,
      ];
    });

    // loop over the arrays of userIds for each thread to check
    // if every userId is in the array. That lets you know
    // if a thread already exists or not.
    Object.values(obj).map((value: string[]) => {
      let count = 0;
      userIds.map((userId) => {
        if (value.includes(userId)) {
          count++;
        }
      });
      if (count === userIds.length) {
        exists = true;
      }
    });

    return exists;
  }
}
