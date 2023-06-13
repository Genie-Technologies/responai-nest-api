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
  await AppDataSource.manager.save(
    AppDataSource.manager.create(Users, {
      firstName: "Timber",
      lastName: "Saw",
      email: "randombron1@gmail.com",
      password: "test1",
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Users, {
      firstName: "Phantom",
      lastName: "Assassin",
      email: "test@test.com",
      password: "test",
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Users, {
      firstName: "Al",
      lastName: "Bronson",
      email: "lebron.alex21@gmail.com",
      password: "test",
    }),
  );

  // Write function to get user id of previously created user above using typeorm query builder
  const user = await AppDataSource.getRepository(Users).findOne({
    where: { firstName: "Timber" },
  });

  const user2 = await AppDataSource.getRepository(Users).findOne({
    where: { firstName: "Phantom" },
  });

  const user3 = await AppDataSource.getRepository(Users).findOne({
    where: { firstName: "Al" },
  });

  // Create threads for users
  const threadId = randomUUID();
  const threadId2 = randomUUID();

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Threads, {
      userId: user.id,
      id: threadId,
      createdAt: new Date(),
      lastMessage: "First Message",
      isActive: true,
      threadName: "Shitposters",
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Threads, {
      userId: user.id,
      id: threadId2,
      createdAt: new Date(),
      lastMessage: "I was born in the dark",
      isActive: false,
      threadName: "Batgun",
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Threads, {
      userId: user.id,
      id: threadId,
      createdAt: new Date(),
      lastMessage: "First Message",
      isActive: true,
      threadName: "Shitposters",
    }),
  );

  // Create participants for threads
  await AppDataSource.manager.save(
    AppDataSource.manager.create(Participants, {
      id: randomUUID(),
      threadId,
      userId: user.id,
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Participants, {
      id: randomUUID(),
      threadId,
      userId: user2.id,
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Participants, {
      id: randomUUID(),
      threadId,
      userId: user3.id,
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Participants, {
      id: randomUUID(),
      threadId: threadId2,
      userId: user3.id,
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Participants, {
      id: randomUUID(),
      threadId: threadId2,
      userId: user.id,
    }),
  );

  // Create messages
  await AppDataSource.manager.save(
    AppDataSource.manager.create(Messages, {
      senderId: user.id,
      receiverId: user2.id,
      message: "I'm not fuckin leavin",
      threadId,
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Messages, {
      senderId: user3.id,
      receiverId: user.id,
      message: "We own the night",
      threadId: threadId2,
    }),
  );
};
