import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "src/db/models/users.entity";
import { MessagesModule } from "src/messages/messages.module";

@Module({
  controllers: [AiController],
  providers: [AiService],
  // imports: [TypeOrmModule.forFeature([Users]), MessagesModule],
  exports: [AiService],
})
export class AiModule {}
