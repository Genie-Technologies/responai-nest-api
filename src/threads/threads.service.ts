import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "crypto";
import { NewThreadRequestPayload } from "src/constants";
import { Messages } from "src/db/models/messages.entity";
import { Participants } from "src/db/models/participants.entity";
import { Threads } from "src/db/models/threads.entity";
import { Not, Repository } from "typeorm";

@Injectable()
export class ThreadsService {
  constructor(
    @InjectRepository(Messages)
    private readonly messagesRepository: Repository<Messages>,
    @InjectRepository(Threads)
    private readonly threadsRepository: Repository<Threads>,
    @InjectRepository(Participants)
    private readonly participantsRepository: Repository<Participants>,
  ) {}

  async getThreads() {
    return await this.threadsRepository.find();
  }

  async getThread(threadId: string) {
    return await this.threadsRepository.find({ where: { id: threadId } });
  }

  async getThreadsByUserId(userId: string) {
    const threads = await this.participantsRepository.find({
      where: { userId },
    });

    const threadsForUser = await Promise.all(
      threads.map(async (thread) => {
        const userThread = await this.threadsRepository.find({
          where: { id: thread.threadId },
        });

        // Now get all participants for the given threadId
        const participants = await this.participantsRepository.find({
          where: { threadId: thread.threadId, userId: Not(userId) },
        });

        Object.assign(userThread[0], { participants, messages: [] });

        return userThread[0];
      }),
    );
    console.log("threadsForUser", threadsForUser);
    return threadsForUser;
  }

  async saveLastMessageToThread(threadId: string, lastMessage: string) {
    const thread = await this.threadsRepository.findOne({
      where: { id: threadId },
    });

    if (!thread) {
      return;
    }

    thread.lastMessage = lastMessage;

    await this.threadsRepository.save(thread);
  }

  async createThread(newThread: NewThreadRequestPayload) {
    const newUuid = randomUUID().toString();

    const thread = this.threadsRepository.create({
      id: newUuid,
      // userId represents the creator of the thread.
      userId: newThread.userId,
      createdAt: newThread.createdAt,
      lastMessage: newThread.lastMessage,
      threadName: newThread.threadName,
    });

    const savedThread = await this.threadsRepository.save(thread);

    return savedThread;
  }

  async getMessagesByThread(threadId: string) {
    const thread = await this.threadsRepository.findOne({
      where: { id: threadId },
    });

    if (!thread || !thread.isActive) {
      return [];
    }

    const messages = await this.messagesRepository.find({
      where: { threadId },
      order: { createdAt: "ASC" },
    });

    return messages;
  }

  async threadExistsBetweenUsers(
    currentUser: string,
    otherUser: string | string[],
  ): Promise<boolean> {
    const otherUsers = Array.isArray(otherUser) ? otherUser : [otherUser];

    // Base case: if the current user has no threads, return false
    const currentUserThreads = await this.threadsRepository.find({
      where: { userId: currentUser },
    });

    if (currentUserThreads.length === 0) {
      return false;
    }

    let threadIds = await this.participantsRepository
      .createQueryBuilder("participants")
      .select("participants.threadId")
      .where("participants.userId = :currentUser", { currentUser })
      .getRawMany();

    threadIds = threadIds.map((thread) => thread.threadId);

    if (threadIds.length === 0) {
      return false;
    }

    const userIds = await this.participantsRepository
      .createQueryBuilder("participants")
      .select("participants.userId")
      .where("participants.threadId IN (:...threadIds)", { threadIds })
      .getRawMany();

    const exists = userIds.every((user) => {
      return user.userId === currentUser || otherUsers.includes(user.userId);
    });

    return exists;
  }

  async getThreadsWithParticipantsAndMessages(threads: [Threads[], number]) {
    // Get the participants for each thread and add them to the thread object
    const threadsWithParticipants = await Promise.all(
      threads[0].map(async (thread) => {
        const participants = await this.participantsRepository
          .createQueryBuilder("participants")
          .select([
            "users.id as userId",
            "users.firstName as firstName",
            "users.lastName as lastName",
            "users.email as email",
          ])
          .innerJoin("users", "users", 'participants."userId"::uuid = users.id')
          .getRawMany();

        const messages = await this.messagesRepository.find({
          where: { threadId: thread.id },
        });

        return { ...thread, participants, messages };
      }),
    );

    return threadsWithParticipants;
  }
}
