import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Messages } from "src/db/models/messages.entity";
import { UsersModule } from "src/users/users.module";

// TypeOrmModule.forFeature([Messages, Threads, Participants])

@Module({
  controllers: [AiController],
  providers: [AiService],
  imports: [
    TypeOrmModule.forFeature([], "vectordbConnection"),
    TypeOrmModule.forFeature([Messages]),
    UsersModule,
  ],
  exports: [AiService],
})
export class AiModule {}
