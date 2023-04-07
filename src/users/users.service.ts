import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Users } from 'src/db/models/users.entity';
import { MessagesService } from 'src/messages/messages.service';
import { Repository } from 'typeorm';

export interface UserBody {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  familyName: string;
  picture: string;
  joined: string;
  locale: string;
  authOId: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private messageService: MessagesService,
  ) {}

  USER_NOT_FOUND = 'User not found';
  INVALID_UUID = 'Invalid UUID';

  isUUID(uuid: string): boolean {
    const uuidPattern =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i;
    return uuidPattern.test(uuid);
  }

  healthCheck() {
    return 'Users service is up and running';
  }

  async getUser(id: string): Promise<Users> {
    try {
      console.log('Finding user by this id: ', id);

      let foundUser: Users;

      if (!this.isUUID(id)) {
        console.log('id is not a UUID, trying to find by authOId: ', id);
        foundUser = await this.usersRepository.findOne({
          where: { authOId: id },
        });
      } else {
        foundUser = await this.usersRepository.findOne({
          where: { id },
        });
      }

      console.log('foundUser: ', foundUser);

      if (!foundUser) {
        throw new Error(this.USER_NOT_FOUND);
      }

      delete foundUser.password;

      return foundUser;
    } catch (error) {
      console.log('Error: ', error);
      throw error;
    }
  }

  async createUser(user?: UserBody) {
    try {
      console.log('Creating user: ', user);
      return await this.usersRepository.save({
        id: randomUUID().toString(),
        lastLogin: new Date(),
        ...user,
      });
    } catch (error) {
      console.error('Error while creating user: ', error);
      throw new Error(
        'There was an error creating the user, please try again later.',
      );
    }
  }
}
