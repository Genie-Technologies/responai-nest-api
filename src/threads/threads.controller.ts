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

  @Get()
  async threads() {
    return await this.threadService.getThreads();
  }

  // @UseGuards(AuthGuard('jwt'))
  @Get("user/:userId")
  async getThreadsByUserId(@Param("userId") userId: string) {
    return await this.threadService.getThreadsByUserId(userId);
  }

  @Get(":threadId")
  async getThread(@Param("threadId") threadId: string) {
    return await this.threadService.getThread(threadId);
  }

  @Get(":threadId/messages")
  async getMessagesByThread(@Param("threadId") threadId: string) {
    return await this.threadService.getMessagesByThread(threadId);
  }

  @Post("create")
  async createThread(
    @Body()
    newThread: NewThreadRequestPayload,
  ) {
    return await this.threadService.createThread(newThread);
  }
}
