import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "crypto";
import { NewThreadRequestPayload } from "src/constants";
import { Messages } from "src/db/models/messages.entity";
import { Participants } from "src/db/models/participants.entity";
import { Threads } from "src/db/models/threads.entity";
import { Repository } from "typeorm";

@Injectable()
export class ThreadsService {
  constructor(
    @InjectRepository(Messages)
    private readonly messagesRepository: Repository<Messages>,
    @InjectRepository(Threads)
    private readonly threadsRepository: Repository<Threads>,
    @InjectRepository(Participants)
    private readonly participantsRepository: Repository<Participants>
  ) {}

  async getThreadsByUserId(userId: string) {
    console.log(
      "Reaching out to the API to get threads for this user: ",
      userId
    );
    const threads = await this.threadsRepository.findAndCount({
      where: { userId },
    });

    console.log("-------> Threads: ", threads);

    const threadsWithParticipants =
      await this.getThreadsWithParticipantsAndMessages(threads);

    console.log(
      "Threads beign returned for this user: ",
      userId,
      threadsWithParticipants
    );
    return threadsWithParticipants;
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
    const { participants } = newThread;
    const newUuid = randomUUID().toString();
    const threadLinkId = randomUUID().toString();

    const threadExists = await this.threadExistsBetweenUsers(
      newThread.userId,
      participants
    );

    console.log("Thread Exists: ", threadExists);

    if (threadExists) {
      return await this.threadsRepository.findOne({
        where: { userId: newThread.userId },
      });
    }

    console.log(
      "Creating new thread: ",
      newThread,
      " with participants: ",
      participants
    );

    const thread = this.threadsRepository.create({
      id: newUuid,
      userId: newThread.userId,
      createdAt: newThread.createdAt,
      isActive: newThread.isActive,
      lastMessage: newThread.lastMessage,
      threadName: newThread.threadName,
      threadLinkId: newThread.threadLinkId || threadLinkId,
    });

    const participantsToSave = participants.map((participant) => {
      return this.participantsRepository.create({
        userId: participant,
        threadId: newUuid,
      });
    });

    await this.participantsRepository.save(participantsToSave);
    await this.threadsRepository.save(thread);

    const threadWithParticipantsAndMessages =
      await this.getThreadsWithParticipantsAndMessages([[thread], 0]);
    console.log("New thread: ", thread);
    return threadWithParticipantsAndMessages;
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
    otherUser: string | string[]
  ): Promise<boolean> {
    console.log(
      "Checking if thread exists between users: ",
      currentUser,
      otherUser
    );
    const otherUsers = Array.isArray(otherUser) ? otherUser : [otherUser];

    // Base case: if the current user has no threads, return false
    const currentUserThreads = await this.threadsRepository.find({
      where: { userId: currentUser },
    });

    if (currentUserThreads.length === 0) {
      return false;
    }

    console.log("Retrieve all thread IDs that belong to the current user");
    let threadIds = await this.participantsRepository
      .createQueryBuilder("participants")
      .select("participants.threadId")
      .where("participants.userId = :currentUser", { currentUser })
      .getRawMany();

    threadIds = threadIds.map((thread) => thread.threadId);

    if (threadIds.length === 0) {
      return false;
    }

    console.log(
      "Retrieve all user IDs that belong to the threads associated with the current user",
      threadIds
    );
    const userIds = await this.participantsRepository
      .createQueryBuilder("participants")
      .select("participants.userId")
      .where("participants.threadId IN (:...threadIds)", { threadIds })
      .getRawMany();

    console.log(
      "Check if a thread exists between the current user and the other user(s)"
    );
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

        console.log("Participants: ", participants);

        return { ...thread, participants, messages };
      })
    );

    return threadsWithParticipants;
  }
}
