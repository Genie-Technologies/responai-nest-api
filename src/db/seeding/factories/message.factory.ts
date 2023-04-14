import { faker } from '@faker-js/faker';
import { define } from 'typeorm-seeding';

import { Messages } from '../../models/messages.entity';

define(Messages, () => {
  const message = new Messages();
  const messageText = faker.lorem.words(8);

  message.message = messageText;
  message.senderId = faker.datatype.uuid();
  message.receiverId = faker.datatype.uuid();
  message.threadId = `${Math.floor(Math.random() * 15)}`;

  return message;
});
