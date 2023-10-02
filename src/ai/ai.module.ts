import { Module } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "src/db/models/users.entity";
import { MessagesModule } from "src/messages/messages.module";

@Module({
  controllers: [AiController],
  providers: [AiService],
  imports: [TypeOrmModule.forFeature([], "vectordbConnection")],
  exports: [AiService],
})
export class AiModule {}
