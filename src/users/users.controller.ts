import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  Query,
  Request,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthGuard } from "@nestjs/passport";
import { Users } from "src/db/models/users.entity";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get("search")
  async searchUsers(
    @Query("email") email: string,
    @Query("name") name: string,
    @Query("phone") phone: string
  ) {
    console.log("------------> : ", email, name, phone);
    return await this.usersService.searchUsers({
      email,
      name,
      phone,
    });
  }

  // @UseGuards(AuthGuard('jwt'))
  @Get(":id")
  async getUser(@Param("id") id: string) {
    console.log("------> id: ", id);
    try {
      return await this.usersService.getUser(id);
    } catch (error) {
      // Return a 400 if the user is not found or the id is not UUID
      return { error: error.message, status: 400 };
    }
  }

  @Post("create")
  async createUser(@Req() req: Request) {
    const userBody: Users = req.body as any;
    return await this.usersService.createUser(userBody);
  }
}
