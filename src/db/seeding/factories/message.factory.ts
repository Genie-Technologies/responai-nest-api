import { faker } from '@faker-js/faker';
import { define } from 'typeorm-seeding';

import { Messages } from '../../models/messages.entity';

define(Messages, () => {
  const message = new Messages();
  const messageText = faker.lorem.words(8);

  message.message = messageText;
  message.sender_id = faker.datatype.uuid();
  message.receiver_id = faker.datatype.uuid();
  message.thread_id = `${Math.floor(Math.random() * 15)}`;

  return message;
});
