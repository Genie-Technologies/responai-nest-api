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
    private readonly usersRepository: Repository<Users>
  ) {}

  USER_NOT_FOUND = "User not found";
  INVALID_UUID = "Invalid UUID";

  async getUsers() {
    try {
      console.log("Getting all users... ");
      return await this.usersRepository.find();
    } catch (error) {
      console.log("Error getting all users: ", error);
      throw error;
    }
  }

  async getUser(idOrEmail: string): Promise<Users> {
    try {
      console.log("Finding user by this id: ", idOrEmail);

      let foundUser: Users;

      if (!isUUID(idOrEmail) && !isEmail(idOrEmail)) {
        console.log("id is not a UUID, trying to find by authOId: ", idOrEmail);
        foundUser = await this.usersRepository.findOne({
          where: { authOId: idOrEmail },
        });
      } else if (isEmail(idOrEmail)) {
        console.log("id is an email, trying to find by email: ", idOrEmail);
        foundUser = await this.usersRepository.findOne({
          where: { email: idOrEmail },
        });
      } else {
        foundUser = await this.usersRepository.findOne({
          where: { id: idOrEmail },
        });
      }

      console.log("foundUser: ", foundUser);

      if (!foundUser) {
        throw new Error(this.USER_NOT_FOUND);
      }

      delete foundUser.password;

      return foundUser;
    } catch (error) {
      console.log("Error: ", error);
      throw error;
    }
  }

  async createUser(user?: Users) {
    try {
      console.log("Creating user: ", user);
      return await this.usersRepository.save({
        id: randomUUID().toString(),
        lastLogin: new Date(),
        ...user,
      });
    } catch (error) {
      console.error("Error while creating user: ", error);
      throw new Error(
        "There was an error creating the user, please try again later."
      );
    }
  }

  async searchUsers({ email, name, phone }) {
    // Search the users table for users with a name that matches the query, first or last name or both or email address
    try {
      // Grab the query params based on the name

      const firstName = name?.split(" ")[0];
      const lastName = name?.split(" ")[1];
      console.log("email: ", email);

      const whereClause = [];
      const params: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
      } = {};

      const users = await this.usersRepository
        .createQueryBuilder("users")
        .where("users.email = :email", { email })
        .orWhere("users.phone = :phone", { phone })
        .orWhere(
          "users.firstName = :firstName AND users.lastName = :lastName",
          {
            firstName,
            lastName,
          }
        )
        // limit to 10 results
        .limit(10)
        .getMany();

      return users;
    } catch (error) {
      console.error("Error while searching users: ", error);
      throw new Error(
        "There was an error searching for users, please try again later."
      );
    }
  }
}
