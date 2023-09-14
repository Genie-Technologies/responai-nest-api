import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Messages } from "src/db/models/messages.entity";
import { Participants } from "src/db/models/participants.entity";
import { Repository } from "typeorm";

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Messages)
    private readonly messagesRepository: Repository<Messages>,
    @InjectRepository(Participants)
    private readonly particpantsRepository: Repository<Participants>,
  ) {}

  // Get the messages from the psql database
  async getMessages() {
    try {
      // Reach out to the database and get the messages
      return await this.messagesRepository.find();
    } catch (error) {
      throw error;
    }
  }

  async getMessage(id: string) {
    try {
      return await this.messagesRepository.findOne({ where: { id } });
    } catch (error) {}
  }

  async getMessageBySender(senderId: string) {
    try {
      return await this.messagesRepository.findOne({
        where: { senderId },
        order: { createdAt: "ASC" },
      });
    } catch (error) {}
  }

  async getMessagesBySender(senderId: string) {
    try {
      return await this.messagesRepository.find({
        where: { senderId },
        order: { createdAt: "ASC" },
      });
    } catch (error) {
      console.log(
        "Error getting all messages by sender: ",
        senderId,
        "\n",
        error,
      );
    }
  }

  async getMessageByReceiver(receiverId: string) {
    try {
      return await this.messagesRepository.findOne({
        where: { receiverId },
        order: { createdAt: "ASC" },
      });
    } catch (error) {
      console.log(
        "Error getting message by receiver: ",
        receiverId,
        "\n",
        error,
      );
    }
  }

  async getMessagesForThread(threadId: string) {
    try {
      const messages = await this.messagesRepository.find({
        where: [{ threadId }],
      });
      return messages;
    } catch (err) {
      console.log("Error in getMessagesForThread:", err);
    }
  }

  async saveMessage(message: Messages) {
    try {
      return await this.messagesRepository.save(message);
    } catch (error) {}
  }

  // TODO: Dunno if we need this but I'm keeping it her for now incase we need it later.
  async checkIfThreadExists(userIds: string[]) {
    // Check if the thread exists
    // If the thread exists, return the thread id
    // If the thread does not exist, return false

    // Get all the threads

    const obj = {};
    let exists = false;
    const allParticipants = await this.particpantsRepository.find({
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
