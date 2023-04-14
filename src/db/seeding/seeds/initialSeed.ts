import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';

import { Users } from '../../models/users.entity';
import { Messages } from '../../models/messages.entity';

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const users = await factory(Users)().createMany(15);
    await factory(Messages)()
      .map(async (post) => {
        post.senderId = users[Math.floor(Math.random() * users.length)].id;
        post.receiverId = users[Math.floor(Math.random() * users.length)].id;
        return post;
      })
      .createMany(100);

    const messages = await factory(Messages)().createMany(100);
    // ...
  }
}
