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

  const user4 = await AppDataSource.manager.save(
    AppDataSource.manager.create(Users, {
      firstName: "Shagun",
      lastName: "Mistry",
      email: "smistr61@gmail.com",
      password: "test",
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Users, {
      authOId: "shagun.mistry@hotmail.com",
      fullName: "shagun.mistry@hotmail.com",
      email: "shagun.mistry@hotmail.com",
      picture:
        "https://s.gravatar.com/avatar/7636d01e1def5b08671a48116e3c777a?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fsh.png",
      joined: "2023-11-19 11:31:14.194",
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Users, {
      authOId: "anicajerkovic4@gmail.com",
      fullName: "Anica Jerkovic",
      email: "anicajerkovic4@gmail.com",
      picture:
        "https://lh3.googleusercontent.com/a/ACg8ocIUD4-cWcf5Us2Wv3PVaEFjnN0j4QvqFMMd3fPAyL59xCw=s96-c",
      joined: "2023-12-25 17:40:52.975",
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
      threadId: thread.id,
      userId: user4.id,
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

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Participants, {
      id: randomUUID(),
      threadId: thread2.id,
      userId: user4.id,
    }),
  );

  // Create messages
  await AppDataSource.manager.save(
    AppDataSource.manager.create(Messages, {
      senderId: user.id,
      receiverId: user2.id,
      message: "I'm not fuckin leavin",
      threadId: thread.id,
      embedded: false,
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Messages, {
      senderId: user3.id,
      receiverId: user.id,
      message: "We own the night",
      threadId: thread2.id,
      embedded: false,
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Messages, {
      senderId: user4.id,
      receiverId: user.id,
      message: "I am Batgun",
      threadId: thread2.id,
      embedded: false,
    }),
  );
};
