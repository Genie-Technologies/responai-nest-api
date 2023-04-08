import { faker } from '@faker-js/faker';
import { define } from 'typeorm-seeding';

import { Users } from '../../models/users.entity';

define(Users, () => {
  const user = new Users();
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = faker.internet.email();

  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;

  return user;
});
