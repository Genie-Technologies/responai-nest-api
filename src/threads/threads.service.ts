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

  async getThread(threadId: string, userId?: string) {
    const res = await this.threadsRepository
      .createQueryBuilder("thread")
      .leftJoinAndSelect("thread.participants", "participants")
      .where("thread.id = :threadId", { threadId })
      .andWhere("participants.userId != :userId", { userId })
      .getOne();

    if (!res) {
      const thread = await this.threadsRepository.findOne({
        where: { id: threadId },
      });
      thread.participants = [];
      return thread;
    }

    return res;
  }

  async saveThread(thread: Threads) {
    try {
      return await this.threadsRepository.save(thread);
    } catch (error) {
      console.log("Error saving thread:", error);
    }
  }

  // TODO-AL: I tried using this createQueryBuilder but to no avail.
  // const threads = await this.threadsRepository
  //     .createQueryBuilder("threads")
  //     .leftJoinAndSelect("threads.participants", "participants")
  //     .leftJoinAndSelect("participants.user", "users")
  //     .where(`users.id::uuid = :userId::uuid`, { userId })
  //     .getMany();
  //   return threads;
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

        Object.assign(userThread[0], { participants });
        return userThread[0];
      }),
    );

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
    try {
      const newUuid = randomUUID().toString();

      // TODO-AL-NEXT: Now I think we have problem saving thread. Create thread then add message. See what happens.
      const savedThread = await this.threadsRepository.save({
        id: newUuid,
        // userId represents the creator of the thread.
        userId: newThread.userId,
        createdAt: newThread.createdAt,
        isActive: newThread.isActive,
      });
      const savedParticipant = await this.participantsRepository.save({
        threadId: savedThread.id,
        userId: savedThread.userId,
      });

      if (savedParticipant) {
        return savedThread;
      }
    } catch (error) {
      console.log("Error creating thread:", error);
      return error;
    }
  }

  async updateThread(thread: {
    id: string;
    threadName: string;
    createdAt: Date;
    isActive: boolean;
    participants: string[];
  }) {
    try {
      let particpants = thread?.participants?.map((participantId) => {
        return { threadId: thread.id, userId: participantId };
      });

      if (particpants?.length > 0) {
        // save all participants at once to db. particapants is an array of objects
        particpants = await this.participantsRepository.save(particpants);
        delete thread.participants;
        const newThread = await this.threadsRepository.save(
          thread as unknown as Threads,
        );
        // @ts-ignore
        newThread.participants = particpants;
        return newThread;
      }

      return await this.threadsRepository.save(thread as unknown as Threads);
    } catch (error) {
      console.log("Error updating thread:", error);
      return error;
    }
  }

  async deleteThread(threadId: string) {
    try {
      await this.participantsRepository.delete({ threadId });
      await this.messagesRepository.delete({ threadId });
      return await this.threadsRepository.delete({ id: threadId });
    } catch (error) {
      console.log("Error deleting thread:", error);
      return error;
    }
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
