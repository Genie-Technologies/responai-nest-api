import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "crypto";
import { Users } from "src/db/models/users.entity";
import { isEmail, isUUID } from "src/utils";
import { Repository } from "typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  USER_NOT_FOUND = "User not found";
  INVALID_UUID = "Invalid UUID";

  async getUsers() {
    try {
      return await this.usersRepository.find();
    } catch (error) {
      throw error;
    }
  }

  async getUser(idOrEmail: string): Promise<Users> {
    try {
      let foundUser: Users;

      if (!isUUID(idOrEmail) && !isEmail(idOrEmail)) {
        foundUser = await this.usersRepository.findOne({
          where: { authOId: idOrEmail },
        });
      } else if (isEmail(idOrEmail)) {
        foundUser = await this.usersRepository.findOne({
          where: { email: idOrEmail },
        });
      } else {
        foundUser = await this.usersRepository.findOne({
          where: { id: idOrEmail },
        });
      }

      if (!foundUser) {
        throw new Error(this.USER_NOT_FOUND);
      }

      delete foundUser.password;

      return foundUser;
    } catch (error) {
      throw error;
    }
  }

  async createUser(user?: Users) {
    try {
      return await this.usersRepository.save({
        lastLogin: new Date(),
        authOId: user.authOId,
        email: user.email,
        fullName: user.fullName,
        picture: user.picture,
        joined: user.joined,
      });
    } catch (error) {
      console.error("Error -- while creating user: ", error);
      throw new Error(
        "There was an error creating the user, please try again later.",
      );
    }
  }

  async searchUsers({ email, name, phone }) {
    // Search the users table for users with a name that matches the query, first or last name or both or email address
    try {
      // Grab the query params based on the name

      const firstName = name?.split(" ")[0];
      const lastName = name?.split(" ")[1];

      const users = await this.usersRepository
        .createQueryBuilder("users")
        .where("users.email = :email", { email })
        .orWhere("users.phone = :phone", { phone })
        .orWhere(
          "users.firstName = :firstName AND users.lastName = :lastName",
          {
            firstName,
            lastName,
          },
        )
        // limit to 10 results
        .limit(10)
        .getMany();

      return users;
    } catch (error) {
      console.error("Error while searching users: ", error);
      throw new Error(
        "There was an error searching for users, please try again later.",
      );
    }
  }
}
