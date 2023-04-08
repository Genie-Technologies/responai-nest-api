import { DataSource } from 'typeorm';
import { dataSource } from './data-source';
import { Users } from './models/users.entity';
import { Messages } from './models/messages.entity';

dataSource.initialize().then(async () => {
  await dataInit(dataSource);
  console.log('Data seeded');
  process.exit(0);
});

const dataInit = async (AppDataSource: DataSource) => {
  // insert new users for test
  await AppDataSource.manager.save(
    AppDataSource.manager.create(Users, {
      firstName: 'Timber',
      lastName: 'Saw',
      email: 'test@test1.com',
      password: 'test1',
    }),
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Users, {
      firstName: 'Phantom',
      lastName: 'Assassin',
      email: 'test@test.com',
      password: 'test',
    }),
  );

  // Write function to get user id of previously created user above using typeorm query builder
  const user = await AppDataSource.getRepository(Users).findOne({
    where: { firstName: 'Timber' },
  });

  const user2 = await AppDataSource.getRepository(Users).findOne({
    where: { firstName: 'Phantom' },
  });

  console.log('USER_ID', user, 'USER_ID2', user2);
  await AppDataSource.manager.save(
    AppDataSource.manager.create(Messages, {
      sender_id: user.id,
      receiver_id: user2.id,
      message: "I'm not fuckin leavin",
      thread_id: '100001',
    }),
  );

  // await AppDataSource.getRepository(Message).findOneBy({user_id: user.id,
  //     other_user_id: user2.id,
  //     message_body: "I'm not fuckin leavin" }
  // )
};
