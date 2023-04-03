import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Users } from 'src/db/models/users.entity';
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
  ) {}

  USER_NOT_FOUND = 'User not found';
  INVALID_UUID = 'Invalid UUID';

  isUUID(uuid: string): boolean {
    const uuidPattern =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i;
    return uuidPattern.test(uuid);
  }

  async getUsers(): Promise<Users[]> {
    try {
      return await this.usersRepository.find();
    } catch (error) {
      throw error;
    }
  }

  async getUser(id: string): Promise<Users> {
    try {
      if (!this.isUUID(id)) {
        throw new Error(this.INVALID_UUID);
      }
      const foundUser = await this.usersRepository.findOne({
        where: [{ id }, { authOId: id }],
      });

      //  Do not return the password
      delete foundUser.password;

      if (!foundUser) {
        throw new Error(this.USER_NOT_FOUND);
      }
      return foundUser;
    } catch (error) {
      throw error;
    }
  }

  async createUser(user?: UserBody) {
    try {
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
