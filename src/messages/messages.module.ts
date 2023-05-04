import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessagesService } from "./messages.service";
import { MessagesController } from "./messages.controller";
import { Messages } from "../db/models/messages.entity";
import { Threads } from "src/db/models/threads.entity";
import { Participants } from "src/db/models/participants.entity";
@Module({
  imports: [TypeOrmModule.forFeature([Messages, Participants])],
  controllers: [MessagesController],
  exports: [MessagesService],
  providers: [MessagesService],
})
export class MessagesModule {}
