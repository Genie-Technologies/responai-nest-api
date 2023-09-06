import { DataSource } from "typeorm";
import { dataSource } from "./data-source";
import { Users } from "./models/users.entity";
import { Messages } from "./models/messages.entity";
import { Threads } from "./models/threads.entity";
import { Participants } from "./models/participants.entity";
import { randomUUID } from "crypto";

dataSource.initialize().then(async () => {
  await dataInit(dataSource);

  process.exit(0);
});

const dataInit = async (AppDataSource: DataSource) => {
  // Create new users for testing
  const user = await AppDataSource.manager.save(
    AppDataSource.manager.create(Users, {
      firstName: "Timber",
      lastName: "Saw",
      email: "randombron1@gmail.com",
      password: "test1",
    }),
  );

  const user2 = await AppDataSource.manager.save(
    AppDataSource.manager.create(Users, {
      firstName: "Phantom",
      lastName: "Assassin",
      email: "test@test.com",
      password: "test",
    }),
  );

  const user3 = await AppDataSource.manager.save(
    AppDataSource.manager.create(Users, {
      firstName: "Al",
      lastName: "Bronson",
      email: "lebron.alex21@gmail.com",
      password: "test",
    }),
  );

  const thread = await AppDataSource.manager.save(
    AppDataSource.manager.create(Threads, {
      userId: user.id,
      createdAt: new Date(),
      lastMessage: "First Message",
      isActive: true,
      threadName: "Shitposters",
    }),
  );

  const thread2 = await AppDataSource.manager.save(
    AppDataSource.manager.create(Threads, {
      userId: user.id,
      createdAt: new Date(),
      lastMessage: "I was born in the dark",
      isActive: false,
      threadName: "Batgun",
    }),
  );

  // Create participants for threads
  await AppDataSource.manager.save(
    AppDataSource.manager.create(Participants, {
      id: randomUUID(),
      threadId: thread.id,
      userId: user.id,
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Participants, {
      id: randomUUID(),
      threadId: thread.id,
      userId: user2.id,
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Participants, {
      id: randomUUID(),
      threadId: thread.id,
      userId: user3.id,
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Participants, {
      id: randomUUID(),
      threadId: thread2.id,
      userId: user3.id,
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Participants, {
      id: randomUUID(),
      threadId: thread2.id,
      userId: user.id,
    }),
  );

  // Create messages
  await AppDataSource.manager.save(
    AppDataSource.manager.create(Messages, {
      senderId: user.id,
      receiverId: user2.id,
      message: "I'm not fuckin leavin",
      threadId: thread.id,
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Messages, {
      senderId: user3.id,
      receiverId: user.id,
      message: "We own the night",
      threadId: thread2.id,
    }),
  );
};
