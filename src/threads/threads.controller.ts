import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  Req,
  Put,
} from "@nestjs/common";
import { Request } from "express";
import { ThreadsService } from "./threads.service";
import { NewThreadRequestPayload } from "src/constants";
import { Threads } from "src/db/models/threads.entity";

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
  async getThread(@Param("threadId") threadId: string, @Req() req: Request) {
    const { userId } = req.query;
    return await this.threadService.getThread(threadId, userId as string);
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

  @Put(":threadId")
  async updateThread(
    @Param("threadId") threadId: string,
    @Body()
    thread: {
      id: string;
      threadName: string;
      createdAt: Date;
      isActive: boolean;
      participants: string[];
    },
  ) {
    return await this.threadService.updateThread(thread);
  }

  @Delete(":threadId")
  async deleteThread(@Param("threadId") threadId: string) {
    return await this.threadService.deleteThread(threadId);
  }
}
