import { Controller, Get, Param, Post, Body } from "@nestjs/common";
import { Threads } from "src/db/models/threads.entity";
import { ThreadsService } from "./threads.service";
import { NewThreadRequestPayload } from "src/constants";

@Controller("threads")
export class ThreadsController {
  constructor(private readonly threadService: ThreadsService) {}

  @Get("health")
  health() {
    return "OK";
  }

  // @UseGuards(AuthGuard('jwt'))
  @Get("user/:userId")
  async getThreadsByUserId(@Param("userId") userId: string) {
    console.log("Controller: --> getThreads: ", userId, " <--");
    return await this.threadService.getThreadsByUserId(userId);
  }

  @Get(":threadId")
  async getThread(@Param("threadId") threadId: string) {
    return await this.threadService.getMessagesByThread(threadId);
  }

  @Post("create")
  async createThread(
    @Body()
    newThread: NewThreadRequestPayload
  ) {
    console.log("Controller: --> createThread: ", newThread, " <--");
    return await this.threadService.createThread(newThread);
  }
}
